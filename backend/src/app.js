import express from 'express';
import cors from 'cors';
import multer from 'multer';
import routes from './routes/index.js';

const app = express();

app.use(cors());
app.use(express.json());

// Configure multer for file uploads (images only, max 5MB each, up to 5 files)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Middleware to handle multipart/form-data for image uploads (up to 5 files)
app.use('/api/listings', upload.array('images', 5));

app.use('/api', routes);

export default app;
