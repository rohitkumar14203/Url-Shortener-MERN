import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { getAllUrls } from "../../api/url";
import styles from "./Analytics.module.css";
import dtIcon from "../../assets/dt.png";
import arrowIcon from "../../assets/arrow.svg";
import arrow1Icon from "../../assets/arrow1.svg";

const ITEMS_PER_PAGE = 9;

const Analytics = () => {
  const [visits, setVisits] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  // Reset page when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [visits.length]);

  const fetchVisits = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found - redirecting to login");
        navigate("/login");
        return;
      }

      const response = await getAllUrls();
      if (response.data && response.data.visits) {
        setVisits(response.data.visits);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      if (
        error.message.includes("No authentication token found") ||
        error.message.includes("unauthorized")
      ) {
        navigate("/login");
      } else {
        toast.error(error.message || "Failed to fetch analytics data");
      }
    }
  }, [navigate]);

  useEffect(() => {
    fetchVisits();
    // Set up auto-refresh every 30 seconds
    const intervalId = setInterval(fetchVisits, 30000);
    return () => clearInterval(intervalId);
  }, [fetchVisits]);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (!dateString || isNaN(date.getTime())) return "Invalid Date";

      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Invalid Date";
    }
  };

  // Pagination calculations
  const totalPages = Math.max(Math.ceil(visits.length / ITEMS_PER_PAGE), 1);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedVisits = visits.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // If current page is greater than total pages, reset to last page
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <div className={styles.container}>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>
                <div className={styles.headerCell}>
                  <span>Timestamp</span>
                  <img src={dtIcon} alt="" />
                </div>
              </th>
              <th>Original Link</th>
              <th>Short Link</th>
              <th>IP Address</th>
              <th>Device</th>
            </tr>
          </thead>
          <tbody>
            {paginatedVisits.map((visit) => (
              <tr key={visit._id} className={styles.visitRow}>
                <td>{formatDate(visit.timestamp)}</td>
                <td className={styles.urlCell}>
                  <div className={styles.urlWrapper}>
                    <span>{visit.originalUrl}</span>
                  </div>
                </td>
                <td className={styles.urlCell}>
                  <div className={styles.urlWrapper}>
                    <span>{visit.shortUrl}</span>
                  </div>
                </td>
                <td>{visit.ipAddress}</td>
                <td>
                  <span className={styles.deviceInfo}>{visit.device}</span>
                </td>
              </tr>
            ))}
            {visits.length === 0 && (
              <tr>
                <td colSpan="5" className={styles.noData}>
                  No visits recorded yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={styles.pageButton}
          >
            <img src={arrowIcon} alt="" />
          </button>
          <span className={styles.pageInfo}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className={styles.pageButton}
          >
            <img src={arrow1Icon} alt="" />
          </button>
        </div>
      )}
    </div>
  );
};

export default Analytics;
