import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    connection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Connection",
      required: true,
    },

    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    topic: {
      type: String,
      default: "",
    },

    scheduledAt: {
      type: Date,
      required: true,
    },

    duration: {
      type: Number, // minutes
      default: 60,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed", "cancelled"],
      default: "pending",
    },

    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Session", sessionSchema);
