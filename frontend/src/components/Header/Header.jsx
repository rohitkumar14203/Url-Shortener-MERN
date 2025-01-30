import styles from "./Header.module.css";
import { useAuth } from "../../context/AuthContext";
import { logoutUser } from "../../api/auth";
import { useNavigate, useLocation } from "react-router-dom";
import sunIcon from "../../assets/Header-Icons/sun1.png";
import nightIcon from "../../assets/Header-Icons/night.png";
import eveningIcon from "../../assets/Header-Icons/evening1.png";
import afternoonIcon from "../../assets/Header-Icons/afternoon.png";
import searchIcon from "../../assets/Header-Icons/search.png";
import { useState, useEffect } from "react";
import Modal from "../Modal/Modal";
import { API_BASE_URL } from "../../config/config";
import { notify } from "../../utils/notify";
import PropTypes from "prop-types";

const Header = ({ onLinkCreated, onSearch }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Reset search query when leaving the links page
  useEffect(() => {
    if (location.pathname !== "/link") {
      setSearchQuery("");
    }
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      logout();
      notify("Logged out successfully");
      navigate("/login");
    } catch (error) {
      notify(error.message, "error");
    }
  };

  const handleCreateLink = async (formData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/url/shorten`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create short URL");
      }

      notify("Short URL created successfully");
      setIsModalOpen(false);

      // If we're on the links page, refresh the list
      if (location.pathname === "/link") {
        onLinkCreated && onLinkCreated();
      } else {
        // If we're not on the links page, navigate to it
        navigate("/link");
      }
    } catch (error) {
      notify(error.message, "error");
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (onSearch) {
      onSearch(query);
    }
  };

  const now = new Date();
  const hours = now.getHours();

  // Determine greeting and icon based on the time of day
  let greeting = "Good Morning";
  let greetingIcon = sunIcon;

  if (hours >= 12 && hours < 18) {
    greeting = "Good Afternoon";
    greetingIcon = afternoonIcon;
  } else if (hours >= 18 && hours < 21) {
    greeting = "Good Evening";
    greetingIcon = eveningIcon;
  } else if (hours >= 21 || hours < 6) {
    greeting = "Good Night";
    greetingIcon = nightIcon;
  }

  // Format the date using Intl.DateTimeFormat
  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const parts = dateFormatter.formatToParts(now);
  const weekday = parts.find((part) => part.type === "weekday").value;
  const month = parts.find((part) => part.type === "month").value;
  const day = parts.find((part) => part.type === "day").value;
  const year = parts.find((part) => part.type === "year").value;

  const formattedDate = `${weekday}, ${month} ${day}, ${year}`;

  return (
    <>
      <header className={styles.header}>
        <div className={styles.title}>
          <div className={styles.greeting}>
            <span>
              <img
                src={greetingIcon}
                alt="greeting icon"
                className={styles.greetingIcon}
              />
              {greeting}, {user?.username}
            </span>
          </div>
          <div className={styles.date}>{formattedDate}</div>
        </div>
        <div className={styles.userMenu}>
          <button
            className={styles.createBtn}
            onClick={() => setIsModalOpen(true)}
          >
            + Create New
          </button>
          <div className={styles.searchBar}>
            <img src={searchIcon} className={styles.searchIcon} alt="" />
            <input
              type="text"
              placeholder="Search by remarks"
              className={styles.searchInput}
              value={searchQuery}
              onChange={handleSearch}
              disabled={location.pathname !== "/link"}
            />
          </div>
          <div className={styles.userInitialsContainer}>
            <div
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={styles.userInitials}
            >
              {user?.username
                ?.split(" ")
                .map((name) => name[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </div>
            {isDropdownOpen && (
              <div className={styles.dropdown}>
                <button onClick={handleLogout} className={styles.dropdownItem}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateLink}
      />
    </>
  );
};

Header.propTypes = {
  onLinkCreated: PropTypes.func,
  onSearch: PropTypes.func,
};

export default Header;
