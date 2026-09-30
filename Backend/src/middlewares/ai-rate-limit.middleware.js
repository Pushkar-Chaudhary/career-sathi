function createUserRateLimit({ maxRequests, windowMs, message }) {
  const buckets = new Map();

  return function userRateLimit(req, res, next) {
    const key = String(req.user?.id || 'unknown');
    const now = Date.now();
    let bucket = buckets.get(key);

    if (!bucket || now - bucket.startedAt >= windowMs) {
      bucket = { startedAt: now, count: 0 };
      buckets.set(key, bucket);
    }

    if (bucket.count >= maxRequests) {
      const retryAfter = Math.max(1, Math.ceil((bucket.startedAt + windowMs - now) / 1000));
      res.set('Retry-After', String(retryAfter));
      return res.status(429).json({ message });
    }

    bucket.count += 1;
    if (buckets.size > 1000) {
      for (const [userId, userBucket] of buckets) {
        if (now - userBucket.startedAt >= windowMs) buckets.delete(userId);
      }
    }
    return next();
  };
}

const limitResumeDrafts = createUserRateLimit({
  maxRequests: 4,
  windowMs: 15 * 60 * 1000,
  message: 'You have reached the resume draft limit. Please try again in a few minutes.'
});

const limitCareerGuide = createUserRateLimit({
  maxRequests: 15,
  windowMs: 5 * 60 * 1000,
  message: 'You have sent several guide questions. Please wait a few minutes and try again.'
});

module.exports = { limitResumeDrafts, limitCareerGuide };
