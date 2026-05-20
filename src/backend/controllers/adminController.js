const pool = require("../database/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const adminAndSellerLogin = async (req, res) => {
     try {
          let text, values;
          const { email, password } = req.body;

          text = `SELECT * FROM users WHERE email = $1`;
          values = [email];

          const userFound = await pool.query(text, values);
          if (userFound.rows.length === 0) {
               return res.status(400).send({ success: false, message: "User not found" });
          }
          const user = userFound.rows[0];
          // if (user.role !== 'admin') {
          //      return res.status(403).send({ success: false, message: "Only admin can login here" });
          // }

          const passwordCompare = await bcrypt.compare(password, user.password);
          if (!passwordCompare) {
               return res.status(401).send({ success: false, message: "Invalid email or password" });
          }

          const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
          return res.status(200).send({ success: true, message: `User ${user.role} login successfully`, token: token });
     } catch (error) {
          console.log(error, 'Error while admin login');
          return res.status(400).send({ sucess: false, message: "Error while admin login", error: error.message });
     }
}

const createSeller = async (req, res) => {
     try {
          const { name, email, mobile, country, state, skills, password, } = req.body;

          const existingSeller = await pool.query(
               'SELECT * FROM users WHERE email = $1',
               [email]
          );

          if (existingSeller.rows.length > 0) {
               return res.status(400).send({
                    success: false,
                    message: 'Seller already exists',
               });
          }

          const hashedPassword = await bcrypt.hash(password, 10);

          const query = `
          INSERT INTO users
          (name, email, mobile, country, state, skills, password, role)
          VALUES ($1,$2,$3,$4,$5,$6,$7, $8)
          RETURNING *
          `;
          const values = [name, email, mobile, country, state, skills, hashedPassword, 'seller'];

          const result = await pool.query(query, values);

          res.status(201).json({
               success: true,
               message: 'Seller created successfully',
               data: result.rows[0],
          });
     } catch (error) {
          console.log(error, 'Error while create seller');
          return res.status(400).send({ sucess: false, message: "Error while create seller", error: error.message });
     }
}

const listSellers = async (req, res) => {
     try {
          const page = parseInt(req.query.page) || 1;
          const limit = parseInt(req.query.limit) || 10;
          const offset = (page - 1) * limit;

          const totalRes = await pool.query("SELECT COUNT(*)::int AS total FROM users WHERE role = 'seller'");
          const total = totalRes.rows[0]?.total ?? 0;

          const sellersRes = await pool.query(
               `SELECT id, role, name, email, mobile, country, state, skills, created_at
                FROM users
                WHERE role='seller'
                ORDER BY created_at DESC
                LIMIT $1 OFFSET $2`,
               [limit, offset]
          );

          return res.status(200).json({
               success: true,
               message: "Sellers fetched successfully",
               data: sellersRes.rows,
               total,
               page,
               limit,
          });
     } catch (error) {
          console.log(error, 'Error while list sellers');
          return res.status(500).send({ success: false, message: "Error while listing sellers", error: error.message });
     }
}

module.exports = {
     adminAndSellerLogin,
     createSeller,
     listSellers
}
