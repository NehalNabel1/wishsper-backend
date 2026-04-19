import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { HttpError } from "./errorHandler.js";

export async function authenticate(req, _res, next) {
  // TODO:
  // Hint: read Authorization: Bearer <token>. Verify with jwt.verify(token, JWT_SECRET).
  // Load User.findById(payload.sub). Attach to req.user. Any failure -> 401.
  // See: docs/API.md "Authentication", tester/tests/auth.test.js
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new HttpError(401, "No token provided"));
    }

    const token = authHeader.split(" ")[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub);

    if (!user) return next(new HttpError(401, "User not found"));

    req.user = user;
    next();
  } catch (err) {
    return next(new HttpError(401, "Invalid token"));
  }
}

export function signToken(user) {
  // TODO:
  // Hint: jwt.sign({ sub: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN || '7d' })
  return jwt.sign({ sub: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });
}
