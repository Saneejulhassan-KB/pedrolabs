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


  const userRole = sessionStorage.getItem("role");
  const userName = sessionStorage.getItem("userName");
  const userEmail = sessionStorage.getItem("userEmail");
  const token = sessionStorage.getItem("token");

  // Fetch Registered Users
  const fetchRegisteredUsers = () => {
    if (!token) {
      console.error("No token found, please login first.");
      return;
    }

    axios
      .get(`${baseURL}/getusers`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setUsers(response.data.data || []);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
        if (error.response?.status === 401) {
          alert("Unauthorized access. Please log in again.");
          sessionStorage.removeItem("token");
          window.location.href = "/login";
        }
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
    const token = sessionStorage.getItem("token");
    if (token) {
      fetchRegisteredUsers();
    }
  }, []);

  return (
 <Container className="dashboard-container">
    <h2 className="text-center my-4"></h2>

    {sessionStorage.getItem("token") ? (
      sessionStorage.getItem("role") === "admin" ? (
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
                      className="me-2"
                      onClick={() => handleEditUser(user)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleDeleteUser(user.id)}
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
        <div className="text-center">
          <h3>Welcome, {sessionStorage.getItem("userName")}!</h3>
          <p>Name: {sessionStorage.getItem("userName")}</p>
          <p>Email: {sessionStorage.getItem("email")}</p>
          <p>ID: {sessionStorage.getItem("userId")}</p>
        </div>
      )
    ) : (
      <p className="text-center">Please log in to view your details.</p>
    )}
  </Container>
  );
}

export default Dashboard;
