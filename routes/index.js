const express = require('express');
const bodyParser = require('body-parser');
const collection=require('../models/config');
const Project=require('../models/user');
const upload = require('../config/multer');
const Asset = require('../models/obj');
const Member = require('../models/member');
const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.render("register");
});
app.post("/", async (req, res) => {
  try {
    const { username,email, password, confirmpassword } = req.body;

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
      username,
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
});app.post("/login", async (req, res) => {
  try {
    const user = await collection.findOne({ email: req.body.email });
    if (!user) {
      return res.send("Email not found");
    }
    // Check if the password matches the one stored in the database
    if (req.body.password === user.password) {
      // Password matches, redirect to the dashboard
      res.redirect("/dash");
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


app.get('/assign',async (req,res)=>{
  const projects = await Project.find();
  res.render('assign', { projects})
});
;
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
app.get('/members',(req,res)=>{
  res.render('member');
});
app.post('/members', async (req, res) => {
  try {
    const { numOfRepetitions } = req.body;
    const savedMembers = [];
    console.log(numOfRepetitions);

    // Loop through each member submitted in the form
    for (let i = 0; i < numOfRepetitions; i++) {
      const memberName = req.body[`memberName${i}`];
      const memberPosition = req.body[`memberPosition${i}`];
      const taskToAssign = req.body[`taskToAssign${i}`];
      const startDate = req.body[`startDate${i}`];
      const endDate = req.body[`endDate${i}`];

      // Create a new member document
      const newMember = new Member({
        memberName,
        memberPosition,
        taskToAssign,
        startDate,
        endDate
      });

      // Save the member document to the database
      const savedMember = await newMember.save();

      console.log('Member saved:', savedMember);
      savedMembers.push(savedMember);
    }

    // Send a response after all members have been saved
    res.status(200).json({ message: 'Members saved successfully', members: savedMembers });
  } catch (err) {
    console.error('Error saving member data:', err);
    // Send a JSON response with the error message
    res.status(500).json({ error: 'Failed to save member data to database', details: err.message });
  }
});


app.get("/assets", (req, res) => {
  res.render("assets");
});
app.post('/assets', upload.single('filename'), async (req, res) => {
  try {
    const { filename, path } = req.file;

    // Create a new asset document
    const newAsset = new Asset({
      filename,
      path
    });

    // Save the asset document to the database
    await newAsset.save();

    res.status(200).json({ message: 'File uploaded successfully', asset: newAsset });
  } catch (err) {
    console.error('Error uploading file:', err);
    res.status(500).json({ error: 'Failed to upload file', details: err.message });
  }
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
