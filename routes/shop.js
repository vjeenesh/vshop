const path = require("path");

const express = require("express");

const shopController = require("../controllers/shop");
const checkAuth = require("../middleware/is-auth");
const checkAddress = require("../middleware/checkAddress");

const router = express.Router();

router.get("/", shopController.getIndex);
router.get("/products", shopController.getProducts);
router.get("/products/:productId", shopController.getProduct);
router.get("/cart", checkAuth, shopController.getCart);
router.post("/cart", checkAuth, shopController.addToCart);
router.post("/cart-item-delete", checkAuth, shopController.deleteItemFromCart);
router.post("/checkout", checkAuth, checkAddress, shopController.getCheckout);
router.get("/checkout/success", checkAuth, shopController.createOrder);
router.post("/checkout/cancel", checkAuth, shopController.getCheckout);
router.get("/orders", checkAuth, shopController.getOrders);
router.get("/orders/:orderId", checkAuth, shopController.getInvoice);

module.exports = router;
