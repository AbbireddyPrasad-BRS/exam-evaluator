// src/pages/LandingPage.js
import { Link, useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import '../styles/LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  useEffect(() => {
    const sections = document.querySelectorAll('.section');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          } else {
            entry.target.classList.remove('in-view');
          }
        });
      },
      { threshold: 0.1 }
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  return (
    <div className="landing-wrapper">
      <header className="landing-header">
        <h1 onClick={() => scrollToSection('home')} className="logo">AI Exam Evaluation</h1>

        <div className="menu-icon" onClick={toggleMenu}>
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>

        <nav className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <ul>
            <li onClick={() => scrollToSection('home')}>Home</li>
            <li onClick={() => scrollToSection('what')}>What it does</li>
            <li onClick={() => scrollToSection('instructions')}>Instructions</li>
            <li><Link to="/login">Login / Signup</Link></li>
          </ul>
        </nav>
      </header>

      <section id="home" className="section home-section">
        <h2>AI Based Exam Paper Evaluation System</h2>
        <p>Revolutionizing academic assessments with automation.</p>
        <p>Fast. Fair. Automated. The future of assessments is here</p>
        <button onClick={() => navigate('/login')}>Get Started</button>
      </section>

      <section id="what" className="section what-section">
        <h3>What This App Does</h3>
        <p>
          The AI Based Exam Paper Evaluation System uses machine learning and OCR to automatically evaluate
          student's answer scripts (PDF files). Faculty members can configure exams, upload question papers,
          and let AI extract the text from the PDF file to evaluate. Student's scanned answers are then marked intelligently
          saving hours of manual effort.
        </p>
      </section>

      <section id="instructions" className="section instructions-section">
        <h3>How to Use</h3>
        <ul>
          <li>Login or Signup as Faculty.</li>
          <li>Set up an exam with questions and marks.</li>
          <li>Upload scanned answer script PDF files.</li>
          <li>AI processes the answers and evaluates them.</li>
          <li>View results, mark distribution, and pass/fail status.</li>
        </ul>
      </section>

      <footer className="landing-footer">
        <div className="footer-links">
          <span onClick={() => scrollToSection('home')}>Home</span>
          <span onClick={() => scrollToSection('what')}>What it does</span>
          <span onClick={() => scrollToSection('instructions')}>Instructions</span>
        </div>
        <div className="footer-details">
          <p>Created by - &copy; A.V.V.S.S Prasad </p>
          <a href="https://www.linkedin.com/in/saiprasadabbireddy/" target="_blank" rel="noopener noreferrer">
            LinkedIn Profile
          </a>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
