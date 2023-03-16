const mongoose = require("mongoose");

const UserDataSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },

  partner: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "UserData",
  },

  credential: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "Credential",
  },
});

const UserData = mongoose.model("UserData", UserDataSchema);

module.exports = UserData;
