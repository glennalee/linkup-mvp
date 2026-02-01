import express from "express";
import Booking from "../models/booking.js";
import User from "../models/User.js";

const router = express.Router();

/**
 * GET /bookings?studentId=xxx
 * GET /bookings?tutorId=xxx
 */
router.get("/", async (req, res) => {
  try {
    const { studentId, tutorId } = req.query;

    const filter = {};
    if (studentId) filter.student = studentId;
    if (tutorId) filter.tutor = tutorId;

    const bookings = await Booking.find(filter)
      .populate("student", "name email role")
      .populate("tutor", "name email role")
      .sort({ createdAt: -1 });

    // ✅ remove orphan bookings (if user deleted)
    const cleaned = bookings.filter((b) => b.student && b.tutor);

    return res.json(cleaned);
  } catch (err) {
    console.error("GET /bookings error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * GET /bookings/:id
 */
router.get("/:id", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("student", "name email role")
      .populate("tutor", "name email role");

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // ✅ if orphaned, return 404 so frontend doesn't crash
    if (!booking.student || !booking.tutor) {
      return res.status(404).json({ message: "Booking is invalid (user deleted)" });
    }

    return res.json(booking);
  } catch (err) {
    console.error("GET /bookings/:id error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST /bookings
 * Create booking
 * Required: student, tutor, sessionDate, moduleCode
 */
router.post("/", async (req, res) => {
  try {
    const { student, tutor, sessionDate, remarks, moduleCode } = req.body;

    if (!student || !tutor || !sessionDate || !moduleCode) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // optional: verify both users exist to prevent orphan bookings
    const [studentExists, tutorExists] = await Promise.all([
      User.findById(student).select("_id"),
      User.findById(tutor).select("_id"),
    ]);

    if (!studentExists || !tutorExists) {
      return res.status(400).json({ message: "Student or tutor does not exist" });
    }

    const booking = await Booking.create({
      student,
      tutor,
      sessionDate,
      moduleCode: String(moduleCode).trim().toUpperCase(),
      remarks: remarks || "",
      status: "pending",
      completedByTutor: false,
      completedByStudent: false,
    });

    const populated = await Booking.findById(booking._id)
      .populate("student", "name email role")
      .populate("tutor", "name email role");

    return res.status(201).json(populated);
  } catch (err) {
    console.error("POST /bookings error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * PATCH /bookings/:id/status
 * Tutor accepts/rejects
 */
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    )
      .populate("student", "name email role")
      .populate("tutor", "name email role");

    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (!booking.student || !booking.tutor) {
      return res.status(404).json({ message: "Booking is invalid (user deleted)" });
    }

    return res.json(booking);
  } catch (err) {
    console.error("PATCH /bookings/:id/status error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * PATCH /bookings/:id/complete
 * Body: { role: "student" } OR { role: "tutor" }
 */
router.patch("/:id/complete", async (req, res) => {
  try {
    const { role } = req.body;

    if (!["student", "tutor"].includes(role)) {
      return res.status(400).json({ message: "role must be 'student' or 'tutor'" });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.status !== "accepted" && booking.status !== "completed") {
      return res.status(400).json({ message: "Only accepted bookings can be completed" });
    }

    if (role === "student") booking.completedByStudent = true;
    if (role === "tutor") booking.completedByTutor = true;

    if (booking.completedByStudent && booking.completedByTutor) {
      booking.status = "completed";
    }

    await booking.save();

    const populated = await Booking.findById(booking._id)
      .populate("student", "name email role")
      .populate("tutor", "name email role");

    if (!populated.student || !populated.tutor) {
      return res.status(404).json({ message: "Booking is invalid (user deleted)" });
    }

    return res.json(populated);
  } catch (err) {
    console.error("PATCH /bookings/:id/complete error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

/**
 * DELETE /bookings/:id
 */
router.delete("/:id", async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.status === "completed") {
      return res.status(400).json({ message: "Cannot cancel completed booking" });
    }

    await booking.deleteOne();
    return res.json({ message: "Booking cancelled" });
  } catch (err) {
    console.error("DELETE /bookings/:id error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
