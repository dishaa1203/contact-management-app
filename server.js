// Load environment variables first
require("dotenv").config();


const express = require("express");
const connectDb = require("./dbConnection");
const cors = require("cors");
const errorHandler = require("./middleware/errorHandler");

// Routes
const contactRoutes = require("./routes/contactRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();
const port = process.env.PORT || 5001;

app.use(cors()); // allow all origins
// Connect to MongoDB
connectDb();

// Middleware to parse JSON bodies
app.use(express.json());
const userRoutes = require("./routes/userRoutes");
// Routes
app.use("/api/contacts", contactRoutes);
app.use("/api/users", userRoutes);

// Catch-all 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
