import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import userRoutes from "./routes/users.js";
import tutorRoutes from "./routes/tutors.js";
import bookingRoutes from "./routes/bookings.js";
import reviewRoutes from "./routes/reviews.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.send("<h1>Welcome to my API! The server is running successfully.</h1>");
});
app.get("/debug/db", (req, res) => {
  res.json({
    dbName: mongoose.connection.name,
    host: mongoose.connection.host,
    readyState: mongoose.connection.readyState, // 1 means connected
  });
});


app.use("/tutors", tutorRoutes);
app.use("/users", userRoutes);
app.use("/bookings", bookingRoutes);
app.use("/reviews", reviewRoutes);

const PORT = process.env.PORT || 5050;

async function start() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in .env");
    }

    // ✅ Force DB name so you don't accidentally write to "test"
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.MONGO_DB_NAME || "tuition_backend",
    });

    console.log("MongoDB Connected");
    console.log("Mongo DB Name:", mongoose.connection.name);
    

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();
