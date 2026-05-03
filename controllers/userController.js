// import { User } from "../models/User.js";
// import { HttpError } from "../middleware/errorHandler.js";

// export async function getPublicProfile(req, res, next) {
//   // TODO:
//   // Hint: User.findOne({ username }). 404 if missing. Exclude email + passwordHash from response.
//   // See: docs/API.md "GET /api/users/:username", tester/tests/profile.test.js
//   try {
//     const { username } = req.params;
//     const user = await User.findOne({ username })
//       .select("-email -passwordHash")
//       .lean();
//     if (!user) {
//       return next(new HttpError(404, `User not found`));
//     }
//     res.json(user);
//   } catch (err) {
//     next(err);
//   }
// }

// export async function updateMe(req, res, next) {
//   // TODO:
//   // Hint: whitelist fields a user may update: displayName, bio, avatarUrl, acceptingQuestions, tags.
//   // Silently IGNORE username / email even if sent — they are immutable here.
//   // Use findByIdAndUpdate with { new: true, runValidators: true }.
//   // See: docs/API.md "PATCH /api/users/me", tester/tests/profile.test.js
//   try {
//     const allowFields = [
//       "displayName",
//       "bio",
//       "avatarUrl",
//       "acceptingQuestions",
//       "tags",
//     ];
//     const updates = {};
//     for (const field of allowFields) {
//       if (Object.prototype.hasOwnProperty.call(req.body, field)) {
//         updates[field] = req.body[field];
//       }
//     }
//     const updateUser = await User.findByIdAndUpdate(
//       req.user._id,
//       { $set: updates },
//       { new: true, runValidators: true },
//     )
//       .select("-email -passwordHash")
//       .lean();
//     if (!updateUser) {
//       return next(new HttpError(404, `User not found`));
//     }
//     res.json(updateUser);
//   } catch (err) {
//     next(err);
//   }
// }

import { User } from "../models/User.js";
import { HttpError } from "../middleware/errorHandler.js";

export async function getPublicProfile(req, res, next) {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    if (!user) {
      return next(new HttpError(404, "User not found"));
    }
    const out = user.toJSON();
    delete out.email;
    res.json(out);
  } catch (err) {
    next(err);
  }
}

export async function updateMe(req, res, next) {
  try {
    const allowFields = [
      "displayName",
      "bio",
      "avatarUrl",
      "acceptingQuestions",
      "tags",
    ];
    for (const field of allowFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        req.user[field] = req.body[field];
      }
    }
    await req.user.save();
    res.json(req.user.toJSON());
  } catch (err) {
    next(err);
  }
}
