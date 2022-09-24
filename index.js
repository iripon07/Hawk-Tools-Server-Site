const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");

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

    //GET ALL TOOLS
    app.get("/tools", async (req, res) => {
        const query = {};
        const cursor = toolsCollection.find(query);
        const tools = await cursor.toArray();
        res.send(tools);
      });
  } finally {
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello from Hawk Tools");
});

app.listen(port, () => {
  console.log(`Hawk Tools App listening on port ${port}`);
});
