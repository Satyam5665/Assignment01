const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const { decode } = require("punycode");
const app = express();
require("dotenv").config();
const SECRET_KEY = process.env.SECRET_KEY;

app.use(bodyParser.json());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;

// User and Admin models
const userSchema = new mongoose.Schema({
  email: String,
  phone: String,
  name: String,
  profileImage: String,
  password: String,
});

const adminSchema = new mongoose.Schema({
  email: String,
  phone: String,
  name: String,
  profileImage: String,
  password: String,
});

const User = mongoose.model("User", userSchema);
const Admin = mongoose.model("Admin", adminSchema);

// Middleware to verify JWT
function verifyToken(req, res, next) {
  const token = req.headers["authorization"];
  if (!token)
    return res.status(403).send({ auth: false, message: "No token provided." });
  jwt.verify(token, SECRET_KEY, function (err, decoded) {
    if (err)
      return res
        .status(500)
        .send({ auth: false, message: "Failed to authenticate token." });
    req.userId = decoded.email;
    console.log(decoded);
    next();
  });
}

// Multer storage configuration for handling file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Added Timestamp, to keep the Filename Unique
  },
});

const upload = multer({ storage });

// Signup with image upload
app.post("/signup", upload.single("profileImage"), async (req, res) => {
  const { email, phone, name, password, role } = req.body;
  const profileImage = req.file ? req.file.filename : "";

  if (!email && !phone) {
    return res
      .status(400)
      .send({ message: "Please provide at least one of email or phone." });
  }

  if (!email || !phone || !name || !password) {
    return res
      .status(400)
      .json({ error: "Please provide all the required fields" });
  }

  const hashedPassword = bcrypt.hashSync(password, 8);
  let token = "";
  try {
    if (role === "admin") {
      const existingUser = await Admin.findOne({ $or: [{ email }, { phone }] });
      if (existingUser) {
        return res.status(409).send({ message: "User already exists." });
      }
      const admin = new Admin({
        email,
        phone,
        name,
        profileImage,
        password: hashedPassword,
      });

      token = jwt.sign({ email, role }, SECRET_KEY);
      await admin.save();
    } else {
      const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
      if (existingUser) {
        return res.status(409).send({ message: "User already exists." });
      }
      const user = new User({
        email,
        phone,
        name,
        profileImage,
        password: hashedPassword,
      });
      token = jwt.sign({ email, role }, SECRET_KEY);
      await user.save();
    }
    res.status(200).send({ auth: true, token });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: error });
  }
});

//Login Functionality

app.post("/login", async (req, res) => {
  const { email, password, role } = req.body;

  try {
    let userModel, roleName;

    if (role === "user") {
      userModel = User;
      roleName = "user";
    } else if (role === "admin") {
      userModel = Admin;
      roleName = "admin";
    } else {
      return res.status(400).send({ message: "Invalid role specified." });
    }

    const userOrAdmin = await userModel.findOne({ email });

    if (!userOrAdmin) {
      return res.status(404).send({ message: `${roleName} not found.` });
    }

    const isPasswordValid = bcrypt.compareSync(password, userOrAdmin.password);

    if (!isPasswordValid) {
      return res
        .status(401)
        .send({ auth: false, token: null, message: "Invalid password." });
    }

    const token = jwt.sign(
      { id: userOrAdmin.email, role: roleName },
      SECRET_KEY
    );

    res.status(200).send({ auth: true, token });
  } catch (error) {
    res.status(500).send({ message: `Error during ${role} login.` });
  }
});

//Profile Update
app.put(
  "/profile",
  verifyToken,
  upload.single("profileImage"),
  async (req, res) => {
    const { name } = req.body;
    const profileImage = req.file ? req.file.filename : "";

    try {
      const user = await User.findOne({ email: req.userId });
      if (!user) {
        return res.status(404).send({ message: "User not found." });
      }

      user.name = name || user.name;
      user.profileImage = profileImage || user.profileImage;
      await user.save();
      res.status(200).send({ message: "Profile updated successfully." });
    } catch (error) {
      res.status(500).send({ message: "Error updating profile." });
    }
  }
);

//Delete the User from the db
app.delete("/profile", verifyToken, async (req, res) => {
  try {
    //console.log(req.userId);
    const user = await User.findOne({ email: req.userId });

    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }

    await User.deleteOne({ email: req.userId });

    res.status(200).send({ message: "Account deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error deleting account." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
