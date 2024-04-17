const express = require('express');
const bodyParser = require('body-parser');
const collection=require('../models/config');
const Project=require('../models/user');
const Member = require('../models/member');
const app = express();

app.use(express.static('public'));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.render('register');
});
app.post('/', async (req, res) => {
  try {
    const { username,email, password, confirmpassword } = req.body;

    // Check if user with the provided email already exists
    const existUser = await collection.findOne({ email });

    if (existUser) {
      return res.send("User already exists!!");
    }

    // Check if password and confirm password match
    if (password !== confirmpassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    // Create a new user
    const newUser = new collection({
      username,
      email,
      password
    });
    await newUser.save();
    res.redirect("/dash");
  } catch (err) {
    console.error('Error saving user:', err);
    res.status(500).json({ error: 'Failed to save user to database' });
  }
});

app.get('/login', (req, res) => {
  res.render('login');
});
app.post('/login',async(req,res)=>{
  try{
    const check=await collection.findOne({email:req.body.email});
    if(!check){
      res.send("email not found");
    }
    const ispassword=await collection.findOne({password:req.body.password});
    if(ispassword){
      res.redirect("/dash/" + user._id);
    }else{
      req.send("wrong password");
    }
    
  }catch{
    req.send("wrong details");
  }
});
app.get('/dash/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const user = await collection.findById(id);

    if (!user) {
      return res.status(404).send('User not found');
    }

    res.render('home', { username: user.username });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/assign',async (req,res)=>{
  const projects = await Project.find();
  res.render('assign', { projects });
});
app.post('/assign', async (req, res) => {
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
    res.redirect('/assign');
  } catch (error) {
    console.error('Error saving project:', error);
    res.status(500).send('Internal Server Error');
  }
});
app.get('/members',(req,res)=>{
  res.render('member');
});app.post('/members', async (req, res) => {
  try {
    const { numOfRepetitions } = req.body;

    // Loop through each member submitted in the form
    for (let i = 0; i < numOfRepetitions; i++) {
      const { memberName, memberPosition, taskToAssign, startDate, endDate } = req.body;

      // Create a new member document
      const newMember = new Member({
        memberName,
        memberPosition,
        taskToAssign,
        startDate,
        endDate
      });

      // Save the member document to the database
      await newMember.save();

      console.log(newMember);
    }

    // Redirect to a success page after saving all members
    res.redirect("/members");
  } catch (err) {
    console.error('Error saving member data:', err);
    res.status(500).json({ error: 'Failed to save member data to database' });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
