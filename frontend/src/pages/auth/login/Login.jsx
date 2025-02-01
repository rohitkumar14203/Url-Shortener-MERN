import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";

import styles from "./Login.module.css";
import front from "../../../assets/front.png";
import Logo from "../../../assets/logo.svg";
import { loginUser } from "../../../api/auth";
import { useAuth } from "../../../context/AuthContext";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill all the inputs");
      return;
    }

    try {
      const data = await login({
        email: email,
        password: password,
      });
      console.log("Login successful:", data);
      navigate("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
      toast.error(error.message);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.leftSection}>
        <img src={Logo} alt="Logo" className={styles.logo} />
        <img src={front} alt="" className={styles.frontImage} />
      </div>

      <div className={styles.rightSection}>
        <div className={styles.navButtons}>
          <button
            onClick={() => {
              navigate("/register");
            }}
            className={styles.navButton1}
          >
            SignUp
          </button>
          <button
            onClick={() => {
              navigate("/login");
            }}
            className={styles.navButton}
          >
            Login
          </button>
        </div>

        <div className={styles.loginContainer}>
          <p className={styles.loginTitle}>Login</p>
          <div className={styles.loginBox}>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.input}
                />
              </div>
              <div className={styles.inputGroup}>
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={styles.input}
                />
              </div>
              <button type="submit" className={styles.loginButton}>
                Login
              </button>
              <p className={styles.signup}>
                Don't have an account? <Link to="/register">SignUp</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
