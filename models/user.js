const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  first_name: { type: String, required: true, maxLength: 100 },
  family_name: { type: String, required: true, maxLength: 100 },
  email: { type: String, required: true },
  password: { type: String, required: true },
  membership_status: {
    type: String,
    required: true,
    enum: ["Active", "Inactive" ],
    default: "Active",
  },
  is_admin: {
    type: Boolean,
    default: false,
  },
});

// Virtual for author's full name
UserSchema.virtual("full_name").get(function () {
  // To avoid errors in cases where an author does not have either a family name or first name
  // We want to make sure we handle the exception by returning an empty string for that case
  let fullname = "";
  if (this.first_name && this.family_name) {
    fullname = `${this.first_name} ${this.family_name}`;
  }

  return fullname;
});

// Export model
module.exports = mongoose.model("User", UserSchema);
