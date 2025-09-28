
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AccountPage.css';

const AccountPage = () => {
  const navigate = useNavigate();
  const [facultyEmail, setFacultyEmail] = useState('');
  const [facultyName, setFacultyName] = useState('');
  const [uploads, setUploads] = useState([]);
  const [expandedRows, setExpandedRows] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const email = localStorage.getItem('facultyEmail');
    if (!email) {
      alert('Please log in to access this page.');
      navigate('/login');
      return;
    }

    setFacultyEmail(email);
    const nameFromEmail = email.split('@')[0].replace('.', ' ');
    setFacultyName(nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1));

    fetch(`http://localhost:5000/api/answers/history/by-faculty?facultyEmail=${email}`)
      .then((res) => res.json())
      .then((data) => setUploads(data.uploads || []))
      .catch((err) => console.error('Error fetching uploads:', err));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    alert('Logged out successfully!');
    navigate('/login');
  };

  const toggleRow = (index) => {
    setExpandedRows((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <div className="account-page-container">
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
      <li onClick={() => navigate('/uploadscript')}>Upload Script</li>
      <li onClick={() => navigate('/marks')}>Marks</li>
      <li onClick={() => navigate('/account')}>Account</li>
      <li onClick={() => navigate('/login')}>Logout</li>
    </ul>
  </nav>
</header>

      <h1 className="main-heading">User Details and Upload history</h1>

      <div className="faculty-bar">
        <p>👩‍🏫 Faculty Name: <strong>{facultyName}</strong></p>
      </div>

      <h2>📚 Students Marks Records (Upload History)</h2>

      <table>
        <thead>
          <tr>
            <th>Roll No</th>
            <th>Name</th>
            <th>Total Marks</th>
            <th>Result</th>
            <th>Exam</th>
            <th>Submitted At</th>
          </tr>
        </thead>
        <tbody>
          {uploads.length === 0 ? (
            <tr><td colSpan="6">No uploads found for this faculty.</td></tr>
          ) : (
            uploads.map((upload, i) => (
              <React.Fragment key={i}>
                <tr onClick={() => toggleRow(i)} style={{ cursor: 'pointer' }}>
                  <td>{upload.rollNumber}</td>
                  <td>{upload.studentName}</td>
                  <td>{upload.totalMarks ?? 'Not Evaluated'}</td>
                  <td>{upload.result ?? 'Pending'}</td>
                  <td>{upload.exam}</td>
                  <td>{upload.createdAt ? new Date(upload.createdAt).toLocaleString() : '-'}</td>
                </tr>
                {expandedRows.includes(i) && (
                  <tr>
                    <td colSpan="6">
                      <div style={{ textAlign: 'left', padding: '10px', backgroundColor: '#0f0f0f', borderRadius: '10px' }}>
                        <h4 style={{ color: '#66fcf1' }}>📋 Answer Details:</h4>
                        {upload.answers.map((ans, idx) => {
                          const evalMark = upload.evaluated?.find(e => e.questionNumber === ans.questionNumber);
                          return (
                            <div key={idx} style={{ marginBottom: '20px', borderBottom: '1px solid #666', paddingBottom: '10px' }}>
                              <p><strong>Q{ans.questionNumber}</strong></p>
                              <p>✍️ <strong>Student Answer:</strong> {ans.answerText}</p>
                              <p>✅ <strong>Marks:</strong> {evalMark?.marks ?? 'N/A'}</p>
                              <p>📝 <strong>Feedback:</strong> {evalMark?.feedback ?? 'N/A'}</p>
                            </div>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))
          )}
        </tbody>
      </table>
<h3 className="future-scope"><strong>NOTE: </strong> This Page will be available from the next version of this app !!</h3>
      <div className="logout-container">
        <button onClick={handleLogout} className="logout-button">🚪 Logout</button>
      </div>
    </div>
  );
};

export default AccountPage;
