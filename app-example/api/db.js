require('dotenv').config();
const { Pool } = require('pg');

// Vérification des variables d'environnement obligatoires
const requiredEnvVars = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
const missingVars = requiredEnvVars.filter(v => !process.env[v]);

if (missingVars.length > 0) {
  console.error(`❌ Variables d'environnement manquantes : ${missingVars.join(', ')}`);
  process.exit(1);
}

// Création du pool de connexions
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: true
  },
  max: 10,                // Maximum 10 connexions simultanées
  idleTimeoutMillis: 30000,  // Ferme une connexion inactive après 30s
  connectionTimeoutMillis: 5000, // Timeout si connexion impossible après 5s
});

// Test de connexion au démarrage
pool.on('connect', () => {
  console.log('✅ Connecté à PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Erreur PostgreSQL :', err.message);
});

module.exports = pool;