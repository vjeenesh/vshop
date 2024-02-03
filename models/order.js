const mongoose = require("mongoose");
const { Schema } = mongoose;

const orderSchema = Schema({
  products: [
    {
      productData: {
        productId: {
          type: mongoose.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        productTitle: {
          type: String,
          required: true,
        },
        productPrice: {
          type: Number,
          required: true,
        },
        productDescription: {
          type: String,
          required: true,
        },
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
  userData: {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    username: {
      type: String,
    },
    shippingDetails: {
      name: String,
      shipping_address: String,
    },
  },
});

module.exports = mongoose.model("Order", orderSchema);

//  sql code
// const Sequelize = require('sequelize');

// const sequelize = require('../utils/database');

// const Order = sequelize.define('order', {
//     id: {
//         type: Sequelize.INTEGER,
//         autoIncrement: true,
//         primaryKey: true,
//         allowNull: false
//     }
// })

// module.exports = Order;
