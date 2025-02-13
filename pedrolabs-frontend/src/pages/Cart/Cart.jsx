import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Table,
  Image,
  Form,
  Card,
} from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Cart.css";
import axios from "axios";

function Cart() {
  const [products, setProducts] = useState([]);
  const baseURL = "http://localhost:3001";

  // fetch products

  const fetchProducts = () => {
    axios
      .get(`${baseURL}/getproducts`)
      .then((response) => {
        setProducts(response.data.data || []);
      })
      .catch((error) => {
        console.error("error fetching products:", error);
      });
  };

  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        console.log("Loaded cart:", parsedCart);
        if (Array.isArray(parsedCart)) {
          setProducts(parsedCart); // Ensure it's an array
        } else {
          console.error("Cart data format is incorrect.");
        }
      } catch (error) {
        console.error("Error parsing cart data:", error);
      }
    }
  }, []);

  const cartItems = [
    {
      name: "VATS Vein Finder",
      price: 3000,
      quantity: 1,
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQZmfhpVHfm2uIPubPG7eipdbV-uBe18a9pg&s",
    },
    {
      name: "BPL Medical Technologies Breather",
      price: 2000,
      quantity: 1,
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQZmfhpVHfm2uIPubPG7eipdbV-uBe18a9pg&s",
    },
  ];

  const similarProducts = [
    {
      name: "Philips HeartStart AED",
      price: 4500,
      image: "https://via.placeholder.com/150",
    },
    {
      name: "Omron Blood Pressure Monitor",
      price: 1800,
      image: "https://via.placeholder.com/150",
    },
    {
      name: "Welch Allyn Otoscope",
      price: 3500,
      image: "https://via.placeholder.com/150",
    },
  ];

  const getTotal = () => {
    return products.reduce(
      (total, item) => total + item.offerprice * item.quantity,
      0
    );
  };

  const updateQuantity = (id, change) => {
    setProducts((prev) => {
      const updatedProducts = prev.map((product) =>
        product.id === id
          ? { ...product, quantity: Math.max(1, product.quantity + change) }
          : product
      );

      localStorage.setItem("cart", JSON.stringify(updatedProducts)); // Store as an array
      return updatedProducts;
    });
  };

  const handleRemove = (id) => {
    setProducts((prev) => {
      const updatedProducts = prev.filter((product) => product.id !== id);
      localStorage.setItem("cart", JSON.stringify(updatedProducts)); // Store as an array
      return updatedProducts;
    });
  };

  return (
    <Container className="cart-container p-4 shadow-lg rounded">
      <h2 className="cart-title text-center mb-4">Shopping Cart</h2>
      {products.length === 0 ? (
        <p className="empty-cart text-center">Your cart is empty.</p>
      ) : (
        <Table
          responsive
          striped
          bordered
          hover
          className="cart-table text-center"
        >
          <thead className="table-dark">
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Total</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td className="cart-item d-flex align-items-center gap-3">
                  <Image
                    src={`${baseURL}/uploads/${product.image}`}
                    alt={product.name}
                    className="cart-image rounded"
                  />
                  <span>{product.name}</span>
                </td>
                <td>₹{product.offerprice}</td>
                <td>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => updateQuantity(product.id, -1)}
                  >
                    -
                  </Button>
                  <span className="quantity mx-2">{product.quantity}</span>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => updateQuantity(product.id, 1)}
                  >
                    +
                  </Button>
                </td>
                <td>₹{product.offerprice * product.quantity}</td>
                <td>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleRemove(product.id)}
                  >
                    Remove
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      <div className="cart-total text-center my-4">
        <h4>Total: ₹{getTotal()}</h4>
      </div>
      <div className="payment-section p-4 shadow-sm rounded bg-light">
        <h3 className="text-center mb-3">Payment Details</h3>
        <Form>
          <Form.Group className="mb-3" controlId="cardNumber">
            <Form.Label>Card Number</Form.Label>
            <Form.Control type="text" placeholder="Enter card number" />
          </Form.Group>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="expiryDate">
                <Form.Label>Expiry Date</Form.Label>
                <Form.Control type="text" placeholder="MM/YY" />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="cvv">
                <Form.Label>CVV</Form.Label>
                <Form.Control type="text" placeholder="CVV" />
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-3" controlId="cardName">
            <Form.Label>Cardholder Name</Form.Label>
            <Form.Control type="text" placeholder="Enter name on card" />
          </Form.Group>
          <Button variant="success" className="w-100">
            Proceed to Payment
          </Button>
        </Form>
      </div>
      <div className="similar-products-section mt-5 p-4 shadow-sm rounded bg-light">
        <h3 className="text-center mb-3">Similar Products</h3>
        <Row className="g-4">
          {similarProducts.map((product, index) => (
            <Col key={index} md={4}>
              <Card className="shadow-sm h-100">
                <Card.Img
                  variant="top"
                  src={`${baseURL}/uploads/${product.image}`}
                  alt={product.name}
                  className="p-3"
                />
                <Card.Body className="text-center">
                  <Card.Title>{product.name}</Card.Title>
                  <Card.Text>₹{product.price}</Card.Text>
                  <Button variant="primary">Add to Cart</Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </Container>
  );
}

export default Cart;
