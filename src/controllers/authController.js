import bcrypt from "bcrypt";
import "dotenv/config";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { createUser, findUser } from "../db/dbHelper.js";

//zod schemas
const authSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(6),
});

export const userSignup = async (req, res) => {
  const parsed = authSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: {
        message: "Invalid Input",
        issues: z.flattenError(parsed.error),
      },
    });
  }

  const { username, password } = parsed.data;

  try {
    const existingUser = await findUser(username);

    if (existingUser.length > 0) {
      return res.status(409).json({
        success: false,
        error: { message: "Username already exists" },
      });
    }

    // hashing password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const [result] = await createUser(username, hashedPassword);

    return res.status(201).json({
      success: true,
      data: {
        message: "User created successfully",
        userId: result.id,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { message: "Failed to create user." },
    });
  }
};

export const userLogin = async (req, res) => {
  const parsed = authSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      error: {
        message: "Invalid Input",
        issues: z.flattenError(parsed.error),
      },
    });
  }

  const { username, password } = parsed.data;

  try {
    const existingUser = await findUser(username);

    if (existingUser.length === 0) {
      return res.status(401).json({
        success: false,
        error: { message: "Invalid Username or Password !" },
      });
    }

    const currentUser = existingUser[0];

    const matchingPass = await bcrypt.compare(password, currentUser.password);

    if (!matchingPass) {
      return res.status(401).json({
        success: false,
        error: { message: "Invalid Username or Password !" },
      });
    }

    const jwt_token = jwt.sign(
      {
        id: currentUser.id,
        username: username,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      }
    );

    return res.status(200).json({
      success: true,
      data: {
        message: "Login successful",
        token: jwt_token,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        message: "Failed to Login.",
      },
    });
  }
};
