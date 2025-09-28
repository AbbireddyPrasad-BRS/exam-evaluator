// UploadScript.js
import React, { useState, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExamContext } from '../context/ExamContext';
import '../styles/UploadScript.css';

const UploadScript = () => {
  const [rollNumber, setRollNumber] = useState('');
  const [studentName, setStudentName] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { examData, setExamData } = useContext(ExamContext);
  const [menuOpen, setMenuOpen] = useState(false);


  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setUploadedFile(file);
      setShowPopup(false);
    } else {
      alert('Only PDF files are allowed!');
    }
  };

  const handleCancelUpload = () => {
    setUploadedFile(null);
    fileInputRef.current.value = null;
    setShowPopup(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      setUploadedFile(file);
    } else {
      alert('Only PDF files are allowed!');
    }
  };

  const handleSubmit = async () => {
    // Clear previous roll number and student name from localStorage
    localStorage.removeItem('studentRollNumber');
    localStorage.removeItem('studentName');
  // Validate roll number and student name
  if (!rollNumber || !studentName) {
    alert('Please enter Roll Number and Student Name.');
    return;
  }

  if (uploadedFile) {
    const formData = new FormData();
    formData.append('pdf', uploadedFile);
    formData.append('rollNumber', rollNumber);
    formData.append('studentName', studentName);
    formData.append('examId', examData.examId); // ✅ add this if missing


    try {
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
       setExamData(prev => {
            const newExamData = {
              ...prev,
              rollNumber,
              studentName,
              examId: prev.examId,
              questions: prev.questions
            };

            // ✅ Store in localStorage *inside the callback*
            localStorage.setItem('studentRollNumber', rollNumber);
            localStorage.setItem('studentName', studentName);
            localStorage.setItem('examId', newExamData.examId);
            localStorage.setItem('questions', JSON.stringify(newExamData.questions));

            return newExamData;
          });
        // Show success popup
        setShowPopup(true);
        setTimeout(() => {
          setShowPopup(false);
          navigate(`/marks/${rollNumber}`);
        }, 1500);
      } else {
        alert('Upload failed. Please try again.');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('An error occurred during upload.');
    }
  } else {
    alert('Please upload a file before submitting.');
  }
};

  return (
    <div className="upload-container">
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
    </ul>
  </nav>
</header>

      <h1 className="main-heading">WELCOME TO ANSWERS UPLOAD PAGE</h1>
      <h2 className="sub-heading">Please enter the details & upload the answer script.</h2>

      <div className="student-roll-number">
        <label>Student Roll Number</label>
        <input
          type="text"
          value={rollNumber}
          onChange={(e) => setRollNumber(e.target.value)}
          placeholder="Enter Roll Number"
        />
      </div>

      <div className="student-name">
        <label>Student Name</label>
        <input
          type="text"
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
          placeholder="Enter Student Name"
        />
      </div>

      <h2 className="upload-title">Upload Student Answer File</h2>

      <div
        className={`dropzone ${isDragging ? 'dragging' : ''} ${uploadedFile ? 'active' : ''}`}
        onClick={() => fileInputRef.current.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="file-input"
          accept=".pdf"
          onChange={handleFileChange}
        />
        <p>{uploadedFile ? uploadedFile.name : 'Click or drag a PDF file here to upload'}</p>
      </div>

      {uploadedFile && (
        <div className="file-controls">
          <button className="cancel" onClick={handleCancelUpload}>Cancel Upload</button>
          <button
            className="view"
            onClick={() => window.open(URL.createObjectURL(uploadedFile), '_blank')}
          >
            View File
          </button>
        </div>
      )}

      <button className="submit" onClick={handleSubmit}>Submit</button>

      {showPopup && <div className="popup-alert">✅ Submitted Successfully!</div>}
    </div>
  );
};

export default UploadScript;
