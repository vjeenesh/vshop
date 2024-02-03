const mongoose = require("mongoose");

const { Schema } = mongoose;

const userSchema = Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  resetToken: String,
  resetTokenExpiry: Date,
  cart: {
    items: [
      {
        productId: {
          type: mongoose.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  name: {
    type: String,
  },
  shippingAddress: {
    street_address: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    country: {
      type: String,
    },
    zipcode: {
      type: Number,
    },
  },
});

userSchema.methods.addToCart = function (product) {
  const existingProductIndex = this.cart.items.findIndex((item) => {
    return item.productId.toString() === product._id.toString();
  });
  let newQuantity = 1;
  let updatedCartItems = [...this.cart.items];
  if (existingProductIndex >= 0) {
    newQuantity = this.cart.items[existingProductIndex].quantity + 1;
    updatedCartItems[existingProductIndex].quantity = newQuantity;
  } else {
    updatedCartItems.push({
      productId: product._id,
      quantity: newQuantity,
    });
  }

  let updatedCart = { items: updatedCartItems };
  this.cart = updatedCart;
  return this.save();
};

userSchema.methods.deleteCartItem = function (productId) {
  if (this.cart.items.length > 0) {
    // console.log(productId, this.cart.items[0].productId);
    const updatedCartItems = this.cart.items.filter((item) => {
      return item.productId.toString() !== productId.toString();
    });
    this.cart.items = updatedCartItems;
  }
  return this.save();
};

userSchema.methods.clearCart = function () {
  this.cart.items = [];
  return this.save();
};

module.exports = mongoose.model("User", userSchema);

//  mongo driver code
// const mongodb = require('mongodb');

// const getDb = require('../utils/database').getDb;

// class User {
//     constructor(username, email, cart, id) {
//         this.username = username;
//         this.email = email;
//         this.cart = cart;
//         this._id = new mongodb.ObjectId(id);
//     }

//     save() {
//         const db = getDb();
//         return db.collection('users').insertOne(this)
//             .then(result =>
//                console.log(result))
//             .catch(err => console.log(err));
//     }

//     addToCart(product) {
//         // handle already existing cart items
//         const existingProductIndex = this.cart.items.findIndex(item => {
//             return item.productId.toString() === product._id.toString();
//         })
//         let newQuantity = 1;
//         let updatedCartItems = [...this.cart.items];
//         if (existingProductIndex >= 0) {
//             newQuantity  = this.cart.items[existingProductIndex].quantity + 1;
//             updatedCartItems[existingProductIndex].quantity = newQuantity;
//         } else {
//             updatedCartItems.push({productId: new mongodb.ObjectId(product._id), quantity: newQuantity})
//         }

//         let updatedCart = {items: updatedCartItems}
//         const db = getDb();
//         return db.collection('users').updateOne({_id: this._id}, {$set: {cart: updatedCart}});
//     }

//     getCart() {
//         const db = getDb();
//         const productIds = this.cart.items.map(item => {
//             return item.productId;
//         })
//         return db.collection('products').find(
//             {_id: {$in: productIds}}
//         )
//         .toArray()
//         .then(products => {
//             return products.map(product => {
//                 return {...product,
//                 quantity: this.cart.items.find(item => {
//                     return item.productId.toString() ===  product._id.toString();
//                 }).quantity
//                 }
//             })
//         });
//     }

//     deleteCartItem(productId) {
//         const updatedCartItems = this.cart.items.filter(item => {
//             return item.productId.toString() !== productId.toString();
//         });

//         const db = getDb();
//         return db.collection('users').updateOne({_id: this._id}, {$set: {cart: {items: updatedCartItems}}});
//     }

//     createOrder() {
//         const db = getDb();
//         return this.getCart()
//             .then(cart => {
//                 const order = {
//                     items: cart,
//                     userId: new mongodb.ObjectId(this._id)
//                 };
//                 return db.collection('orders').insertOne(order)
//             })
//             .then(result => {
//                 this.cart = {items: []};
//                 const db = getDb();
//                 return db.collection('users').updateOne({_id: this._id}, {$set: {cart: {items: []}}});
//             })
//             .catch(err => console.log(err));
//     }

//     getOrders() {
//         const db = getDb();
//         return db.collection('orders').find({userId: new mongodb.ObjectId(this._id)}).toArray();
//     }

//     static findUserById(userId) {
//         const db = getDb();
//         return db.collection('users').find({_id: new mongodb.ObjectId(userId)})
//                     .next()
//                     .then(result => {
//                         // console.log(result);
//                         return result
//                     })
//                     .catch(err => console.log(err));

//     }
// }

// module.exports = User;

// //  MYSQL CODE
// // const Sequelize = require('sequelize');
// // const sequelize = require('../utils/database');
// // const User = sequelize.define('user', {
// //     id: {
// //         type: Sequelize.INTEGER,
// //         autoIncrement: true,
// //         allowNull: false,
// //         primaryKey: true,
// //         unique: true
// //     },
// //     name: {
// //         type: Sequelize.STRING
// //     },
// //     email: {
// //         type: Sequelize.STRING(100)
// //     }
// // });

// // module.exports = User;
