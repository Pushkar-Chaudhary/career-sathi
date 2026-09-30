const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 32,
        unique: [true, 'username already exists']
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        maxlength: 254,
        unique: [true, 'use another email address']
    },
    password: {
        type: String,
        required: true
    }
});

const userModel = mongoose.model('users', userSchema);

module.exports = userModel;
