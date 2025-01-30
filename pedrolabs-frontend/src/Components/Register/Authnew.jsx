import React, { useState } from "react";
import { useNavigate } from "react-router";
import { Container, Form, Button, Row, Col, Card } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";

function Authnew() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [registerStatus, setRegisterStatus] = useState("");
  const navigate = useNavigate();
  const baseURL = "http://localhost:3001"; // Backend API URL

  const handleRegister = (e) => {
    e.preventDefault();

    if (!fname || !lname || !email || !password) {
      setRegisterStatus("Please fill out all fields.");
      return;
    }

    console.log("Sending registration data:", {
      fname,
      lname,
      email,
      password,
    });

    axios
      .post(`${baseURL}/register`, {
        fname: fname,
        lname: lname,
        email: email,
        password: password,
      })
      .then((response) => {
        console.log("result", response.data);
        if (response.data.success) {
          setRegisterStatus("Registration successful! Please log in.");
          setIsRegistering(false);

          // Clear the form fields after successful registration
          setFname("");
          setLname("");
          setEmail("");
          setPassword("");
        } else {
          setRegisterStatus(response.data.message); // Show error message
        }
      })
      .catch((err) => {
        console.error(err);
        setRegisterStatus(
          "An error occurred during registration. Please try again later."
        );
      });
  };

  const handleLogin = (e) => {
    e.preventDefault();

    if (!email || !password) {
      setRegisterStatus("Please fill out all fields.");
      return;
    }

    console.log("Attempting login with:", { email, password });

    axios
      .post(`${baseURL}/login`, { email, password })
      .then((response) => {
        console.log("result", response.data);
        if (response.data.success) {
          sessionStorage.setItem("userId", response.data.userId); // Store user ID
          sessionStorage.setItem("email", response.data.email);
          sessionStorage.setItem(
            "userName",
            `${response.data.fname} ${response.data.lname} `
          );
          setRegisterStatus("Login successful!");
          navigate("/");
        } else {
          setRegisterStatus(response.data.message); // Show error message
        }
      })
      .catch((err) => {
        console.error(err);
        setRegisterStatus("User not exist");
      });
  };

  return (
    <div>
      <Container className="my-5">
        <Row className="justify-content-md-center">
          <Col md={8} lg={6} xl={4}>
            <Card className="shadow-lg rounded">
              <Card.Body>
                <h3 className="text-center mb-4">
                  {isRegistering ? "Register" : "Login"}
                </h3>

                {isRegistering ? (
                  // Registration Form
                  <Form onSubmit={handleRegister}>
                    <Form.Group controlId="formFirstName">
                      <Form.Label>First Name</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter first name"
                        name="fname"
                        value={fname}
                        onChange={(e) => setFname(e.target.value)}
                        required
                      />
                    </Form.Group>

                    <Form.Group controlId="formLastName">
                      <Form.Label>Last Name</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter last name"
                        name="lname"
                        value={lname}
                        onChange={(e) => setLname(e.target.value)}
                        required
                      />
                    </Form.Group>

                    <Form.Group controlId="formEmail">
                      <Form.Label>Email address</Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="Enter email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </Form.Group>

                    <Form.Group controlId="formPassword">
                      <Form.Label>Password</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Enter password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </Form.Group>

                    <Button
                      variant="primary"
                      type="submit"
                      className="w-100 mt-3"
                    >
                      Register
                    </Button>

                    <p className="text-center mt-3">
                      Already registered?{" "}
                      <span
                        onClick={() => {
                          setIsRegistering(false), setRegisterStatus(""); // Clear the error message
                          setFname("");
                          setLname("");
                          setEmail("");
                          setPassword("");
                        }}
                        style={{
                          color: "#007bff", // A nice blue color
                          textDecoration: "none", // Underline to resemble a link
                          cursor: "pointer", // Pointer cursor to show it's clickable
                          fontWeight: "bold", // Optional, to make the text stand out more
                        }}
                      >
                        Login here
                      </span>
                    </p>
                  </Form>
                ) : (
                  // Login Form
                  <Form onSubmit={handleLogin}>
                    <Form.Group controlId="formLoginEmail">
                      <Form.Label>Email address</Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="Enter email"
                        name="email"
                        value={email} // Bind to the password state
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </Form.Group>

                    <Form.Group controlId="formLoginPassword">
                      <Form.Label>Password</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Enter password"
                        name="password"
                        value={password} // Bind to the password state
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </Form.Group>

                    <Button
                      variant="primary"
                      type="submit"
                      className="w-100 mt-3"
                    >
                      Login
                    </Button>

                    <p className="text-center mt-3">
                      New user?{" "}
                      <span
                        onClick={() => {
                          setIsRegistering(true), setRegisterStatus(""); // Clear the error message
                          setFname("");
                          setLname("");
                          setEmail("");
                          setPassword("");
                        }}
                        style={{
                          color: "#007bff", // A nice blue color
                          textDecoration: "none", // Underline to resemble a link
                          cursor: "pointer", // Pointer cursor to show it's clickable
                          fontWeight: "bold", // Optional, to make the text stand out more
                        }}
                      >
                        Register here
                      </span>
                    </p>
                  </Form>
                )}

                <p
                  className="text-center mt-3"
                  style={{ color: "red", fontSize: "14px" }}
                >
                  {registerStatus}
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Authnew;
