// // const Sequelize = require('sequelize');

// // const sequelize = new Sequelize('node-app', 'root', '*******************', {
// //     host: 'localhost',
// //     port: 3306,
// //     dialect: 'mysql'
// // });

// // module.exports = sequelize;

// const mongodb = require('mongodb');
// const MongoClient = mongodb.MongoClient;

// let _db;

// const mongoConnect = (callback) => {
//     MongoClient
//         .connect('mongodb+srv://shop_dev_admin:lfc9XfMx7adbW8be@cluster0.wx9tr.mongodb.net/shop?retryWrites=true&w=majority')
//         .then(client => {
//             console.log('Connected to remote DB!');
//             _db = client.db();
//             callback();
//         })
//         .catch(err => {
//             console.log(err);
//             throw err;
//         });
// }

// const getDb = () => {
//     if(_db) {
//         return _db
//     }
//     throw 'Database connection failed';
// }

// exports.mongoConnect = mongoConnect;
// exports.getDb = getDb;

