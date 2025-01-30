import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar/Sidebar";
import Header from "../components/Header/Header";
import styles from "./Layout.module.css";
import { useState, useCallback } from "react";

const Layout = () => {
  const location = useLocation();
  const isLinksPage = location.pathname === "/link";
  const [refreshCallback, setRefreshCallback] = useState(() => () => {});
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleRefresh = useCallback(() => {
    refreshCallback();
  }, [refreshCallback]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    navigate("/link", { state: { searchQuery: query } });
  };

  return (
    <div className={styles.layout}>
      <Sidebar />
      <div className={styles.mainContent}>
        <Header
          onLinkCreated={isLinksPage ? handleRefresh : undefined}
          onSearch={handleSearch}
        />
        <main className={styles.content}>
          <Outlet context={{ setRefreshCallback, searchQuery }} />
        </main>
      </div>
    </div>
  );
};

export default Layout;
