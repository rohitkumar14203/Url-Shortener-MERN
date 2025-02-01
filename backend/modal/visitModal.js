import mongoose from "mongoose";

const visitSchema = new mongoose.Schema(
  {
    url: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "URL",
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    device: {
      type: String,
      default: "Unknown",
    },
    browser: {
      type: String,
      default: "Unknown",
    },
    ip: {
      type: String,
      default: "Unknown",
    },
  },
  {
    timestamps: true,
  }
);

const Visit = mongoose.model("Visit", visitSchema);

export default Visit; 