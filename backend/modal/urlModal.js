import mongoose from "mongoose";
import shortid from "shortid";

// Configure shortid to use 64 unique characters (alphanumeric + two safe special chars)
shortid.characters(
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ@$"
);

// Schema for click details
const clickDetailSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
  },
  ipAddress: {
    type: String,
    required: true,
  },
  device: {
    type: String,
    required: true,
  },
  userAgent: {
    type: String,
    required: true,
  },
  visitId: {
    type: String,
    required: true,
  },
});

// Create indexes for efficient querying
clickDetailSchema.index({ visitId: 1 });

// Main URL Schema
const urlSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  originalUrl: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /^(ftp|http|https):\/\/[^ "]+$/.test(v); // Validate URL format
      },
      message: (props) => `${props.value} is not a valid URL!`,
    },
  },
  shortUrl: {
    type: String,
    unique: true,
  },
  expirationDate: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  clicks: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
  clickDetails: [clickDetailSchema],
  remarks: {
    type: String,
  },
});

// Create indexes for efficient querying
urlSchema.index({ status: 1 });
urlSchema.index({ expirationDate: 1 });

// Pre-save middleware to generate the full short URL
urlSchema.pre("save", function (next) {
  const hostname = process.env.HOSTNAME || "localhost:5000"; // Use hostname from environment or default to localhost
  if (!this.shortUrl) {
    // Generate a clean alphanumeric string by replacing special chars
    const uniqueId = shortid
      .generate()
      .slice(0, 6)
      .replace(/[@$]/g, (char) => (char === "@" ? "X" : "Y")); // Replace special chars with X or Y
    this.shortUrl = `https://${hostname}/${uniqueId}`;
  }

  if (this.expirationDate && this.expirationDate < new Date()) {
    this.status = "inactive";
  }

  next();
});

// Method to increment clicks and add click details
urlSchema.methods.registerClick = async function (
  ipAddress,
  userAgent,
  visitId
) {
  this.clicks += 1;

  // Determine device from user agent
  let device = "Other";
  const userAgentLower = userAgent.toLowerCase();

  if (userAgentLower.includes("android")) {
    device = "Android";
  } else if (
    userAgentLower.includes("iphone") ||
    userAgentLower.includes("ipad") ||
    userAgentLower.includes("ios")
  ) {
    device = "iOS";
  } else if (
    userAgentLower.includes("macintosh") ||
    userAgentLower.includes("mac os")
  ) {
    device = "Mac";
  } else if (userAgentLower.includes("windows")) {
    device = "Windows";
  } else if (userAgentLower.includes("linux")) {
    device = "Linux";
  }

  // Clean up IP address
  const cleanIp = ipAddress.replace(/^.*:/, "");

  this.clickDetails.push({
    ipAddress: cleanIp,
    device,
    userAgent,
    visitId,
  });

  return this.save();
};

// Method to check if URL is inactive
urlSchema.methods.isInactive = function () {
  if (this.status === "inactive") return true;
  if (this.expirationDate && this.expirationDate < new Date()) {
    this.status = "inactive";
    return true;
  }
  return false;
};

// Static method to find all active URLs
urlSchema.statics.findActive = function () {
  return this.find({ status: "active" });
};

const URL = mongoose.model("URL", urlSchema);

export default URL;
