import { upsertStreamUser } from "../lib/stream.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

// signup controller
export async function signup(req, res) {
  const { fullName, email, password } = req.body;

  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long." });
    }

    // check if valid email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "Email already exists." });
    }

    // generate a random profile picture URL
    const idx = Math.floor(Math.random() * 100) + 1;
    const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

    const newUser = await User.create({
      fullName,
      email,
      password,
      profilePicture: randomAvatar,
    });

      // create user in stream
      try {
        await upsertStreamUser({
          id: newUser._id.toString(),
          name: newUser.fullName,
          image: newUser.profilePicture || "",
        });
        console.log(`Stream user created for ${newUser.fullName}`);
      } catch (error) {
        console.log("Error creating Stream user:", error);
      }


    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "7d",
      }
    );

    res.cookie("jwt", token, {
      httpOnly: true, // Prevents XSS attacks
      sameSite: "Strict", // Helps prevent CSRF attacks
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      success: true,
      user: {
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePicture: newUser.profilePicture,
      },
    });
  } catch (error) {
    console.log("Error in signup controller:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}

// login controller
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    res.cookie("jwt", token, {
      httpOnly: true, // Prevents XSS attacks
      sameSite: "Strict", // Helps prevent CSRF attacks
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.log("Error in login controller:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}

// logout controller
export function logout(req, res) {
  res.clearCookie("jwt");
  res.status(200).json({ success: true, message: "Logged out successfully." });
}

// onboarding controller
export async function onboard(req, res) {
    try {
        const userId = req.user._id;

        const { fullName, bio, nativeLanguage, learningLanguage, location } = req.body;

        if (!fullName || !bio || !nativeLanguage || !learningLanguage || !location) {
            return res.status(400).json({ 
                message: "All fields are required." , 
                MissingFields: [
                    !fullName && "fullName",
                    !bio && "bio",
                    !nativeLanguage && "nativeLanguage",
                    !learningLanguage && "learningLanguage",
                    !location && "location"
                ].filter(Boolean)
            });
        }

        const updatedUser = await User.findByIdAndUpdate(userId, {
            ...req.body,
            isOnboarded: true,
        }, {new: true});

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found." });
        }

        // updated the user in stream
        try {
            await upsertStreamUser({
                id: updatedUser._id.toString(),
                name: updatedUser.fullName,
                image: updatedUser.profilePicture || "",
            })
            console.log(`Stream user updated after onboarding for ${updatedUser.fullName}`);
        } catch (error) {
            console.log("Error updating Stream user during onboarding:", error);
        }

        res.status(200).json({success:true, user: updatedUser});
    } catch (error) {
        console.log("Error in onboarding controller:", error);
        res.status(500).json({ message: "Internal server error." });
    }
}
