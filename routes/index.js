var express = require('express');
var router = express.Router();
const passport = require("passport");
const controller = require("../controllers/controller");


// GET message board home page
router.get("/", controller.index);

// Get request for sign up form
router.get("/signup", controller.sign_up_get);

// POST request for sign up form
router.post("/signup", controller.sign_up_post);

// GET request for log in form
router.get("/login", controller.login_get);

// POST request for log in form
router.post(
  "/login", 
  passport.authenticate("local", {
    successRedirect: "/login",
    failureRedirect: "/login?error=invalid"
  })
);

// GET request for membership form
router.get("/membership", controller.membership_get);

// POST request for membership form
router.post("/membership", controller.membership_post);

router.get("/logout", controller.log_out_get);

module.exports = router;
