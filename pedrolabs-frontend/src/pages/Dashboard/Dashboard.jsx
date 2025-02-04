import React, { useEffect, useState } from "react";
import { Container, Table, Button, Modal, Form } from "react-bootstrap";
import axios from "axios";
import "./Dashboard.css";

function Dashboard() {
  const baseURL = "http://localhost:3001";

  // State Management
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState("user"); // New state to manage active tab
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [registerStatus, setRegisterStatus] = useState("");

  const [name, setName] = useState("");
  const [details, setDetails] = useState("");
  const [photo, setPhoto] = useState("");
  const [originalprice, setOriginalprice] = useState("");
  const [offerprice, setOfferprice] = useState("");

  // Fetch Registered Users
  const fetchRegisteredUsers = () => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      console.error("No token found, please login first.");
      return;
    }

    axios
      .get(`${baseURL}/getusers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setUsers(response.data.data || []);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
        if (error.response && error.response.status === 401) {
          alert("Unauthorized access. Please log in again.");
          sessionStorage.removeItem("token");
          window.location.href = "/login";
        }
      });
  };

  // Fetch Products
  const fetchProducts = () => {
    const token = sessionStorage.getItem("token");

    if (!token) {
      console.error("No token found, please login first.");
      return;
    }

    axios
      .get(`${baseURL}/getproducts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setProducts(response.data.data || []);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
      });
  };

  // User Actions
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const handleSaveUser = () => {
    if (selectedUser) {
      const token = sessionStorage.getItem("token");
      if (!token) {
        console.error("Token is missing.");
        return;
      }

      axios
        .put(`${baseURL}/update/${selectedUser.id}`, selectedUser, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
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
      const token = sessionStorage.getItem("token");
      if (!token) {
        console.error("Token is missing.");
        return;
      }

      axios
        .delete(`${baseURL}/delete/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then(() => {
          fetchRegisteredUsers();
        })
        .catch((error) => {
          console.error("Error deleting user:", error);
        });
    }
  };

  // Product Actions
  const handleAddProduct = () => {
    setShowProductModal(true);
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
          fetchProducts(); // Fetch products after adding a new one
        } else {
          setRegisterStatus(response.data.message);
        }
      })
      .catch((err) => {
        console.error(err);
        setRegisterStatus("An error occurred. Please try again later.");
      });
  };

  const handleDeleteProduct = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      const token = sessionStorage.getItem("token");
      if (!token) {
        console.error("Token is missing.");
        return;
      }

      axios
        .delete(`${baseURL}/deleteproduct/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then(() => {
          fetchProducts();
        })
        .catch((error) => {
          console.error("Error deleting product:", error);
        });
    }
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const handleCloseProductModal = () => {
    setShowProductModal(false);
    setName("");
    setDetails("");
    setPhoto("");
    setOriginalprice("");
    setOfferprice("");
  };

  const handleCloseUserModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  // Initial Data Fetch
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      fetchRegisteredUsers();
      fetchProducts(); // Fetch products as well
    }
  }, []);

  return (
    <Container className="dashboard-container">
      <h2 className="text-center my-4">Admin Dashboard</h2>

      {/* Tab buttons */}
      <div className="text-center mb-3">
        <Button
          variant={activeTab === "user" ? "primary" : "secondary"}
          onClick={() => setActiveTab("user")}
          className="me-2 "
          style={{ paddingRight: "58px" }}
        >
          Users
        </Button>
        <Button
          variant={activeTab === "product" ? "primary" : "secondary"}
          onClick={() => setActiveTab("product")}
          style={{ paddingRight: "80px" }}
        >
          Products
        </Button>
      </div>

      {/* User or Product Table */}
      {activeTab === "user" ? (
        <>
          <div className="text-end mb-3">
            <Button
              variant="success"
              onClick={() => (window.location.href = "./test")} // Add product button should still be present in user tab
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

          <Table striped bordered hover responsive className="text-center">
            <thead >
              <tr>
                <th>#</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user.id}>
                  <td>{index + 1}</td>
                  <td>{user.fname}</td>
                  <td>{user.lname}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
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
                      onClick={() => handleDeleteUser(user.id)}
                      className="pr-5"
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      ) : (
        <>
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

          <Table striped bordered hover responsive className="text-center">
            <thead>
              <tr>
                <th>#</th>
                <th>Product Name</th>
                <th>Details</th>
                <th>Photo</th>
                <th>Original Price</th>
                <th>Offer Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr key={product.id}>
                  <td>{index + 1}</td>
                  <td>{product.name}</td>
                  <td>{product.details}</td>
                  <td>
                    <img
                      src={`${baseURL}/uploads/${product.image}`}
                      alt={product.name}
                      width="50"
                    />
                  </td>
                  <td>{product.originalprice}</td>
                  <td>{product.offerprice}</td>
                  <td className="d-flex justify-content-center">
                    <Button
                      variant="warning"
                      className="me-2 pr-5"
                      onClick={() => handleEditProduct(product)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleDeleteProduct(product.id)}
                      className="pr-5"
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}

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

      {/* Edit Product Modal */}
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
