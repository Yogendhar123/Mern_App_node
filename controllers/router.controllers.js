import express from "express";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js"; // Adjust the path based on your project structure
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET; // Ensure this is properly loaded
const JWT_EXPIRES_IN = "1h"; // Adjust the token expiry as needed

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

export const signUp = async (req, res) => {
  const { email, password, name, username } = req.body;

  try {
    if (!email || !password || !name || !username) {
      throw new Error("All fields are required");
    }

    const userAlreadyExists = await User.findOne({ $or: [{ email }, { username }] });
    console.log("userAlreadyExists", userAlreadyExists);

    if (userAlreadyExists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const user = new User({
      email,
      password: hashedPassword,
      name,
      username,
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        ...user._doc,
        password: undefined, // Exclude password from the response
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const loginIn = async (req, res) => {
  const { emailOrUsername, password } = req.body;

  try {
    if (!emailOrUsername || !password) {
      throw new Error("Email/Username and password are required");
    }

    const user = await User.findOne({
      $or: [{ email: emailOrUsername }, { username: emailOrUsername }],
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ success: false, message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    // Set token in a cookie (optional, you can also send it in the response body)
    res.cookie("token", token, { httpOnly: true });

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        ...user._doc,
        password: undefined, // Exclude password from the response
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const logOut = (req, res) => {
  res.clearCookie("token"); // Clear the JWT token cookie

  res.status(200).json({
    success: true,
    message: "Logout successful",
  });
};
