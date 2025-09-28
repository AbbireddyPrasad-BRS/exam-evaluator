// App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ExamSetup from './pages/ExamSetup';
import UploadScript from './pages/UploadScript';
import MarksDisplay from './pages/MarksDisplay';
import AccountPage from './pages/AccountPage';
import PrivateRoute from './components/PrivateRoute';
import LandingPage from './pages/LandingPage'; // ✅ NEW

import './App.css';
import { ExamProvider } from './context/ExamContext';

function App() {
  return (
    <ExamProvider>
      <div className="App">
        <Routes>
          {/* ✅ Show Landing Page at root */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* ✅ Protected Routes */}
          <Route path="/examsetup" element={<PrivateRoute><ExamSetup /></PrivateRoute>} />
          <Route path="/uploadscript" element={<PrivateRoute><UploadScript /></PrivateRoute>} />
          <Route path="/marks/:rollNo" element={<PrivateRoute><MarksDisplay /></PrivateRoute>} />
          <Route path="/account" element={<PrivateRoute><AccountPage /></PrivateRoute>} />
        </Routes>
      </div>
    </ExamProvider>
  );
}

export default App;
