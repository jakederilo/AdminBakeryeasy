import { FC, useState } from "react";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import "./adduser.scss"; // Add your own CSS file

interface AddUserProps {
  setOpen: (open: boolean) => void;
}

const AddUser: FC<AddUserProps> = ({ setOpen }) => {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    authType: "local", // Default to local authentication
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
    data.append("name", formData.name);
    data.append("email", formData.email);
    data.append("password", formData.password);
    data.append("authType", formData.authType);
    if (image) data.append("image", image);

    try {
      await axios.post("http://localhost:5001/users", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setOpen(false);
      queryClient.invalidateQueries(["users"]); // Invalidate the users query to update the data
    } catch (err) {
      console.error("Error creating user:", err);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => setOpen(false)}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <span className="close" onClick={() => setOpen(false)}>
          &times;
        </span>
        <h1>Add New User</h1>
        <form onSubmit={handleSubmit}>
          <div className="item">
            <label>Name</label>
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="item">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="item">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <div className="item">
            <label>Authentication Type</label>
            <select
              name="authType"
              value={formData.authType}
              onChange={handleChange}
              required
            >
              <option value="local">Local</option>
              <option value="google">Google</option>
            </select>
          </div>

          <div className="item">
            <label>Profile Image</label>
            <input type="file" name="image" onChange={handleImageChange} />
          </div>

          <button type="submit">Create User</button>
        </form>
      </div>
    </div>
  );
};

export default AddUser;
