import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'ShopSphere server is running'
  });
});

app.listen(PORT, () => {
  console.log(`ShopSphere server running on port ${PORT}`);
});