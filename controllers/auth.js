const User = require("../models/user");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const SENDEMAIL = require("../utils/mail");
const { validationResult } = require("express-validator");

exports.getSignup = (req, res, next) => {
  let msg = req.flash("error");
  if (msg.length > 0) {
    msg = msg[0];
  } else {
    msg = null;
  }
  res.render("auth/signup", {
    pageTitle: "Sign Up",
    path: req.originalUrl,
    isLoggedIn: req.session.isLoggedIn,
    flashMessage: msg,
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const username = req.body.username;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // console.log(errors.array());
    return res
      .status(422)
      .render("auth/signup", {
        pageTitle: "Sign Up",
        path: req.originalUrl,
        isLoggedIn: req.session.isLoggedIn,
        flashMessage: errors.array()[0].msg,
      });
  }

  User.find({ $or: [{ email: email }, { username: username }] })
    .exec()
    .then((user) => {
      if (user.length > 0) {
        // console.log(user);
        req.flash(
          "error",
          "User already exists! Try changing Email or Username."
        );
        res.redirect("/signup");
      } else {
        bcrypt
          .hash(password, 12)
          .then((hash) => {
            const newUser = new User({
              email: email,
              username: username,
              password: hash,
              cart: { items: [] },
              name: "",
              shippingAddress: {},
            });
            newUser.save();
            SENDEMAIL({ toEmail: email, username: username }, (info) => {
              // console.log(info);
              res.redirect("/login");
            });
          })
          .catch((err) => console.log(err));
      }
    });
};

exports.getLogin = (req, res, next) => {
  // console.log(req.session);
  let msg = req.flash("error");
  if (msg.length > 0) {
    msg = msg[0];
  } else {
    msg = null;
  }
  res.render("auth/login", {
    pageTitle: "Login",
    path: req.originalUrl,
    isLoggedIn: req.session.isLoggedIn,
    flashMessage: msg,
  });
};

exports.postLogin = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // console.log(errors.array());
    return res
      .status(422)
      .render("auth/login", {
        pageTitle: "Login",
        path: req.originalUrl,
        isLoggedIn: req.session.isLoggedIn,
        flashMessage: errors.array()[0].msg,
      });
  }

  User.find({ email: req.body.email })
    .exec()
    .then((user) => {
      const password = req.body.password;
      if (user.length > 0) {
        bcrypt.compare(password, user[0].password).then((result) => {
          if (result) {
            // console.log(user);
            req.session.user = user;
            req.session.isLoggedIn = true;
            return req.session.save((err) => {
              // console.log(err);
              res.redirect("/");
            });
          } else {
            req.flash("error", "Invalid Email or Password!");
            res.redirect("/login");
          }
        });
      } else {
        req.flash("error", "Please Sign Up before Login!");
        res.redirect("/signup");
      }
    })
    .catch((err) => console.log(err));
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    res.redirect("/");
  });
};

exports.getReset = (req, res, next) => {
  let msg = req.flash("error");
  if (msg.length > 0) {
    msg = msg[0];
  } else {
    msg = null;
  }
  res.render("auth/reset-pass", {
    pageTitle: "Reset Password",
    path: req.originalUrl,
    isLoggedIn: req.session.isLoggedIn,
    flashMessage: msg,
  });
};

exports.postReset = (req, res, next) => {
  const userEmail = req.body.email;
  let msg = req.flash("error");
  if (msg.length > 0) {
    msg = msg[0];
  } else {
    msg = null;
  }

  // Create token
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/reset");
    }
    const token = buffer.toString("hex");
    // find user and Store token in db (create token and expiration in user model)
    User.find({ email: userEmail })
      .exec()
      .then((user) => {
        user = user[0];
        if (!user) {
          req.flash("error", "No such user exists!");
          return res.redirect("/reset");
        }
        user.resetToken = token;
        user.resetTokenExpiry = Date.now() + 3600000;
        return user.save();
      })
      .then((user) => {
        // send password reset link (token in path) on email and flash msg
        if (!user) {
          return;
        }
        SENDEMAIL(
          {
            toEmail: userEmail,
            username: user.username,
            subject: "Password Reset",
            html: `
                        
<!doctype html>
<html lang="en-US">

<head>
    <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
    <title>Password Reset</title>
    <meta name="description" content="Reset Password">
    <style type="text/css">
        a:hover {text-decoration: underline !important;}
    </style>
</head>

<body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0">
    <!--100% body table-->
    <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8"
        style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
        <tr>
            <td>
                <table style="background-color: #f2f3f8; max-width:670px;  margin:0 auto;" width="100%" border="0"
                    align="center" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="height:20px;">&nbsp;</td>
                    </tr>
                    
                        <td>
                            <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
                                style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                                <tr>
                                    <td style="height:40px;">&nbsp;</td>
                                </tr>
                                <tr>
                                    <td style="padding:0 35px;">
                                        <h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">You have
                                            requested to reset your password</h1>
                                        <span
                                            style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
                                        <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                                            We cannot simply send you your old password. A unique link to reset your
                                            password has been generated for you. To reset your password, click the
                                            following link and follow the instructions.
                                        </p>
                                        <a href="${req.hostname}/reset/${user.resetToken}"
                                            style="background:#20e277;text-decoration:none !important; font-weight:500; margin-top:35px; color:#fff;text-transform:uppercase; font-size:14px;padding:10px 24px;display:inline-block;border-radius:50px;">Reset
                                            Password</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="height:40px;">&nbsp;</td>
                                </tr>
                            </table>
                        </td>
                    <tr>
                        <td style="height:20px;">&nbsp;</td>
                    </tr>
                    <tr>
                        <td style="text-align:center;">
                            <p style="font-size:14px; color:rgba(69, 80, 86, 0.7411764705882353); line-height:18px; margin:0 0 0;">&copy; <strong>VShop</strong></p>
                        </td>
                    </tr>
                    <tr>
                        <td style="height:80px;">&nbsp;</td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
    <!--/100% body table-->
</body>
</html>
`,
          },
          (info) => {
            // console.log(info);
            res.redirect("/reset");
          }
        );
      })
      .catch((err) => console.log(err));
  });
};

exports.getNewPassForm = (req, res, next) => {
  const token = req.params.token;
  let msg = req.flash("error");
  if (msg.length > 0) {
    msg = msg[0];
  } else {
    msg = null;
  }
  User.find({ resetToken: token, resetTokenExpiry: { $gt: Date.now() } })
    .exec()
    .then((user) => {
      if (!user) {
        return res.redirect("/reset");
      }
      res.render("auth/new-password", {
        pageTitle: "Reset Password",
        path: req.originalUrl,
        isLoggedIn: req.session.isLoggedIn,
        flashMessage: msg,
        userId: user[0]._id.toString(),
        token: token,
      });
    });
};

exports.postNewPassword = (req, res, next) => {
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const userId = req.body.userId;
  const resetToken = req.body.token;
  let newUser;

  User.findOne({
    _id: userId,
    resetToken: resetToken,
    resetTokenExpiry: { $gt: Date.now() },
  })
    .exec()
    .then((user) => {
      // console.log(user);
      if (!user) {
        req.flash("Password reset token expired. Please try again!");
        return res.redirect("/reset");
      }
      newUser = user;
      return bcrypt.hash(password, 12);
    })
    .then((hashedPassword) => {
      // console.log(newUser);
      newUser.password = hashedPassword;
      newUser.resetToken = undefined;
      newUser.resetTokenExpiry = undefined;
      return newUser.save();
    })
    .then((results) => {
      req.flash(
        "error",
        "Password Reset Successful! Login with your new password"
      );
      res.redirect("/login");
    })
    .catch((err) => console.log(err));
};
