const mongoose = require('mongoose');
const schema = new mongoose.Schema
({
    userID:{
        type:String,
        required:true
    },
    postID:{
        type:String,
        required:true
    },
    content:{
        type:String,
        required:true
    }
})

module.exports = mongoose.model("comments", schema);