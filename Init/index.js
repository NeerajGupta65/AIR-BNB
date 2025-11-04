const mongoose = require('mongoose');
const initdata=require('./data.js');
const listen = require('../models/listening.js');

main()
.then(() => console.log("Connected to MongoDB"))
.catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/WanderLust');
}

const initdb = async () => {
    await listen.deleteMany({});
    await listen.insertMany(initdata.data);
    console.log("Database Initialized with sample data");
}

initdb();
