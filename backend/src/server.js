import dotenv from 'dotenv';
dotenv.config();
import app from './app.js';

// Parse PORT as integer, fallback to 8080 if invalid
const PORT = parseInt(process.env.PORT, 10) || 8080;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend listening on port ${PORT}`);
  console.log('Buy request workflow enabled');
}).on('error', (err) => {
  console.error('Server failed to start:', err);
  process.exit(1);
});
