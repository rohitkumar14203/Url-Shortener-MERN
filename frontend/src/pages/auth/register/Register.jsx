import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { useState } from "react";

import styles from "./Register.module.css";
import front from "../../../assets/front.png";
import Logo from "../../../assets/logo.svg";
import { registerUser } from "../../../api/auth";

const Register = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !password || !confirmPassword || !email) {
      toast.error("Please fill all the inputs");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Password do not match");
      return;
    }

    // if (password.length < 6) {
    //   toast.error("Password must be at least 6 characters long");
    //   return;
    // }
    try {
      await registerUser({
        username: name,
        email,
        phoneNumber: mobile,
        password,
      });

      toast.success("Registration successful");
      navigate("/login");
      setName("");
      setEmail("");
      setMobile("");
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
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
            onClick={() => navigate("/register")}
            className={styles.navButton1}
          >
            SignUp
          </button>
          <button
            onClick={() => navigate("/login")}
            className={styles.navButton}
          >
            Login
          </button>
        </div>

        <div className={styles.loginContainer}>
          <div className={styles.loginBox}>
            <form onSubmit={handleSubmit} className={styles.form}>
              <p className={styles.registerTitle}>Join us Today!</p>
              <div className={styles.inputGroup}>
                <input
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                  }}
                  className={styles.input}
                />
              </div>
              <div className={styles.inputGroup}>
                <input
                  type="email"
                  placeholder="Email id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.input}
                />
              </div>
              <div className={styles.inputGroup}>
                <input
                  type="text"
                  placeholder="Mobile No."
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
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
              <div className={styles.inputGroup}>
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={styles.input}
                />
              </div>
              <button type="submit" className={styles.registerButton}>
                Register
              </button>
              <p className={styles.login}>
                Already have an account? <Link to="/login">Login</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
