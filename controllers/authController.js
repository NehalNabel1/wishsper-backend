import { User } from "../models/User.js";
import { signToken } from "../middleware/auth.js";
import { HttpError } from "../middleware/errorHandler.js";

export async function signup(req, res, next) {
  try {
    const { username, email, password, displayName } = req.body;
    const existingEmail = await User.findOne({ email: email });
    const existingName = await User.findOne({ username: username });
    if (existingName) {
      throw new HttpError(
        409,
        `This username is ${existingName} already exists`,
      );
    } else if (existingEmail) {
      throw new HttpError(409, `This email is ${existingEmail} already exists`);
    }
    const passwordHash = await User.hashPassword(password);
    const user = await User.create({
      username,
      email,
      passwordHash,
      displayName,
    });
    const token = signToken(user);
    res.status(201).json({ token, user: user.toJSON() });
  } catch (err) {
    if (err.code === 11000) {
      return next(new HttpError(409, `Email or Username is already exists`));
    }
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      throw new HttpError(401, `Invalid email`);
    }
    const match = await user.comparePassword(password);
    if (!match) {
      throw new HttpError(401, `Invalid password`);
    }
    const token = signToken(user);
    res.status(200).json({ token, user: user.toJSON() });
  } catch (err) {
    next(err);
  }
}

export async function me(req, res, next) {
  // TODO:
  // Hint: authenticate middleware has already attached the user — just return it.
  // See: docs/API.md "GET /api/auth/me", tester/tests/auth.test.js
  try {
    res.json(req.user.toJSON());
  } catch (err) {
    next(err);
  }
}
