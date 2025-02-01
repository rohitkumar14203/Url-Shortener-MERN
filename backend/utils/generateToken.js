import jwt from "jsonwebtoken";

const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not defined in environment variables");
    throw new Error("JWT_SECRET is not configured");
  }

  try {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });
    console.log("Generated new token for user:", userId);
    return token;
  } catch (error) {
    console.error("Error generating token:", error);
    throw error;
  }
};

export default generateToken;
