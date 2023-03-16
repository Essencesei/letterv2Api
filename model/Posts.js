const mongoose = require("mongoose");

const PostsSchema = new mongoose.Schema({
  userData: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserData",
  },

  subject: String,
  body: String,

  from: {
    type: String,
  },

  createdAt: {
    type: Date,
    default: () => Date.now(),
  },

  isPublic: {
    type: Boolean,
    default: () => true,
  },

  reactCount: {
    type: Number,
    default: () => 0,
  },
});

const Posts = mongoose.model("Posts", PostsSchema);

module.exports = Posts;
