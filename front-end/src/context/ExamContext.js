import React, { createContext, useState, useEffect } from 'react';

export const ExamContext = createContext();

export const ExamProvider = ({ children }) => {
  const [examData, setExamData] = useState({
    rollNumber: '',
    studentName: '',
    examId: '', // ✅ ADD THIS
    maxMarks: '',
    passMarks: '',
    questions: [],
  });
  const [facultyName, setFacultyName] = useState('');

  // Restore facultyName from localStorage if available
  useEffect(() => {
  const storedFaculty = localStorage.getItem('facultyName');
  const storedExamId = localStorage.getItem('examId');
  if (storedFaculty) {
    setFacultyName(storedFaculty);
  }

  if (storedExamId) {
    setExamData(prev => ({
      ...prev,
      examId: storedExamId // ✅ Restore examId into context
    }));
  }
}, []);

  return (
    <ExamContext.Provider value={{ examData, setExamData, facultyName, setFacultyName }}>
      {children}
    </ExamContext.Provider>
  );
};
