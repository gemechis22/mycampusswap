import dotenv from 'dotenv';
dotenv.config();
import app from './app.js';

const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend listening on port ${PORT}`);
}).on('error', (err) => {
  console.error('Server failed to start:', err);
  process.exit(1);
});
