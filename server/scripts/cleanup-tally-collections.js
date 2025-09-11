// cleanup-tally-collections.js
// Script to clear all tally-related collections from MongoDB


const mongoose = require('mongoose');
require('dotenv').config();


const collections = [
  'tallycompanies',
  'tallycostcenters',
  'tallycurrencies',
  'tallygroups',
  'tallyledgers',
  'tallystockitems',
  'tallyvouchers'
];

async function clearCollections() {
  const mongoUri = "mongodb+srv://gs8683921:123qwe@cluster0.m94ov.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0";

  if (!mongoUri) {
    console.error('MONGO_URI is not defined in environment variables.');
    process.exit(1);
  }
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
  for (const name of collections) {
    try {
      await mongoose.connection.collection(name).deleteMany({});
      console.log(`Cleared collection: ${name}`);
    } catch (err) {
      console.error(`Error clearing ${name}:`, err);
    }
  }
  await mongoose.disconnect();
  console.log('Cleanup complete.');
}

clearCollections();
