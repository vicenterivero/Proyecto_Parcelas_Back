const { MongoClient } = require('mongodb');
require('dotenv').config();

let mongoDb;

const connectMongoDB = async () => {
  try {
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    mongoDb = client.db(process.env.MONGO_DB_NAME);
    console.log('✅ Conectado a MongoDB');
    return mongoDb;
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error);
    throw error;
  }
};

const getMongoDb = () => mongoDb;

module.exports = { connectMongoDB, getMongoDb };
