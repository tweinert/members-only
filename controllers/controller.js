const User = require("../models/user");
const Message = require("../models/message");
const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const passport = require("passport");

exports.index_get = asyncHandler(async (req, res, next) => {
  const messagesArray = await Message.find({}, "title timestamp text user")
    .sort({ timestamp: 1 })
    .populate("user")
    .exec();
  
  // used to check membership status
  let isMember = false;
  let isAdmin = false;
  if (req.user) {
    const currentUser = await User.findById(req.user.id).exec();
    if (currentUser.membership_status === "Active") {
      isMember = true;
    }

    if (currentUser.is_admin) {
      isAdmin = true;
    }
  }
  
  res.render("messages", {
    title: "Message Board",
    message_list: messagesArray,
    user: req.user,
    isMember: isMember,
    isAdmin: isAdmin,
  });
});

exports.index_post = [
  body("id", "Error with message id")
    .trim()
    .escape(),

  asyncHandler(async (req, res, next) => {
    const message = await Message.findByIdAndDelete(req.body.id);
    res.redirect("/");
  })
];

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
    console.log(req.body.is_admin);

    // create User without hashed password in case of re-render due to error
    const userNoPass = new User({
      first_name: req.body.first_name,
      family_name: req.body.family_name,
      email: req.body.email,
      membership_status: "Inactive",
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
          membership_status: "Inactive",
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
  res.render("log_in_form", {
    title: "Log In",
    user: req.user,
    errors: errorMessage
  });
});

exports.message_get = asyncHandler(async (req, res, next) => {
  res.render("message_form", {
    title: "Create a Message",
    user: req.user,
  });
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

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    if (!req.user) {
      const errorUser = ["Need to log in to create message"];
      res.render("message_form", {
        title: "Create a Message",
        user: req.user,
        errors: errorUser,
      });
      return;
    } else if (!errors.isEmpty()) {
      res.render("message_form", {
        title: "Create a Message",
        user: req.user,
        errors: errors.array(),
      });
    } else {
      const message = new Message({
        title: req.body.title,
        text: req.body.text,
        user: req.user
      });
      const result = await message.save();
      res.redirect("/");
    }
  })
];

exports.membership_get = asyncHandler(async (req, res, next) => {
  res.render("member_form", {
    title: "Membership",
    user: req.user
  });
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
      const matchAdmin = await bcrypt.compare(req.body.passcode, process.env.ENV_ADMIN);
      if (!match && !matchAdmin) {
        res.render("member_form", {
          title: "Membership",
          user: req.user,
          message: "Incorrect Password",
          errors: errors.array(),
        });
        return;
      } else if (match) {
        await User.findByIdAndUpdate(req.user.id, { membership_status: "Active"}, {});
        res.render("member_form", {
          title: "Membership",
          user: req.user,
          message: "Correct Member Password!",
          errors: errors.array(),
        });
        return;
      } else if (matchAdmin) {
        await User.findByIdAndUpdate(req.user.id, { is_admin: true }, {});
        res.render("member_form", {
          title: "Membership",
          user: req.user,
          message: "Correct Admin Password!",
          errors: errors.array(),
        });
      }
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