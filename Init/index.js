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
  // Ensure each seeded listing has a valid ObjectId as owner.
  initdata.data = initdata.data.map((obj) => ( { ...obj, owner: new mongoose.Types.ObjectId('69090b180bf090ed64cc040d') } ));
    await listen.insertMany(initdata.data);
    console.log("Database Initialized with sample data");
}

initdb();

