import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - No access token provdied",
      });
    }
    try {
      const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findById(decoded.userId).select("-password");
      if (!user) {
        return res
          .status(401)
          .json({ success: false, message: "User not found" });
      }

      req.user = user;
      next();
    } catch (error) {
      if (error.name === "TOKENEXPIREDERROR") {
        return res
          .status(401)
          .json({ success: false, messages: "Unauthorized - Access Toekn expired" });
      }
    }
  } catch (error) {
    console.log("Erorr in protectRoute middleware ", error.message);
    return res.status(401).json({ success: false, message: "Unauthorized - Invalid access token" });
  }
};

export const adminRoute = async (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  }else{
    res.status(403).json({success: false, message: "Access Denied - Admin Only!"})
  }
};


export const getProfile = async(req, res)=>{
  try {
    res.json(req.user);
  } catch (error) {
    console.log("Error in getProfile controller", error.message);
    res.status(501).json({success: false, message: "Server Error", error: error.message})
  }
}