const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const Credential = require("./model/Credential");
const UserData = require("./model/UserData");
const Posts = require("./model/Posts");

const app = express();
app.use(express.json());
app.use(cors());

app.post("/test/register", async (req, res) => {
  try {
    const username = req.body.username;
    const plainPassword = req.body.password;
    const hashed = await bcrypt.hash(plainPassword, 10);

    const firstName = req.body.firstName;
    const lastName = req.body.lastName;

    const cred = await Credential.create({
      username: username,
      hash: hashed,
    });

    const user = await UserData.create({
      firstName: firstName,
      lastName: lastName,
      credential: cred._id,
    });

    res.status(201).json({
      status: "Created",
      data: { cred, user },
    });
  } catch (e) {
    console.error(e);
    res.status(400).json({
      status: "fail",
      message: e.message,
    });
  }
});

app.post("/test/login", async (req, res) => {
  try {
    const username = req.body.username;
    const password = req.body.password;

    const data = await Credential.findOne({ username })
      .where("username")
      .equals(username);
    if (!data) throw new Error("Incorrect Credentials");
    const match = await bcrypt.compare(password, data.hash);
    if (!match) throw new Error("Incorrect Credentials");

    console.log(data);

    const token = jwt.sign(
      { userId: data._id, username: data.username },
      process.env.SECRET_KEY,
      {
        expiresIn: "1h",
      }
    );

    data.token = token;
    data.save();

    res.status(200).json({
      status: "ok",
      data: data,
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }
});

app.get("/test", async (req, res) => {
  res.status(200).json({
    status: "ok",
  });
});

app.get("/test/cred", validateToken, async (req, res) => {
  try {
    const data = await UserData.find({})
      .where("credential")
      .equals(req.decoded.userId);

    const post = await Posts.find()
      .where("userData")
      .equals(req.decoded.userId);

    res.status(200).json({
      status: "ok",
      message: { ...data, ...post },
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }
});

app.post("/test/post", validateToken, async (req, res) => {
  try {
    const subject = req.body.subject;
    const body = req.body.body;
    const isPublic = req.body.isPublic;

    console.log(req.decoded);

    const data = await Posts.create({
      subject: subject,
      body: body,
      isPublic: isPublic,
      from: req.decoded.username,
    });

    data.userData = req.decoded.userId;
    data.save();

    res.status(200).json({
      status: "ok",
      data: data,
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }
});

app.get("/test/post/:id", validateToken, async (req, res) => {
  try {
    if (req.params.id !== req.decoded.userId)
      throw new Error("ID not match with token");
    const data = await Posts.find({})
      .where("userData")
      .equals(req.decoded.userId)
      .sort({ createdAt: -1 });
    res.status(200).json({
      status: "ok",
      data: data,
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message,
    });
  }
});

app.get("/test/server", (req, res) => {
  try {
    res.status(200).json({
      status: "ok",
      statusCode: 200,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      statusCode: 400,
    });
  }
});

app.delete("/test/post/:id", validateToken, async (req, res) => {
  try {
    const data = await Posts.deleteOne()
      .where("_id")
      .equals(req.params.id)
      .where("userData")
      .equals(req.decoded.userId);

    res.status(200).json({
      status: "ok",
      message: "deleted",
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
});

app.delete("/test/post", validateToken, async (req, res) => {
  try {
    await Posts.deleteMany().where("userData").equals(req.decoded.userId);
    res.status(200).json({
      status: "ok",
      message: "deleted",
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
});

app.get("/test/posts", validateToken, async (req, res) => {
  try {
    const data = await Posts.find({})
      .where("isPublic")
      .equals(true)
      .sort({ createdAt: -1 });
    res.status(200).json({
      status: "ok",
      data: data,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
});

function validateToken(req, res, next) {
  try {
    const token = req.headers && req.headers.authorization?.split(" ")[1];
    if (!token) throw new Error("No Token");

    req.decoded = jwt.verify(token, process.env.SECRET_KEY);

    next();
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
}

module.exports = app;
