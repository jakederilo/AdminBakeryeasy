import { FC, useState, useEffect } from "react";
import axios from "axios";
import "./edituser.scss";

interface EditUserProps {
  setOpen: (open: boolean) => void;
  userId: string;
  onEditSuccess: () => void;
}

const EditUser: FC<EditUserProps> = ({ setOpen, userId, onEditSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    authType: "local", // Default to "local" for authType
  });
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Define auth types for dropdown
  const authTypes = [
    { value: "local", label: "Local" },
    { value: "google", label: "Google" },
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5001/users/${userId}`
        );
        const { name, email, authType } = response.data; // Include the relevant fields
        setFormData({ name, email, authType, password: "" }); // Set data for form
      } catch (error) {
        setError("Failed to load user data.");
        console.error("Error fetching user data:", error);
      }
    };
    fetchUserData();
  }, [userId]);

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
    data.append("email", formData.email);
    data.append("authType", formData.authType);
    if (formData.password) data.append("password", formData.password); // Only append if password is set
    if (image) data.append("image", image);

    try {
      await axios.put(`http://localhost:5001/users/${userId}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      onEditSuccess(); // Notify parent component of success
      setOpen(false); // Close the modal
    } catch (err) {
      console.error("Error updating user:", err);
      setError("Failed to update user data.");
    }
  };

  return (
    <div className="modal-overlay" onClick={() => setOpen(false)}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <span className="close" onClick={() => setOpen(false)}>
          &times;
        </span>
        <h1>Edit User</h1>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="item">
            <label htmlFor="name">Full Name</label>
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
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email || ""}
              onChange={handleChange}
              required
            />
          </div>
          <div className="item">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Password (Leave blank to keep current)"
              value={formData.password || ""}
              onChange={handleChange}
            />
          </div>
          <div className="item">
            <label htmlFor="authType">Authentication Type</label>
            <select
              id="authType"
              name="authType"
              value={formData.authType || ""}
              onChange={handleChange}
              required
            >
              {authTypes.map((auth) => (
                <option key={auth.value} value={auth.value}>
                  {auth.label}
                </option>
              ))}
            </select>
          </div>
          <div className="item">
            <label htmlFor="image">Profile Image</label>
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

export default EditUser;
