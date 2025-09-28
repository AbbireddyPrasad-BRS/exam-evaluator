// models/Faculty.js
const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
  email: String,
  password: String, // In production, hash this!
});

module.exports = mongoose.model('Faculty', facultySchema);
