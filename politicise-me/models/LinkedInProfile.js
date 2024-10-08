const mongoose = require('mongoose');

const LinkedInProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  linkedinData: {
    sub: String,
    email_verified: Boolean,
    name: String,
    locale: {
      country: String,
      language: String
    },
    given_name: String,
    family_name: String,
    email: String,
    picture: String
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LinkedInProfile', LinkedInProfileSchema);
