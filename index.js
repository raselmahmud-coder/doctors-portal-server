const express = require("express");
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");
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

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `${process.env.URI}`;
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
    const bookingCollection = client.db("doctor_portal").collection("booking");
    const userCollection = client.db("doctor_portal").collection("user");

    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      console.log(email);
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      const token = jwt.sign(
        { email: email },
        process.env.ACCESS_TOKEN_SECRET,
        {
          expiresIn: "1h",
        }
      );
      res.send({result, token});
    });
    app.get("/available", async (req, res) => {
      const date = req.query.date;
      // step 1: to get all services
      const services = await servicesCollection.find().toArray();
      //step 2: get the booking of that day
      const query = { date: date };
      const bookings = await bookingCollection.find(query).toArray();
      // step 3 for each service, find booking for that service
      services.forEach((service) => {
        const serviceBookings = bookings.filter(
          (book) => book.treatment === service.name
        );
        const bookedSlots = serviceBookings.map((book) => book.slot);
        const available = service.slots.filter(
          (slot) => !bookedSlots.includes(slot)
        );
        service.slots = available;
      });
      res.send(services);
    });
    app.get("/booking", async (req, res) => {
      const patient = req.query.patient;
      const header = req.headers.authorization;
      console.log(typeof header);
      const query = { patient: patient };
      const booking = await bookingCollection.find(query).toArray();
      res.send(booking);
    });
    app.post("/booking", async (req, res) => {
      const booking = req.body;
      const query = {
        treatment: booking,
        date: booking.date,
        patient: booking.patient,
      };
      const exists = await bookingCollection.findOne(query);
      if (exists) {
        // console.log(exists);
        return res.send({ success: false, booking: exists });
      } else {
        const result = await bookingCollection.insertOne(booking);
        res.send({ success: true, result });
      }
    });

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
