import express from "express";
import mongoose from "mongoose";
import Review from "../models/Review.js";
import Booking from "../models/booking.js";

const router = express.Router();

/**
 * GET /reviews?tutorId=xxx
 * GET /reviews?studentId=xxx
 * GET /reviews?bookingId=xxx
 */
router.get("/", async (req, res) => {
  try {
    const { tutorId, studentId, bookingId } = req.query;
    const filter = {};

    if (tutorId) {
      if (!mongoose.Types.ObjectId.isValid(tutorId)) {
        return res.status(400).json({ message: "Invalid tutorId" });
      }
      filter.tutor = tutorId;
    }

    if (studentId) {
      if (!mongoose.Types.ObjectId.isValid(studentId)) {
        return res.status(400).json({ message: "Invalid studentId" });
      }
      filter.student = studentId;
    }

    if (bookingId) {
      if (!mongoose.Types.ObjectId.isValid(bookingId)) {
        return res.status(400).json({ message: "Invalid bookingId" });
      }
      filter.booking = bookingId;
    }

    const reviews = await Review.find(filter)
      .populate("student", "name email")
      .populate("tutor", "name email")
      .sort({ createdAt: -1 });

    // ✅ IMPORTANT:
    // If bookingId is provided, return as-is (even if tutor/student populate is null)
    // because frontend needs to know "a review exists".
    if (bookingId) {
      return res.status(200).json(reviews);
    }

    // Otherwise, for lists, remove orphan reviews to prevent UI crashes
    const cleaned = reviews.filter((r) => r.student && r.tutor);
    return res.status(200).json(cleaned);
  } catch (err) {
    console.error("GET /reviews error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST /reviews
 * One review per booking (unique index)
 */
router.post("/", async (req, res) => {
  try {
    const { bookingId, rating, comment, studentId } = req.body;

    if (!bookingId || rating === undefined) {
      return res.status(400).json({ message: "Missing bookingId or rating" });
    }

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ message: "Invalid bookingId" });
    }

    const ratingNum = Number(rating);
    if (!Number.isFinite(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ message: "rating must be between 1 and 5" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found in database" });
    }

    if (booking.status !== "completed") {
      return res.status(400).json({ message: "Session not completed" });
    }

    if (studentId) {
      if (!mongoose.Types.ObjectId.isValid(studentId)) {
        return res.status(400).json({ message: "Invalid studentId" });
      }
      if (String(booking.student) !== String(studentId)) {
        return res.status(403).json({ message: "Not allowed to review this booking" });
      }
    }

    const review = await Review.create({
      booking: bookingId,
      tutor: booking.tutor,
      student: booking.student,
      rating: ratingNum,
      comment: (comment || "").trim(),
    });

    const populated = await Review.findById(review._id)
      .populate("student", "name email")
      .populate("tutor", "name email");

    return res.status(201).json(populated);
  } catch (err) {
    // ✅ nicer duplicate message
    if (err?.code === 11000) {
      return res.status(400).json({
        message: "Review already submitted for this booking",
      });
    }

    console.error("POST /reviews error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// GET /reviews/stats?tutorId=xxx
router.get("/stats", async (req, res) => {
  try {
    const { tutorId } = req.query;
    if (!tutorId || !mongoose.Types.ObjectId.isValid(tutorId)) {
      return res.status(400).json({ message: "Invalid tutorId" });
    }

    const stats = await Review.aggregate([
      { $match: { tutor: new mongoose.Types.ObjectId(tutorId) } },
      {
        $group: {
          _id: "$tutor",
          avgRating: { $avg: "$rating" },
          reviewCount: { $sum: 1 },
        },
      },
    ]);

    if (!stats.length) {
      return res.json({ avgRating: 0, reviewCount: 0 });
    }

    res.json({
      avgRating: Number(stats[0].avgRating.toFixed(2)),
      reviewCount: stats[0].reviewCount,
    });
  } catch (err) {
    console.error("GET /reviews/stats error:", err);
    res.status(500).json({ message: "Server error" });
  }
});


export default router;
