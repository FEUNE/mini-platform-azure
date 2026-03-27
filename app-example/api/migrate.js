require('dotenv').config();
const pool = require('./db');

const migrate = async () => {
  console.log(' Démarrage de la migration...');

  try {
    // Transaction — si quelque chose échoue, tout est annulé
    await pool.query('BEGIN');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS items (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description VARCHAR(500),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log(' Table "items" créée ou déjà existante');

    // Seed : données de test
    const existing = await pool.query('SELECT COUNT(*) FROM items');
    if (parseInt(existing.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO items (name, description) VALUES
        ('Item 1', 'Premier item de test'),
        ('Item 2', 'Deuxième item de test'),
        ('Item 3', 'Troisième item de test');
      `);
      console.log(' Données de test insérées (seed)');
    } else {
      console.log('ℹ Données déjà présentes, seed ignoré');
    }

    // Tout s'est bien passé — on valide
    await pool.query('COMMIT');
    console.log(' Migration validée');

  } catch (err) {
    // Quelque chose a échoué — on annule tout
    await pool.query('ROLLBACK');
    console.error(' Erreur migration, rollback effectué :', err.message);
    process.exit(1);
  } finally {
    await pool.end();
    console.log(' Connexion fermée');
  }
};

migrate();