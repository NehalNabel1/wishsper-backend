// import { Question } from "../models/Question.js";
// import { User } from "../models/User.js";

//   // TODO:
//   // Hint: filter status='answered', visibility='public'.
//   // Optional ?tag=xxx: first find user ids with that tag (User.find({tags: xxx}).distinct('_id')),
//   //   then add recipient: { $in: ids } to the filter. If no users match, return empty page.
//   // Populate recipient with: username displayName avatarUrl tags.
//   // Sort answeredAt desc. Pagination envelope { data, page, limit, total, totalPages }.
//   // See: docs/API.md "GET /api/feed", tester/tests/global-feed.test.js
//   // throw new Error('not implemented');

//   //   const data= await Question.find(filter).populate('recipient' , 'username displayName avatarUrl tags')
//   //  .sort({answeredAt: -1})
//   //  .skip(skip)
//   //  .limit(limit);
//   //  const total = await  Question.countDocuments(filter);
//

import { Question } from "../models/Question.js";
import { User } from "../models/User.js";

export async function listGlobalFeed(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter = { status: "answered", visibility: "public" };

    if (req.query.tag) {
      const ids = await User.find({ tags: req.query.tag }).distinct("_id");
      if (ids.length === 0) {
        return res.json({ data: [], page, limit, total: 0, totalPages: 0 });
      }
      filter.recipient = { $in: ids }; // show questions answered by users
    }

    const [docs, total] = await Promise.all([
      Question.find(filter)
        .populate("recipient", "username displayName avatarUrl tags")
        .sort({ answeredAt: -1 })
        .skip(skip)
        .limit(limit),
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
