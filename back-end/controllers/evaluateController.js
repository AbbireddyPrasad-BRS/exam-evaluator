// const mongoose = require('mongoose');
// const Exam = require('../models/Exam');
// const StudentAnswer = require('../models/StudentAnswer');
// const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
// require('dotenv').config();

// exports.evaluateAnswers = async (req, res) => {
//   try {
//     const { rollNumber, examId } = req.body;

//     if (!rollNumber || !examId) {
//       return res.status(400).json({ error: 'rollNumber and examId are required' });
//     }

//     if (!mongoose.Types.ObjectId.isValid(examId)) {
//       return res.status(400).json({ error: 'Invalid examId' });
//     }

//     const student = await StudentAnswer.findOne({ rollNumber });
//     if (!student) return res.status(404).json({ message: 'Student not found' });

//     if (!student.examId) {
//       student.examId = examId;
//     }

//     const exam = await Exam.findById(student.examId);
//     if (!exam) return res.status(404).json({ message: 'Exam not found' });

//     const evaluations = [];

//     const normalizeQNum = (qNum) => {
//       const match = qNum.match(/^\d+/);
//       return match ? match[0] : qNum;
//     };

//     for (let ans of student.answers) {
//       const rawQNum = (ans.questionNumber || '').toString().trim().toUpperCase();
//       const normQNum = normalizeQNum(rawQNum);

//       const questionObj = exam.questions.find(q => {
//         const examQNum = (q.questionNumber || '').toString().trim().toUpperCase();
//         const normExamQNum = normalizeQNum(examQNum);
//         return normExamQNum === normQNum;
//       });

//       if (!questionObj) {
//         evaluations.push({
//           questionNumber: rawQNum,
//           marks: 0,
//           feedback: 'Question not found in exam config.'
//         });
//         continue;
//       }

//       const prompt = `
// Evaluate the student's answer for the following question.

// Question (${questionObj.questionNumber}): ${questionObj.questionText || questionObj.question}
// Student Answer: ${ans.answerText}
// Maximum Marks: ${questionObj.maxMarks || questionObj.marks}

// Rules:
// - Award full marks ONLY IF the student's answer is completely correct, covers ALL key points, and is 100% relevant to the exact question asked.
// - If the answer is only partially correct (e.g., missing major points, lacks clarity, or doesn’t fully address the question), award proportionally reduced marks.
// - If the answer uses related keywords but does not actually explain or solve the current question, award low marks.
// - If the answer is correct for a different question but not this one, assign 0 marks.
// - Answers that are vague, off-topic, or provide general statements must be penalized.
// - If the answer is empty, assign 0 marks
// - Feedback must clearly explain the reason for reduced marks (e.g., “The answer contains related terms but does not explain the required concept fully.” or “Seems correct for a different topic, not this one.”).

// Return JSON only in this format:
// {"marks": number, "feedback": string}
//       `.trim();

//       let marks = 0;
//       let feedback = '';
//       let usedFallback = false;

//       try {
//         const response = await fetch('http://localhost:11434/api/chat', {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json'
//           },
//           body: JSON.stringify({
//             model: 'llama3.2',
//             messages: [
//               {
//                 role: 'system',
//                 content: 'You are an AI that evaluates student answers. Return only JSON with "marks" and "feedback".'
//               },
//               {
//                 role: 'user',
//                 content: prompt
//               }
//             ],
//             stream: false
//           })
//         });

//         const data = await response.json();
//         const rawText = data?.message?.content?.trim();

//         if (!rawText) throw new Error('Empty response from local model');

//         let parsed;
//         try {
//           parsed = JSON.parse(rawText);
//         } catch (err) {
//           console.error('❌ JSON Parse Error:', rawText);
//           throw new Error('Invalid JSON from model');
//         }

//         if (parsed && typeof parsed.marks === 'number' && parsed.feedback) {
//           const max = questionObj.maxMarks || questionObj.marks;
//           marks = Math.min(parsed.marks, max);
//           feedback = parsed.feedback;
//         } else {
//           throw new Error('Missing marks or feedback in parsed response');
//         }

//       } catch (err) {
//         console.error(`❌ Error evaluating question ${rawQNum}:`, err.message);
//         const max = questionObj.maxMarks || questionObj.marks;
//         marks = getRandomMarks(max);
//         feedback = getRandomFeedback();
//         usedFallback = true;
//       }

//       evaluations.push({
//         questionNumber: rawQNum,
//         marks,
//         feedback,
//         usedFallback
//       });
//     }

//     student.evaluated = evaluations;
//     student.totalMarks = evaluations.reduce((sum, e) => sum + e.marks, 0);
//     student.result = student.totalMarks >= exam.passMarks ? 'Pass' : 'Fail';
//     student.examId = exam._id;

//     await student.save();

//     res.json({
//       message: 'Evaluation complete',
//       evaluations,
//       totalMarks: student.totalMarks,
//       result: student.result
//     });

//   } catch (err) {
//     console.error('Evaluation Error:', err);
//     res.status(500).json({ error: 'Evaluation failed' });
//   }
// };



const mongoose = require('mongoose');
const Exam = require('../models/Exam');
const StudentAnswer = require('../models/StudentAnswer');

// **NEW:** Import the Groq SDK
const Groq = require('groq-sdk');
require('dotenv').config();

// Initialize the Groq client with the API key from environment variables
const GROQ_API_KEY = process.env.GROQ_API_KEY;
if (!GROQ_API_KEY) {
    console.error("GROQ_API_KEY is not set in environment variables. Evaluation will fail.");
}
const groq = new Groq({ apiKey: GROQ_API_KEY });

// --- Fallback functions (assuming these exist elsewhere in your original code) ---
// // Note: These functions must be defined for the fallback logic to work.
// const getRandomMarks = (max) => Math.floor(Math.random() * (max + 1));
// const getRandomFeedback = () => "Evaluation failed: The API call to the LLM failed, and a temporary fallback mark and feedback were assigned.";
// -------------------------------------------------------------------------------

exports.evaluateAnswers = async (req, res) => {
    try {
        const { rollNumber, examId } = req.body;

        if (!rollNumber || !examId) {
            return res.status(400).json({ error: 'rollNumber and examId are required' });
        }

        if (!mongoose.Types.ObjectId.isValid(examId)) {
            return res.status(400).json({ error: 'Invalid examId' });
        }

        const student = await StudentAnswer.findOne({ rollNumber });
        if (!student) return res.status(404).json({ message: 'Student not found' });

        // Ensure examId is set, preventing potential issues if it's missing (though it should be passed in req.body)
        if (!student.examId) {
            student.examId = examId;
        }

        const exam = await Exam.findById(student.examId);
        if (!exam) return res.status(404).json({ message: 'Exam not found' });

        const evaluations = [];

        const normalizeQNum = (qNum) => {
            const match = qNum.match(/^\d+/);
            return match ? match[0] : qNum;
        };

        for (let ans of student.answers) {
            const rawQNum = (ans.questionNumber || '').toString().trim().toUpperCase();
            const normQNum = normalizeQNum(rawQNum);

            const questionObj = exam.questions.find(q => {
                const examQNum = (q.questionNumber || '').toString().trim().toUpperCase();
                const normExamQNum = normalizeQNum(examQNum);
                return normExamQNum === normQNum;
            });

            if (!questionObj) {
                evaluations.push({
                    questionNumber: rawQNum,
                    marks: 0,
                    feedback: 'Question not found in exam config.',
                    usedFallback: false,
                });
                continue;
            }

            const prompt = `
Evaluate the student's answer for the following question.

Question (${questionObj.questionNumber}): ${questionObj.questionText || questionObj.question}
Student Answer: ${ans.answerText}
Maximum Marks: ${questionObj.maxMarks || questionObj.marks}

Rules:
- Award full marks ONLY IF the student's answer is completely correct, covers ALL key points, and is 100% relevant to the exact question asked.
- If the answer is only partially correct (e.g., missing major points, lacks clarity, or doesn’t fully address the question), award proportionally reduced marks.
- If the answer uses related keywords but does not actually explain or solve the current question, award low marks.
- If the answer is correct for a different question but not this one, assign 0 marks.
- Answers that are vague, off-topic, or provide general statements must be penalized.
- If the answer is empty, assign 0 marks
- Feedback must clearly explain the reason for reduced marks (e.g., “The answer contains related terms but does not explain the required concept fully.” or “Seems correct for a different topic, not this one.”).

Return JSON only in this format:
{"marks": number, "feedback": string}
            `.trim();

            let marks = 0;
            let feedback = '';
            let usedFallback = false;

            try {
                // **REPLACEMENT START: Using Groq SDK**

                // Groq uses the same message structure as OpenAI for chat completions.
                const completion = await groq.chat.completions.create({
                    // **Recommended Groq Llama 3 Model:** High performance, good limits for free tier.
                    model: 'llama-3.1-8b-instant', 
                    messages: [
                        {
                            role: 'system',
                            // Requesting the model to output *only* the JSON object.
                            content: 'You are an AI that evaluates student answers. You MUST ONLY return a raw JSON object with two keys: "marks" (number) and "feedback" (string). Do not include any other text, preambles, or markdown formatting.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    // Enforce JSON output if the model supports it (llama 3 does)
                    response_format: { type: "json_object" }, 
                    temperature: 0.2, // Lower temperature helps for consistent evaluation
                    max_tokens: 512, // Sufficient for a short JSON response
                    stream: false,
                });

                // The response is now structured, making content extraction easier.
                const rawText = completion.choices[0]?.message?.content?.trim();

                if (!rawText) throw new Error('Empty response from Groq model');

                let parsed;
                try {
                    // Try parsing the raw text (which should be a clean JSON object)
                    parsed = JSON.parse(rawText);
                } catch (err) {
                    console.error('❌ JSON Parse Error:', rawText);
                    throw new Error('Invalid JSON from model. Raw response: ' + rawText.substring(0, 100) + '...');
                }

                if (parsed && typeof parsed.marks === 'number' && parsed.feedback) {
                    const max = questionObj.maxMarks || questionObj.marks;
                    // Ensure awarded marks do not exceed the maximum marks
                    marks = Math.min(parsed.marks, max); 
                    feedback = parsed.feedback;
                } else {
                    throw new Error('Missing marks or feedback in parsed response');
                }

                // **REPLACEMENT END**

            } catch (err) {
                console.error(`❌ Error evaluating question ${rawQNum}:`, err.message);
                const max = questionObj.maxMarks || questionObj.marks;
                marks = getRandomMarks(max);
                feedback = getRandomFeedback();
                usedFallback = true;
            }

            evaluations.push({
                questionNumber: rawQNum,
                marks,
                feedback,
                usedFallback
            });
        }

        student.evaluated = evaluations;
        student.totalMarks = evaluations.reduce((sum, e) => sum + e.marks, 0);
        student.result = student.totalMarks >= exam.passMarks ? 'Pass' : 'Fail';
        student.examId = exam._id;

        await student.save();

        res.json({
            message: 'Evaluation complete',
            evaluations,
            totalMarks: student.totalMarks,
            result: student.result
        });

    } catch (err) {
        console.error('Evaluation Error:', err);
        res.status(500).json({ error: 'Evaluation failed' });
    }
};