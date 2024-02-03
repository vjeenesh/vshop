const fs = require('fs');
const path = require('path');
const rootDir = require('../utils/path');

const cartPath = path.join(rootDir, 'data', 'cart.json');

module.exports = class Cart {
    static addProduct(id,productPrice) {

        // fetch the existing cart products
        fs.readFile(cartPath, (err, fileContent) => {
            let cart = {products: [], totalPrice: 0};

            if(err) {
                // console.log(JSON.stringify(cart));
                cart.products.push({id: id, qty: 1});
                cart.totalPrice = +productPrice;
                fs.writeFileSync(cartPath, JSON.stringify(cart));
            }
            else {
                cart = JSON.parse(fileContent);
                const existingProductIndex = cart.products.findIndex(p => p.id === id);
                // console.log(existingProductIndex);
                let existingProduct = cart.products[existingProductIndex];
                let updatedProduct;
                if (existingProduct) {
                    updatedProduct = {...existingProduct};
                    updatedProduct.qty = updatedProduct.qty + 1;
                    cart.products = [...cart.products];
                    cart.products[existingProductIndex] = updatedProduct;
                } else {
                    updatedProduct = {id: id, qty: 1};
                    cart.products = [...cart.products, updatedProduct];
                }
                cart.totalPrice = cart.totalPrice + +productPrice;
                fs.writeFileSync(cartPath, JSON.stringify(cart), err => {
                    console.log(err);
                } );
            }
            // console.log(fileContent);
            
        
        })
    }

    static deleteProduct(id, price) {
        fs.readFile(cartPath, (err, fileContent) => {
            if (err) {
                return
            }
            const cart = JSON.parse(fileContent);
            const updatedCart = { ...cart };
            const deleteProductIndex = updatedCart.products.findIndex(p => +p.id === +id);
            if (deleteProductIndex < 0) {
                return;
            }
            const productQty = updatedCart.products[deleteProductIndex].qty;
            updatedCart.products = updatedCart.products.filter(p => +p.id !== +id);
            updatedCart.totalPrice = updatedCart.totalPrice - (price * productQty);
            fs.writeFileSync(cartPath, JSON.stringify(updatedCart), err => {
                console.log(err);
            } );
        })
    }

    static getCart(cb) {
        fs.readFile(cartPath, (err, fileContent) => {
            if (err) {
                cb(null);
            } else {
                const cart = JSON.parse(fileContent);
                cb(cart);
            }
        })
    }

}