import { DataGrid, GridColDef, GridToolbar } from "@mui/x-data-grid";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { Button, Snackbar, Alert, Box } from "@mui/material";
import EditProduct from "../editproduct/editproduct";
import EditUser from "../edituser/edituser";
import "./dataTable.scss";
import { format } from "date-fns";

interface Props {
  columns: GridColDef[];
  rows: object[];
  slug: string; // "users", "items", "orders", or "customrewards"
}

const DataTable = (props: Props) => {
  const queryClient = useQueryClient();
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "warning" | "info",
  });

  // Delete mutation
  const deleteMutation = useMutation(
    (id: string) => axios.delete(`http://localhost:5001/${props.slug}/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries([props.slug]);
        setSnackbar({
          open: true,
          message: "Item deleted successfully.",
          severity: "success",
        });
      },
      onError: (error) => {
        console.error("Error deleting item:", error);
        setSnackbar({
          open: true,
          message: "Failed to delete item.",
          severity: "error",
        });
      },
    }
  );

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleEdit = (id: string) => {
    setSelectedItemId(id);
    setEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    queryClient.invalidateQueries([props.slug]);
    setEditModalOpen(false);
  };

  const activateLoyaltyMutation = useMutation(
    (id: string) => axios.post(`http://localhost:5001/loyalty/activate/${id}`), // New API endpoint
    {
      onMutate: async (id) => {
        await queryClient.cancelQueries(["customrewards"]);
        const previousRewards = queryClient.getQueryData(["customrewards"]);

        queryClient.setQueryData(["customrewards"], (oldData: any) => {
          if (!oldData) return;
          return {
            ...oldData,
            data: oldData.data.map((loyalty: any) =>
              loyalty._id === id
                ? {
                    ...loyalty,
                    status:
                      loyalty.status === "active" ? "not active" : "active",
                  }
                : loyalty
            ),
          };
        });

        return { previousRewards };
      },
      onError: (error, _id, context) => {
        queryClient.setQueryData(["customrewards"], context?.previousRewards);
        console.error("Error toggling loyalty status:", error);
        setSnackbar({
          open: true,
          message: "Failed to toggle loyalty status.",
          severity: "error",
        });
      },
      onSuccess: (data) => {
        const updatedLoyalty = data.data.loyalty;
        setSnackbar({
          open: true,
          message: `Loyalty ${
            updatedLoyalty.status === "active" ? "activated" : "deactivated"
          } successfully.`,
          severity: "success",
        });
      },
    }
  );

  const handleActivateLoyalty = (id: string) => {
    activateLoyaltyMutation.mutate(id);
  };

  const resetRewardCountMutation = useMutation(
    (id: string) =>
      axios.post(`http://localhost:5001/loyalty/resetcount/${id}`),
    {
      onMutate: async (id) => {
        await queryClient.cancelQueries(["customrewards"]);
        const previousRewards = queryClient.getQueryData(["customrewards"]);

        queryClient.setQueryData(["customrewards"], (oldData: any) => {
          if (!oldData) return;
          return {
            ...oldData,
            data: oldData.data.map((reward: any) =>
              reward._id === id ? { ...reward, orderCount: 0 } : reward
            ),
          };
        });

        return { previousRewards };
      },
      onError: (error, _id, context) => {
        queryClient.setQueryData(["customrewards"], context?.previousRewards);

        console.error("Error resetting reward count:", error);
        setSnackbar({
          open: true,
          message: "Failed to reset reward count.",
          severity: "error",
        });
      },
      onSuccess: (_data) => {
        setSnackbar({
          open: true,
          message: "Reward count reset successfully.",
          severity: "success",
        });
      },
    }
  );

  const handleResetRewardCount = (id: string) => {
    resetRewardCountMutation.mutate(id);
  };

  // Handle order confirmation
  const handleConfirmOrder = async (id: string, action: string) => {
    try {
      let newStatus = "Pending";
      switch (action) {
        case "Accept":
          newStatus = "Baking";
          break;
        case "Ready for Pickup":
          newStatus = "Ready for Pickup";
          break;
        case "Picked Up":
          newStatus = "Picked Up";
          break;
        case "Cancel":
          newStatus = "Canceled";
          break;
      }

      const response = await axios.post(
        `http://localhost:5001/orders/confirm/${id}`,
        { status: newStatus }
      );

      if (newStatus === "Picked Up") {
        const { userId, userName } = response.data.order;
        await axios.post(`http://localhost:5001/loyalty/update`, {
          userId,
          userName,
        });
      }

      queryClient.invalidateQueries(["orders"]);
      setSnackbar({
        open: true,
        message: `Order ${action} successfully!`,
        severity: "success",
      });
    } catch (error) {
      console.error("Error confirming order:", error);
      setSnackbar({
        open: true,
        message: `Failed to ${action.toLowerCase()} order.`,
        severity: "error",
      });
    }
  };

  // Define the action column
  const actionColumn: GridColDef = {
    field: "action",
    headerName: "Actions",
    width: 288,
    renderCell: (params) => {
      if (props.slug === "orders") {
        return (
          <div className="action">
            {params.row.status === "Pending" && (
              <>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleConfirmOrder(params.row.id, "Accept")}
                >
                  Accept
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => handleConfirmOrder(params.row.id, "Cancel")}
                >
                  Cancel
                </Button>
              </>
            )}
            {params.row.status === "Baking" && (
              <Button
                variant="contained"
                color="warning"
                onClick={() =>
                  handleConfirmOrder(params.row.id, "Ready for Pickup")
                }
              >
                Ready for Pickup
              </Button>
            )}
            {params.row.status === "Ready for Pickup" && (
              <Button
                variant="contained"
                color="success"
                onClick={() => handleConfirmOrder(params.row.id, "Picked Up")}
              >
                Picked Up
              </Button>
            )}
          </div>
        );
      }

      if (props.slug === "customrewards") {
        return (
          <div className="action">
            <Button
              variant="contained"
              color="success"
              onClick={() => handleActivateLoyalty(params.row.id)}
              disabled={params.row.orderCount < 10}
            >
              {params.row.status === "active" ? "Deactivate" : "Activate"}
            </Button>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => handleResetRewardCount(params.row.id)}
            >
              Reset Count
            </Button>
          </div>
        );
      }

      if (props.slug !== "transactions") {
        return (
          <div className="action">
            <div className="edit" onClick={() => handleEdit(params.row.id)}>
              <img src="/edit.svg" alt="Edit" />
            </div>
            <div className="delete" onClick={() => handleDelete(params.row.id)}>
              <img src="/delete.svg" alt="Delete" />
            </div>
          </div>
        );
      }

      return (
        <div className="action">
          <div className="edit" onClick={() => handleEdit(params.row.id)}>
            <img src="/edit.svg" alt="Edit" />
          </div>
          <div className="delete" onClick={() => handleDelete(params.row.id)}>
            <img src="/delete.svg" alt="Delete" />
          </div>
        </div>
      );
    },
  };

  // Format the date using date-fns
  const formatDateTime = (date: string | Date) => {
    try {
      return format(new Date(date), "MMM d, yyyy h:mm a"); // Example: Dec 20, 2024 1:54 PM
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };

  // Map over rows to format date fields
  const formattedRows = props.rows.map((row: any) => {
    const newRow = { ...row };
    for (const key in newRow) {
      if (
        key.toLowerCase().includes("date") ||
        key.toLowerCase().includes("time")
      ) {
        newRow[key] = formatDateTime(newRow[key]);
      }
    }
    return newRow;
  });
  return (
    <Box className="dataTable">
      <DataGrid
        className="dataGrid"
        rows={formattedRows} // Use the formatted rows
        columns={
          props.slug === "transactions"
            ? props.columns
            : [...props.columns, actionColumn]
        }
        autoHeight
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10,
            },
          },
        }}
        slots={{ toolbar: GridToolbar }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
            quickFilterProps: { debounceMs: 500 },
          },
        }}
        pageSizeOptions={[5, 10]}
        checkboxSelection
        disableRowSelectionOnClick
        disableColumnFilter
        disableDensitySelector
        disableColumnSelector
      />

      {isEditModalOpen &&
        selectedItemId &&
        (props.slug === "users" ? (
          <EditUser
            setOpen={setEditModalOpen}
            userId={selectedItemId}
            onEditSuccess={handleEditSuccess}
          />
        ) : props.slug === "items" ? (
          <EditProduct
            setOpen={setEditModalOpen}
            itemId={selectedItemId}
            onEditSuccess={handleEditSuccess}
          />
        ) : null)}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DataTable;
