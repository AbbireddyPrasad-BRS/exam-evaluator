const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const examRoutes = require('./routes/examRoutes');
const authRoutes = require('./routes/authRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const studentAnswerRoutes = require('./routes/studentAnswerRoutes');
const scriptRoutes = require('./routes/scriptRoutes');
const evaluateRoutes = require('./routes/evaluateRoutes'); // ✅ This is correct

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Test route to verify server is up
app.get('/api/ping', (req, res) => res.send('Server is alive 🔥'));

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/exam', examRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/answers', studentAnswerRoutes);
app.use('/api/scripts', scriptRoutes);
app.use('/api/evaluate', evaluateRoutes); // ✅ Correct path

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`);
});
