import { Link, useLocation } from "react-router-dom";
import styles from "./Navbar.module.css";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className={`${styles.navbar} ${isMenuOpen ? styles.open : ""}`}>
      <div className={styles.navContent}>
        <Link to="/" className={styles.logo} onClick={closeMenu}>
          URL Shortener
        </Link>

        <button
          className={styles.mobileMenuButton}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span className={styles.mobileMenuIcon}></span>
        </button>

        <div className={styles.navLinks}>
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className={`${styles.navLink} ${
                  location.pathname === "/dashboard" ? styles.activeLink : ""
                }`}
                onClick={closeMenu}
              >
                Dashboard
              </Link>
              <Link
                to="/setting"
                className={`${styles.navLink} ${
                  location.pathname === "/setting" ? styles.activeLink : ""
                }`}
                onClick={closeMenu}
              >
                Settings
              </Link>
              <Link
                to="/"
                className={styles.navLink}
                onClick={() => {
                  logout();
                  closeMenu();
                }}
              >
                Logout
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`${styles.navLink} ${
                  location.pathname === "/login" ? styles.activeLink : ""
                }`}
                onClick={closeMenu}
              >
                Login
              </Link>
              <Link
                to="/register"
                className={`${styles.navLink} ${
                  location.pathname === "/register" ? styles.activeLink : ""
                }`}
                onClick={closeMenu}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
