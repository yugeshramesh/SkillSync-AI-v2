import User from "../models/User.js";

export const findMatches = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id);

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const users = await User.find({
      _id: { $ne: currentUser._id },
    }).select("-password");

    const matches = users.map((user) => {
      let score = 0;

      // Teaching ↔ Learning Match
      currentUser.learns.forEach((skill) => {
        if (
          user.teaches.some(
            (s) => s.toLowerCase() === skill.toLowerCase()
          )
        ) {
          score += 30;
        }
      });

      currentUser.teaches.forEach((skill) => {
        if (
          user.learns.some(
            (s) => s.toLowerCase() === skill.toLowerCase()
          )
        ) {
          score += 30;
        }
      });

      // Same Department
      if (currentUser.department === user.department)
        score += 10;

      // Same Year
      if (currentUser.year === user.year)
        score += 10;

      // Same Learning Style
      if (
        currentUser.learningStyle &&
        currentUser.learningStyle === user.learningStyle
      )
        score += 10;

      // Same Preferred Time
      if (
        currentUser.preferredTime &&
        currentUser.preferredTime === user.preferredTime
      )
        score += 5;

      // Same Language
      if (
        currentUser.language &&
        currentUser.language === user.language
      )
        score += 5;

      return {
        ...user.toObject(),
        compatibility: Math.min(score, 100),
      };
    });

    matches.sort(
      (a, b) => b.compatibility - a.compatibility
    );

    res.json({
      success: true,
      matches,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};