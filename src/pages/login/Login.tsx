import { Link, Navigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import "./login.scss";
import { useAuth } from "../../components/AuthContext";
import ReCAPTCHA from "react-google-recaptcha";

const Login: React.FC = () => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const { login, isAuthenticated } = useAuth();

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleCaptchaChange = (token: string | null) => {
    setCaptchaToken(token); // Store the CAPTCHA token
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");

    if (!name || !password || !captchaToken) {
      setErrorMessage("All fields and CAPTCHA verification are required.");
      return;
    }

    try {
      const result = await axios.post("http://localhost:5001/login", {
        name,
        password,
        captchaToken,
      });

      if (result.data.token && result.data.user) {
        // Pass both token and user object to login
        login(result.data.token, result.data.user);
      } else {
        setErrorMessage("Invalid credentials");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Invalid credentials");
    }
  };

  const handleChange =
    (setter: React.Dispatch<React.SetStateAction<string>>) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setter(e.target.value);

  return (
    <div className="login-overlay">
      <div className="login-card">
        <section className="login-header">
          <h1>Login</h1>
          {errorMessage && (
            <p className={`errormsg ${errorMessage ? "errormsg-visible" : ""}`}>
              {errorMessage}
            </p>
          )}
        </section>

        <form className="login-form" onSubmit={handleSubmit}>
          <input
            type="name"
            name="name"
            placeholder="Name"
            value={name}
            onChange={handleChange(setName)}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={handleChange(setPassword)}
            required
          />
          <div className="recaptcha-container">
            <ReCAPTCHA
              sitekey="6LcsfcUqAAAAAMHnVZ0lo7OmS7QiNdL7uc92tr0f"
              onChange={handleCaptchaChange}
              className="justify-center items-center pb-5 pl-2"
            />
          </div>
          <button
            disabled={!captchaToken}
            type="submit"
            className="submit-button"
          >
            Login
          </button>
          <div className="signup-link">
            <Link to={"/signup"}>Sign Up</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
