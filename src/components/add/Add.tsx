import { GridColDef } from "@mui/x-data-grid";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import "./add.scss";

type Props = {
  slug: string;
  columns: GridColDef[];
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const Add = (props: Props) => {
  const queryClient = useQueryClient();

  // Initialize state to manage form inputs
  const [formData, setFormData] = useState<{ [key: string]: any }>({});

  // Define the mutation for adding a new item
  const mutation = useMutation({
    mutationFn: () => {
      return fetch(`http://localhost:8800/api/${props.slug}s`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData), // Use the formData state
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries([`all${props.slug}s`]); // Invalidate cache on success
      props.setOpen(false); // Close the modal after successful submission
    },
    onError: (error) => {
      console.error("Error adding item:", error); // Log the error for debugging
      alert("Failed to add item. Please try again."); // Alert user of failure
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value, // Update state with new input value
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutation.mutate(); // Trigger the mutation to add a new item
  };

  return (
    <div className="add">
      <div className="modal">
        <span className="close" onClick={() => props.setOpen(false)}>
          X
        </span>
        <h1>Add new {props.slug}</h1>
        <form onSubmit={handleSubmit}>
          {props.columns
            .filter((item) => item.field !== "id" && item.field !== "img")
            .map((column) => (
              <div className="item" key={column.field}>
                <label>{column.headerName}</label>
                <input
                  type={column.type}
                  name={column.field} // Set name attribute for each input
                  placeholder={column.field}
                  onChange={handleChange} // Handle input changes
                  required // Add required attribute if necessary
                />
              </div>
            ))}
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
};

export default Add;
