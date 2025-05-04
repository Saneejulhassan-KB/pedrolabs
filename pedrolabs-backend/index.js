const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcryptjs"); // Correct bcrypt module
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

app.use(bodyParser.json());


app.use(
  cors({
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// MySQL Connection Pool
const pool = mysql.createPool({
  connectionLimit: 10,
  user: "admin",
  host: "mydb.cb0qmoqugx66.ap-south-1.rds.amazonaws.com",
  password: "Admin123", // Update with your credentials
  database: "pedrolabsdb",
});


const util = require('util')
pool.query = util.promisify(pool.query)

// ********** User Registration **********
app.post("/register", async (req, res) => {
  const { fname, lname, email, password } = req.body;

  if (!fname || !lname || !email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required." });
  }

  const checkEmailQuery = `SELECT * FROM register WHERE email = ?`;
  pool.query(checkEmailQuery, [email], async (err, results) => {
    if (err) {
      console.error("Error querying database:", err);
      return res
        .status(500)
        .json({ success: false, message: "Database error." });
    }

    if (results.length > 0) {
      return res
        .status(400)
        .json({ success: false, message: "Email already exists." });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      // Automatically assign role based on email
      const role = email === "admin@gmail.com" ? "admin" : "user";

      const sql = `INSERT INTO register (fname, lname, email, password, role) VALUES (?, ?, ?, ?, ?)`;
      pool.query(
        sql,
        [fname, lname, email, hashedPassword, role],
        (err, result) => {
          if (err) {
            console.error("Error inserting into database:", err);
            return res
              .status(500)
              .json({ success: false, message: "Database error." });
          }
          res.status(200).json({
            success: true,
            message: "User registered successfully.",
            role: role,
          });
        }
      );
    } catch (error) {
      console.error("Error hashing password:", error);
      res.status(500).json({ success: false, message: "Server error." });
    }
  });
});

// ********** User Login **********
const jwt = require("jsonwebtoken");

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res
      .status(400)
      .json({ success: false, message: "All fields are required." });

  pool.query(
    "SELECT * FROM register WHERE email = ?",
    [email],
    async (err, results) => {
      if (err)
        return res
          .status(500)
          .json({ success: false, message: "Database error." });

      if (results.length === 0)
        return res
          .status(401)
          .json({ success: false, message: "Invalid email or password." });

      const user = results[0];
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch)
        return res
          .status(401)
          .json({ success: false, message: "Invalid email or password." });

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      res.status(200).json({
        success: true,
        message: "Login successful.",
        token,
        user: {
          id: user.id,
          fname: user.fname,
          lname: user.lname,
          email: user.email,
          role: user.role,
        },
      });
    }
  );
});

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token)
    return res.status(403).json({ success: false, message: "Access denied." });

  jwt.verify(token.split(" ")[1], process.env.JWT_SECRET, (err, decoded) => {
    if (err)
      return res
        .status(401)
        .json({ success: false, message: "Invalid token." });

    req.user = decoded; // Attach user data to request object
    next();
  });
};


// const verifyToken = (req, res, next) => {
//   const authHeader = req.headers.authorization;
//   if (!authHeader)
//     return res.status(403).json({ success: false, message: "Access denied." });

//   const tokenParts = authHeader.split(" ");
//   if (tokenParts.length !== 2 || tokenParts[0] !== "Bearer")
//     return res.status(401).json({ success: false, message: "Invalid token format." });

//   const token = tokenParts[1];

//   jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
//     if (err)
//       return res.status(401).json({ success: false, message: "Invalid token." });

//     req.user = decoded; // Attach user data to request object
//     next();
//   });
// };


module.exports = verifyToken;


const verifyAdmin = (req, res, next) => {
  if (req.user.role !== "admin")
    return res
      .status(403)
      .json({ success: false, message: "Admin access required." });

  next();
};

// app.delete("/delete/:id", verifyToken, verifyAdmin, (req, res) => {
//   pool.query(
//     "DELETE FROM register WHERE id = ?",
//     [req.params.id],
//     (err, result) => {
//       if (err)
//         return res
//           .status(500)
//           .json({ success: false, message: "Database error" });
//       res.json({ success: true, message: "User deleted successfully." });
//     }
//   );
// });

// ********** CRUD Operations for Users **********
app.get("/getusers", verifyToken, verifyAdmin, (req, res) => {
  pool.query("SELECT * FROM register", (err, results) => {
    if (err)
      return res
        .status(500)
        .json({ success: false, message: "Database error" });
    res.status(200).json({ success: true, data: results });
  });
});

app.delete("/delete/:id", verifyToken, verifyAdmin, (req, res) => {
  pool.query(
    "DELETE FROM register WHERE id = ?",
    [req.params.id],
    (err, result) => {
      if (err)
        return res
          .status(500)
          .json({ success: false, message: "Database error" });
      res.json({ success: true, message: "User deleted successfully." });
    }
  );
});

app.put("/update/:id", verifyToken, (req, res) => {
  const { fname, lname, email } = req.body;
  if (!fname || !lname || !email)
    return res
      .status(400)
      .json({ success: false, message: "All fields are required." });

  pool.query(
    "UPDATE register SET fname = ?, lname = ?, email = ? WHERE id = ?",
    [fname, lname, email, req.params.id],
    (err, result) => {
      if (err)
        return res
          .status(500)
          .json({ success: false, message: "Database error." });
      if (result.affectedRows === 0)
        return res
          .status(404)
          .json({ success: false, message: "User not found." });
      res
        .status(200)
        .json({ success: true, message: "User updated successfully." });
    }
  );
});

// ********** Image Upload Configuration **********
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueSuffix =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only image files are allowed."), false);
};

const upload = multer({ storage, fileFilter });

// ********** Product Management **********
app.post("/product", upload.single("image"), verifyToken, (req, res) => {
  const { name, details, originalprice, offerprice } = req.body;
  const image = req.file ? req.file.filename : null;

  if (!name || !details || !originalprice || !offerprice || !image) {
    return res.status(400).json({ error: "All fields are required." });
  }

  pool.query(
    "INSERT INTO products (name, details, originalprice, offerprice, image) VALUES (?, ?, ?, ?, ?)",
    [name, details, originalprice, offerprice, image],
    (err, result) => {
      if (err) {
        console.error("Database Insert Error:", err); // Log error
        return res
          .status(500)
          .json({ error: "Failed to add product", details: err.message });
      }
      res.json({
        message: "Product added successfully",
        productId: result.insertId,
      });
    }
  );
});

app.get("/getproducts", (req, res) => {
  pool.query("SELECT * FROM products", (err, results) => {
    if (err)
      return res
        .status(500)
        .json({ success: false, message: "Database error" });
    res.status(200).json({ success: true, data: results });
  });
});

app.delete("/deleteproduct/:id", verifyToken, verifyAdmin, (req, res) => {
  pool.query(
    "DELETE FROM products WHERE id = ?",
    [req.params.id],
    (err, result) => {
      if (err)
        return res
          .status(500)
          .json({ success: false, message: "Database error" });
      res.json({ success: true, message: "Product deleted successfully." });
    }
  );
});

app.put(
  "/updateproduct/:id",
  upload.single("image"),
  verifyToken,
  (req, res) => {
    const { name, details, originalprice, offerprice } = req.body;
    const image = req.file ? req.file.filename : null;

    if (!name || !details || !originalprice || !offerprice)
      return res
        .status(400)
        .json({
          success: false,
          message: "All fields except image are required.",
        });

    // First, get the current image filename from the database
    pool.query(
      "SELECT image FROM products WHERE id = ?",
      [req.params.id],
      (err, rows) => {
        if (err) {
          return res
            .status(500)
            .json({ success: false, message: "Database error." });
        }
        if (rows.length === 0) {
          return res
            .status(404)
            .json({ success: false, message: "Product not found." });
        }

        const oldImage = rows[0].image;
        const finalImage = image || oldImage; // Keep the old image if no new one is provided

        // Update the product details
        pool.query(
          "UPDATE products SET name = ?, details = ?, originalprice = ?, offerprice = ?, image = ? WHERE id = ?",
          [name, details, originalprice, offerprice, finalImage, req.params.id],
          (updateErr, result) => {
            if (updateErr) {
              return res
                .status(500)
                .json({ success: false, message: "Database error." });
            }
            if (result.affectedRows === 0) {
              return res
                .status(404)
                .json({ success: false, message: "Product not found." });
            }
            res
              .status(200)
              .json({
                success: true,
                message: "Product updated successfully.",
              });
          }
        );
      }
    );
  }
);

app.get("/getproduct/:id", (req, res) => {
  const productId = req.params.id;

  pool.query(
    "SELECT * FROM products WHERE id = ?",
    [productId],
    (err, results) => {
      if (err) {
        console.error("Database Error:", err);
        return res.status(500).json({ error: "Internal server error" });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "Product not found" });
      }

      res.json(results[0]); // Return the first (and only) product object
    }
  );
});

// ********** save the cart data **********
app.post("/addtocart", verifyToken, (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user?.userId; // Ensure userId is being received

  console.log("Received add to cart request:", { userId, productId, quantity });

  if (!productId || !quantity) {
    console.error("Missing productId or quantity");
    return res.status(400).json({ success: false, message: "Product and quantity are required." });
  }

  // Check if the product is already in the cart
  pool.query(
    "SELECT * FROM carts WHERE user_id = ? AND product_id = ?",
    [userId, productId],
    (err, results) => {
      if (err) {
        console.error("Database error in SELECT query:", err);
        return res.status(500).json({ success: false, message: "Database error." });
      }

      if (results.length > 0) {
        // If product exists, update quantity
        pool.query(
          "UPDATE carts SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?",
          [quantity, userId, productId],
          (updateErr) => {
            if (updateErr) {
              console.error("Failed to update cart:", updateErr);
              return res.status(500).json({ success: false, message: "Failed to update cart." });
            }
            console.log("Cart updated successfully");
            return res.status(200).json({ success: true, message: "Cart updated successfully." });
          }
        );
      } else {
        // Insert new entry
        pool.query(
          "INSERT INTO carts (user_id, product_id, quantity) VALUES (?, ?, ?)",
          [userId, productId, quantity],
          (insertErr) => {
            if (insertErr) {
              console.error("Failed to add product to cart:", insertErr);
              return res.status(500).json({ success: false, message: "Failed to add product to cart." });
            }
            console.log("Product added to cart successfully");
            return res.status(200).json({ success: true, message: "Product added to cart successfully." });
          }
        );
      }
    }
  );
});



// ********** Fetch cart details **********
app.get("/getcart", verifyToken, (req, res) => {
  const userId = req.user.userId; // Extract user ID from token

  console.log("Fetching cart for user:", userId);

  pool.query(
    "SELECT p.*, c.quantity FROM carts c JOIN products p ON c.product_id = p.id WHERE c.user_id = ?",
    [userId],
    (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ success: false, message: "Database error." });
      }

      console.log("Cart fetched successfully:", results);
      res.status(200).json({ success: true, cart: results });
    }
  );
});

// ********** update cart details **********
app.put("/updatecart", verifyToken, (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user.userId;

  console.log("Updating cart:", { userId, productId, quantity });

  pool.query(
    "UPDATE carts SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?",
    [quantity, userId, productId],
    (err, result) => {
      if (err) {
        console.error("Failed to update cart:", err);
        return res.status(500).json({ success: false, message: "Database error." });
      }
      res.status(200).json({ success: true, message: "Cart updated successfully." });
    }
  );
});


// ********** delete cart details **********
app.delete("/removecart/:productId", verifyToken, (req, res) => {
  const userId = req.user.userId;
  const productId = req.params.productId;

  console.log("Removing item from cart:", { userId, productId });

  pool.query(
    "DELETE FROM carts WHERE user_id = ? AND product_id = ?",
    [userId, productId],
    (err, result) => {
      if (err) {
        console.error("Failed to remove cart item:", err);
        return res.status(500).json({ success: false, message: "Database error." });
      }
      res.status(200).json({ success: true, message: "Product removed from cart." });
    }
  );
});


// order

app.post('/checkout', verifyToken, (req, res) => {
  const userId = req.user?.userId;
  const cartItems = req.body.cart;

  if (!userId || !Array.isArray(cartItems) || cartItems.length === 0) {
    return res.status(400).json({ success: false, message: "Invalid checkout data." });
  }

  // Step 1: Create the order with status 'pending'
  pool.query(
    "INSERT INTO orders (user_id, status) VALUES (?, ?)",
    [userId, 'pending'],
    (err, result) => {
      if (err) {
        console.error("Error creating order:", err);
        return res.status(500).json({ success: false, message: "Error creating order." });
      }

      const orderId = result.insertId;

      // Step 2: Insert order items
      const orderItems = cartItems.map(item => [orderId, item.id, item.quantity, item.offerprice]);

      pool.query(
        "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?",
        [orderItems],
        (itemErr) => {
          if (itemErr) {
            console.error("Error inserting order items:", itemErr);
            return res.status(500).json({ success: false, message: "Failed to store order items." });
          }

          // Step 3: Clear the user's cart (optional but recommended)
          pool.query(
            "DELETE FROM carts WHERE user_id = ?",
            [userId],
            (clearErr) => {
              if (clearErr) {
                console.warn("Order created but cart not cleared:", clearErr);
              }

              return res.status(200).json({ success: true, message: "Order placed successfully." });
            }
          );
        }
      );
    }
  );
});




app.get('/getorderlist', verifyToken, (req, res) => {
  const userId = req.user?.userId;

  const query = `
    SELECT 
      orders.id AS order_id,
      orders.created_at,
      orders.status,
      order_items.quantity,
      order_items.price,
      products.name AS product_name,
      products.image AS product_image
    FROM 
      orders
    JOIN 
      order_items ON orders.id = order_items.order_id
    JOIN 
      products ON order_items.product_id = products.id
    WHERE 
      orders.user_id = ?
    ORDER BY 
      orders.created_at DESC
  `;

  pool.query(query, [userId], (err, result) => {
    if (err) {
      console.error("Error fetching orders:", err);
      return res.status(500).json({ success: false, message: "Error fetching orders." });
    }

    res.status(200).json({ success: true, message: "Orders fetched successfully", result });
  });
});




// ********** Start Server **********
app.listen(3001, () => console.log("Running backend server on port 3001"));
