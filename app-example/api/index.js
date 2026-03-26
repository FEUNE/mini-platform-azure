const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// Sécurité : headers HTTP
app.use(helmet());

// Sécurité : rate limiting (100 requêtes par 15 minutes par IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});
app.use(limiter);

// Parse JSON
app.use(express.json());

// Gestion d'erreurs globale
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'mini-platform-api'
  });
});

// Root
app.get('/', (req, res) => {
  res.json({ message: 'Mini Platform API is running' });
});

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});