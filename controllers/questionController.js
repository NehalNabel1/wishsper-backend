// import { Question } from "../models/Question.js";
// import { User } from "../models/User.js";
// import { HttpError } from "../middleware/errorHandler.js";

// // TODO:
// // Hint: find recipient by :username. 404 if missing, 403 if acceptingQuestions === false.
// // Create Question { recipient: recipient._id, body }. Respond 201 WITHOUT recipient field
// // (anonymous send — do not leak sender OR recipient id in the echo).
// // See: docs/API.md "POST /api/users/:username/questions", tester/tests/send-question.test.js
// // throw new Error('not implemented');
// // controllers/question.js - sendQuestion()
// export async function sendQuestion(req, res, next) {
//   try {
//     const { username } = req.params;
//     const { body } = req.body;

//     if (body === undefined || body === null) {
//       return next(new HttpError(400, "body is required"));
//     }
//     if (typeof body !== "string" || body.trim() === "") {
//       return next(new HttpError(400, "body must not be empty"));
//     }
//     if (body.length > 500) {
//       return next(new HttpError(400, "body must be 500 characters or less"));
//     }

//     const recipient = await User.findOne({ username });
//     if (!recipient) return next(new HttpError(404, "User not found"));
//     if (!recipient.acceptingQuestions)
//       return next(new HttpError(403, "User is not accepting questions"));

//     const question = await Question.create({ recipient: recipient._id, body });

//     const out = question.toObject();
//     delete out.recipient; //  hide recipient
//     delete out.__v;

//     res.status(201).json(out);
//   } catch (err) {
//     next(err);
//   }
// }

// const VALID_STATUSES = ["pending", "answered", "ignored"];

// // TODO:
// // Hint: filter { recipient: req.user._id }. Optional ?status=pending|answered|ignored (else 400).
// // Pagination: page (default 1, min 1), limit (default 20, min 1, max 50).
// // Sort createdAt desc. Envelope: { data, page, limit, total, totalPages }.
// // See: docs/API.md "GET /api/questions/inbox", tester/tests/inbox.test.js

// export async function listInbox(req, res, next) {
//   try {
//     const page = Math.max(1, parseInt(req.query.page) || 1);
//     const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
//     const skip = (page - 1) * limit;
//     const filter = { recipient: req.user._id };

//     if (req.query.status) {
//       if (!VALID_STATUSES.includes(req.query.status)) {
//         return next(
//           new HttpError(
//             400,
//             `status must be one of: ${VALID_STATUSES.join(", ")}`,
//           ),
//         );
//       }
//       filter.status = req.query.status;
//     }

//     const [docs, total] = await Promise.all([
//       Question.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
//       Question.countDocuments(filter),
//     ]);

//     res.json({
//       data: docs.map((q) => q.toObject()), //  plain objects
//       page,
//       limit,
//       total,
//       totalPages: Math.ceil(total / limit),
//     });
//   } catch (err) {
//     next(err);
//   }
// }

// async function getOwnedQuestion(id, userId) {
//   // TODO:
//   // Hint: load by id -> 404 if missing -> 403 if recipient !== userId.
//   // Compare as strings (ObjectId). Returns the question doc.
//   // throw new Error('not implemented');

//   const question = await Question.findById(id);
//   if (!question) throw new HttpError(404, "Question not found");
//   if (question.recipient.toString() !== userId.toString()) {
//     throw new HttpError(403, "Forbidden");
//   }
//   return question;
// }

// // TODO:
// // Hint: use getOwnedQuestion for 404/403. Set answer, answeredAt=now, status='answered'.
// // If body has visibility, apply it. Save + return the question.
// // See: docs/API.md "POST /api/questions/:id/answer", tester/tests/answer.test.js
// // throw new Error('not implemented');
// export async function answerQuestion(req, res, next) {
//   try {
//     //  Validate answer not empty
//     if (!req.body.answer || req.body.answer.trim() === "") {
//       return next(new HttpError(400, "answer must not be empty"));
//     }

//     const question = await getOwnedQuestion(req.params.id, req.user._id);
//     question.answer = req.body.answer;
//     question.answeredAt = new Date();
//     question.status = "answered";
//     if (req.body.visibility) question.visibility = req.body.visibility;

//     await question.save();
//     res.json(question.toObject()); //  plain object not Mongoose doc
//   } catch (err) {
//     next(err);
//   }
// }

// // TODO:
// // Hint: ownership check. Accept any of answer / status / visibility. If answer provided,
// // also set answeredAt + status='answered'. Save + return.
// // See: docs/API.md "PATCH /api/questions/:id", tester/tests/answer.test.js
// export async function updateQuestion(req, res, next) {
//   try {
//     const { answer, status, visibility } = req.body;

//     if (
//       answer === undefined &&
//       status === undefined &&
//       visibility === undefined
//     ) {
//       return next(
//         new HttpError(
//           400,
//           "At least one of answer, status, visibility is required",
//         ),
//       );
//     }

//     if (
//       status !== undefined &&
//       !["pending", "answered", "ignored"].includes(status)
//     ) {
//       return next(new HttpError(400, "Invalid status value"));
//     }

//     const question = await getOwnedQuestion(req.params.id, req.user._id);

//     if (answer !== undefined) {
//       question.answer = answer;
//       question.answeredAt = new Date();
//       question.status = "answered";
//     }
//     if (status !== undefined) question.status = status;
//     if (visibility !== undefined) question.visibility = visibility;

//     await question.save();
//     res.json(question.toObject());
//   } catch (err) {
//     next(err);
//   }
// }

// export async function removeQuestion(req, res, next) {
//   // TODO:
//   // Hint: ownership check, deleteOne, 204 no content.
//   // See: docs/API.md "DELETE /api/questions/:id", tester/tests/answer.test.js
//   try {
//     const question = await getOwnedQuestion(req.params.id, req.user._id);
//     await question.deleteOne();
//     res.status(204).send();
//   } catch (err) {
//     next(err);
//   }
// }

// export async function listPublicFeed(req, res, next) {
//   // TODO:
//   // Hint: find user by :username (404 if missing). Filter questions:
//   //   recipient=user._id, status='answered', visibility='public'.
//   // Exclude recipient field from response. Sort answeredAt desc. Same pagination envelope as inbox.
//   // See: docs/API.md "GET /api/users/:username/questions", tester/tests/public-feed.test.js
//   try {
//     const { username } = req.params;
//     const page = Math.max(1, parseInt(req.query.page) || 1);
//     const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
//     const skip = (page - 1) * limit;

//     const user = await User.findOne({ username });
//     if (!user) return next(new HttpError(404, "User not found"));

//     const filter = {
//       recipient: user._id,
//       status: "answered",
//       visibility: "public",
//     };

//     const [data, total] = await Promise.all([
//       Question.find(filter)
//         .select("-recipient")
//         .sort({ answeredAt: -1 })
//         .skip(skip)
//         .limit(limit),
//       Question.countDocuments(filter),
//     ]);

//     res.json({
//       data,
//       page,
//       limit,
//       total,
//       totalPages: Math.ceil(total / limit),
//     });
//   } catch (err) {
//     next(err);
//   }
// }
import { Question } from "../models/Question.js";
import { User } from "../models/User.js";
import { HttpError } from "../middleware/errorHandler.js";

export async function sendQuestion(req, res, next) {
  try {
    const { username } = req.params;
    const { body } = req.body;

    if (body === undefined || body === null) {
      return next(new HttpError(400, "body is required"));
    }
    if (typeof body !== "string" || body.trim() === "") {
      return next(new HttpError(400, "body must not be empty"));
    }
    if (body.length > 500) {
      return next(new HttpError(400, "body must be 500 characters or less"));
    }

    const recipient = await User.findOne({ username });
    if (!recipient) return next(new HttpError(404, "User not found"));
    if (!recipient.acceptingQuestions)
      return next(new HttpError(403, "User is not accepting questions"));

    const question = await Question.create({ recipient: recipient._id, body });
    const out = question.toJSON();//plain obj
    delete out.recipient; //delete id 
    res.status(201).json(out);
  } catch (err) {
    next(err);
  }
}

const VALID_STATUSES = ["pending", "answered", "ignored"];

export async function listInbox(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;
    const filter = { recipient: req.user._id };

    if (req.query.status) {
      if (!VALID_STATUSES.includes(req.query.status)) {
        return next(new HttpError(400, `status must be one of: ${VALID_STATUSES.join(", ")}`));
      }
      filter.status = req.query.status;
    }

    const [docs, total] = await Promise.all([
      Question.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Question.countDocuments(filter),
    ]);

    res.json({
      data: docs.map((q) => q.toJSON()),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
}
//helper
async function getOwnedQuestion(id, userId) {
  const question = await Question.findById(id);
  if (!question) throw new HttpError(404, "Question not found");
  if (question.recipient.toString() !== userId.toString()) {
    throw new HttpError(403, "Forbidden");
  }
  return question;
}

export async function answerQuestion(req, res, next) {
  try {
    if (!req.body.answer || req.body.answer.trim() === "") {
      return next(new HttpError(400, "answer must not be empty"));
    }

    const question = await getOwnedQuestion(req.params.id, req.user._id);
    question.answer = req.body.answer;
    question.answeredAt = new Date();
    question.status = "answered";
    if (req.body.visibility) question.visibility = req.body.visibility;

    await question.save();
    res.json(question.toJSON());
  } catch (err) {
    next(err);
  }
}

export async function updateQuestion(req, res, next) {
  try {
    const { answer, status, visibility } = req.body;

    if (answer === undefined && status === undefined && visibility === undefined) {
      return next(new HttpError(400, "At least one of answer, status, visibility is required"));
    }

    if (status !== undefined && !VALID_STATUSES.includes(status)) {
      return next(new HttpError(400, "Invalid status value"));
    }

    const question = await getOwnedQuestion(req.params.id, req.user._id);

    if (answer !== undefined) {
      question.answer = answer;
      question.answeredAt = new Date();
      question.status = "answered";
    }
    if (status !== undefined) question.status = status;
    if (visibility !== undefined) question.visibility = visibility;

    await question.save();
    res.json(question.toJSON());
  } catch (err) {
    next(err);
  }
}

export async function removeQuestion(req, res, next) {
  try {
    const question = await getOwnedQuestion(req.params.id, req.user._id);
    await question.deleteOne();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function listPublicFeed(req, res, next) {
  try {
    const { username } = req.params;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const user = await User.findOne({ username });
    if (!user) return next(new HttpError(404, "User not found"));

    const filter = {
      recipient: user._id,
      status: "answered",
      visibility: "public",
    };

    const [docs, total] = await Promise.all([
      Question.find(filter).sort({ answeredAt: -1 }).skip(skip).limit(limit),
      Question.countDocuments(filter),
    ]);

    res.json({
      data: docs.map((q) => {
        const out = q.toJSON();
        delete out.recipient;
        return out;
      }),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    next(err);
  }
}