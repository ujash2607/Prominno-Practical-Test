const express = require("express");
const app = express();
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();

app.use(express.json());
const { ensureDb } = require("./database/utils");

const adminRoute = require("../backend/router/adminRoute");
const sellerRoute = require("../backend/router/sellerRoute");

app.use('/api/admin', adminRoute);
app.use('/api/seller', sellerRoute);

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

const port = process.env.SERVER_PORT || 3000;

ensureDb();

app.listen(port, () => {
     console.log(`Server running on port ${port}`);
});
