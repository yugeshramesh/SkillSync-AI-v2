import User from "../models/User.js";

// GET PROFILE
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE PROFILE
export const updateProfile = async (req, res) => {
  try {
    const {
      name,
      college,
      department,
      year,
      teaches,
      learns,
      learningStyle,
      preferredTime,
      language,
      learningMode,
      location,
      bio,
    } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        name,
        college,
        department,
        year,
        teaches,
        learns,
        learningStyle,
        preferredTime,
        language,
        learningMode,
        location,
        bio,
      },
      {
        new: true,
      }
    ).select("-password");

    res.json({
      success: true,
      message: "Profile Updated Successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};