#! /usr/bin/env node

console.log(
  'This script populates some test messages and users to your database. Specified database as argument - e.g.: node populatedb "mongodb+srv://cooluser:coolpassword@cluster0.lz91hw2.mongodb.net/local_library?retryWrites=true&w=majority"'
);

// Get arguments passed on command line
const userArgs = process.argv.slice(2);

const User = require("./models/user");
const Message = require("./models/message");

const users = [];
const messages = [];

const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

const mongoDB = userArgs[0];

main().catch((err) => console.log(err));

async function main() {
  console.log("Debug: About to connect");
  await mongoose.connect(mongoDB);
  console.log("Debug: Should be connected?");
  await createUsers();
  await createMessages();
  console.log("Debug: Closing mongoose");
  mongoose.connection.close();
}

async function userCreate(index, first_name, family_name, email, password, membership_status) {
  const userDetail = {
    first_name: first_name,
    family_name: family_name,
    email: email,
    password: password,
    membership_status: membership_status,
  };
  const user = new User(userDetail);

  await user.save();
  users[index] = user;
  console.log(`Added user: ${first_name} ${family_name}`);
}

async function messageCreate(index, title, timestamp, text, user) {
  const messageDetail = {
    title: title,
    user: user,
  };
  if (text != false) messageDetail.text = text;
  if (timestamp != false) messageDetail.timestamp = timestamp;

  const message = new Message(messageDetail);
  await message.save();
  messages[index] = message;
  console.log(`Added message: ${title}`);
}

async function createUsers() {
  console.log("Adding users");
  await Promise.all([
    userCreate(0, "John", "Smith", "john.smith@email.com", "password1", "Active"),
    userCreate(1, "Herbert", "Hastings", "herbert1972@gmail.com", "dogName321", "Inactive"),
    userCreate(2, "Thomas", "Johnson", "tJohn@gmail.com.au", "wordpass", "Active"),
    userCreate(3, "Hillary", "Hart", "hHart1999@outlook.com", "aeiou123", "Active"),
    userCreate(4, "Kathy", "Carroll", "catLover1@hotmail.com.au", "catcatcat", "Inactive"),
  ]);
}

async function createMessages() {
  console.log("Adding messages");
  await Promise.all([
    messageCreate(
      0,
      "Test Message",
      false,
      "This is a message to test functionality",
      users[0],
    ),
    messageCreate(
      1,
      "Hello World",
      false,
      "hello world",
      users[0],
    ),
    messageCreate(
      2,
      "Birthday",
      false,
      "My birthday is on the weekend, please come",
      users[1],
    ),
    messageCreate(
      3,
      "Google",
      false,
      "funny cat videos",
      users[4],
    ),
  ]);
}
