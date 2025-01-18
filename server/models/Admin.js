import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  googleId: { type: String },
  authType: { type: String, enum: ["google", "local"], default: "local" },
});

// Hash the password before saving

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
