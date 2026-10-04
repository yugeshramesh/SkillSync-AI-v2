import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ================= REGISTER =================

export const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      college,
      department,
      year,
    } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      college,
      department,
      year,
    });

    res.status(201).json({
      success: true,
      message: "Registration Successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        college: user.college,
        department: user.department,
        year: user.year,
      },
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ================= LOGIN =================

export const login = async (req, res) => {
  try {

    console.log("========== LOGIN START ==========");

    const { email, password } = req.body;
    console.log("1. Email received:", email);

    const user = await User.findOne({ email });
    console.log("2. User found:", !!user);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    console.log("3. Password matched:", isMatch);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    console.log("4. Creating JWT...");

    const token = jwt.sign(
      {
        id: user._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    console.log("5. JWT Created Successfully");

    return res.status(200).json({
      success: true,
      message: "Login Successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        college: user.college,
        department: user.department,
        year: user.year,
      },
    });

  } catch (error) {

    console.log("========== LOGIN ERROR ==========");
    console.error(error);
    console.error(error.stack);

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};