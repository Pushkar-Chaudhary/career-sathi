const mongoose = require('mongoose');

const rateLimitBucketSchema = new mongoose.Schema({
  _id: { type: String },
  count: { type: Number, required: true },
  expiresAt: { type: Date, required: true, expires: 0 }
}, { versionKey: false });

module.exports = mongoose.model('RateLimitBucket', rateLimitBucketSchema);