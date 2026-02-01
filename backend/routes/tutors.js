import express from "express";
import TutorProfile from "../models/TutorProfile.js";
import User from "../models/User.js";
import Review from "../models/Review.js";


const router = express.Router();

/**
 * GET /tutors
 * List all tutor profiles
 * Optional filters:
 *  - moduleCode (matches in moduleCodes array)
 *  - year
 */
router.get("/", async (req, res) => {
  try {
    const { moduleCode, year } = req.query;

    const match = { status: "approved" };

    if (year !== undefined) match.year = Number(year);
    if (moduleCode) {
      match.moduleCodes = String(moduleCode).trim().toUpperCase(); // matches in array
    }

    const results = await TutorProfile.aggregate([
      { $match: match },

      // join tutor user
      {
        $lookup: {
          from: "users",
          localField: "tutor",
          foreignField: "_id",
          as: "tutor",
        },
      },
      { $unwind: { path: "$tutor", preserveNullAndEmptyArrays: true } },

      // drop orphaned tutor profiles (deleted users)
      { $match: { "tutor._id": { $ne: null } } },

      // join reviews by tutor user id
      {
        $lookup: {
          from: "reviews",
          let: { tutorUserId: "$tutor._id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$tutor", "$$tutorUserId"] } } },
            {
              $group: {
                _id: "$tutor",
                avgRating: { $avg: "$rating" },
                reviewCount: { $sum: 1 },
              },
            },
          ],
          as: "reviewStats",
        },
      },

      // flatten stats
      {
        $addFields: {
          avgRating: {
            $ifNull: [{ $arrayElemAt: ["$reviewStats.avgRating", 0] }, 0],
          },
          reviewCount: {
            $ifNull: [{ $arrayElemAt: ["$reviewStats.reviewCount", 0] }, 0],
          },
        },
      },

      { $project: { reviewStats: 0 } },
      { $sort: { createdAt: -1 } },
    ]);

    res.json(results);
  } catch (err) {
    console.error("GET /tutors error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


/**
 * GET /tutors/by-user/:userId
 * Get tutor profile by USER id
 * IMPORTANT: must be ABOVE "/:id"
 */
router.get("/by-user/:userId", async (req, res) => {
  try {
    const profile = await TutorProfile.findOne({ tutor: req.params.userId })
      .populate("tutor", "name email role");

    if (!profile) return res.status(404).json({ message: "Tutor profile not found" });
    res.json(profile);
  } catch (err) {
    console.error("GET /tutors/by-user error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /tutors/:id
 * Get tutor profile by PROFILE id
 */
router.get("/:id", async (req, res) => {
  try {
    const profile = await TutorProfile.findById(req.params.id)
      .populate("tutor", "name email role");

    if (!profile) return res.status(404).json({ message: "Tutor profile not found" });
    res.json(profile);
  } catch (err) {
    console.error("GET /tutors/:id error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST /tutors
 * Auto-approve application:
 * - create TutorProfile (status approved)
 * - set User.role = tutor
 */
router.post("/", async (req, res) => {
  try {
    const { tutor, year, cgpa, moduleCodes, bio, availability } = req.body;

    if (!tutor || !year || cgpa === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (!Array.isArray(moduleCodes) || moduleCodes.length === 0) {
      return res.status(400).json({ message: "Select at least one module" });
    }

    // Create profile
    const profile = await TutorProfile.create({
      tutor,
      year: Number(year),
      cgpa: Number(cgpa),
      moduleCodes,
      bio: (bio || "").trim(),
      availability: (availability || "").trim(),
      status: "approved",
    });

    // Update role
    const updatedUser = await User.findByIdAndUpdate(
      tutor,
      { role: "tutor" },
      { new: true }
    ).select("_id name email role");

    const populatedProfile = await TutorProfile.findById(profile._id)
      .populate("tutor", "name email role");

    res.status(201).json({
      message: "Tutor approved automatically",
      tutorProfile: populatedProfile,
      user: updatedUser,
    });
  } catch (err) {
    console.error("POST /tutors error:", err);

    // duplicate tutor profile
    if (err?.code === 11000) {
      return res.status(409).json({ message: "Tutor profile already exists" });
    }

    res.status(500).json({ message: "Server error" });
  }
});

export default router;
