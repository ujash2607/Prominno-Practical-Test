const pool = require("../database/db");
const bcrypt = require("bcrypt");


const createProduct = async (req, res) => {
     try {
          let text, values;
          const sellerId = req.user.id;
          console.log(sellerId, 'Seller ID here <<<');

          // multipart/form-data => brands usually comes as a JSON string
          const { product_name, product_description } = req.body;
          let brands = req.body.brands;

          if (typeof brands === "string") {
               brands = JSON.parse(brands);
          }
          if (!product_name || !product_description) {
               return res.status(400).send({ success: false, message: "All fields are required" });
          }

          if (!brands) {
               return res.status(400).send({ success: false, message: 'At least one brand is required' });
          }

          if (!Array.isArray(brands) || brands.length === 0) {
               return res.status(400).send({
                    success: false,
                    message: 'At least one brand is required',
               });
          }

          // images are uploaded with field name: images
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

          // Insert each brand with its corresponding uploaded image
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
          const page = parseInt(req.query.page) || 1;
          const limit = parseInt(req.query.limit) || 10;

          const offset = (page - 1) * limit;

          const totalProducts = await pool.query(
               `SELECT COUNT(*)::int AS total FROM products`
          );

          const total = totalProducts.rows[0]?.total ?? 0;

          const listProducts = await pool.query(
               `
          SELECT *
          FROM products
          ORDER BY id DESC
          LIMIT $1 OFFSET $2
          `,
               [limit, offset]
          );
          const productsWithBrands = [];

          const imageUrlPath = `http://localhost:${process.env.SERVER_PORT}`;

          for (const product of listProducts.rows) {
               const brandsResult = await pool.query(
                    `
        SELECT
          id,
          brand_name,
          detail,
          image_url,
          price
        FROM product_brands
        WHERE product_id = $1
        `,
                    [product.id]
               );

               productsWithBrands.push({
                    ...product,
                    // product_brands: brandsResult.rows,
                    product_brands: brandsResult.rows.map((brand) => ({
                         ...brand,
                         image_url: `${imageUrlPath}/uploads/${brand.image_url}`
                    }))
               });
          }

          return res.status(200).send({
               success: true,
               message: "Products fetched successfully",
               data: productsWithBrands,
               total,
               page,
               limit,
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
          console.log(id, 'Product ID');

          const findProduct = await pool.query(`SELECT * FROM products WHERE id = $1`, [id]);
          if (findProduct.rows.length === 0) {
               return res.status(400).send({
                    success: false,
                    message: `Product with this id ${id} is not exists`
               });
          }

          const productDelete = await pool.query(`
          DELETE FROM products WHERE id = $1               
               `, [id]);

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

module.exports = {
     createProduct,
     listAllProducts,
     deleteProduct
}