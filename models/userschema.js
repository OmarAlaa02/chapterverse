const mongoose = require('mongoose');
const schema = new mongoose.Schema
({
    username: {
        type: String,
        required: true,
        unique:true
    },
    email: {
        type: String,
        required: true,
        unique:true
    },
    password: {
        type: String,
        required: true
    },
    profilepicture:{
        type:String,
        default:"https://tse2.mm.bing.net/th?id=OIP.fqSvfYQB0rQ-6EG_oqvonQHaHa&pid=Api&P=0&h=220",
        required:true,
    }

})

module.exports = mongoose.model("users", schema);