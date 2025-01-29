import "./signup.scss";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL;

const SignUp = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(""); // State to store success message
  const [errorMessage, setErrorMessage] = useState(""); // State to store error message

  const handleClick = () => {
    navigate("/login");
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    try {
      const result = await axios.post(`${apiUrl}/register`, {
        name,
        email,
        password,
      });
      console.log(result);
      setMessage("User Created Successfully!");
      setErrorMessage(""); // Clear error message on success
      // Clear the input fields after success
      setName("");
      setEmail("");
      setPassword("");
    } catch (e: any) {
      console.log(e);
      if (e.response && e.response.data) {
        setErrorMessage(e.response.data.message || "User already exists.");
      } else {
        setErrorMessage("An error occurred. Please try again.");
      }
    }
  };
  return (
    <div className="login-overlay">
      <div className="login-card">
        <section className="login-header">
          <h1>Sign Up</h1>
          {message && (
            <p className="text-center text-green-600">{message}</p> // Conditionally rendering success message
          )}
          {errorMessage && (
            <p className={`errormsg ${errorMessage ? "errormsg-visible" : ""}`}>
              {errorMessage}
            </p>
          )}
        </section>
        <form className="login-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Name"
            autoComplete="off"
            name="name"
            value={name} // Controlled input
            onChange={(e) => setName(e.target.value)}
            required // Make it required
          />
          <input
            type="email"
            placeholder="Email"
            autoComplete="off"
            name="email"
            value={email} // Controlled input
            onChange={(e) => setEmail(e.target.value)}
            required // Make it required
            className="mb-4 w-full border rounded-lg p-2"
          />
          <input
            type="password"
            placeholder="Password"
            autoComplete="off"
            name="password"
            value={password} // Controlled input
            onChange={(e) => setPassword(e.target.value)}
            required // Make it required
            className="mb-4 w-full border rounded-lg p-2"
          />
          <button className="submit-button" type="submit">
            Sign Up
          </button>

          <div className="signup-link" onClick={handleClick}>
            Already have an account? Login
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
