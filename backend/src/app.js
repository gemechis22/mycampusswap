import express from 'express';
import cors from 'cors';
import multer from 'multer';
import routes from './routes/index.js';

const app = express();

app.use(cors());
app.use(express.json());

// Configure multer for file uploads (images only, max 5MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Middleware to handle multipart/form-data for image uploads
app.use('/api/listings', upload.single('image'));

app.use('/api', routes);

export default app;
