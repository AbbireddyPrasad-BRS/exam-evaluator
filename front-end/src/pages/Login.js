// pages/Login.js
import React, { useState, useContext } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ExamContext } from '../context/ExamContext';
import { API_BASE_URL } from '../config';
import '../styles/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false); // ✅ Mobile nav state

  const navigate = useNavigate();
  const location = useLocation();
  const { setFacultyName } = useContext(ExamContext);

  const handleLogin = async () => {
    setError('');
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        const facultyId = result.user._id;
        const facultyEmail = result.user.email;
        const facultyName = facultyEmail.split('@')[0];

        localStorage.setItem('facultyId', facultyId);
        localStorage.setItem('facultyName', facultyName);
        localStorage.setItem('facultyEmail', facultyEmail);

        setFacultyName(facultyName);

        navigate('/examsetup');
      } else {
        setError(result.message || 'Login failed. Try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Could not connect to server. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const scrollToSection = (id) => {
    if (location.pathname !== '/') {
      navigate(`/#${id}`);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
    setMenuOpen(false);
  };

  return (
    <div className="login-page-wrapper">
      {/* ✅ Header */}
      <header className="landing-header">
        <h1 className="logo" onClick={() => scrollToSection('top')}>AI Exam Evaluation</h1>

        {/* Hamburger Menu */}
        <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
          <div className="bar" />
          <div className="bar" />
          <div className="bar" />
        </div>

        {/* Desktop + Mobile Nav */}
        <nav className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <ul>
            <li onClick={() => scrollToSection('top')}>Home</li>
            <li onClick={() => scrollToSection('what')}>What it does</li>
            <li onClick={() => scrollToSection('instructions')}>Instructions</li>
            <li><Link to="/signup">Signup</Link></li>
          </ul>
        </nav>
      </header>

      {/* ✅ Login Container */}
      <div className="login-container">
        <h1 className="main-heading">AI Based Exam Paper Evaluation System</h1>
        <h2>Login</h2>

        <input
          type="email"
          placeholder="Faculty Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="login-password-field">
  <input
    type={showPassword ? 'text' : 'password'}
    placeholder="Password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
  />
  <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle Password Visibility">
    👁
  </button>
</div>


        {error && <p className="error">{error}</p>}

        <button onClick={handleLogin} disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p>New user? <Link to="/signup">Signup</Link></p>
      </div>

      {/* ✅ Footer */}
      {/* <footer className="landing-footer">
        <div className="footer-links">
          <span onClick={() => scrollToSection('top')}>Home</span>
          <span onClick={() => scrollToSection('what')}>What it does</span>
          <span onClick={() => scrollToSection('instructions')}>Instructions</span>
        </div>
        <div className="footer-details">
          <p>Created by - &copy; A.V.V.S.S Prasad</p>
          <a href="https://www.linkedin.com/in/saiprasadabbireddy/" target="_blank" rel="noopener noreferrer">
            LinkedIn Profile
          </a>
        </div>
      </footer> */}
    </div>
  );
};

export default Login;
