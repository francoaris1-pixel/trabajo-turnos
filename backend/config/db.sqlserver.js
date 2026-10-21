// config/db.sqlserver.js — Conexión a SQL Server con mssql (Tedious)
// Uso: const { sql, poolPromise } = require('./db.sqlserver');
require('dotenv').config();
const sql = require('mssql');

const config = {
  server: process.env.DB_SERVER || 'localhost',
  port: parseInt(process.env.DB_PORT || '1433', 10),
  database: process.env.DB_DATABASE || 'TrabajoTurnos',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: (process.env.DB_ENCRYPT || 'false') === 'true', // true si usas Azure SQL
    trustServerCertificate: (process.env.DB_TRUST_SERVER_CERTIFICATE || 'true') === 'true',
    enableArithAbort: true,
  },
  pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
};

const poolPromise = new sql.connect(config)
  .then((pool) => {
    console.log('✅ Conectado a SQL Server:', config.database);
    return pool;
  })
  .catch((err) => {
    console.error('❌ Error de conexión a SQL Server:', err.message);
    process.exit(1);
  });

module.exports = { sql, poolPromise };
