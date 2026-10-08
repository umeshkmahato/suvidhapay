import pkg from 'pg';
import config from './index.js';

const { Pool } = pkg;

const pool = new Pool(config.db);

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export default pool;
