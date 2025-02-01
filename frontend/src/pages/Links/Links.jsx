import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { notify } from "../../utils/notify";
import { useOutletContext, useLocation, useNavigate } from "react-router-dom";
import styles from "./Links.module.css";
import Modal from "../../components/Modal/Modal";
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal";
import dtIcon from "../../assets/dt.png";
import editIcon from "../../assets/edit.png";
import deleteIcon from "../../assets/delete.png";
import copyIcon from "../../assets/copy.png";
import arrowIcon from "../../assets/arrow.svg";
import arrow1Icon from "../../assets/arrow1.svg";
import { API_BASE_URL } from "../../config/config";
import { useAuth } from '../../context/AuthContext';

const ITEMS_PER_PAGE = 9;

const Links = () => {
  const [links, setLinks] = useState([]);
  const [filteredLinks, setFilteredLinks] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { setRefreshCallback } = useOutletContext();
  const location = useLocation();
  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Reset page when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredLinks.length]);

  const fetchLinks = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/url/all`, {
        credentials: "include",
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to fetch links");
      }
      const data = await response.json();
      // Sort links by creation date (newest first)
      const sortedLinks = data.data.urls.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setLinks(sortedLinks);

      // Apply search filter if exists
      const searchQuery = location.state?.searchQuery;
      if (searchQuery) {
        const filtered = sortedLinks.filter((link) => {
          const remarks = (link.remarks || "").toLowerCase();
          return remarks.includes(searchQuery.toLowerCase());
        });
        setFilteredLinks(filtered);
      } else {
        setFilteredLinks(sortedLinks);
      }
    } catch (error) {
      notify(error.message, "error");
    }
  }, [location.state?.searchQuery]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  useEffect(() => {
    setRefreshCallback(() => fetchLinks);
    return () => setRefreshCallback(() => () => {});
  }, [fetchLinks, setRefreshCallback]);

  // Apply search filter when search query changes
  useEffect(() => {
    const searchQuery = location.state?.searchQuery;
    if (searchQuery) {
      const filtered = links.filter((link) => {
        const remarks = (link.remarks || "").toLowerCase();
        return remarks.includes(searchQuery.toLowerCase());
      });
      setFilteredLinks(filtered);
    } else {
      setFilteredLinks(links);
    }
  }, [links, location.state?.searchQuery]);

  const handleEdit = async (link) => {
    setSelectedLink(link);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (link) => {
    setSelectedLink(link);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/url/${selectedLink._id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete link");
      }

      notify("Link deleted successfully");
      fetchLinks();
    } catch (error) {
      notify(error.message, "error");
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedLink(null);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    notify("Link copied to clipboard!");
  };

  const handleUpdate = async (formData) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/url/${selectedLink._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to update link");
      }

      toast.success("Link updated successfully");
      setIsEditModalOpen(false);
      fetchLinks();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";

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
  const totalPages = Math.max(
    Math.ceil(filteredLinks.length / ITEMS_PER_PAGE),
    1
  );
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedLinks = filteredLinks.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

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
                  <span>Date</span>
                  <img src={dtIcon} alt="" />
                </div>
              </th>
              <th>Original Link</th>
              <th>Short Link</th>
              <th>Remarks</th>
              <th>Clicks</th>
              <th>
                <div className={styles.headerCell}>
                  <span>Status</span>
                  <img src={dtIcon} alt="" />
                </div>
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedLinks.map((link) => (
              <tr key={link._id}>
                <td>{formatDate(link.createdAt)}</td>
                <td className={styles.urlCell}>
                  <div className={styles.urlWrapper}>
                    <span>{link.originalUrl}</span>
                    <button
                      className={styles.copyButton}
                      onClick={() => handleCopy(link.originalUrl)}
                    >
                      <img src={copyIcon} alt="Copy" />
                    </button>
                  </div>
                </td>
                <td className={styles.urlCell}>
                  <div className={styles.urlWrapper}>
                    <span>{link.shortUrl}</span>
                    <button
                      className={styles.copyButton}
                      onClick={() => handleCopy(link.shortUrl)}
                    >
                      <img src={copyIcon} alt="Copy" />
                    </button>
                  </div>
                </td>
                <td className={styles.remark}>{link.remarks || "-"}</td>
                <td>{link.clicks || 0}</td>
                <td>
                  <span
                    className={`${styles.status} ${
                      link.status === "active"
                        ? styles.statusActive
                        : styles.statusInactive
                    }`}
                  >
                    {link.status || "active"}
                  </span>
                </td>
                <td>
                  <div className={styles.actions}>
                    <button
                      onClick={() => handleEdit(link)}
                      className={styles.editButton}
                    >
                      <img src={editIcon} alt="Edit" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(link)}
                      className={styles.deleteButton}
                    >
                      <img src={deleteIcon} alt="Delete" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredLinks.length === 0 && (
              <tr>
                <td colSpan="7" className={styles.noData}>
                  No links found
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

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedLink(null);
        }}
        onSubmit={handleUpdate}
        initialData={selectedLink}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedLink(null);
        }}
        onConfirm={handleDelete}
        message=" Are you sure, you want to remove it ? "
      />
    </div>
  );
};

export default Links;
