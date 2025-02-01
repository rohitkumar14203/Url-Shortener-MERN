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
  },
  shortUrl: {
    type: String,
    unique: true,
  },
  fullShortUrl: {
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
}, {
  timestamps: true,
});

// Create indexes for efficient querying
urlSchema.index({ status: 1 });
urlSchema.index({ expirationDate: 1 });

// Pre-save middleware to ensure URLs are properly formatted
urlSchema.pre('save', function(next) {
  // If no shortUrl is set, generate one
  if (!this.shortUrl) {
    this.shortUrl = Math.random().toString(36).substring(2, 8);
  }

  // Create the full short URL if not set
  if (!this.fullShortUrl) {
    const baseUrl = process.env.API_BASE_URL || 'https://url-shortener-mern.onrender.com';
    this.fullShortUrl = `${baseUrl}/${this.shortUrl}`;
  }

  // Ensure original URL has protocol
  if (!this.originalUrl.startsWith('http://') && !this.originalUrl.startsWith('https://')) {
    this.originalUrl = 'https://' + this.originalUrl;
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
  try {
    // Use findOneAndUpdate to atomically update the document
    const result = await this.constructor.findOneAndUpdate(
      {
        _id: this._id,
        "clickDetails.visitId": { $ne: visitId }, // Only update if this visitId doesn't exist
      },
      {
        $inc: { clicks: 1 },
        $push: {
          clickDetails: {
            ipAddress: ipAddress.replace(/^.*:/, ""),
            device: determineDevice(userAgent),
            userAgent,
            visitId,
          },
        },
      },
      { new: true }
    );

    return result;
  } catch (error) {
    console.error("Error registering click:", error);
    throw error;
  }
};

// Helper function to determine device
function determineDevice(userAgent) {
  const ua = userAgent.toLowerCase();

  if (ua.includes("android")) {
    return "Android";
  } else if (
    ua.includes("iphone") ||
    ua.includes("ipad") ||
    ua.includes("ios")
  ) {
    return "iOS";
  } else if (ua.includes("macintosh") || ua.includes("mac os")) {
    return "Mac";
  } else if (ua.includes("windows")) {
    return "Windows";
  } else if (ua.includes("linux")) {
    return "Linux";
  }

  return "Other";
}

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
