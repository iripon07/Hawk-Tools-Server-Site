const express = require("express");
const cors = require("cors");
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

async function run() {
  try {
    await client.connect();
    const toolsCollection = client.db("hawktools").collection("tools");
    const reviewsCollection = client.db("hawktools").collection("reviews");

    //GET ALL TOOLS
    app.get("/tools", async (req, res) => {
      const query = {};
      const cursor = toolsCollection.find(query);
      const tools = await cursor.toArray();
      res.send(tools);
    });


    app.get("/tools/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await toolsCollection.findOne(query);
      res.send(result);
    });


    //Reviews 
    //get all reviews
    app.get("/reviews", async(req, res) => {
      const query = {};
      const cursor = reviewsCollection.find(query);
      const reviews = await cursor.toArray();
      res.send(reviews);
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
