const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    authorID: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    img: {
        type: String,
        default: ""
    },
    likecount: {
        type: Number,
        required: true,
        default: 0
    },
    commentcount: {
        type: Number,
        required: true,
        default: 0
    }
}, { timestamps: true }); 

module.exports = mongoose.model("posts", schema);
