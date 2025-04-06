const { MongoClient } = require("mongodb");

async function testMongo() {
  const client = new MongoClient("mongodb://localhost:27017");

  try {
    await client.connect();
    console.log("Connected to MongoDB!");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
  } finally {
    await client.close();
  }
}

testMongo();
