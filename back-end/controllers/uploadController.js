const fs = require('fs');
const pdfParse = require('pdf-parse');
const Tesseract = require('tesseract.js');
const { fromPath } = require('pdf2pic');
const StudentAnswer = require('../models/StudentAnswer');

// Helper: extract answers
const extractAnswers = (text) => {
  const pattern = /(?=\b(\d{1,2}[ -]?[aA]?(?:ns)?\)?))/g;
  const rawSegments = text.split(pattern).map(seg => seg.trim()).filter(Boolean);

  const answers = [];
  for (let i = 0; i < rawSegments.length; i++) {
    const qnMatch = rawSegments[i].match(/^(\d{1,2}[ -]?[aA]?(?:ns)?)/i);
    if (qnMatch) {
      const questionNumber = qnMatch[1].replace(/[-\s]/g, '').toUpperCase();
      const answerText = rawSegments[i + 1] ? rawSegments[i + 1].trim() : '';
      answers.push({ questionNumber, answerText });
      i++;
    }
  }
  return answers;
};

// Helper: validate answers
const validateAnswers = (answers) => {
  const invalids = [];
  answers.forEach((ans, index) => {
    if (!ans.questionNumber || ans.answerText.length < 5) {
      invalids.push({ index, ...ans });
    }
  });
  return invalids;
};

// ✅ Main controller function
const processUpload = async (req, res) => {
  try {
    const { rollNumber, studentName, previewOnly, facultyEmail } = req.body;
    const pdfPath = req.file.path;

    let extractedText = '';

    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdfParse(dataBuffer);

    if (data.text.trim().length > 0) {
      extractedText = data.text;
    } else {
      const options = {
        density: 100,
        saveFilename: 'temp',
        savePath: './temp_images',
        format: 'png',
        width: 1200,
        height: 1600
      };

      const storeAsImage = fromPath(pdfPath, options);
      const pageCount = (await pdfParse(dataBuffer)).numpages;

      for (let i = 1; i <= pageCount; i++) {
        const page = await storeAsImage(i);
        const ocrResult = await Tesseract.recognize(
          page.path,
          'eng',
          { logger: m => console.log(m) }
        );
        extractedText += ocrResult.data.text + '\n';
        fs.unlinkSync(page.path);
      }
    }

    const answers = extractAnswers(extractedText);
    const invalidAnswers = validateAnswers(answers);

    if (previewOnly === 'true') {
      return res.status(200).json({
        preview: true,
        extractedAnswers: answers,
        invalidAnswers
      });
    }

    const studentAnswer = new StudentAnswer({
      rollNumber,
      studentName,
      facultyEmail, // ✅ saving uploader
      answers
    });

    await studentAnswer.save();
    res.status(200).json({ message: 'Upload and processing successful.', invalidAnswers });

  } catch (error) {
    console.error('Error processing upload:', error);
    res.status(500).json({ error: 'An error occurred while processing the upload.' });
  }
};

// ✅ FIXED: Add this export!
module.exports = { processUpload };
