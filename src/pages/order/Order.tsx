import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DataTable from "../../components/dataTable/DataTable";
import { GridColDef } from "@mui/x-data-grid";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import "./order.scss";

interface Order {
  _id: string;
  userName: string;
  userEmail: string;
  cartItems: { title: string; quantity: number }[];
  totalAmount: number;
  quantity: number;
  pickupDateTime: string;
  paymentMethod: "PayMongo" | "Cash";
  status: "Pending" | "Baking" | "Ready for Pickup" | "Picked Up" | "Canceled";
}

interface ApiResponse {
  message: string;
  data: Order[];
}

const Orders = () => {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    string | null
  >(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [expandedOrderItems, setExpandedOrderItems] = useState<string | null>(
    null
  );

  const { data, isLoading, error } = useQuery<ApiResponse>(
    ["orders"],
    async () => {
      const response = await fetch("http://localhost:5001/orders");
      if (!response.ok) throw new Error("Error fetching orders");
      return response.json();
    }
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {(error as Error).message}</div>;

  const handleStatusChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatus(event.target.value);
  };

  const handlePaymentMethodChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedPaymentMethod(event.target.value);
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(event.target.value);
  };

  const filteredRows =
    data?.data
      .filter((order) =>
        selectedStatus ? order.status === selectedStatus : true
      )
      .filter((order) =>
        selectedPaymentMethod
          ? order.paymentMethod === selectedPaymentMethod
          : true
      )
      .filter((order) =>
        selectedDate
          ? new Date(order.pickupDateTime).toDateString() ===
            new Date(selectedDate).toDateString()
          : true
      )
      .map((order: Order) => ({
        id: order._id,
        userName: order.userName,
        userEmail: order.userEmail,
        cartItems: order.cartItems,
        totalAmount: order.totalAmount,
        pickupDateTime: order.pickupDateTime,
        paymentMethod: order.paymentMethod,
        quantity: order.quantity,
        status: order.status,
      })) || [];

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 30 },
    { field: "userName", headerName: "Name", width: 100 },
    {
      field: "cartItems",
      headerName: "Order Items",
      width: 270,
      renderCell: (params) => {
        const items = params.row.cartItems;
        const preview = items
          .slice(0, 1)
          .map((item: any) => item.title)
          .join(", ");
        return (
          <div style={{ display: "flex", alignItems: "center" }}>
            <span
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "100px", // Adjust this value as needed
              }}
            >
              {preview}
            </span>
            {items.length > 1 && (
              <button
                style={{
                  marginLeft: "5px",
                  color: "blue",
                  cursor: "pointer",
                  border: "none",
                  background: "none",
                }}
                onClick={() => setExpandedOrderItems(params.row.id)}
              >
                Show More
              </button>
            )}
            <Dialog
              open={expandedOrderItems === params.row.id}
              onClose={() => setExpandedOrderItems(null)}
              aria-labelledby="order-items-dialog-title"
            >
              <DialogTitle id="order-items-dialog-title">
                Order Items
              </DialogTitle>
              <DialogContent>
                <List>
                  {items.map((item: any, index: number) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={item.title}
                        secondary={`Quantity: ${item.quantity}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </DialogContent>
            </Dialog>
          </div>
        );
      },
    },

    { field: "totalAmount", headerName: "Total Amount", width: 100 },
    {
      field: "pickupDateTime",
      headerName: "Pickup Date & Time",
      width: 200,
    },
    { field: "paymentMethod", headerName: "Payment Method", width: 130 },
    {
      field: "status",
      headerName: "Status",
      width: 90,
    },
  ];

  return (
    <div className="orders">
      <div className="info">
        <h1>Order List</h1>
        <div className="filters">
          <div className="filter-group">
            <label htmlFor="status-filter">Status:</label>
            <select
              id="status-filter"
              value={selectedStatus || ""}
              onChange={handleStatusChange}
              className="status-filter"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Baking">Baking</option>
              <option value="Ready for Pickup">Ready for Pickup</option>
              <option value="Picked Up">Picked Up</option>
              <option value="Canceled">Canceled</option>
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="payment-filter">Payment Method:</label>
            <select
              id="payment-filter"
              value={selectedPaymentMethod || ""}
              onChange={handlePaymentMethodChange}
              className="payment-filter"
            >
              <option value="">All Payment Methods</option>
              <option value="PayMongo">PayMongo</option>
              <option value="Cash">Cash</option>
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="date-filter">Date:</label>
            <input
              id="date-filter"
              type="date"
              value={selectedDate || ""}
              onChange={handleDateChange}
              className="date-filter"
            />
          </div>
        </div>
      </div>
      <DataTable slug="orders" columns={columns} rows={filteredRows} />
    </div>
  );
};

export default Orders;
