const fs = require('fs');
const path = require('path');
const Tesseract = require('tesseract.js');
const { fromPath } = require('pdf2pic');
const StudentScript = require('../models/StudentScript');
const Exam = require('../models/Exam');

// 🧠 Convert each page to image and extract text using OCR
async function extractTextFromPDF(filePath) {
  const pdf2pic = fromPath(filePath, {
    density: 150,
    saveFilename: 'page',
    savePath: './temp-images',
    format: 'png',
    width: 1200,
    height: 1600,
  });

  const numPages = 10; // you can dynamically detect pages if needed
  let fullText = '';

  // Ensure temp directory exists
  if (!fs.existsSync('./temp-images')) fs.mkdirSync('./temp-images');

  for (let i = 1; i <= numPages; i++) {
    try {
      const image = await pdf2pic(i);
      const ocrResult = await Tesseract.recognize(image.path, 'eng');
      fullText += ocrResult.data.text + '\n---PAGE-END---\n';
      fs.unlinkSync(image.path); // cleanup
    } catch (err) {
      console.error(`Error processing page ${i}:`, err.message);
      break;
    }
  }

  return fullText;
}

// 🧠 Split answers by pattern (like 1A, 2B, etc.)
function splitAnswers(text) {
  const parts = text.split(/(?:\n|^)(\d+[A]?(?:ns)?[-:]?)/gi);
  const answers = [];

  for (let i = 1; i < parts.length; i += 2) {
    const questionNo = parts[i].trim().replace(/[^0-9A-Za-z]/g, '');
    const studentAnswer = parts[i + 1]?.trim() || '';
    if (questionNo && studentAnswer) {
      answers.push({ questionNo, studentAnswer });
    }
  }

  return answers;
}

// 🧾 Controller
exports.processUploadScript = async (req, res) => {
  try {
    const { rollNumber, studentName, examId } = req.body;
    const filePath = req.file.path;

    const fullText = await extractTextFromPDF(filePath);
    const answers = splitAnswers(fullText);

    const script = new StudentScript({
      examId,
      rollNumber,
      studentName,
      answers,
    });

    await script.save();
    fs.unlinkSync(filePath);

    res.status(200).json({ message: 'Script processed successfully', answers });
  } catch (error) {
    console.error('Error processing script:', error);
    res.status(500).json({ error: 'Failed to process script' });
  }
};
