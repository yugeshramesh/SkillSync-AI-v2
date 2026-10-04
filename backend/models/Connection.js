import mongoose from "mongoose";

const timelineEntrySchema = new mongoose.Schema(
  {
    date: { type: Date, default: Date.now },
    progress: { type: Number, required: true },
    note: { type: String, default: "" },
  },
  { _id: false }
);

const connectionSchema = new mongoose.Schema(
  {
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    learningGoal: {
      type: String,
      default: "Not set yet",
    },

    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    completedSessions: {
      type: Number,
      default: 0,
    },

    achievements: {
      type: [String],
      default: [],
    },

    weeklyGoal: {
      type: Number,
      default: 2, // sessions per week
    },

    monthlyGoal: {
      type: Number,
      default: 8, // sessions per month
    },

    progressTimeline: {
      type: [timelineEntrySchema],
      default: [],
    },
  },
  { timestamps: true }
);

connectionSchema.index({ users: 1 });

export default mongoose.model("Connection", connectionSchema);
