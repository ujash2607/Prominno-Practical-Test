const express = require("express");
const router = express.Router();

const sellerController = require("../controllers/sellerController");
const { authorized, sellerAccessMiddleware } = require("../middleware/middleware");
const upload = require("../multer/multer");

router.post(
     "/create_product",
     authorized,
     sellerAccessMiddleware,
     upload.array("images"),
     sellerController.createProduct
);

router.get("/list_products", authorized, sellerAccessMiddleware, sellerController.listAllProducts);
router.delete("/delete_product/:id", authorized, sellerAccessMiddleware, sellerController.deleteProduct);

module.exports = router;

