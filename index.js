const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middle ware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("doctors portal running the server");
});

app.listen(port, () => {
  console.log(`Doctors portal app listening on port ${port}`);
});
// doctor-portal IZ9Ct9zCgCnpK5Er

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri =
  "mongodb+srv://doctor-portal:IZ9Ct9zCgCnpK5Er@cluster0.dt6dv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();

    const servicesCollection = client
      .db("doctor_portal")
      .collection("services");

    app.get("/services", async (req, res) => {
      const query = {};
      const cursor = servicesCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
  } catch (err) {
    console.log(err);
  }
}
run().catch(console.dir);
