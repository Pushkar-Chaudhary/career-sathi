const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  role: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: 160
  },
  company: {
    type: String,
    required: [true, 'Company is required'],
    trim: true,
    maxlength: 160
  },
  jobUrl: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  status: {
    type: String,
    enum: ['saved', 'applied', 'interviewing', 'offer', 'rejected'],
    default: 'saved'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 3000
  },
  appliedAt: Date
}, { timestamps: true });

applicationSchema.index({ userId: 1, updatedAt: -1 });

module.exports = mongoose.model('Application', applicationSchema);
