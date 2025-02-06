//AdminDashboard

import { connect } from "mongoose";
import cors from "cors";
import Admin from "./models/Admin.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import session from "express-session";
import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import dotenv from "dotenv"; // Import dotenv
import Item from "./models/Item.js";
import multer from "multer";
import User from "./models/User.js";
import mongoose from "mongoose";
import axios from "axios";
import Order from "./models/Orders.js";
import Transaction from "./models/Transaction.js";
import nodemailer from "nodemailer";
import Loyalty from "./models/Loyalty.js";
import path from "path";
import express, { Express } from "express";
import { fileURLToPath } from "url";
const express = require("express");
const { json } = express;
// Load environment variables from .env file
dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

app.use(
  cors({
    origin: "https://adminbakeryeasy.onrender.com", // Adjust as needed
    credentials: true, // Allow credentials if needed
  })
);
app.use(json());
app.use(
  session({
    secret: "sdssf",
    resave: false,
    saveUninitialized: true,
  })
);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const buildPath = path.join(__dirname, "..", "dist");

app.use(express.static(buildPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(buildPath, "index.html"));
});

const conectbco = process.env.MONGO_URI;
const jwt_secret = process.env.JWT_SECRET;

connect(conectbco)
  .then((res) => console.log(`Connection Success in DB Cloud ${res}`))
  .catch((err) =>
    console.log(`Error in connection with DataBase MongoDB ${err}`)
  );

// Change this to a strong secret and keep it safe

// Register route (hashed password)
app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await Admin.create({ ...req.body, password: hashedPassword });
    res.status(201).json(user);
  } catch (err) {
    console.log("Error:", err);
    res.status(500).json(err);
  }
});

app.post("/login", async (req, res) => {
  const { name, password, captchaToken } = req.body;

  // Verify reCAPTCHA token
  try {
    const secretKey = process.env.RECAPTCHA_NEW_SECRET_KEY;
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`,
      null,
      {
        params: {
          secret: secretKey,
          response: captchaToken,
        },
      }
    );

    console.log("reCAPTCHA verification:", response.data);
    if (!response.data.success) {
      return res.status(400).json({ error: "CAPTCHA verification failed" });
    }
  } catch (captchaError) {
    console.error("CAPTCHA verification error:", captchaError);
    return res.status(500).json({ error: "CAPTCHA verification error" });
  }

  // Authenticate user
  try {
    const user = await Admin.findOne({ name: name });
    console.log("Fetched user:", user);

    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      console.log("Password match result:", isMatch);

      if (isMatch) {
        const token = jwt.sign({ id: user._id }, jwt_secret, {
          expiresIn: "1h",
        });
        console.log("Generated JWT:", token);

        return res.json({
          token,
          user: { name: user.name, email: user.email, _id: user._id },
        });
      } else {
        return res.status(400).json("Password incorrect");
      }
    } else {
      return res.status(400).json("Unregistered user");
    }
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json(err);
  }
});

// Logout Route
app.post("/logout", (req, res) => {
  // If you're using sessions, destroy the session
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
      return res.status(500).json({ message: "Logout failed" });
    }
    // Clear any cookies if necessary
    res.clearCookie("connect.sid"); // Assuming "connect.sid" is the session cookie name
    res.status(200).json({ message: "Successfully logged out" });
  });
});

// Protected Route Example
// Protected Route Example
app.get("/protected", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract the token
  if (!token) return res.status(401).send("Unauthorized: No token provided");

  try {
    const decoded = jwt.verify(token, jwt_secret); // Verify token using your secret
    const user = await Admin.findById(decoded.id); // Find user by decoded token ID
    if (!user) return res.status(404).send("Admin not found");

    res.status(200).json({ user }); // Return user data if valid token
  } catch (error) {
    console.error("Invalid token", error);
    res.status(401).send("Invalid token");
  }
});

// Optional: Token verification route (for testing JWT)
app.post("/verifyToken", (req, res) => {
  const token = req.body.token; // Assume the token is sent in the request body for testing

  if (!token) return res.status(400).json({ message: "Token is required" });

  try {
    const decoded = jwt.verify(token, jwt_secret); // Verify token
    res.status(200).json({ valid: true, decoded }); // If valid, return decoded payload
  } catch (error) {
    console.error("JWT verification error", error);
    res.status(401).json({ valid: false, message: "Invalid or expired token" });
  }
});

// Adjust the path as necessary
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "../../cake-ordering-app/public/uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

// Create a new item with an image
app.post("/items", upload.single("image"), async (req, res) => {
  try {
    const { name, description, price, category, quantity } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const newItem = new Item({
      name,
      description,
      price,
      category,
      quantity,
      image: imageUrl,
    });
    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    console.error("Error creating item:", err);
    res.status(500).json({ message: "Error creating item" });
  }
});

// Serve static files from the 'uploads' folder
app.use("public/uploads/", express.static("uploads"));

// Get all items
app.get("/items/", async (req, res) => {
  try {
    const items = await Item.find(); // Fetch all items from MongoDB
    res.json({ message: "Success", data: items }); // Send items back as JSON
  } catch (err) {
    res.status(500).json({ message: "Error fetching items" });
  }
});

// Get a single item by ID
app.get("/items/:id", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.status(200).json(item);
  } catch (err) {
    console.error("Error fetching item:", err);
    res.status(500).json({ message: "Error fetching item" });
  }
});

// Update an item by ID
app.put("/items/:id", upload.single("image"), async (req, res) => {
  console.log("Update request received:", req.body, req.file); // Log incoming data
  try {
    const updateData = {
      name: req.body.name, // Ensure you match the field names correctly
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      quantity: req.body.quantity,
      ...(req.file && { image: `/uploads/${req.file.filename}` }), // Save the image path correctly
    };

    const item = await Item.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    if (!item) return res.status(404).json({ message: "Item not found" });

    res.status(200).json(item);
  } catch (err) {
    console.error("Error updating item:", err);
    res.status(500).json({ message: "Error updating item" });
  }
});

// Delete an item by ID
app.delete("/items/:id", async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.status(204).send(); // No content response
  } catch (err) {
    console.error("Error deleting item:", err);
    res.status(500).json({ message: "Error deleting item" });
  }
});

// Serve the uploaded images
app.use("/uploads", express.static("uploads"));

// Get all users
app.get("/users", async (req, res) => {
  try {
    const users = await User.find(); // Fetch all users from MongoDB
    res.json({ message: "Success", data: users }); // Send users back as JSON
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

// Get a single user by ID
app.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ message: "Error fetching user" });
  }
});

// Create a new user
app.post("/users", upload.single("image"), async (req, res) => {
  try {
    const { name, email, password, authType } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    // Create a new user
    const newUser = new User({
      name,
      email,
      password,
      authType,
      image,
    });

    await newUser.save();
    res.status(201).json({ message: "User created", user: newUser });
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ message: "Error creating user" });
  }
});

// Update a user by ID
app.put("/users/:id", upload.single("image"), async (req, res) => {
  console.log("Update request received:", req.body, req.file); // Log incoming data
  try {
    const updateData = {
      name: req.body.name, // Ensure you match the field names correctly
      email: req.body.email,
      password: req.body.password,
      authType: req.body.authType,
      ...(req.file && { image: `/uploads/${req.file.filename}` }), // Save the image path correctly
    };

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ message: "Error updating user" });
  }
});

// Delete a user by ID
app.delete("/users/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(204).send(); // No content response
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ message: "Error deleting user" });
  }
});

// Get all orders
app.get("/products", async (req, res) => {
  try {
    const item = await Item.find(); // Assuming `Item` is your products collection model
    res.json({ message: "Success", data: products });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching products", error: err.message });
  }
});
app.get("/items-by-category", async (req, res) => {
  try {
    const itemsByCategory = await Item.aggregate([
      {
        $group: {
          _id: "$category",
          totalQuantity: { $sum: "$quantity" }, // Sum the quantities of items
        },
      },
      {
        $project: {
          category: "$_id",
          totalQuantity: 1,
          _id: 0,
        },
      },
    ]);

    res.json(itemsByCategory);
  } catch (error) {
    console.error("Error fetching items by category:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get all orders
app.get("/orders/", async (req, res) => {
  try {
    const orders = await Order.find(); // Fetch all items from MongoDB
    res.json({ message: "Success", data: orders }); // Send items back as JSON
  } catch (err) {
    res.status(500).json({ message: "Error fetching items" });
  }
});

app.post("/send-email", async (req, res) => {
  const { email, subject, body } = req.body;
  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "bakeryeasy5@gmail.com",
        pass: "ulnn lgtx ezkk pqbg",
      },
    });
    await transporter.sendMail({
      from: "bakeryeasy5@gmail.com",
      to: email,
      subject,
      text: body,
    });
    res.json({ message: "Email sent successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error sending email" });
  }
});

app.post("/orders/confirm/:id", async (req, res) => {
  const orderId = req.params.id;
  const { status } = req.body;

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    await order.save();

    // Only create a transaction when status is "Picked Up"
    if (status === "Picked Up") {
      const transaction = new Transaction({
        orderId: order._id,
        userName: order.userName,
        userEmail: order.userEmail,
        totalAmount: order.totalAmount,
        status: "Completed", // Ensure the status matches the schema
      });
      await transaction.save();
      console.log("Transaction saved for picked-up order:", transaction);
    }

    // Sending emails based on status
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "bakeryeasy5@gmail.com",
        pass: "ulnnlgtxezkkpqbg", // Ensure this is stored securely in environment variables
      },
    });

    // Shorten the order ID to the last 4 characters
    const shortId = order._id.toString().slice(-4);

    const subject =
      status === "Picked Up"
        ? "Order Completed"
        : status === "Baking"
        ? "Order Baking In Progress"
        : status === "Ready for Pickup"
        ? "Order Ready for Pickup"
        : "Order Update";

    const html = `
      <div style="font-family: Arial, sans-serif; text-align: center; color: #333;">
        <h1 style="color: #f39c12;">Bakery Easy</h1>
     

        <p style="font-size: 16px;">
          ${
            status === "Picked Up"
              ? `Dear ${order.userName}, Your order #${shortId} has been picked up. </n>We hope you have a sweet celebration! We're already excited for your next order.`
              : status === "Baking"
              ? `Dear ${order.userName}, Our ovens are working their magic on your order #${shortId}! Your cake will be ready soon.`
              : status === "Ready for Pickup"
              ? `Dear ${order.userName}, Time for cake! Your order #${shortId} is ready for pickup. We can't wait for you to see it!`
              : `Dear ${order.userName}, your order with ID ${shortId} has been updated.`
          }
        </p>
        <p style="font-size: 14px; color: #555;">Thank you for choosing Bakery Easy!</p>
      </div>
    `;

    // Serve the uploaded images
    app.use("/uploads", express.static("uploads"));

    await transporter.sendMail({
      from: "bakeryeasy5@gmail.com",
      to: order.userEmail,
      subject,
      html,
    });

    return res.json({
      message: `Order status updated to ${status}`,
      order,
    });
  } catch (error) {
    console.error("Error updating order status or sending email:", error);
    res.status(500).json({
      message: "Error updating order status or sending email",
    });
  }
});

//Reports

// Fetch all transactions
app.get("/transactions", async (req, res) => {
  try {
    const transactions = await Transaction.find(); // Fetch all transactions
    res.json({
      message: "Transactions fetched successfully",
      data: transactions,
    });
  } catch (err) {
    console.error("Error fetching transactions:", err);
    res.status(500).json({ message: "Error fetching transactions" });
  }
});

app.get("/reports/accepted-orders", async (req, res) => {
  try {
    const { period } = req.query;

    // Validate the period
    if (!["day", "week", "month"].includes(period)) {
      return res.status(400).send("Invalid period");
    }

    const now = new Date();
    const startOfDec2024 = new Date(2024, 11, 1); // Example date: December 1, 2024

    // Set match conditions
    let matchCondition = {
      createdAt: { $gte: startOfDec2024, $lt: now },
      status: "Completed",
    };

    // Grouping logic based on period
    let groupFormat;
    switch (period) {
      case "day":
        groupFormat = "%Y-%m-%d"; // Group by day
        break;
      case "week":
        groupFormat = "%Y-%U"; // Group by year and week
        break;
      case "month":
        groupFormat = "%Y-%m"; // Group by year and month
        break;
    }

    // Aggregate query
    const acceptedOrders = await Transaction.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: { $dateToString: { format: groupFormat, date: "$createdAt" } },
          totalAmount: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 }, // Count number of orders
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(acceptedOrders);
  } catch (error) {
    console.error("Error fetching accepted orders:", error.message);
    res.status(500).json({ error: error.message });
  }
});
//total collectionm
app.get("/reports/total-collection", async (req, res) => {
  try {
    const { period } = req.query;

    if (!["day", "week", "month"].includes(period)) {
      return res.status(400).send("Invalid period");
    }

    const now = new Date();
    const startOfDec2024 = new Date(2024, 11, 1); // December 1, 2024
    let matchCondition = { createdAt: { $gte: startOfDec2024, $lt: now } };

    // Aggregate total collection
    const totalCollection = await Transaction.aggregate([
      { $match: { ...matchCondition, status: "Completed" } },
      {
        $group: {
          _id: null, // No grouping, sum all
          totalAmount: { $sum: "$totalAmount" },
        },
      },
    ]);

    res.json(
      totalCollection.length > 0 ? totalCollection[0] : { totalAmount: 0 }
    );
  } catch (error) {
    console.error("Error fetching total collection:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Function to update loyalty when an order is picked up (consolidated version)
const updateLoyalty = async (userId, userName) => {
  try {
    const loyaltyRecord = await Loyalty.findOneAndUpdate(
      { userId },
      { $inc: { orderCount: 1 }, userName },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    if (typeof loyaltyRecord.specialOfferEligible === "undefined") {
      loyaltyRecord.specialOfferEligible = false;
      await loyaltyRecord.save();
    }

    if (loyaltyRecord.orderCount >= 10 && !loyaltyRecord.specialOfferEligible) {
      loyaltyRecord.specialOfferEligible = true;
      await loyaltyRecord.save();
    }

    console.log("Loyalty updated:", loyaltyRecord);
    return loyaltyRecord;
  } catch (err) {
    console.error("Error updating loyalty:", err);
    throw err;
  }
};

app.post("/loyalty/update", async (req, res) => {
  const { userId, userName } = req.body;

  try {
    const updatedLoyalty = await updateLoyalty(userId, userName); // Call the consolidated function

    res.status(200).json({
      message: "Loyalty updated successfully",
      loyalty: updatedLoyalty,
    });
  } catch (err) {
    console.error("Error updating loyalty:", err);
    res.status(500).json({ message: "Failed to update loyalty" });
  }
});

app.get("/rewards", async (req, res) => {
  try {
    const rewards = await Loyalty.find({});
    res.json({ message: "Success", data: rewards });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch rewards", error: err.message });
  }
});

app.post("/loyalty/activate/:id", async (req, res) => {
  try {
    const loyalty = await Loyalty.findById(req.params.id);
    if (!loyalty) return res.status(404).json({ message: "Loyalty not found" });

    // Toggle status
    loyalty.status = loyalty.status === "active" ? "not active" : "active";
    await loyalty.save();

    res.json({
      message: `Loyalty ${
        loyalty.status === "active" ? "activated" : "deactivated"
      } successfully`,
      loyalty,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error activating/deactivating loyalty", error });
  }
});

app.post("/loyalty/resetcount/:id", async (req, res) => {
  try {
    const loyalty = await Loyalty.findById(req.params.id);
    if (!loyalty) return res.status(404).json({ message: "Loyalty not found" });

    loyalty.orderCount = 0;
    await loyalty.save();

    res.json({ message: "Order count reset successfully", loyalty });
  } catch (error) {
    res.status(500).json({ message: "Error resetting order count", error });
  }
});

// Example endpoint to handle order status updates
app.put("/orders/status/:orderId", async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  try {
    // Update the order status
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // If status is "picked up," update the loyalty record
    if (status === "picked up") {
      await updateLoyalty(order.userId, order.userName);
    }

    res.json({
      message: "Order status updated successfully",
      order,
    });
  } catch (err) {
    console.error("Error updating order status:", err);
    res
      .status(500)
      .json({ message: "Error updating order status", error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server app is listening at ${port}`);
});
