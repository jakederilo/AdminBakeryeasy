import { useQuery } from "@tanstack/react-query";
import DataTable from "../../components/dataTable/DataTable";
import { GridColDef } from "@mui/x-data-grid";
import "./transaction.scss";
const apiUrl = import.meta.env.VITE_API_URL;

interface Transaction {
  _id: string;
  orderId: string;
  userName: string;
  userEmail: string;
  totalAmount: number;
  status: string;
}

interface ApiResponse {
  message: string;
  data: Transaction[];
}

const columns: GridColDef[] = [
  { field: "id", headerName: "ID", width: 50 },
  { field: "orderId", headerName: "Order ID", width: 150 },
  { field: "userName", headerName: "User Name", width: 150 },
  { field: "userEmail", headerName: "User Email", width: 200 },
  { field: "totalAmount", headerName: "Total Amount", width: 100 },
  { field: "status", headerName: "Status", width: 100 },
];

const Transaction = () => {
  const { data, isLoading, error } = useQuery<ApiResponse>(
    ["transactions"],
    async () => {
      const response = await fetch(`${apiUrl}/transactions`);
      if (!response.ok) throw new Error("Error fetching transactions");
      return response.json();
    }
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {(error as Error).message}</div>;

  const rows =
    data?.data.map((transaction: Transaction) => ({
      id: transaction._id, // GridColDef requires 'id' for unique identification
      orderId: transaction.orderId,
      userName: transaction.userName,
      userEmail: transaction.userEmail,
      totalAmount: transaction.totalAmount,
      status: transaction.status,
    })) || [];

  return (
    <div className="transaction">
      <div className="info">
        <h1 className="trans" style={{ paddingBottom: "20px" }}>
          Transaction List
        </h1>
      </div>
      <DataTable slug="transactions" columns={columns} rows={rows} />
    </div>
  );
};

export default Transaction;
