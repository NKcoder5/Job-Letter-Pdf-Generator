const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// CORS setup to allow only the deployed frontend
const allowedOrigins = [
  'https://job-letter-pdf-generator-1.onrender.com',
];
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

app.use('/uploads', express.static(uploadsDir));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Mongoose Schema for Job Offer
const JobOfferSchema = new mongoose.Schema({
  date: String,
  recipientName: String,
  recipientAddress: String,
  position: String,
  joiningDate: String,
  salary: String,
  senderName: String,
  pdfPath: String,
});

const JobOffer = mongoose.model('JobOffer', JobOfferSchema);

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Routes
app.post('/submit', async (req, res) => {
  try {
    const jobOffer = new JobOffer(req.body);
    await jobOffer.save();
    res.status(201).send({ message: 'Application submitted successfully!', application: jobOffer });
  } catch (error) {
    res.status(400).send({ message: 'Error submitting application', error });
  }
});

app.post('/upload-pdf', upload.single('pdf'), async (req, res) => {
  try {
    const { applicationId } = req.body;
    if (!req.file) {
      return res.status(400).send({ message: 'No file uploaded.' });
    }
    const pdfPath = req.file.path;
    await JobOffer.findByIdAndUpdate(applicationId, { pdfPath });
    const shareableLink = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.status(200).send({ message: 'PDF uploaded successfully!', link: shareableLink });
  } catch (error) {
    res.status(400).send({ message: 'Error uploading PDF', error });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
}); 