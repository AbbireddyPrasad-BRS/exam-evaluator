// models/StudentScript.js
const mongoose = require('mongoose');

const studentScriptSchema = new mongoose.Schema({
  studentName: String,
  rollNumber: String,
  examId: mongoose.Schema.Types.ObjectId,
  answers: [{
    questionNumber: String,
    studentAnswer: String,
    aiAnswer: String,
    marksAwarded: Number,
    similarityPercentage: Number
  }],
  totalMarks: Number,
  result: String
});

// ✅ Prevent OverwriteModelError by checking if model already exists
module.exports = mongoose.models.StudentScript || mongoose.model('StudentScript', studentScriptSchema);
