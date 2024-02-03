const express = require("express");
const { check } = require("express-validator");

const authControllers = require("../controllers/auth");
const checkAuth = require("../middleware/is-auth");
const loggedIn = require("../middleware/loggedIn");

const router = express.Router();

router.get("/login", loggedIn, authControllers.getLogin);
router.get("/signup", loggedIn, authControllers.getSignup);
router.post(
  "/login",
  [
    check("email", "Please enter a valid email!")
      .trim()
      .notEmpty()
      .isEmail()
      .escape(),
    check("password", "Please enter a valid password!").trim().notEmpty(),
  ],
  authControllers.postLogin
);
router.post(
  "/signup",
  [
    check("email")
      .trim()
      .notEmpty()
      .isEmail()
      .escape()
      .withMessage("Please enter a valid email!"),
    check("password")
      .isLength({ min: 8, max: 32 })
      .custom((value, { req }) => {
        const strongPasswordRegex =
          /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[0-9]).{8,32}$/;
        if (strongPasswordRegex.test(value)) {
          return true;
        } else {
          throw new Error(
            "Please enter a password which is minimum 8 characters long, contains atleast one Uppercase, one Special character and one Numeric."
          );
        }
      }),
    check("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Password and Confirm Password must match!");
      }
      return true;
    }),
  ],
  authControllers.postSignup
);
router.post("/logout", checkAuth, authControllers.postLogout);
router.get("/reset", loggedIn, authControllers.getReset);
router.post("/reset", loggedIn, authControllers.postReset);
router.get("/reset/:token", loggedIn, authControllers.getNewPassForm);
router.post("/new-password", loggedIn, authControllers.postNewPassword);

module.exports = router;
