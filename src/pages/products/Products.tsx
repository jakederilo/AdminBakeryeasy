import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import DataTable from "../../components/dataTable/DataTable";
import AddProduct from "../../components/addproduct/addproduct"; // Adjust the path as needed
import { GridColDef } from "@mui/x-data-grid";
import "./products.scss"; // Make sure to import the stylesheet
const apiUrl = import.meta.env.VITE_API_URL;

// Define the structure of your data response
interface ApiResponse {
  message: string;
  data: {
    _id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    quantity: number;
    image?: string;
    createdAt: string; // Add createdAt field
    updatedAt: string; // Add updatedAt field
  }[];
}

const columns: GridColDef[] = [
  { field: "id", headerName: "ID", width: 150 },

  {
    field: "image",
    headerName: "Image",
    width: 100,
    renderCell: (params) => (
      <img src={params.row.image} alt="Product" width="40" />
    ),
  },
  { field: "name", headerName: "Name", width: 80 },
  { field: "description", headerName: "Description", width: 80 },
  { field: "price", headerName: "Price", width: 80 },
  { field: "category", headerName: "Category", width: 100 },
  { field: "quantity", headerName: "Quantity", width: 80 },
  {
    field: "createdAt",
    headerName: "Created At",
    width: 150,
    renderCell: (params) => {
      const date = new Date(params.row.createdAt);
      return date.toLocaleDateString(); // Formats the date for display
    },
  },
  {
    field: "updatedAt",
    headerName: "Updated At",
    width: 150,
    renderCell: (params) => {
      const date = new Date(params.row.updatedAt);
      return date.toLocaleDateString(); // Formats the date for display
    },
  },
];

const Products = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading, error } = useQuery<ApiResponse>(
    ["items"],
    async () => {
      const response = await fetch(`${apiUrl}/items`);
      if (!response.ok) throw new Error("Error fetching items");
      return response.json();
    }
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {(error as Error).message}</div>;

  const rows =
    data?.data.map((item) => ({
      id: item._id,
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      quantity: item.quantity,
      image: item.image,
      createdAt: item.createdAt, // Map createdAt for DataTable
      updatedAt: item.updatedAt, // Map updatedAt for DataTable
    })) || [];

  return (
    <div className="products">
      <div className="info">
        <h1>Product List</h1>
        <button onClick={() => setIsModalOpen(true)}>Add New Product</button>
      </div>

      <DataTable slug="items" columns={columns} rows={rows} />

      {/* Conditionally render the AddProduct modal */}
      {isModalOpen && <AddProduct setOpen={setIsModalOpen} />}
    </div>
  );
};

export default Products;
