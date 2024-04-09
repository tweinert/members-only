// const express = require("express");
// const router = express.Router();
// const passport = require("passport");

// router.get("/", function (req, res, next) { 
//   const errorMessage = 
//     req.query.error === "invalid" ? "Invalid username or password" : null;
//   res.render("log_in_form", { title: "Log In", errors: errorMessage });
// });

// router.post(
//   "/",
//   passport.authenticate("local", {
//     successRedirect: "/login",
//     failureRedirect: "/login?error=invalid"
//   })
// );

// module.exports = router;