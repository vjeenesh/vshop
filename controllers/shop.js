const Product = require("../models/product");
const Order = require("../models/order");
const User = require("../models/user");
const { createInvoice } = require("../utils/createInvoice");

const fs = require("fs");
const path = require("path");
const stripe = require("stripe")(process.env.STRIPE_KEY);

const PRODUCTS_PER_PAGE = 10;

exports.getProducts = (req, res, next) => {
  let current_page = req.query.page
    ? +req.query.page <= 0
      ? 1
      : +req.query.page
    : 1;
  let totalProducts, last_page, last_link, first_link;

  Product.countDocuments()
    .then((count) => {
      totalProducts = count;
      last_page = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);
      current_page = current_page > last_page ? last_page : current_page;
      first_link =
        current_page - 2 <= 1
          ? 1
          : last_page - 4 < current_page - 2
          ? last_page - 4
          : current_page - 2;
      last_link =
        current_page + 2 > last_page
          ? last_page
          : first_link + 4 > last_page
          ? current_page + 2
          : first_link + 4;
      return Product.find()
        .skip((current_page - 1) * PRODUCTS_PER_PAGE)
        .limit(PRODUCTS_PER_PAGE)
        .populate("userId", "username");
    })
    .then((products) => {
      res.render("shop/product-list", {
        products: products,
        pageTitle: "Shop",
        path: req.originalUrl,
        pagination: {
          first: first_link,
          last: last_link,
          current: current_page,
        },
        isLoggedIn: req.session.isLoggedIn,
        username: req.session.user ? req.session.user[0].username : "",
        flashMessage: "",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getProduct = (req, res, next) => {
  const productId = req.params.productId;
  Product.findById(productId)
    .populate("userId", "username")
    .then((product) => {
      // console.log(product._id);
      res.render("shop/product-detail", {
        product: product,
        pageTitle: product.title,
        path: req.originalUrl,
        isLoggedIn: req.session.isLoggedIn,
        username: req.session.user ? req.session.user[0].username : "",
      });
    })
    .catch((err) => console.log(err));
};

exports.getCart = async (req, res, next) => {
  await User.findById(req.session.user[0]._id)
    .populate("cart.items.productId")
    .exec()
    .then((userCart) => {
      // console.log(userCart);
      res.render("shop/cart", {
        pageTitle: "Cart",
        path: req.originalUrl,
        products: userCart.cart.items,
        isLoggedIn: req.session.isLoggedIn,
        shippingAddress: userCart.shippingAddress,
        name: userCart.name,
        username: req.session.user ? req.session.user[0].username : "",
      });
    })
    .catch((err) => console.log(err));
};

exports.addToCart = (req, res, next) => {
  const productId = req.body.productId;

  Product.findById(productId)
    .then((product) => {
      // console.log(req.session.user);
      req.user
        .addToCart(product)
        .then((cart) => {
          res.redirect("/cart");
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));

  // let fetchedCart;
  // let newQuantity = 1;
  // req.user.getCart()
  //         .then(cart => {
  //             fetchedCart = cart;
  //             return cart.getProducts({where: {id: productId}});
  //         })
  //         .then(products => {
  //             let product;
  //             if (products.length > 0) {
  //                 product = products[0];
  //             }

  //             if (product) {
  //                 // handle existing products
  //                 const existingQuantity = product.cartItem.quantity;
  //                 newQuantity = existingQuantity + 1;
  //                 return product;
  //             }
  //             return Product.findByPk(productId)

  //         })
  //         .then(product => {
  //             return fetchedCart.addProduct(product, {through: {quantity: newQuantity}});
  //         })
  //         .then(() => {
  //             res.redirect('/cart')
  //         })
  //         .catch(err => console.log(err));
  // Product.findById(productId, (product) => {
  //     Cart.addProduct(productId, product.price);
  // })
  // res.redirect('/cart');
};

exports.deleteItemFromCart = (req, res, next) => {
  const productId = req.body.productId;
  req.user
    .deleteCartItem(productId)
    .then((result) => {
      // console.log(result.cart.items);
      res.redirect("/cart");
    })
    .catch((err) => console.log(err));
};

exports.createOrder = async (req, res, next) => {
  let shipping_address, name;
  const productList = await User.findById(req.session.user[0]._id)
    .populate("cart.items.productId")
    .exec()
    .then((user) => {
      // console.log(user.cart.items[0].productId);
      shipping_address =
        user.shippingAddress.street_address +
        " " +
        user.shippingAddress.city +
        " " +
        user.shippingAddress.state +
        " " +
        user.shippingAddress.country +
        " " +
        user.shippingAddress.zipcode;
      name = user.name;
      const products = user.cart.items.map((i) => {
        return {
          productData: {
            productId: i.productId._id,
            productTitle: i.productId.title,
            productPrice: i.productId.price,
            productDescription: i.productId.description,
          },
          quantity: i.quantity,
        };
      });
      return products;
    });

  const order = new Order({
    products: productList,
    userData: {
      userId: req.user._id,
      username: req.user.username,
      shippingDetails: {
        name: name,
        shipping_address: shipping_address,
      },
    },
  });
  req.user
    .clearCart()
    .then(() => {
      // console.log("before order save");
      order
        .save()
        .then((order) => {
          // console.log("Order saved");
          res.redirect("/orders");
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};

exports.getCheckout = async (req, res, next) => {
  const name = req.body.shipping_name;
  const shippingDetails = {
    street_address: req.body.shipping_street,
    city: req.body.shipping_city,
    state: req.body.shipping_state,
    country: req.body.shipping_country,
    zipcode: req.body.shipping_zipcode,
  };
  const productList = await User.findById(req.session.user[0]._id)
    .populate("cart.items.productId")
    .exec()
    .then((user) => {
      // console.log(user.cart.items[0].productId);
      user.name = name;
      user.shippingAddress = shippingDetails;
      user.save();
      const products = user.cart.items.map((i) => {
        return {
          productData: {
            productId: i.productId._id,
            productTitle: i.productId.title,
            productPrice: i.productId.price,
            productDescription: i.productId.description,
          },
          quantity: i.quantity,
        };
      });

      return products;
    });

  const stripeSession = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: productList.map((item) => {
      return {
        price_data: {
          currency: "usd",
          unit_amount: item.productData.productPrice * 100,
          product_data: {
            name: item.productData.productTitle,
            description: item.productData.productDescription,
          },
        },
        quantity: item.quantity,
      };
    }),
    success_url: req.protocol + "://" + req.get("host") + "/checkout/success",
    cancel_url: req.protocol + "://" + req.get("host") + "/checkout/cancel",
  });

  res.render("shop/checkout", {
    pageTitle: "Checkout",
    path: req.originalUrl,
    products: productList,
    isLoggedIn: req.session.isLoggedIn,
    stripeSessionId: stripeSession.id,
    shippingAddress: shippingDetails,
    username: req.session.user ? req.session.user[0].username : "",
  });
};

exports.getOrders = async (req, res, next) => {
  // console.log(req.user);
  await Order.find({ "userData.userId": req.user._id })
    .then((orders) => {
      // console.log(orders[0].products);
      res.render("shop/orders", {
        pageTitle: "My Orders",
        path: req.originalUrl,
        orders: orders,
        isLoggedIn: req.session.isLoggedIn,
        username: req.session.user ? req.session.user[0].username : "",
      });
    })
    .catch((err) => console.log(err));
};

exports.getIndex = (req, res, next) => {
  let current_page = req.query.page
    ? +req.query.page <= 0
      ? 1
      : +req.query.page
    : 1;
  let totalProducts, last_page, last_link, first_link;

  Product.countDocuments()
    .then((count) => {
      totalProducts = count;
      last_page = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);
      current_page = current_page > last_page ? last_page : current_page;
      first_link =
        current_page - 2 <= 1
          ? 1
          : last_page - 4 < current_page - 2
          ? last_page - 4
          : current_page - 2;
      last_link =
        current_page + 2 > last_page
          ? last_page
          : first_link + 4 > last_page
          ? current_page + 2
          : first_link + 4;
      current_page = current_page == 0 ? 1 : current_page;
      return Product.find()
        .skip((current_page - 1) * PRODUCTS_PER_PAGE)
        .limit(PRODUCTS_PER_PAGE)
        .populate("userId", "username");
    })
    .then((products) => {
      res.render("shop/index", {
        products: products,
        pageTitle: "Shop",
        path: req.originalUrl,
        pagination: {
          first: first_link,
          last: last_link,
          current: current_page,
        },
        isLoggedIn: req.session.isLoggedIn,
        username: req.session.user ? req.session.user[0].username : "",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getInvoice = async (req, res, next) => {
  // handle this edge case --> no product data getting populated bcoz prod deleted

  const orderId = req.params.orderId;
  const filename = "invoice-" + orderId + ".pdf";
  const order = await Order.findById(orderId);
  try {
    // console.log(order);
    if (!order) {
      return next(new Error("No order found."));
    }
    if (order.userData.userId.toString() !== req.user._id.toString()) {
      return next(new Error("Unauthorized access."));
    }

    const invoicePath = path.join("data", "invoices", filename);
    if (!fs.existsSync(invoicePath)) {
      // console.log("Creating invoice...");
      await createInvoice(order, invoicePath);
    }
    const file = fs.createReadStream(invoicePath);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'inline; filename="' + filename + '"');
    file.pipe(res);
  } catch (err) {
    next(err);
  }
};
