import { NavLink } from "react-router-dom";
import { useState } from "react";
import logo from "../../assets/Sidebar-Icons/Icons/Logo2.png";
import styles from "./Sidebar.module.css";

import dashboardIcon from "../../assets/Sidebar-Icons/Icons/dashboardIcons.svg";
import linkIcon from "../../assets/Sidebar-Icons/Icons/linkIcons.svg";
import analyticsIcon from "../../assets/Sidebar-Icons/Icons/analyticsIcons.svg";
import settingIcon from "../../assets/Sidebar-Icons/Icons/settingIcons.svg";

import hovDashboardIcon from "../../assets/Sidebar-Icons/Hover-Icons/hovDashboardIcons.svg";
import hovLinkIcon from "../../assets/Sidebar-Icons/Hover-Icons/hovLinkIcons.svg";
import hovAnalyticsIcon from "../../assets/Sidebar-Icons/Hover-Icons/hovAnalyticsIcons.svg";
import hovSettingIcon from "../../assets/Sidebar-Icons/Hover-Icons/hovSettingIcons.svg";

const Sidebar = () => {
  const [hoveredItem, setHoveredItem] = useState(null);

  return (
    <div className={styles.sidebar}>
      <img src={logo} alt="logo" className={styles.logo} />
      <nav className={styles.nav}>
        <div>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
            onMouseEnter={() => setHoveredItem("dashboard")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <img
              src={
                hoveredItem === "dashboard" ||
                location.pathname === "/dashboard"
                  ? hovDashboardIcon
                  : dashboardIcon
              }
              alt=""
            />
            Dashboard
          </NavLink>
          <NavLink
            to="/link"
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
            onMouseEnter={() => setHoveredItem("link")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <img
              src={
                hoveredItem === "link" || location.pathname === "/link"
                  ? hovLinkIcon
                  : linkIcon
              }
              alt=""
            />
            Links
          </NavLink>
          <NavLink
            to="/analytic"
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
            onMouseEnter={() => setHoveredItem("analytic")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <img
              src={
                hoveredItem === "analytic" || location.pathname === "/analytic"
                  ? hovAnalyticsIcon
                  : analyticsIcon
              }
              alt=""
            />
            Analytics
          </NavLink>
        </div>
        <div className={styles.settingBtn}>
          <NavLink
            to="/setting"
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
            onMouseEnter={() => setHoveredItem("setting")}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <img
              src={
                hoveredItem === "setting" || location.pathname === "/setting"
                  ? hovSettingIcon
                  : settingIcon
              }
              alt=""
            />
            Settings
          </NavLink>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
