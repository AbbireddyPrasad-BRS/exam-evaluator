// components/PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const facultyEmail = localStorage.getItem('facultyEmail');
  const facultyId = localStorage.getItem('facultyId');

  return facultyEmail && facultyId ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
