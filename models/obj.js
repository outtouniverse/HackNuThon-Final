// models/File.js
const mongoose = require('mongoose');
const connect=mongoose.connect('mongodb://localhost:27017/HACKNUTHON');
connect.then(()=>{
    console.log("connected");
})
.catch(()=>{
    console.log("couldnt connect");
})
const assetSchema = new mongoose.Schema({
  filename: String,
  path: String,
  uploadDate: { type: Date, default: Date.now }
});

const Asset = mongoose.model('Asset', assetSchema);

module.exports = Asset;
