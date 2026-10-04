import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    college: {
      type: String,
      default: "",
    },

    department: {
      type: String,
      default: "",
    },

    year: {
      type: String,
      default: "",
    },

    teaches: {
      type: [String],
      default: [],
    },

    learns: {
      type: [String],
      default: [],
    },

    learningStyle: {
      type: String,
      default: "",
    },

    preferredTime: {
      type: String,
      default: "",
    },

    language: {
      type: String,
      default: "",
    },

    learningMode: {
      type: String,
      default: "",
    },

    location: {
      type: String,
      default: "",
    },

    bio: {
      type: String,
      default: "",
    },

    profileImage: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);