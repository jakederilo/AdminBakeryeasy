import { FC, useState } from "react";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import "./addproduct.scss";

interface AddProductProps {
  setOpen: (open: boolean) => void;
}

const AddProduct: FC<AddProductProps> = ({ setOpen }) => {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: "",
    price: "",
    description: "",
    category: "Birthday Cakes",
    quantity: 1, // Add quantity field with default value of 1
  });
  const [image, setImage] = useState<File | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", formData.title);
    data.append("description", formData.description);
    data.append("price", formData.price);
    data.append("category", formData.category);
    data.append("quantity", formData.quantity.toString()); // Append quantity to FormData
    if (image) data.append("image", image);

    try {
      await axios.post("http://localhost:5001/items", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setOpen(false);

      queryClient.invalidateQueries(["items"]);
    } catch (err) {
      console.error("Error creating item:", err);
    }
  };
  return (
    <div className="modal-overlay" onClick={() => setOpen(false)}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <span className="close" onClick={() => setOpen(false)}>
          &times;
        </span>
        <h1>Add New Product</h1>
        <form onSubmit={handleSubmit}>
          <div className="item">
            <label>Title</label>
            <input
              type="text"
              name="title"
              placeholder="Title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          <div className="item">
            <label>Price</label>
            <input
              type="number"
              name="price"
              placeholder="Price"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </div>
          <div className="item">
            <label>Description</label>
            <input
              type="text"
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>
          <div className="item">
            <label>Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="Birthday Cakes">Birthday Cakes</option>
              <option value="Wedding Cakes">Wedding Cakes</option>
              <option value="Holiday Cakes">Holiday Cakes</option>
              <option value="Anniversary Cakes">Anniversary Cakes</option>
            </select>
          </div>
          <div className="item">
            <label>Quantity</label>
            <input
              type="number"
              name="quantity"
              placeholder="Quantity"
              value={formData.quantity}
              onChange={handleChange}
              required
            />
          </div>

          <div className="item">
            <label>Image</label>
            <input type="file" name="image" onChange={handleImageChange} />
          </div>
          <button type="submit">Start</button>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
