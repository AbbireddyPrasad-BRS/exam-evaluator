const Faculty = require('../models/Faculty');

exports.signup = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const existingFaculty = await Faculty.findOne({ email });
    if (existingFaculty) {
      return res.status(409).json({ success: false, message: 'Faculty already exists.' });
    }

    const newFaculty = new Faculty({ email, password });
    await newFaculty.save();

    res.status(201).json({ success: true, message: 'Signup successful!' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ success: false, message: 'Server error during signup.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const faculty = await Faculty.findOne({ email });

    if (!faculty || faculty.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        _id: faculty._id,
        email: faculty.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};
