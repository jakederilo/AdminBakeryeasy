import { FC, useState, useEffect } from "react";
import axios from "axios";
import "./editproduct.scss";

interface EditProductProps {
  setOpen: (open: boolean) => void;
  itemId: string;
  onEditSuccess: () => void;
}

const EditProduct: FC<EditProductProps> = ({
  setOpen,
  itemId,
  onEditSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    category: "",
    quantity: "",
  });
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Define categories for dropdown
  const categories = [
    { value: "Birthday Cakes", label: "Birthday Cakes" },
    { value: "Wedding Cakes", label: "Wedding Cakes" },
    { value: "Holiday Cakes", label: "Holiday Cakes" },
    { value: "Anniversary Cakes", label: "Anniversary Cakes" },
  ];

  useEffect(() => {
    const fetchItemData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5001/items/${itemId}`
        );
        const { name, price, description, category, quantity } = response.data; // Include quantity in response
        setFormData({ name, price, description, category, quantity }); // Set quantity in formData
      } catch (error) {
        setError("Failed to load product data.");
        console.error("Error fetching item data:", error);
      }
    };
    fetchItemData();
  }, [itemId]);

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
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("price", formData.price);
    data.append("category", formData.category);
    data.append("quantity", formData.quantity.toString());
    if (image) data.append("image", image);

    try {
      await axios.put(`http://localhost:5001/items/${itemId}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      onEditSuccess(); // Notify parent component of success
      setOpen(false); // Close the modal
    } catch (err) {
      console.error("Error updating item:", err);
      setError("Failed to update product data.");
    }
  };

  return (
    <div className="modal-overlay" onClick={() => setOpen(false)}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <span className="close" onClick={() => setOpen(false)}>
          &times;
        </span>
        <h1>Edit Product</h1>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="item">
            <label htmlFor="name">Item Name</label>
            <input
              id="name"
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name || ""}
              onChange={handleChange}
              required
            />
          </div>
          <div className="item">
            <label htmlFor="price">Price</label>
            <input
              id="price"
              type="number"
              name="price"
              placeholder="Price"
              value={formData.price || ""}
              onChange={handleChange}
              required
            />
          </div>
          <div className="item">
            <label htmlFor="description">Description</label>
            <input
              id="description"
              type="text"
              name="description"
              placeholder="Description"
              value={formData.description || ""}
              onChange={handleChange}
              required
            />
          </div>
          <div className="item">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category || ""}
              onChange={handleChange}
              required
            >
              <option value="" disabled>
                Select a category
              </option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
          <div className="item">
            <label htmlFor="quantity">Quantity</label>
            <input
              id="quantity"
              type="number"
              name="quantity"
              placeholder="Quantity"
              value={formData.quantity || ""} // Make sure to handle undefined values
              onChange={handleChange}
              required
            />
          </div>
          <div className="item">
            <label htmlFor="image">Image</label>
            <input
              id="image"
              type="file"
              name="image"
              onChange={handleImageChange}
            />
          </div>
          <button type="submit">Update</button>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;
