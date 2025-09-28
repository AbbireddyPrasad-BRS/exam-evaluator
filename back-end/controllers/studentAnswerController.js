const StudentAnswer = require('../models/StudentAnswer');
const Exam = require('../models/Exam');

// ✅ Get student answers by roll number
const getStudentAnswers = async (req, res) => {
  try {
    const { rollNumber } = req.params;
    const answer = await StudentAnswer.findOne({ rollNumber });
    if (!answer) {
      return res.status(404).json({ error: 'No answer found' });
    }
    res.status(200).json(answer);
  } catch (err) {
    console.error('Error fetching student answers:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ✅ Upload history by facultyEmail
const getUploadHistoryByFaculty = async (req, res) => {
  try {
    const { facultyEmail } = req.query;
    const uploads = await StudentAnswer.find({ facultyEmail })
      .sort({ createdAt: -1 })
      .populate({ path: 'examId', select: 'maxMarks passMarks questions title', model: Exam });

    const formatted = uploads.map(u => ({
      rollNumber: u.rollNumber,
      studentName: u.studentName,
      totalMarks: u.totalMarks,
      result: u.result,
      answers: u.answers,
      evaluated: u.evaluated,
      createdAt: u.createdAt,
      examId: u.examId
    }));

    res.json({ uploads: formatted });
  } catch (err) {
    console.error('Error fetching upload history:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ✅ ✅ ✅ Fix: Add this!
module.exports = {
  getStudentAnswers,
  getUploadHistoryByFaculty
};
