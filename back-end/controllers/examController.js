const Exam = require('../models/Exam');

exports.createExam = async (req, res) => {
  try {
    const { facultyId, maxMarks, passMarks, numQuestions, questions } = req.body;

    const newExam = new Exam({
      facultyId,
      maxMarks,
      passMarks,
      numQuestions,
      questions,
    });

    const savedExam = await newExam.save();

    res.status(201).json({ message: 'Exam created successfully', examId: savedExam._id });
  } catch (error) {
    console.error('Error creating exam:', error);
    res.status(500).json({ message: 'Server error while creating exam' });
  }
};
