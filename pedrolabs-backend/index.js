const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");

const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads")); //upload folder dbil create akum  image store chaiyan

app.use(
  cors({
    // Allow requests from the frontend
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Create MySQL connection pool
const pool = mysql.createPool({
  connectionLimit: 10,
  user: "root",
  host: "localhost",
  password: "Admin123", // Replace with your MySQL password
  database: "pedrolabsdb", // Replace with your database name
});

// Registration route
app.post("/register", (req, res) => {
  const { fname, lname, email, password } = req.body;
  console.log(req.body);

  if (!fname || !lname || !email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required." });
  }

  const sql = `INSERT INTO register (fname, lname, email, password) VALUES (?, ?, ?, ?)`;

  pool.query(sql, [fname, lname, email, password], (err, result) => {
    if (err) {
      console.error("Error inserting into database:", err);
      return res
        .status(500)
        .json({ success: false, message: "Database error." });
    } else
      res
        .status(200)
        .json({ success: true, message: "User registered successfully." });
  });
});

// Login route
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required." });
  }

  const sql = `SELECT * FROM register WHERE email = ? AND password = ?`;
  pool.query(sql, [email, password], (err, results) => {
    if (err) {
      console.error("Error querying database:", err);
      return res
        .status(500)
        .json({ success: false, message: "Database error." });
    }

    if (results.length > 0) {
      const user = results[0]; // Get user data
      res.status(200).json({
        success: true,
        message: "Login successful.",
        fname: user.fname,
        lname: user.lname,
        email: user.email,
        userId: user.id,
      });
    } else {
      res
        .status(401)
        .json({ success: false, message: "Invalid email or password." });
    }
  });
});

// get register data

app.get("/getusers", (req, res) => {
  const sql = `SELECT * FROM register`;
  pool.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching data from database:", err);
      return res
        .status(500)
        .json({ success: false, message: "Database error" });
    }
    res.status(200).json({ success: true, data: results });
  });
});

// delete register data

app.delete("/delete/:id", (req, res) => {
  console.log("deleted the id sucessfully", req.body);
  const id = req.params.id;
  pool.query("DELETE FROM register WHERE id = ?", id, (err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.send(result);
    }
  });
});

// Update register data
app.put("/update/:id", (req, res) => {
  const id = req.params.id;
  const { fname, lname, email } = req.body;

  if (!fname || !lname || !email) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required." });
  }

  const sql = `UPDATE register SET fname = ?, lname = ?, email = ? WHERE id = ?`;
  pool.query(sql, [fname, lname, email, id], (err, result) => {
    if (err) {
      console.error("Error updating database:", err);
      return res
        .status(500)
        .json({ success: false, message: "Database error." });
    }

    if (result.affectedRows > 0) {
      res
        .status(200)
        .json({ success: true, message: "User updated successfully." });
    } else {
      res.status(404).json({ success: false, message: "User not found." });
    }
  });
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + extension);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith("image/") &&
    /\.(jpg|jpeg|png|gif)$/i.test(file.originalname)
  ) {
    cb(null, true);
  } else {
    cb(
      new Error("Only JPG, JPEG, PNG, and GIF image files are allowed."),
      false
    );
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

// Serve static files from the uploads folder
app.use("/uploads", express.static("uploads"));

app.post("/product", upload.single("image"), (req, res) => {
  console.log("Image upload successful");

  const { name, details, originalprice, offerprice } = req.body; // Adjusted fields to match your table structure
  const image = req.file ? req.file.filename : null;

  if (!name || !details || !originalprice || !offerprice || !image) {
    res
      .status(400)
      .json({ error: "All fields are required, including an image." });
    return;
  }

  const sql = `
    INSERT INTO products (name, details, originalprice, offerprice, image)
    VALUES (?, ?, ?, ?, ?)
  `;

  pool.query(
    sql,
    [name, details, originalprice, offerprice, image],
    (err, result) => {
      if (err) {
        console.error("Error adding product: ", err);
        res.status(500).json({ error: "Failed to add product" });
        return;
      }

      res.json({
        message: "Product added successfully",
        productId: result.insertId,
      });
    }
  );
});

// get product details

app.get("/getproducts", (req, res) => {
  const sql = `SELECT * FROM products`;
  pool.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching data from database:", err);
      return res
        .status(500)
        .json({ success: false, message: "Database error" });
    }
    res.status(200).json({ success: true, data: results });
  });
});

// Start the server
app.listen(3001, () => {
  console.log("Running backend server on port 3001");
});
