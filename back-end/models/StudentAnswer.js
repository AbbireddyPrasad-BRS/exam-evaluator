
const mongoose = require('mongoose');

const studentAnswerSchema = new mongoose.Schema({
  studentName: String,
  rollNumber: String,
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam'
  },
  facultyEmail: String,
  answers: [
    {
      questionNumber: String,
      answerText: String
    }
  ],
  evaluated: [
    {
      questionNumber: String,
      marks: Number,
      feedback: String
    }
  ],
  totalMarks: Number,
  result: String
}, { timestamps: true }); // ✅ Add timestamps

module.exports = mongoose.models.StudentAnswer || mongoose.model('StudentAnswer', studentAnswerSchema);
// This schema captures student answers, their evaluation, and metadata like roll number and exam ID.
// The `timestamps` option automatically adds `createdAt` and `updatedAt` fields to the schema.