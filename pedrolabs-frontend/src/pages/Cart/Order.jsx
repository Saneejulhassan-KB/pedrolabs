import React, { useEffect, useState } from "react";
import axios from "axios";

function Orders() {
  const [groupedOrders, setGroupedOrders] = useState({});
  const [loading, setLoading] = useState(true);
  const token = sessionStorage.getItem("token");
  const baseURL = "http://localhost:3001";

  useEffect(() => {
    axios
      .get(`${baseURL}/getorderlist`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        const orders = res.data.result || [];

        // Group orders by order_id
        const grouped = {};
        orders.forEach((item) => {
          if (!grouped[item.order_id]) {
            grouped[item.order_id] = {
              order_id: item.order_id,
              created_at: item.created_at,
              status: item.status,
              items: [],
            };
          }
          grouped[item.order_id].items.push({
            product_name: item.product_name,
            product_image: item.product_image,
            quantity: item.quantity,
            price: item.price,
          });
        });

        setGroupedOrders(grouped);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch orders", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading orders...</p>;

  return (
    <div className="container my-5">
    <h2 className="mb-4 text-center fw-bold">My Orders</h2>
    {Object.keys(groupedOrders).length === 0 ? (
      <div className="alert alert-info text-center">You have no orders yet.</div>
    ) : (
      Object.values(groupedOrders).map((order) => (
        <div key={order.order_id} className="card mb-4 border-0 shadow-sm">
          <div className="card-header bg-secondary text-white d-flex justify-content-between align-items-center">
            <div>
              <div><strong>Order ID:</strong> #{order.order_id}</div>
              <div><strong>Date:</strong> {new Date(order.created_at).toLocaleString()}</div>
            </div>
            <span className={`badge bg-${order.status === 'Delivered' ? 'success' : order.status === 'Pending' ? 'warning' : 'warning'}`}>
              {order.status}
            </span>
          </div>
          <ul className="list-group list-group-flush">
            {order.items.map((item, index) => (
              <li
                key={index}
                className="list-group-item d-flex align-items-center justify-content-between"
              >
                <div className="d-flex align-items-center">
                  <img
                    src={`${baseURL}/uploads/${item.product_image}`}
                    alt={item.product_name}
                    width="60"
                    height="60"
                    className="rounded me-3 border"
                    style={{ objectFit: "cover" }}
                  />
                  <div>
                    <h6 className="mb-0">{item.product_name}</h6>
                    <small className="text-muted">
                      Qty: {item.quantity} | ₹{item.price}
                    </small>
                  </div>
                </div>
                <div className="fw-bold text-primary">₹{item.quantity * item.price}</div>
              </li>
            ))}
          </ul>
          <div className="card-footer text-end bg-light">
            <strong>
              Total: ₹
              {order.items.reduce((total, item) => total + item.quantity * item.price, 0)}
            </strong>
          </div>
        </div>
      ))
    )}
  </div>
  );
}

export default Orders;
