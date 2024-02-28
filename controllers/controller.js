const User = require("../models/user");
const Message = require("../models/message");
const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");

exports.index = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Site Home Page");
});

exports.sign_up_get = asyncHandler(async (req, res, next) => {
  res.render("sign_up_form", { title: "Sign Up" });
});

exports.sign_up_post = [
  // validate and sanitize inputs 
  body("first_name", "Name must not be empty")
    .trim()
    .isLength({ min: 1})
    .escape(),
  body("family_name", "Name must not be empty")
    .trim()
    .isLength({ min: 1})
    .escape(),
  body("email", "Please enter valid email")
    .trim()
    .isEmail()
    .escape(),
  body("password", "Password must be a minimum of 6 characters long")
    .trim()
    .isLength({ min: 6 })
    .escape(),
  body("confirm_password")
    .trim()
    .isLength({ min: 6 })
    .withMessage("Password must be a minimum of 6 characters long")
    .custom((value, {req, loc, path}) => {
      if (value !== req.body.password) {
        throw new Error("Passwords dont match");
      } else {
        return value;
      }
    })
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    // create User without hashed password in case of re-render due to error
    const userNoPass = new User({
      first_name: req.body.first_name,
      family_name: req.body.family_name,
      email: req.body.email,
      membership_status: "Inactive"
    })

    if (!errors.isEmpty()) {
      res.render("sign_up_form", {
        title: "Sign Up",
        user: userNoPass,
        errors: errors.array(),
      });
      return;
    } else {
      bcrypt.hash(req.body.password, 10, async(err, hashedPassword) => {
        if (err) {
          return next(err);
        }
        const user = new User({
          first_name: req.body.first_name,
          family_name: req.body.family_name,
          email: req.body.email,
          password: hashedPassword,
          membership_status: "Inactive"
        });
        const result = await user.save();
        res.redirect("/");
      });
    }
  }),
];

exports.log_in_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: log in GET");
});

exports.log_in_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: log in POST");
});

exports.membership_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: membership GET");
});

exports.membership_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: membership POST");
});