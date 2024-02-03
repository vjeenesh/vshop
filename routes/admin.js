const path = require("path");
const { check } = require("express-validator");

const express = require("express");
const checkAuth = require("../middleware/is-auth");
const adminController = require("../controllers/admin");

const router = express.Router();

router.get("/products", checkAuth, adminController.getAdminProducts);
router.get("/add-product", checkAuth, adminController.getAddProduct);
router.post(
  "/add-product",
  checkAuth,
  [
    check("title", "Title should be between 8 to 50 characters long.")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 8, max: 50 }),
    check(
      "description",
      "Description should be between 8 to 200 characters long."
    )
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 8, max: 200 }),
    check("price", "Price has to be a number between 0.1 and 100000.")
      .trim()
      .isFloat({ min: 0.1, max: 100000 })
      .notEmpty(),
  ],
  adminController.addProduct
);
router.get(
  "/edit-product/:productId",
  checkAuth,
  adminController.getEditProduct
);
router.post(
  "/edit-product",
  checkAuth,
  [
    check("title", "Title should be between 8 to 50 characters long.")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 8, max: 50 }),
    check(
      "description",
      "Description should be between 8 to 200 characters long."
    )
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 8, max: 200 }),
    check("price", "Price has to be a number between 0.1 and 100000.")
      .trim()
      .isFloat({ min: 0.1, max: 100000 })
      .notEmpty(),
  ],
  adminController.editProduct
);
router.delete(
  "/delete-product/:productId",
  checkAuth,
  adminController.deleteProduct
);

exports.adminRoute = router;
