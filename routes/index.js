const express = require("express");
const bodyParser = require("body-parser");
const collection = require("../models/config");
const Project = require("../models/user");
const app = express();
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("register");
});
app.post("/", async (req, res) => {
  try {
    const { email, password, confirmpassword } = req.body;

    // Check if user with the provided email already exists
    const existUser = await collection.findOne({ email });

    if (existUser) {
      return res.send("User already exists!!");
    }

    // Check if password and confirm password match
    if (password !== confirmpassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    // Create a new user
    const newUser = new collection({
      email,
      password,
    });
    await newUser.save();
    res.redirect("/dash");
  } catch (err) {
    console.error("Error saving user:", err);
    res.status(500).json({ error: "Failed to save user to database" });
  }
});

app.get("/login", (req, res) => {
  res.render("login");
});
app.post("/login", async (req, res) => {
  try {
    const check = await collection.findOne({ email: req.body.email });
    if (!check) {
      res.send("email not found");
    }
    const ispassword = await collection.findOne({
      password: req.body.password,
    });
    if (ispassword) {
      res.redirect("/dash");
    } else {
      req.send("wrong password");
    }
  } catch {
    req.send("wrong details");
  }
});

app.get("/dash", (req, res) => {
  res.render("home");
});
app.get("/assign", async (req, res) => {
  const projects = await Project.find();
  res.render("assign", { projects });
});
app.post("/assign", async (req, res) => {
  try {
    const { title, description, startDate, endDate } = req.body;

    const project = new Project({
      title,
      description,
      startDate,
      endDate,
    });

    // Save the project to the database
    await project.save();
    const projects = await Project.find();
    res.redirect("/assign");
  } catch (error) {
    console.error("Error saving project:", error);
    res.status(500).send("Internal Server Error");
  }
});
app.get("/members", (req, res) => {
  res.render("member");
});

app.get("/assets", (req, res) => {
  res.render("assets");
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
