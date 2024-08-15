const mongoose = require('mongoose');
const schema = new mongoose.Schema
({
    followerID:{
        type:String,
        required:true
    },
    followedID:{
        type:String,
        required:true
    }
})

module.exports = mongoose.model("follows", schema);