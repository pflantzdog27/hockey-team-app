const mongoose = require('mongoose');

const OfficeRequirementsSchema = new mongoose.Schema({
  office: { type: String, required: true },
  requirements: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('OfficeRequirements', OfficeRequirementsSchema);
