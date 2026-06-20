import { genToken } from "../../utils/genToken.js";
import { Auth } from "../models/auth.schema.js";
import { ObjectId } from "mongodb";

export const signup = async (req, res, next) => {
  try {
    const { userName, email, password } = req.body;
    if (!userName || !email || !password) {
      return res.status(400).json({
        message: "all fields are required",
      });
    }
    const isUserExist = await Auth.findOne({ email });
    if (isUserExist) {
      return res.status(400).json({
        message: "Email is already exist",
      });
    }

    const user = await Auth.create({
      userName,
      email,
      password,
    });

    return res.status(201).json({
      message: "user created successfully",
      data: {
        id: user._id,
        name: user.userName,
        email: user.email,
      },
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

export const signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: "all fields are required",
      });
    }
    const user = await Auth.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Password is incorrect",
      });
    }

    //  token:
    const token = await genToken(user._id, user.email, user.userName);

    if (!token) {
      return res.status(400).json({
        message: "Something went wrong",
      });
    }
    return res
      .status(200)
      .cookie("token", token, {
       httpOnly: true,
       secure: process.env.NODE_ENV === "production",
       sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
       maxAge: 7 * 24 * 60 * 60 * 1000,
       })
      .json({
        message: "signin successfully",
        data: {
          id: user._id,
          email: user.email,
          userName: user.userName,
          // Also hand the token back directly. Browsers (mobile especially)
          // increasingly block cross-site cookies between two different
          // domains, so the frontend stores this and sends it back as an
          // "Authorization: Bearer <token>" header on every request instead
          // of relying solely on the cookie.
          token,
        },
      });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

export const logout = async (req, res, next) => {
  try {
    return res
      .status(200)
      .clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      })
      .json({
        message: "logout successfully",
      });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};


export const getUsers = async (req, res, next) => {
  try {
    const users = await Auth.find({ "_id": { "$ne": new ObjectId(req.user.id) } }).select("-password");
    if (users.length === 0) {
      return res.status(400).json({
        message: "No users Found"
      })
    }
    return res.status(200).json({
      message: "success",
      data: users
    })

  } catch (err) {
    return res.status(500).json({
      message: err.message
    })
  }
}

//  Returns whoever the httpOnly cookie/JWT actually identifies.
//  This is the real source of truth for "who is logged in on THIS browser" —
//  used by the frontend on every load to correct any stale/incorrect
//  localStorage value (e.g. if localStorage was copied or shared between
//  windows of the same browser profile).
export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await Auth.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({
        message: "user not found",
      });
    }
    return res.status(200).json({
      message: "success",
      data: {
        id: user._id,
        userName: user.userName,
        email: user.email,
      },
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};