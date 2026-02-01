import mongoose from "mongoose";

const tutorProfileSchema = new mongoose.Schema(
  {
    tutor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one profile per tutor
    },
    year: {
      type: Number,
      required: true,
      min: 1,
      max: 3,
    },
    cgpa: {
      type: Number,
      required: true,
      min: 0,
      max: 4,
    },
    // ✅ multi-select modules
    moduleCodes: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: "At least one module must be selected",
      },
      set: (arr) =>
        (arr || [])
          .map((m) => String(m).trim().toUpperCase())
          .filter(Boolean),
    },

    // ✅ keep only what you want
    bio: {
      type: String,
      trim: true,
      default: "",
    },
    availability: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("TutorProfile", tutorProfileSchema);
