import React, { useEffect, useState } from "react";
import { Container, Table, Button, Image } from "react-bootstrap";
import { Link } from "react-router-dom";
import Header from "../../Components/Header";
import "./Cart.css";

function Cart() {
  // const [cart, setCart] = useState([]);
  // const [total, setTotal] = useState(0);

  // useEffect(() => {
  //   const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
  //   setCart(savedCart);
  //   calculateTotal(savedCart);
  // }, []);

  // const calculateTotal = (cartItems) => {
  //   const totalAmount = cartItems.reduce(
  //     (sum, item) => sum + item.offerprice * item.quantity,
  //     0
  //   );
  //   setTotal(totalAmount);
  // };

  // const handleQuantityChange = (index, quantity) => {
  //   const updatedCart = [...cart];
  //   updatedCart[index].quantity = quantity;
  //   setCart(updatedCart);
  //   localStorage.setItem("cart", JSON.stringify(updatedCart));
  //   calculateTotal(updatedCart);
  // };

  // const handleRemoveItem = (index) => {
  //   const updatedCart = cart.filter((_, i) => i !== index);
  //   setCart(updatedCart);
  //   localStorage.setItem("cart", JSON.stringify(updatedCart));
  //   calculateTotal(updatedCart);
  // };

  return (
    <div>
      {/* <Header cart={cart} /> */}
      <Container className="cart-container" style={{ marginTop: "120px" }}>
        <h2 className="text-center my-4">Shopping Cart</h2>
        {/* {cart.length === 0 ? ( */}
          <h4 className="text-center">Your cart is empty.</h4>
        {/* // ) : ( */}
          <>
            <Table striped bordered hover responsive className="text-center">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>Image</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                
                  <tr >
                    <td>1</td>
                    <td></td>
                    <td>
                      <Image
                        src=''
                        alt=''
                        width="50"
                      />
                    </td>
                    <td></td>
                    <td>
                      <input
                        type="number"
                        
                        
                        
                      />
                    </td>
                    <td></td>
                    <td>
                      <Button
                        variant="danger"
                        
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                
              </tbody>
            </Table>
            <div className="text-end">
              <h4>Total: </h4>
              <Button variant="success">Proceed to Checkout</Button>
            </div>
          </>
        
      </Container>
    </div>
  );
}

export default Cart;

