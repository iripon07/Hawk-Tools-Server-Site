const express = require("express");
const cors = require("cors");
var jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mexo0.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "UnAuthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    await client.connect();
    const toolsCollection = client.db("hawktools").collection("tools");
    const reviewsCollection = client.db("hawktools").collection("reviews");
    const ordersCollection = client.db("hawktools").collection("orders");
    const usersCollection = client.db("hawktools").collection("users");

    //Post user
    app.put("/users/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      const token = jwt.sign(
        { email: email },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1d" }
      );
      res.send({ result, token });
    });

    //GET ALL TOOLS
    app.get("/tools", async (req, res) => {
      const query = {};
      const cursor = toolsCollection.find(query);
      const tools = await cursor.toArray();
      res.send(tools);
    });

    app.get("/tools/:id", async (req, res) => {
      const id = req.params;
      // console.log(id);
      const query = { _id: ObjectId(id) };
      const result = await toolsCollection.findOne(query);
      res.send(result);
    });

    //Reviews
    //get all reviews
    app.get("/reviews", async (req, res) => {
      const query = {};
      const cursor = reviewsCollection.find(query);
      const reviews = await cursor.toArray();
      res.send(reviews);
    });

    app.post("/reviews", async (req, res) => {
      const body = req.body;
      const reviews = await reviewsCollection.insertOne(body);
      res.send(reviews);
    });


    //Get Products by user email 
    app.get("/orders", verifyJWT, async (req, res) => {
      const user = req.query.email;
      const decodedEmail = req.decoded.email;
      if (decodedEmail === user) {
        const filter = { email: user };
        const cursor = ordersCollection.find(filter);
        const result = await cursor.toArray();
        return res.send(result);
      } else {
        return res.status(403).send({ message: "Forbidden access!" });
      }
    });

    //Order

    //Order Post
    app.post("/orders", async (req, res) => {
      const body = req.body;
      const orders = await ordersCollection.insertOne(body);
      res.send(orders);
    });

    //Delete  Product
    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await ordersCollection.deleteOne(query);
      res.send(result);
    });

    //get all orders
    app.get("/orders", async (req, res) => {
      const result = await ordersCollection.find().toArray();
      res.send(result);
    });



      // make shipping
      app.put('/orders/:id', async (req, res) => {
        const id = req.params.id;
        const deliver = req.body;
        const filter = { _id: ObjectId(id) };
        const options = { upsert: true };
        const updateDoc = {
            $set: deliver
        };
        const result = await ordersCollection.updateOne(filter, updateDoc, options);
        res.send(result);
    })
  } finally {
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hawk tools is running");
});

app.listen(port, () => {
  console.log("Listening to port ", port);
});
