const pool = require("../database/db");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");


const createProduct = async (req, res) => {
     try {
          let text, values;
          const sellerId = req.user.id;
          console.log(sellerId, 'Seller ID here <<<');

          const { product_name, product_description } = req.body;
          let brands = req.body.brands;

          if (typeof brands === "string") {
               brands = JSON.parse(brands);
          }

          if (!product_name || !product_description) {
               return res.status(400).send({ success: false, message: "All fields are required" });
          }

          if (!Array.isArray(brands) || brands.length === 0) {
               return res.status(400).send({
                    success: false,
                    message: 'At least one brand is required',
               });
          }

          // For image upload
          const files = req.files || [];
          if (files.length !== brands.length) {
               return res.status(400).send({
                    success: false,
                    message: 'Number of images must match number of brands',
                    imagesCount: files.length,
                    brandsCount: brands.length,
               });
          }

          for (const brand of brands) {
               if (!brand.brand_name || !brand.price || !brand.detail) {
                    return res.status(400).send({
                         success: false,
                         message: 'All fields are required for product brands (brand_name, detail, price)',
                    });
               }
          }

          text = `INSERT INTO products(seller_id, product_name, product_description) VALUES ($1, $2, $3) RETURNING *`,
               values = [sellerId, product_name, product_description];

          const productRes = await pool.query(text, values);
          const productData = productRes.rows[0];

          // Upload image for specific products brand related to that product
          for (let i = 0; i < brands.length; i++) {
               const brand = brands[i];
               const file = files[i];

               const brandImageUrl = file?.filename;

               text = `
                    INSERT INTO product_brands(product_id, brand_name, detail, image_url, price) 
                    VALUES ($1, $2, $3, $4, $5)
               `
               values = [productData.id, brand.brand_name, brand.detail, brandImageUrl, brand.price];

               await pool.query(text, values);
          }
          return res.status(200).send({
               success: true,
               message: 'Product added successfully',
               data: productData,
          });
     } catch (error) {
          console.log(error, 'Error while create product');
          return res.status(400).send({ success: false, message: "Error while create product", error: error.message });
     }
}

const listAllProducts = async (req, res) => {
     try {
          const sellerId = req.user.id;
          const page = parseInt(req.query.page) || 1;
          const limit = parseInt(req.query.limit) || 10;

          const offset = (page - 1) * limit;

          const totalProducts = await pool.query(
               `SELECT COUNT(*)::int AS total FROM products WHERE seller_id = $1`,
               [sellerId]
          );

          const total = totalProducts.rows[0]?.total ?? 0;

          const listProducts = await pool.query(
               `
          SELECT *
          FROM products
          WHERE seller_id = $1
          ORDER BY id DESC
          LIMIT $2 OFFSET $3
          `,
               [sellerId, limit, offset]
          );
          const productsWithBrands = [];

          const baseUrl = `http://localhost:${process.env.SERVER_PORT}`;

          for (const product of listProducts.rows) {
               const brandsResult = await pool.query(
                    `SELECT id, brand_name, detail, image_url, price FROM product_brands WHERE product_id = $1`, [product.id]
               );

               productsWithBrands.push({
                    ...product,
                    // product_brands: brandsResult.rows,
                    product_brands: brandsResult.rows.map((brand) => ({
                         ...brand,
                         image_url: `${baseUrl}/uploads/${brand.image_url}` || null,
                    })),
                    pdf_url: `${baseUrl}/api/seller/view_pdf/${product.id}`,
               });
          }

          return res.status(200).send({
               success: true,
               message: "Products fetched successfully",
               data: productsWithBrands,
               meta: {
                    total,
                    page,
                    limit,
                    totalPages: Math.max(1, Math.ceil(total / limit)),
               },
          });

     } catch (error) {
          console.log(error, 'Error while fetch products with brands');
          return res.status(400).send({
               success: false,
               message: "Error while fetch products with brands",
               error: error.message
          });

     }
};

const deleteProduct = async (req, res) => {
     try {
          const { id } = req.params;
          const sellerId = req.user.id;
          console.log(id, 'Product ID');

          const findProduct = await pool.query(
               `SELECT * FROM products WHERE id = $1 AND seller_id = $2`,
               [id, sellerId]
          );
          if (findProduct.rows.length === 0) {
               return res.status(404).send({
                    success: false,
                    message: `Product not found (or not yours)`
               });
          }

          const productDelete = await pool.query(`
          DELETE FROM products WHERE id = $1 AND seller_id = $2               
               `, [id, sellerId]);

          return res.status(200).send({
               success: true,
               message: "Product deleted successfully."
          })
     } catch (error) {
          console.log(error, 'Error while delete product');
          return res.status(400).send({
               success: false,
               message: "Error while delete product",
               error: error.message
          });
     }
}

const productPdf = async (req, res) => {
     try {
          const { id } = req.params;
          const sellerId = req.user.id;

          const productRes = await pool.query(
               `SELECT id, seller_id, product_name, product_description, created_at
                FROM products
                WHERE id = $1 AND seller_id = $2`,
               [id, sellerId]
          );

          if (productRes.rows.length === 0) {
               return res.status(404).json({
                    success: false,
                    message: "Product not found (or not yours)",
               });
          }

          const product = productRes.rows[0];
          const brandsRes = await pool.query(
               `SELECT brand_name, image_url, price
                FROM product_brands
                WHERE product_id = $1
                ORDER BY id ASC`,
               [product.id]
          );

          const brands = brandsRes.rows;
          console.log(brands, "Brand response are here <<<<")
          const totalPrice = brands.reduce((sum, b) => sum + Number(b.price || 0), 0);
          console.log('Sum of total product brands :', totalPrice);
          res.setHeader("Content-Type", "application/pdf");
          res.setHeader("Content-Disposition", `inline; filename="product-${product.id}.pdf"`);

          const doc = new PDFDocument({ margin: 50 });
          doc.pipe(res);

          doc.fontSize(18).text("Product Details", { underline: true });
          doc.moveDown();
          doc.fontSize(12).text(`Product Name: ${product.product_name}`);
          doc.moveDown(0.25);
          doc.fontSize(12).text(`Product Description: ${product.product_description}`);
          doc.moveDown();

          doc.fontSize(14).text("Brand Details", { underline: true });
          doc.moveDown();

          const uploadsDir = path.join(__dirname, "../../uploads");

          brands.forEach((b, idx) => {
               doc.fontSize(12).text(`${idx + 1}. Brand Name: ${b.brand_name}`);

               if (b.image_url) {
                    const imagePath = path.join(uploadsDir, b.image_url);
                    if (fs.existsSync(imagePath)) {
                         try {
                              doc.moveDown(0.25);
                              doc.image(imagePath, { width: 140 });
                         } catch {
                              doc.moveDown(0.25);
                              doc.fontSize(10).fillColor("gray").text("(Could not render brand image)");
                              doc.fillColor("black");
                         }
                    } else {
                         doc.moveDown(0.25);
                         doc.fontSize(10).fillColor("gray").text("(Brand image file missing)");
                         doc.fillColor("black");
                    }
               }

               doc.moveDown(0.25);
               doc.fontSize(12).text(`Brand Price: ${Number(b.price || 0).toFixed(2)}`);
               doc.moveDown();
          });

          doc.fontSize(14).text(`Total Price: ${totalPrice.toFixed(2)}`, { underline: true });
          doc.end();
     } catch (error) {
          console.log(error, "Error while generating product pdf");
          return res.status(500).json({
               success: false,
               message: "Error while generating PDF",
               error: error.message,
          });
     }
};

module.exports = {
     createProduct,
     listAllProducts,
     deleteProduct,
     productPdf
}
