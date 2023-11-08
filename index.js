const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config();
const cookieParser = require("cookie-parser");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// port
const port = process.env.PORT || 5000;

// middleware
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://classic-hotel-d04b4.web.app",
      "https://classic-hotel-d04b4.firebaseapp.com",
    ],
    credentials: true,
  })
);
app.use(cookieParser());

// custom middleware
const verifyToken = async (req, res, next) => {
  const token = req.cookies?.token;
  // console.log("veri", token);
  if (!token) {
    return res.status(403).send({ message: "Forbidden Access" });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: "Unauthorized" });
    }
    req.user = decoded;
    next();
  });
};

// mongodb

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
    const myBookingsCollection = client
      .db("classicHotelDB")
      .collection("bookings");
    const reviewsCollection = client.db("classicHotelDB").collection("reviews");

    // jwt token
    app.post("/jwt", (req, res) => {
      const user = req.body;
      // console.log("token:", req.cookies.token);
      const token = jwt.sign(user, process.env.ACCESS_TOKEN, {
        expiresIn: "1h",
      });
      res
        .cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        })
        .send({ success: true });
      // console.log(token);
    });
    app.post("/logout", (req, res) => {
      const user = req.body;
      res
        .clearCookie("token", {
          maxAge: 0,
        })
        .send({ message: success });
    });
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

    // add to  bookings
    app.post("/bookings", async (req, res) => {
      const newBooking = req.body;
      // console.log(newBooking);
      const result = await myBookingsCollection.insertOne(newBooking);
      // console.log(newBooking);
      res.send(result);
    });

    // delete single booking
    app.delete("/myBookings/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await myBookingsCollection.deleteOne(query);
      res.send(result);
      // console.log(result);
    });

    // get  my bookings data by email
    app.get("/myBookings", verifyToken, async (req, res) => {
      // console.log("cook", req.cookies.token);
      console.log("owner", req.user);
      if (req.user.email !== req.query.email) {
        return res.status(403).send({ message: "Forbidden Access" });
      }
      let query = {};
      if (req?.query?.email) {
        query = { email: req?.query?.email };
      }
      // console.log(query);

      const result = await myBookingsCollection.find(query).toArray();
      res.send(result);
    });

    // get single booking
    app.get("/myBookings/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await myBookingsCollection.findOne(query);
      res.send(result);
      // console.log(result);
    });

    // update single booking data
    app.put("/myBookings/:id", async (req, res) => {
      // console.log(object);
      const id = req.params.id;
      const newDate = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          date: newDate.date,
        },
      };
      const result = await myBookingsCollection.updateOne(filter, updateDoc);
      // console.log(newDate.date);
      res.send(result);
    });

    // add review
    app.post("/reviews", async (req, res) => {
      const newReview = req.body;
      const result = await reviewsCollection.insertOne(newReview);
      res.send(result);
      // console.log(newReview);
    });
    // get all reviews
    app.get("/reviews", async (req, res) => {
      const result = await reviewsCollection.find().toArray();
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
