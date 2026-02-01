import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tutor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    moduleCode: {
  type: String,
  required: true,
  trim: true,
  uppercase: true,
},

    sessionDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed"],
      default: "pending",
    },
    remarks: {
      type: String,
      trim: true,
      default: "",
    },
    completedByTutor: {
  type: Boolean,
  default: false,
},
completedByStudent: {
  type: Boolean,
  default: false,
},

  },
  { timestamps: true },
);

export default mongoose.model("Booking", bookingSchema);
