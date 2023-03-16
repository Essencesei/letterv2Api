const mongoose = require("mongoose");
require("dotenv").config({ path: "./config.env" });

const app = require("./app");

mongoose
  .connect(process.env.DATABASE.replace("<password>", process.env.PASSWORD))
  .then(() => console.log("Connected"))
  .catch((err) => console.log(err.message));

app.listen(3000,(err) => (err ? console.log("Error") : console.log("Listening")));
