const mongoose = require('mongoose');
const uri = 'mongodb+srv://dbUser:halsohaslo132@cluster0.tfbwlcs.mongodb.net/';

async function connect() {
    try {
        await mongoose.connect(uri);
        console.log('Connected to Mongoose!');
    } catch (error) {
        console.log('Connection failed: ', error);
    };
};

module.exports = connect;