require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, param, validationResult } = require('express-validator');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Sécurité : headers HTTP
app.use(helmet());

// Sécurité : rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});
app.use(limiter);

// Parse JSON avec limite de taille
app.use(express.json({ limit: '10kb' }));

// Middleware de validation
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

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

// GET /items
app.get('/items', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM items ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur GET /items :', err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /items
app.post('/items', [
  body('name')
    .trim()
    .notEmpty().withMessage('Le champ "name" est obligatoire')
    .isLength({ max: 100 }).withMessage('Le nom ne peut pas dépasser 100 caractères')
    .escape(),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('La description ne peut pas dépasser 500 caractères')
    .escape(),
  validate
], async (req, res) => {
  const { name, description } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO items (name, description) VALUES ($1, $2) RETURNING *',
      [name, description || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Erreur POST /items :', err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /items/:id
app.delete('/items/:id', [
  param('id')
    .isInt({ min: 1 }).withMessage('ID invalide'),
  validate
], async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM items WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item non trouvé' });
    }
    res.json({ message: 'Item supprimé', item: result.rows[0] });
  } catch (err) {
    console.error('Erreur DELETE /items :', err.message);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Gestion d'erreurs globale
app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});