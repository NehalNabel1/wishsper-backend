// import { RateLimitHit } from '../models/RateLimitHit.js';
// import { HttpError } from './errorHandler.js';

// export function rateLimit({ max, windowMs, keyFn }) {
//   return async function rateLimitMiddleware(req, _res, next) {
//     // TODO:
//     // Hint: compute windowStart = floor(now / windowMs) * windowMs.
//     // Use findOneAndUpdate with { upsert: true, new: true } and $inc: { count: 1 } on { key, windowStart }.
//     // If returned count > max, throw HttpError(429). Otherwise next().
//     // See: docs/API.md "Rate limiting", tester/tests/bonus-rate-limit.test.js
//     // throw new Error('not implemented');
//   };
// }

// export function clientIp(req) {
//   // TODO:
//   // Hint: prefer x-forwarded-for (first IP before comma) — required behind proxies/serverless.
//   // Fall back to req.socket.remoteAddress, then 'unknown'.
//   // throw new Error('not implemented');
// }

import { RateLimitHit } from "../models/RateLimitHit.js";
import { HttpError } from "./errorHandler.js";

export function rateLimit({ max, windowMs, keyFn }) {
  return async function rateLimitMiddleware(req, res, next) {
    try {
      const key = keyFn(req);
      const windowStart = Math.floor(Date.now() / windowMs) * windowMs;

      const record = await RateLimitHit.findOneAndUpdate(
        { key, windowStart },
        { $inc: { count: 1 } },
        { upsert: true, new: true }, //If record does not exist create it.
      );

      if (record.count > max) {
        return next(new HttpError(429, "Too many requests"));
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

export function clientIp(req) {
  const forwarded = req.headers["x-forwarded-for"]; //real client iP address  on vercel
  if (forwarded) {
    return forwarded.split(",")[0].trim(); //gets first iP only
  }
  return req.socket?.remoteAddress || "unknown"; //If no proxy use direct socket IP
}
