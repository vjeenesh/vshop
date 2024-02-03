const Product = require("../models/product");
const User = require("../models/user");
const { validationResult } = require("express-validator");
const deleteFile = require("../utils/deleteFile");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product.ejs", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    isEditMode: false,
    isLoggedIn: req.session.isLoggedIn,
    username: req.session.user ? req.session.user[0].username : "",
    flashMessage: "",
    alertType: "",
  });
};

exports.addProduct = (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const description = req.body.description;
  const price = req.body.price;

  const errors = validationResult(req);

  if (!errors.isEmpty() || !image) {
    let errorMsg;
    if (!image) {
      errorMsg = "File must be an image of type jpg, jpeg or png!";
    } else {
      errorMsg = errors.array()[0].msg;
    }
    return res.render("admin/edit-product.ejs", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      isEditMode: false,
      isLoggedIn: req.session.isLoggedIn,
      username: req.session.user ? req.session.user[0].username : "",
      flashMessage: errorMsg,
      alertType: "",
    });
  }

  const newProduct = new Product({
    title: title,
    price: price,
    imageUrl: image.path,
    description: description,
    userId: req.session.user[0]._id,
  });
  newProduct
    .save()
    .then((result) => {
      // console.log(result);
      res.redirect("/admin/products");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(err);
    });
};

exports.getEditProduct = (req, res, next) => {
  let isEditMode = req.query.edit;
  isEditMode = String(isEditMode).toLowerCase() == "true";
  if (!isEditMode) {
    res.redirect("/");
  } else {
    const productId = req.params.productId;
    Product.findOne({ _id: productId, userId: req.session.user[0]._id })
      .then((product) => {
        if (!product) {
          return res.redirect("/");
        }
        res.render("admin/edit-product.ejs", {
          pageTitle: "Edit Product",
          path: req.originalUrl,
          isEditMode: isEditMode,
          product: product,
          isLoggedIn: req.session.isLoggedIn,
          username: req.session.user ? req.session.user[0].username : "",
          flashMessage: "",
          alertType: "",
        });
      })
      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(err);
      });
  }
};

exports.editProduct = (req, res, next) => {
  const productId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedDescription = req.body.description;
  const updatedPrice = req.body.price;
  const updatedImage = req.file;

  const errors = validationResult(req);

  Product.findOne({ _id: productId, userId: req.session.user[0]._id }).then(
    (product) => {
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDescription;

      if (updatedImage) {
        deleteFile(product.imageUrl);
        product.imageUrl = updatedImage.path;
      }

      if (!errors.isEmpty() || !updatedImage) {
        let errorMsg;
        if (!updatedImage) {
          errorMsg = "File must be an image of type jpg, jpeg or png!";
        } else {
          errorMsg = errors.array()[0].msg;
        }

        return res.render("admin/edit-product.ejs", {
          pageTitle: "Edit Product",
          path: req.originalUrl,
          isEditMode: true,
          product: product,
          isLoggedIn: req.session.isLoggedIn,
          username: req.session.user ? req.session.user[0].username : "",
          flashMessage: errorMsg,
          alertType: "",
        });
      }

      product
        .save()
        .then((result) => {
          // console.log(result);
          res.redirect(`/products/${productId}`);
        })
        .catch((err) => {
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(err);
        });
    }
  );
};

exports.getAdminProducts = (req, res, next) => {
  Product.find({ userId: req.session.user[0]._id })
    .then((products) => {
      res.render("admin/products", {
        products: products,
        pageTitle: "My Products",
        path: req.originalUrl,
        isLoggedIn: req.session.isLoggedIn,
        username: req.session.user ? req.session.user[0].username : "",
        flashMessage: "",
        alertType: "",
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(err);
    });
};

exports.deleteProduct = (req, res, next) => {
  let productId = req.params.productId;

  Product.findById(productId)
    .then((product) => {
      if (!product) {
        return next(new Error("Product not found"));
      }
      return deleteFile(product.imageUrl);
    })
    .then(() => {
      Product.findOneAndDelete({
        _id: productId,
        userId: req.session.user[0]._id,
      }).then((results) => {
        User.find()
          .exec()
          .then((users) => {
            // console.log(users);
            for (let user of users) {
              // console.log(user);
              user
                .deleteCartItem(productId)
                .then(() => console.log("product deleted from a cart!"))
                .catch((err) => {
                  const error = new Error(err);
                  error.httpStatusCode = 500;
                  return next(err);
                });
            }
          });
        res
          .status(200)
          .json({ message: "Product Deleted!", alertType: "success" });
      });
    })
    .catch((err) => {
      res
        .status(500)
        .json({ message: "Product deletion failed!", alertType: "danger" });
    });
};
