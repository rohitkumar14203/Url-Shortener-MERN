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
    ip: {
      type: String,
      default: "Unknown",
    },
    rawHeaders: {
      type: Object,
      select: false, // Won't be included in queries by default
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to clean IP address
visitSchema.pre('save', function(next) {
  if (this.ip) {
    // Remove IPv6 prefix if present
    this.ip = this.ip.replace(/^.*:/, '');
  }
  next();
});

const Visit = mongoose.model("Visit", visitSchema);

export default Visit;
