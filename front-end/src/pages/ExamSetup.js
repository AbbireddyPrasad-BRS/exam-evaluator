import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExamContext } from '../context/ExamContext';
import '../styles/ExamSetup.css';
import { API_BASE_URL } from '../config';
import { label } from 'framer-motion/client';

const ExamSetup = () => {
  const navigate = useNavigate();
  const { setExamData } = useContext(ExamContext);

  const [maxMarks, setMaxMarks] = useState('');
  const [passMarks, setPassMarks] = useState('');
  const [numQuestions, setNumQuestions] = useState('');
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);


  const handleNumQuestionsChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (isNaN(value) || value < 1 || value > 100) {
      setNumQuestions('');
      setQuestions([]);
    } else {
      setNumQuestions(value);
      setQuestions(Array(value).fill({ question: '', marks: '' }));
    }
  };

  const handleQuestionChange = (index, field, value) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const validateForm = () => {
    if (!maxMarks || !passMarks || questions.length === 0) {
      return 'Please fill in all the fields.';
    }

    const totalMarks = questions.reduce((sum, q) => sum + Number(q.marks || 0), 0);
    if (totalMarks !== Number(maxMarks)) {
      return `Total question marks (${totalMarks}) must equal maximum marks (${maxMarks}).`;
    }

    if (Number(passMarks) > Number(maxMarks)) {
      return `Minimum pass marks (${passMarks}) cannot exceed maximum marks (${maxMarks}).`;
    }

    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].question.trim() || !questions[i].marks) {
        return `Please enter text and marks for question ${i + 1}.`;
      }
    }

    return null;
  };

  const handleSubmit = async () => {
    setError('');
    const facultyId = localStorage.getItem('facultyId');

    if (!facultyId) {
      setError('Faculty ID not found. Please login again.');
      return;
    }

    const errorMsg = validateForm();
    if (errorMsg) {
      setError(errorMsg);
      return;
    }

    const formattedQuestions = questions.map((q, idx) => ({
      questionNumber: idx + 1,
      questionText: q.question.trim(),
      marks: Number(q.marks),
    }));

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE_URL}/api/exam/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facultyId,
          maxMarks: Number(maxMarks),
          passMarks: Number(passMarks),
          numQuestions: Number(numQuestions),
          questions: formattedQuestions,
        }),
      });

      const result = await res.json();

      if (!res.ok || !result.examId) {
        throw new Error(result.message || 'Failed to create exam.');
      }

      setExamData({
        examId: result.examId,
        maxMarks,
        passMarks,
        questions: formattedQuestions,
      });
      navigate('/uploadscript');
    } catch (err) {
      console.error('Submission error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="examsetup-container">
      <header className="landing-header">
  <h1 className="logo" onClick={() => navigate('/')}>AI Exam Evaluation</h1>

  {/* Hamburger Menu */}
  <div className="menu-icon" onClick={() => setMenuOpen(prev => !prev)}>
    <div className="bar" />
    <div className="bar" />
    <div className="bar" />
  </div>

  {/* Navigation */}
  <nav className={`nav-links ${menuOpen ? 'open' : ''}`}>
    <ul>
      <li onClick={() => navigate('/')}>Home</li>
      <li onClick={() => navigate('/uploadscript')}>Upload</li>
      <li onClick={() => navigate('/account')}>Account</li>
      <li onClick={() => navigate('/login')}>Logout</li>
    </ul>
  </nav>
</header>
      {/* <div className="upload-header">
        <button className="account-button" onClick={() => navigate('/account')}>
          👤 Account
        </button>
      </div> */}

      <h1 className="main-heading">WELCOME TO EXAM CONFIGURATION PAGE</h1>
      <h2>Please Fill The Below Details About The Exam</h2>

      <div className="form-group">
        <label>Maximum Marks ( Total Marks ) Of The Exam</label>
        <input
          type="number"
          value={maxMarks}
          onChange={(e) => setMaxMarks(e.target.value)}
          placeholder="Total Exam Marks"
          min="1"
        />
      </div>

      <div className="form-group">
        <label>Minimum Marks To Pass The Exam</label>
        <input
          type="number"
          value={passMarks}
          onChange={(e) => setPassMarks(e.target.value)}
          placeholder="Minimum Pass Marks"
          min="0"
        />
      </div>

      <div className="form-group">
        <label>Total Number Of Questions Present In The Exam</label>
        <input
          type="number"
          value={numQuestions}
          onChange={handleNumQuestionsChange}
          placeholder="Number of Questions"
          min="1"
          max="50"
        />
      </div>

      {questions.map((q, i) => (
        <div key={i} className="question-group">  
          <input
            type="text"
            placeholder={`Enter Question No. ${i + 1}`}
            value={q.question}
            onChange={(e) => handleQuestionChange(i, 'question', e.target.value)}
          />
          <input
            type="number"
            placeholder="Marks"
            min="1"
            value={q.marks}
            onChange={(e) => handleQuestionChange(i, 'marks', e.target.value)}
          />
        </div>
      ))}

      {error && <p className="error">{error}</p>}

      {loading && (
        <div className="loading-container">
          <div className="dots-loader">
            Preparing Exam
            <span className="dot">.</span>
            <span className="dot">.</span>
            <span className="dot">.</span>
          </div>
        </div>
      )}

      <button onClick={handleSubmit} disabled={loading}>
        {loading ? 'Processing...' : 'Submit & Proceed'}
      </button>
    </div>
  );
};

export default ExamSetup;
