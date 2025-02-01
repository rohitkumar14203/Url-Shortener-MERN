import asyncHandler from "../middleware/asyncHandler.js";
import User from "../modal/userModal.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, phoneNumber } = req.body;

  try {
    // Check if all fields are provided
    if (!username || !email || !password || !phoneNumber) {
      res.status(400);
      throw new Error("Please fill in all fields");
    }

    const userExists = await User.findOne({ email });

    // Check if user already exists
    if (userExists) {
      res.status(400);
      throw new Error("User already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      username,
      email,
      phoneNumber,
      password: hashedPassword,
    });

    if (user) {
      const token = generateToken(user._id);

      // Set cookie using setHeader
      res.setHeader(
        "Set-Cookie",
        `jwt=${token}; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=${
          30 * 24 * 60 * 60
        }`
      );

      return res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
        token: token,
      });
    }
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      message: error.message || "An error occurred during registration",
    });
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      const token = generateToken(user._id);

      // Updated cookie configuration
      const cookieOptions = {
        httpOnly: true,
        secure: true, // Always use secure in production
        sameSite: "none", // Required for cross-site cookies
        path: "/",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      };

      res.cookie("jwt", token, cookieOptions);

      return res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
      });
    } else {
      res.status(401);
      throw new Error("Invalid email or password");
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: error.message || "An error occurred during login",
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.username = req.body.username || user.username;
    user.email = req.body.email || user.email;
    user.phoneNumber = req.body.phoneNumber || user.phoneNumber;

    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      phoneNumber: updatedUser.phoneNumber,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const deleteUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    await User.deleteOne({ _id: user._id });
    res.json({ message: "User deleted successfully" });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

const logoutUser = asyncHandler(async (req, res) => {
  try {
    // Clear cookie using setHeader
    res.setHeader(
      "Set-Cookie",
      "jwt=; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=0"
    );
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      message: error.message || "An error occurred during logout",
    });
  }
});

const getCurrentUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      phoneNumber: user.phoneNumber,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

export {
  registerUser,
  loginUser,
  updateUserProfile,
  deleteUserProfile,
  logoutUser,
  getCurrentUserProfile,
};
