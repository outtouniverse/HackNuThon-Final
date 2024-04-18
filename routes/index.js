const express = require("express");
const bodyParser = require("body-parser");
const collection = require("../models/config");
const Project = require("../models/user");
const path = require("path");
const multer = require("multer");
const Asset = require("../models/obj");
const Member = require("../models/member");
const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("register");
});
app.post("/", async (req, res) => {
  try {
    const { username, email, password, confirmpassword } = req.body;

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
      username,
      email,
      password,
    });
    await newUser.save();
    const user = await collection.findOne({ email: req.body.email });
    res.redirect("/dash/"+user._id);
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
    const user = await collection.findOne({ email: req.body.email });
    if (!user) {
      
      return res.send("Email not found");
    }
    // Check if the password matches the one stored in the database
    if (req.body.password === user.password) {
      // Password matches, redirect to the dashboard
      res.redirect("/dash/"+user._id);
    } else {
      // Password does not match
      res.send("Wrong password");
    }
  } catch (error) {
    // Handle any unexpected errors
    console.error("Error during login:", error);
    res.send("An error occurred during login");
  }
});

app.get("/assign", async (req, res) => {
  const projects = await Project.find();
  res.render("assign", { projects });
});
app.get("/dash", (req, res) => {
  res.render("home");
;
app.get("/dash/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const user = await collection.findById(id);
    if (!user) {
      return res.send("User not found");
    }
    const username = user.username; // Assuming the username is stored in the user object
    res.render("home", { username });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).send("Internal Server Error");
  }
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

app.post("/members", async (req, res) => {
  try {
    const { numOfRepetitions } = req.body;
    const savedMembers = [];

    // Loop through each member submitted in the form
    for (let i = 0; i < numOfRepetitions; i++) {
      const memberName = req.body[`project_title_${i}`];
      const memberPosition = req.body[`project_description_${i}`];
      const taskToAssign = req.body[`task_to_assign_${i}`];
      const startDate = req.body[`start_date_${i}`];
      const endDate = req.body[`end_date_${i}`];

      // Create a new member document
      const newMember = new Member({
        memberName,
        memberPosition,
        taskToAssign,
        startDate,
        endDate,
      });

      // Save the member document to the database
      const savedMember = await newMember.save();
      savedMembers.push(savedMember);
      console.log("Member saved:", savedMember);
    }

    // Send a response after all members have been saved
    res
      .status(200)
      .json({ message: "Members saved successfully", members: savedMembers });
  } catch (err) {
    console.error("Error saving member data:", err);
    // Send a JSON response with the error message
    res.status(500).json({
      error: "Failed to save member data to database",
      details: err.message,
    });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
});
app.get("/assets", async (req, res) => {
  try {
    const assets = await Asset.find(); // Corrected from 'asset' to 'Asset'
    res.render("assets", { assets });
  } catch (error) {
    console.error("Error fetching assets:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.post("/assets", upload.single("filename"), async (req, res) => {
  try {
    const { filename, path, size } = req.file;
    const asset = new Asset({
      filename,
      path,
      size,
    });
    await asset.save();
    res.send("Asset uploaded successfully");
  } catch (error) {
    res.status(400).send("Error uploading asset");
  }
});

app.get("/users", (req, res) => {
  res.render("users");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
