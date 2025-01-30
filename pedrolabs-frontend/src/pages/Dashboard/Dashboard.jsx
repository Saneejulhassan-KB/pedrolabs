import React, { useEffect, useState } from "react";
import { Container, Table, Button, Modal, Form } from "react-bootstrap";
import axios from "axios";
import "./Dashboard.css";

function Dashboard() {
  const baseURL = "http://localhost:3001";

  // State Management
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [products, setProducts] = useState([]); // For managing products
  const [showProductModal, setShowProductModal] = useState(false);
  const [registerStatus, setRegisterStatus] = useState("");

  const [name, setName] = useState("");
  const [details, setDetails] = useState("");
  const [photo, setPhoto] = useState("");
  const [originalprice, setOriginalprice] = useState("");
  const [offerprice, setOfferprice] = useState("");

  // Fetch Registered Users
  const fetchRegisteredUsers = () => {
    axios
      .get(`${baseURL}/getusers`)
      .then((response) => {
        setUsers(response.data.data || []);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });
  };

  // User Actions
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleSaveUser = () => {
    if (selectedUser) {
      axios
        .put(`${baseURL}/update/${selectedUser.id}`, selectedUser)
        .then((response) => {
          if (response.data.success) {
            fetchRegisteredUsers();
            setShowModal(false);
          } else {
            alert(response.data.message);
          }
        })
        .catch((error) => {
          console.error("Error updating user:", error);
          alert("Failed to update user. Please try again.");
        });
    }
  };

  const handleDeleteUser = (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      axios
        .delete(`${baseURL}/delete/${id}`)
        .then(() => {
          fetchRegisteredUsers();
        })
        .catch((error) => {
          console.error("Error deleting user:", error);
        });
    }
  };

  const handleCloseUserModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  // Product Actions
  const handleAddProduct = () => {
    window.location.href = "./test";
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();

    if (!name || !details || !photo || !originalprice || !offerprice) {
      setRegisterStatus("Please fill out all fields.");
      return;
    }

    axios
      .post(`${baseURL}/addproduct`, {
        name,
        details,
        photo,
        originalprice,
        offerprice,
      })
      .then((response) => {
        if (response.data.success) {
          setRegisterStatus(response.data.message);
          setShowProductModal(false);
          // Optionally fetch products if required
        } else {
          setRegisterStatus(response.data.message);
        }
      })
      .catch((err) => {
        console.error(err);
        setRegisterStatus("An error occurred. Please try again later.");
      });
  };

  const handleCloseProductModal = () => {
    setShowProductModal(false);
    setName("");
    setDetails("");
    setPhoto("");
    setOriginalprice("");
    setOfferprice("");
  };

  // Initial Data Fetch
  useEffect(() => {
    fetchRegisteredUsers();
  }, []);

  return (
    <Container className="dashboard-container">
      <h2 className="text-center my-4">User Dashboard</h2>

      {/* Add Product Button */}
      <div className="text-end mb-3">
        <Button
          variant="success"
          onClick={handleAddProduct}
          style={{
            fontSize: "16px",
            padding: "10px 40px",
            borderRadius: "5px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "auto",
          }}
        >
          Add Product
        </Button>
      </div>

      {/* Users Table */}
      <Table striped bordered hover responsive className="text-center">
        <thead>
          <tr>
            <th>#</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.fname}</td>
              <td>{user.lname}</td>
              <td>{user.email}</td>
              <td>
                <Button
                  variant="warning"
                  className="me-2 pr-5"
                  onClick={() => handleEditUser(user)}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  className="pr-5"
                  onClick={() => handleDeleteUser(user.id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Edit User Modal */}
      <Modal show={showModal} onHide={handleCloseUserModal}>
        <Modal.Header closeButton>
          <Modal.Title>Edit User</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <Form>
              <Form.Group controlId="formFname">
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter first name"
                  value={selectedUser.fname}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, fname: e.target.value })
                  }
                />
              </Form.Group>

              <Form.Group controlId="formLname">
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter last name"
                  value={selectedUser.lname}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, lname: e.target.value })
                  }
                />
              </Form.Group>

              <Form.Group controlId="formEmail">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter email"
                  value={selectedUser.email}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, email: e.target.value })
                  }
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={handleCloseUserModal}
            className="pr-5"
          >
            Close
          </Button>
          <Button variant="primary" onClick={handleSaveUser} className="pr-5">
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Product Modal */}
      <Modal show={showProductModal} onHide={handleCloseProductModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSaveProduct}>
            <Form.Group controlId="formProductName">
              <Form.Label>Product Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter product name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="formProductDetails">
              <Form.Label>Details</Form.Label>
              <Form.Control
                as="textarea"
                placeholder="Enter product details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="formProductPhoto">
              <Form.Label>Photo URL</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter photo URL"
                value={photo}
                onChange={(e) => setPhoto(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="formOriginalPrice">
              <Form.Label>Original Price</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter original price"
                value={originalprice}
                onChange={(e) => setOriginalprice(e.target.value)}
              />
            </Form.Group>

            <Form.Group controlId="formOfferPrice">
              <Form.Label>Offer Price</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter offer price"
                value={offerprice}
                onChange={(e) => setOfferprice(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={handleCloseProductModal}
            className="pr-5"
          >
            Close
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveProduct}
            className="pr-5"
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default Dashboard;
