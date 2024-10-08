const mongoose = require('mongoose');

const CandidacySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  office: { type: String, required: true },
  campaignSlogan: { type: String },
  campaignDescription: { type: String },
  issues: [String],
  status: { type: String, default: 'active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Candidacy', CandidacySchema);
