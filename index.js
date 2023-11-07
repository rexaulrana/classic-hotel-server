const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv").config();

// port
const port = process.env.PORT || 5000;

// middleware
app.use(express.json());
app.use(cors());

// mongodb

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6rml2ff.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection

    const featuredRoomsCollection = client
      .db("classicHotelDB")
      .collection("featuredRooms");
    const roomsCollection = client.db("classicHotelDB").collection("rooms");

    // get all featured rooms
    app.get("/featuredRooms", async (req, res) => {
      const result = await featuredRoomsCollection.find().toArray();
      res.send(result);
    });

    // get all rooms
    app.get("/rooms", async (req, res) => {
      const result = await roomsCollection.find().toArray();
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Classic Hotel server is running");
});

app.listen(port, () => {
  console.log(`server running on port ${port}`);
});
