const path = require("path");
const fs = require("fs");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const flash = require("connect-flash");
const multer = require("multer");
const helmet = require("helmet");
const morgan = require("morgan");

// Routes import
const adminData = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
const errorControllers = require("./controllers/error");

// Models import
// const Product = require('./models/product');
const User = require("./models/user");
// const Cart = require('./models/cart');
// const CartItem = require('./models/cart-item');
// const Order = require('./models/order');
// const OrderItem = require('./models/order-item');
// const mongoConnect = require('./utils/database').mongoConnect;

const app = express();
const store = new MongoDBStore({
  uri: process.env.DB_URI,
  collection: "sessions",
});

app.set("view engine", "ejs");
app.set("views", "views");

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/heif"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);
app.use(morgan("combined", { stream: accessLogStream }));

app.use(helmet());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    store: store,
    saveUninitialized: false,
  })
);
app.use(flash());

app.use((req, res, next) => {
  if (req.session.user) {
    // console.log(req.session.user);
    User.findById(req.session.user[0]._id)
      .then((user) => {
        // console.log('storing user in session');
        if (!user) {
          return next();
        }
        req.user = user;
        next();
      })
      .catch((err) => {
        next(
          new Error(
            "User could not be found in session. Please try logging in again!"
          )
        );
      });
  } else {
    next();
  }
});

app.use(authRoutes);
app.use("/admin", adminData.adminRoute);
app.use(shopRoutes);
app.get("/500", errorControllers.render500);

app.use(errorControllers.render404);

app.use((error, req, res, next) => {
  console.log(error);
  res.status(500).render("error-500.ejs", {
    pageTitle: "500 Internal Server Error",
    path: req.path,
    isLoggedIn: req.session.isLoggedIn,
    username: req.session.user ? req.session.user[0].username : "",
  });
});

mongoose
  .connect(process.env.DB_URI)
  .then(() => {
    console.log("DB Connected!");
    app.listen(process.env.PORT || 3000);
  })
  .catch((err) => {
    throw new Error(err);
  });

// mongo driver code
// mongoConnect(() => {
//     // console.log(client);
//     app.listen(3000);
// })

//  MYSQL IMPLEMENTAION CODE
// Product.belongsTo(User, {constraints: true, onDelete: 'CASCADE'});
// User.hasMany(Product);
// Cart.belongsTo(User);
// User.hasOne(Cart);
// Product.belongsToMany(Cart, {through: CartItem});
// Cart.belongsToMany(Product, {through: CartItem});
// Order.belongsTo(User);
// User.hasMany(Order);
// Order.belongsToMany(Product, {through: OrderItem});

// sequelize
//     .sync()
//     // .sync({force: true})
//     .then(result => {
//         // console.log(result);
//         return User.findByPk(1)
//     })
//     .then(user => {
//         if (!user) {
//             return User.create({name: "John", email: "john@test.com"});
//         }
//         return user;
//     })
//     .then( user => {
//     //    console.log(user);
//        return user.createCart();
//     }
//     )
//     .then(cart => {
//         app.listen(3000);
//     })
//     .catch(err => {
//         console.log(err);
//     });
