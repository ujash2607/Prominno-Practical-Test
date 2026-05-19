const express = require("express");
const app = express();

app.use(express.json());

const dotenv = require("dotenv");
dotenv.config();

const port = process.env.SERVER_PORT || 3000;

app.listen(port, () => {
     console.log(`Server running on port ${port}`);
});