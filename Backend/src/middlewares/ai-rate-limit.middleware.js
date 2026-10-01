const rateLimitBucketModel = require('../models/rateLimitBucket.model');

async function incrementBucket(bucketId, maxRequests, expiresAt) {
  try {
    return await rateLimitBucketModel.findOneAndUpdate(
      { _id: bucketId, count: { $lt: maxRequests } },
      { $inc: { count: 1 }, $setOnInsert: { expiresAt } },
      { new: true, upsert: true }
    );
  } catch (error) {
    if (error.code !== 11000) throw error;
    return rateLimitBucketModel.findOneAndUpdate(
      { _id: bucketId, count: { $lt: maxRequests } },
      { $inc: { count: 1 } },
      { new: true }
    );
  }
}

function createRateLimit({ action, keyFromRequest, maxRequests, windowMs, message, increment = incrementBucket }) {
  return async function userRateLimit(req, res, next) {
    const key = String(keyFromRequest(req));
    const now = Date.now();
    const windowStart = Math.floor(now / windowMs) * windowMs;
    const expiresAt = new Date(windowStart + windowMs);
    const bucketId = `${action}:${key}:${windowStart}`;

    let bucket;
    try {
      bucket = await increment(bucketId, maxRequests, expiresAt);
    } catch (error) {
      return next(error);
    }

    if (!bucket) {
      const retryAfter = Math.max(1, Math.ceil((expiresAt.getTime() - now) / 1000));
      res.set('Retry-After', String(retryAfter));
      return res.status(429).json({ message });
    }

    return next();
  };
}

function createUserRateLimit(options) {
  return createRateLimit({
    ...options,
    keyFromRequest: (req) => req.user?.id || 'unknown'
  });
}

const limitResumeDrafts = createUserRateLimit({
  action: 'resume-draft',
  maxRequests: 4,
  windowMs: 15 * 60 * 1000,
  message: 'You have reached the resume draft limit. Please try again in a few minutes.'
});

const limitCareerGuide = createUserRateLimit({
  action: 'career-guide',
  maxRequests: 15,
  windowMs: 5 * 60 * 1000,
  message: 'You have sent several guide questions. Please wait a few minutes and try again.'
});

module.exports = { createRateLimit, createUserRateLimit, limitResumeDrafts, limitCareerGuide };
