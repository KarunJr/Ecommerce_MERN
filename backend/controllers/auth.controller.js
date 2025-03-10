import { redis } from "../lib/redis.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

const generateToken = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
  return { accessToken, refreshToken };
};

const storeRefreshToken = async (userId, refreshToken) => {
  await redis.set(
    `refresh_token:${userId}`,
    refreshToken,
    "EX",
    7 * 24 * 60 * 69
  ); //7days
};

const setCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true, //prevents from XSS attacks, cross site scripting attacks
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict", //prevents CSRF attack, cross-site request forgery attack
    maxAge: 15 * 60 * 1000, //15minutes
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true, //prevents from XSS attacks, cross site scripting attacks
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict", //prevents CSRF attack, cross-site request forgery attack
    maxAge: 7 * 24 * 60 * 60 * 1000, //7days
  });
};



export const signup = async (req, res) => {
  const { email, password, name } = req.body;

  try {
    const userExist = await User.findOne({ email });
    if (userExist) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists." });
    }

    const user = await User.create({ email, password, name });

    //Authenticate or generating JWT token
    const { accessToken, refreshToken } = generateToken(user._id);
    await storeRefreshToken(user._id, refreshToken);

    //Setting up cookies
    setCookies(res, accessToken, refreshToken);

    res.status(201).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      message: "User created succesfully",
    });
  } catch (error) {
    console.log("Error signing-up: ", error.message);
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await user.comparePassword(password))) {
      //Authenticate or generating JWT token
      const { accessToken, refreshToken } = generateToken(user._id);
      await storeRefreshToken(user._id, refreshToken);

      //Setting up cookies
      setCookies(res, accessToken, refreshToken);
      res.status(200).json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        message: "User logged in successfully.",
      });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log("Error loggin in: ", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
      await redis.del(`refresh_token:${decoded.userId}`);
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.status(201).json({ success: true, message: "Logged out succesfully" });
  } catch (error) {
    console.log("Error loggin out: ", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// this will refresh the access token

export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res
        .status(401)
        .json({ success: false, message: "No refresh token proivded" });
    }
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const sotoredToken = await redis.get(`refresh_token:${decoded.userId}`);

    if (sotoredToken !== refreshToken) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid refresh token" });
    }

    const accessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: true,
      maxAge: 15 * 60 * 1000, //15min
    });

    res
      .status(200)
      .json({ success: true, message: "Token refreshed successfully" });
  } catch (error) {
    console.log("Error in refreshToken controller ", error.message);

    res.status(501).json({ success: false, message1: "Server Error", message2: error.message });
  }
};
