const User = require("../models/user");
const Message = require("../models/message");
const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const passport = require("passport");

exports.index = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Site Home Page", { user: req.user });
});

exports.sign_up_get = asyncHandler(async (req, res, next) => {
  res.render("sign_up_form", { title: "Sign Up", user: req.user });
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

    if (req.user) {
      const errorUser = ["Already logged in. Please sign out before creating a new account", "Test"];
      res.render("sign_up_form", {
        title: "Sign Up",
        user_details: userNoPass,
        user: req.user,
        errors: errorUser,
      });
      return;
    } else if (!errors.isEmpty()) {
      res.render("sign_up_form", {
        title: "Sign Up",
        user_details: userNoPass,
        user: req.user,
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

exports.login_get = asyncHandler(async (req, res, next) => {
  const errorMessage = 
    req.query.error === "invalid" ? "Invalid username or password" : null;
  res.render("log_in_form", { title: "Log In", user: req.user, errors: errorMessage });
});

exports.message_get = asyncHandler(async (req, res, next) => {
  res.render("message_form", { title: "Create a Message", user: req.user });
});

exports.message_post = [
  body("title", "Title must be at least 3 characters")
    .trim()
    .isLength({ min: 3})
    .escape(),
  body("text", "Message must be at least 3 characters")
    .trim()
    .isLength({ min: 3})
    .escape(),
];

exports.membership_get = asyncHandler(async (req, res, next) => {
  res.render("member_form", { title: "Membership", user: req.user });
});

exports.membership_post = [
  body("passcode", "")
    .trim()
    .escape(),
  
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render("member_form", {
        title: "Membership",
        user: req.user,
        errors: errors.array(),
      });
      return;
    } else {
      const match = await bcrypt.compare(req.body.passcode, process.env.ENV_SECRET);
      if (!match) {
        res.render("member_form", {
          title: "Membership",
          user: req.user,
          message: "Incorrect Password",
          errors: errors.array(),
        });
        return;
      };
      await User.findByIdAndUpdate(req.user.id, { membership_status: "Active"}, {});

      res.render("member_form", {
        title: "Membership",
        user: req.user,
        message: "Correct Password!",
        errors: errors.array(),
      });
    }
  })
];

exports.log_out_get = asyncHandler(async (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});