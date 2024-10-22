const express = require("express");
const { MongoClient } = require("mongodb");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
const client = new MongoClient(process.env.MONGODB_URI);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
  }
}

const db = client.db("sample_airbnb");
const listingsCollection = db.collection("listingsAndReviews");
const clientsCollection = db.collection("clients");
const bookingsCollection = db.collection("bookings");

connectToDatabase();

app.get("/listings", async (req, res) => {
  const page = parseInt(req.query.page) || 1; // Default to page 1
  const limit = 12; // Number of listings per page
  const skip = (page - 1) * limit;

  // Prepare filters based on query parameters
  const query = {};

  // Filter by location (case insensitive)
  if (req.query.location) {
    query["address.market"] = { $regex: new RegExp(req.query.location, "i") }; // Regex for case insensitive
  }

  // Filter by property type
  if (req.query.propertyType) {
    query["property_type"] = req.query.propertyType;
  }

  // Filter by number of bedrooms
  if (req.query.bedrooms) {
    query["bedrooms"] = { $gte: parseInt(req.query.bedrooms) }; // At least the specified number of bedrooms
  }

  try {
    // Count total documents for pagination
    const totalDocuments = await listingsCollection.countDocuments(query);

    // Calculate total pages
    const totalPages = Math.ceil(totalDocuments / limit);

    // Fetch property names without duplicates
    const listings = await listingsCollection
      .find(query)
      .skip(skip) // Skip the documents for previous pages
      .limit(limit) // Limit to the number of documents for the current page
      .project({
        name: 1,
        summary: 1,
        price: 1,
        review_scores: 1,
        _id: 1,
      })
      .toArray();

    // console.log(`Fetched Listings: ${JSON.stringify(listings)}`);

    res.json({ listings, totalPages, currentPage: page, totalDocuments });
  } catch (error) {
    console.error("Error fetching listings:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get distinct property types
app.get("/property-types", async (req, res) => {
  try {
    const propertyTypes = await listingsCollection.distinct("property_type");
    const options = propertyTypes.map((type) => ({ value: type, label: type }));
    res.json(options);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

// Get distinct number of bedrooms
app.get("/bedrooms", async (req, res) => {
  try {
    const bedrooms = await listingsCollection.distinct("bedrooms");
    const options = bedrooms.map((b) => ({ value: b, label: b.toString() })); // Convert to string for dropdown
    res.json(options);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/listing/:id", async (req, res) => {
  const listingId = req.params.id; // Parse the ID as an integer

  try {
    const listing = await listingsCollection.findOne(
      { _id: listingId },
      {
        projection: {
          name: 1,
          "address.market": 1,
          property_type: 1,
          bedrooms: 1,
        },
      } // Only return the name field
    );

    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    res.json({ name: listing.name }); // Return the name in an object
  } catch (error) {
    console.error("Error fetching listing:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/bookings", async (req, res) => {
  const {
    arrival_date,
    departure_date,
    name,
    email,
    mobile_number,
    postal_address,
    home_address,
  } = req.body;

  // Create a client object
  const clientData = {
    name,
    email,
    mobile_number,
    postal_address,
    home_address,
  };

  // Create a booking object
  const bookingData = {
    arrival_date,
    departure_date,
    client: clientData,
    listingId: req.body.listingId, // Make sure you include the listingId if necessary
  };

  try {
    // Insert client into the clients collection
    const clientResult = await clientsCollection.insertOne(clientData);
    bookingData.clientId = clientResult.insertedId; // Link booking to client

    // Insert booking into the bookings collection
    await bookingsCollection.insertOne(bookingData);

    // Respond with success
    res.status(201).send("Booking created successfully!");
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).send("Internal Server Error");
  }
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
