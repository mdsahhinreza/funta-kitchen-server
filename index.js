const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// MongoDB Connection and API's Here

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.epiqiul.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const serviceCollection = client.db("funtaKitchen").collection("services");
    const reviewCollection = client.db("funtaKitchen").collection("reviews");

    app.post("/services", async (req, res) => {
      const service = req.body;

      const result = await serviceCollection.insertOne(service);
      res.send(result);
    });

    app.get("/services", async (req, res) => {
      let dataLimit = 9999;
      if (req.query.limit) {
        dataLimit = parseInt(req.query.limit);
      }
      const query = {};
      const cursor = serviceCollection.find(query).limit(dataLimit);
      const services = await cursor.toArray();
      res.send(services);
    });

    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await serviceCollection.findOne(query);
      res.send(service);
    });

    app.post("/addreview", async (req, res) => {
      const review = req.body;

      const result = await reviewCollection.insertOne(review);
      res.send(result);
    });

    app.get("/reviews", async (req, res) => {
      let query = {};
      if (req.query.email) {
        query = {
          customarEmail: req.query.email,
        };
      } else if (req.query.productId) {
        query = {
          productId: req.query.productId,
        };
      }

      const cursor = reviewCollection.find(query).sort({ reviewTime: -1 });
      const reviews = await cursor.toArray();
      res.send(reviews);
    });

    app.delete("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await reviewCollection.deleteOne(query);
      res.send(result);
    });
  } finally {
  }
}

run().catch((err) => console.error(err));

app.get("/", (req, res) => {
  res.send("Funta-Kitchen server is Running...");
});

app.listen(port, () => {
  console.log(`Funta-Kitchen server is Running on Port : ${port}`);
});
