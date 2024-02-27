const User = require("../models/user");
const Message = require("../models/message");
const asyncHandler = require("express-async-handler");

exports.index = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Site Home Page");
});

exports.sign_up_get = asyncHandler(async (req, res, next) => {
  res.render("sign_up_form", { title: "Sign Up" });
});

exports.sign_up_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: sign up POST");
});

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