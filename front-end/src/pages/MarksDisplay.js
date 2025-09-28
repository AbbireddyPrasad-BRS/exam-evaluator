// src/pages/MarksDisplay.js
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExamContext } from '../context/ExamContext';
import '../styles/MarksDisplay.css';

const MarksDisplay = () => {
  const navigate = useNavigate();
  const [evaluations, setEvaluations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalMarks, setTotalMarks] = useState(0);
  const [result, setResult] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [error, setError] = useState('');
const { examData, setExamData } = useContext(ExamContext);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
  if (
    !examData.rollNumber ||
    !examData.studentName ||
    !examData.examId ||
    !examData.questions.length
  ) {
    const storedRoll = localStorage.getItem('studentRollNumber');
    const storedName = localStorage.getItem('studentName');
    const storedExamId = localStorage.getItem('examId');
    const storedQuestions = localStorage.getItem('questions');

    if (storedRoll && storedName && storedExamId && storedQuestions) {
      setExamData(prev => ({
        ...prev,
        rollNumber: storedRoll,
        studentName: storedName,
        examId: storedExamId,
        questions: JSON.parse(storedQuestions)
      }));
    }
  }
}, []);

useEffect(() => {
  const fetchEvaluation = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('http://localhost:5000/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rollNumber: examData.rollNumber,
          examId: examData.examId
        })
      });

      if (!res.ok) {
        throw new Error('Server Error - Failed to fetch evaluation');
      }

      const data = await res.json();
      setEvaluations(data.evaluations);
      setTotalMarks(data.totalMarks);
      setResult(data.result);
    } catch (err) {
      console.error(err);
      setError('Server Error - Failed to fetch evaluation');
    } finally {
      setIsLoading(false);
    }
  };

  if (
    examData.rollNumber &&
    examData.studentName &&
    examData.examId &&
    examData.questions.length
  ) {
    fetchEvaluation();
  }
}, [examData]);


  const maxMarks = examData.questions
    ? examData.questions.reduce((acc, q) => acc + Number(q.marks), 0)
    : 0;

  const normalizeQNum = (qNum) => {
    const match = qNum.toString().match(/^\d+/);
    return match ? match[0] : qNum.toString();
  };

  return (
    <div className="marks-container">
      <header className="landing-header">
  <h1 className="logo" onClick={() => navigate('/')}>AI Exam Evaluation</h1>

  <div className="menu-icon" onClick={() => setMenuOpen(prev => !prev)}>
    <div className="bar" />
    <div className="bar" />
    <div className="bar" />
  </div>

  <nav className={`nav-links ${menuOpen ? 'open' : ''}`}>
    <ul>
      <li onClick={() => navigate('/')}>Home</li>
      <li onClick={() => navigate('/examsetup')}>Set-Exam</li>
      <li onClick={() => navigate('/account')}>Account</li>
      <li onClick={() => navigate('/login')}>Logout</li>
    </ul>
  </nav>
</header>
      <h1 className="main-heading">Student Exam Report</h1>
      <div className="student-info">
        <p><strong>🆔 Roll Number:</strong> {examData.rollNumber}</p>
        <p><strong>🎓 Student Name:</strong> {examData.studentName}</p>
      </div>

      {error ? (
        <p className="no-data">{error}</p>
      ) : (
        <>
          <h3>📄 Question Breakdown:</h3>
          <table className="marks-table">
            <thead>
              <tr>
                <th>Q. No.</th>
                <th>Question</th>
                <th>Max Marks</th>
                <th>AI Awarded Marks</th>
              </tr>
            </thead>
            <tbody>
              {examData.questions?.map((q, index) => {
                const evalEntry = evaluations.find(e =>
                  normalizeQNum(e.questionNumber) === normalizeQNum(q.questionNumber)
                );

                return (
                  <tr key={index}>
                    <td>{index + 1}</td>
                      <td>{q.question || q.questionText || 'N/A'}</td>
                    <td>{q.marks}</td>
                    <td className="ai-mark">
                      {isLoading
                        ? 'Evaluating...'
                        : evalEntry
                        ? evalEntry.marks
                        : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <h3>📚 Feedback Summary</h3>
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Question No.</th>
             
                <th>Feedback</th>
              </tr>
            </thead>
            <tbody>
              {examData.questions?.map((q, i) => {
                const evalEntry = evaluations.find(e =>
                  normalizeQNum(e.questionNumber) === normalizeQNum(q.questionNumber)
                );
                return (
                  <tr key={i}>
                    <td>{q.questionNumber}</td>
                   
                    <td>{isLoading ? 'Evaluating...' : evalEntry?.feedback ?? '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="result-summary">
            <p><strong>📊 Total Marks Obtained:</strong> {isLoading ? 'Evaluating...' : `${totalMarks} / ${maxMarks}`}</p>
            <p><strong>📌 Status:</strong> {isLoading ? 'Evaluating...' : result}</p>
          </div>
        </>
      )}

      <div className="button-group">
        <button className="back-btn" onClick={() => navigate('/uploadscript')}>⬅ Upload Another</button>
        {pdfUrl && (
          <button className="view-pdf-btn" onClick={() => window.open(pdfUrl, '_blank')}>
            📄 View Uploaded Script
          </button>
        )}
      </div>
    </div>
  );
};

export default MarksDisplay;
