const mongoose = require("mongoose");

const CredentialSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  hash: {
    type: String,
    required: true,
  },

  token: String,
});

const Credential = mongoose.model("Credential", CredentialSchema);

module.exports = Credential;
