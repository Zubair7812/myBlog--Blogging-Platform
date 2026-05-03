const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  username: String,
  fullname: String,
  email: String,
  password: String,
  type: String,
  dp: String,
  bio: String,
  weblink: String,
  facebook: String,
  whatsapp: String,
  twitter: String,
  instagram: String,
  phoneno: String
});

const Profile = mongoose.model("profile", profileSchema);
module.exports = Profile;
