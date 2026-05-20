const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const { RoleMiddleWare, authorized, adminAccessMiddleware } = require("../middleware/middleware");

router.post('/login', adminController.adminAndSellerLogin);
router.post('/create_seller', authorized, adminAccessMiddleware, adminController.createSeller);
router.get('/list_seller', authorized, adminAccessMiddleware, adminController.listSellers);

module.exports = router;