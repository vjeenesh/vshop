const mongoose = require('mongoose');
const {Schema} = mongoose; 
const User = require('./user');

const productSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

// productSchema.post('findOneAndDelete', function(doc, next) {
//     console.log(doc);
//     User.find({cart: {items: {productId: doc._id}}})
//         .then(users => {
//             console.log(users);
//             next();
//         })
// })

module.exports = mongoose.model('Product', productSchema);;





// mongodb driver code
// const mongodb = require('mongodb');

// const getDb = require('../utils/database').getDb;
// class Product {
//     constructor(title, price, description, imageUrl, id, userId) {
//         this.title = title;
//         this.price = price;
//         this.description = description;
//         this.imageUrl = imageUrl;
//         this._id = id ? new mongodb.ObjectId(id) : null;
//         this.userId = new mongodb.ObjectId(userId);
//     }

//     save() {
//         const db = getDb();
//         let dbOperation;
//         // console.log(this);

//         if (this._id) {
//             dbOperation = db.collection('products')
//                             .updateOne({_id: this._id}, {$set: this});
//         } else {
//             // console.log("saving new product");
//             dbOperation = db.collection('products').insertOne(this);
//         }
        
//         return dbOperation
//                     .then(result => {
//                         console.log(result);
//                     })
//                     .catch(err => console.log(err)); 
//     }

//     static fetchAll() {
//         const db = getDb();
//         return db.collection('products')
//                 .find()
//                 .toArray()
//                 .then(products => {
//                     return products
//                 })
//                 .catch(err => console.log(err));
//     }

//     static findById(productId) {
//         const db = getDb();
//         // console.log(new mongodb.ObjectId(productId));
//         return db.collection('products')
//                 .find({_id: new mongodb.ObjectId(productId)})
//                 .next()
//                 .then(product => {
//                     // console.log(product);
//                     return product;
//                 })
//                 .catch(err => console.log(err));
//     }


//     static deleteById(productId) {
//         const db = getDb();
//         return db.collection('products').deleteOne({_id: new mongodb.ObjectId(productId)})
//                         .then(result => {
//                             // console.log(result);
//                         }).catch(err => console.log(err));
//     }
// }

// storage in mysql
// const Sequelize = require('sequelize');
// const sequelize = require('../utils/database');
// const Product = sequelize.define('product', {
//     id: {
//         type: Sequelize.INTEGER,
//         autoIncrement: true,
//         allowNull: false,
//         primaryKey: true,
//         unique: true
//     },
//     title: {
//         type: Sequelize.STRING(255),
//         allowNull: false
//     },
//     price: {
//         type: Sequelize.DOUBLE,
//         allowNull: false
//     },
//     imageUrl: {
//         type: Sequelize.STRING,
//         allowNull: false
//     },
//     description: {
//         type: Sequelize.STRING(255),
//         allowNull: false
//     }
// });
// module.exports = Product;



// Storage in file system
// const db = require('../utils/database');
// const path = require('path');
// const rootDir = require('../utils/path');
// const dataPath = path.join(rootDir, 'data', 'products.json');
// const Cart = require('./cart');
// const getDataFromFile = cb => {
//         fs.readFile(dataPath, (err, productData) => {
//             if (!err) {
//                 // console.log(JSON.parse(productData));
//                 cb(JSON.parse(productData));
//             }
//             else cb([]);
//         });
// }
// module.exports = class Product {
//     constructor(id, title, imageUrl, description, price) {
//         this.id = +id;
//         this.title = title;
//         this.imageUrl = imageUrl;
//         this.description = description;
//         this.price = price;
//     }

//     save() {
//         // getDataFromFile(products => {
//         //     if (this.id) {
//         //         const updateProductIndex = products.findIndex(p => p.id === this.id);
//         //         const updatedProducts = [...products];
//         //         updatedProducts[updateProductIndex] = this;
//         //         fs.writeFileSync(dataPath, JSON.stringify(updatedProducts));
//         //     } else {
//         //         this.id = products.length + 1;
//         //         products.push(this);
//         //         // console.log(JSON.stringify(products));
//         //         // console.log(dataPath);
//         //         fs.writeFileSync(dataPath, JSON.stringify(products));
//         //     }
            
//         // });

//         return db.execute('INSERT INTO products (title, price, imageUrl, description) VALUES (?,?,?,?)',
//         [this.title, this.price, this.imageUrl, this.description]
//         );

//     }

//     static fetchAll() {
//         // console.log(cb)
//         return db.execute('SELECT * FROM products');
        
//     }

//     static findById(id, cb) {
//         // getDataFromFile(products => {
//         //     let product = products.find(p => p.id === +id);
//         //     cb(product);
//         // });

//         return db.execute('SELECT * FROM products WHERE id=?', [id]);
//     }

//     static deleteById(id) {
//         // getDataFromFile(products => {
//         //     let deleteProductIndex = products.findIndex(p => p.id===id);
//         //     if(deleteProductIndex<0) {
//         //         cb([]);
//         //     }
            
//         //     let deletedProduct = products.splice(deleteProductIndex, 1);
//         //     fs.writeFile(dataPath, JSON.stringify(products), err => {
//         //         if (!err) {
//         //             Cart.deleteProduct(id, deletedProduct.price);
//         //         }
//         //     });
//         //     cb(deletedProduct);
//         // })


//         return db.execute('DELETE FROM products WHERE id=?', [id]);
//     }
// }