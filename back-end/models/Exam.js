const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  questionNumber: Number,
  questionText: String,
  marks: Number,
});

const ExamSchema = new mongoose.Schema({
  facultyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  maxMarks: Number,
  passMarks: Number,
  numQuestions: Number,
  questions: [QuestionSchema],
}, { timestamps: true });

module.exports = mongoose.model('Exam', ExamSchema);
