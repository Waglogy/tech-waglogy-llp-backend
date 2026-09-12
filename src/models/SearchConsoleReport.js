const mongoose = require('mongoose');
const metric = new mongoose.Schema({ key: String, clicks: Number, impressions: Number, ctr: Number, position: Number }, { _id: false });
const schema = new mongoose.Schema({
  fingerprint: { type: String, required: true, unique: true },
  property: { type: String, required: true },
  sourceFile: String,
  startDate: String,
  endDate: String,
  filters: [{ _id: false, name: String, value: String }],
  totals: { clicks: Number, impressions: Number, ctr: Number, position: Number },
  daily: [metric], queries: [metric], pages: [metric], countries: [metric], devices: [metric],
  importedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
module.exports = mongoose.model('SearchConsoleReport', schema);
