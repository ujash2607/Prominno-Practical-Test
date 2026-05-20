const pool = require("../database/db");

const schemaSql = `
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('admin','seller')),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  mobile TEXT,
  country TEXT,
  state TEXT,
  skills TEXT[],
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  seller_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  product_description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS product_brands (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  brand_name TEXT NOT NULL,
  detail TEXT,
  image_url TEXT,
  price NUMERIC(18,2) NOT NULL CHECK (price >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

async function ensureDb() {

     await pool.query(schemaSql);

     const { rows } = await pool.query("SELECT id FROM users WHERE role='admin' LIMIT 1");
     if (rows.length === 0) {
          const bcrypt = require('bcrypt');
          const defaultPass = 'admin@123';
          const hash = await bcrypt.hash(defaultPass, 10);

          await pool.query(
               `INSERT INTO users (role, name, email, mobile, country, state, skills, password)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
               ['admin', 'Default Admin', 'admin@gmail.com', null, null, null, '{}', hash]
          );
     }
}

module.exports = { ensureDb };