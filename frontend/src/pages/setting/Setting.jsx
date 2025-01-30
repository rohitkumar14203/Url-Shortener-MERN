import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import styles from "./Setting.module.css";
import { useAuth } from "../../context/AuthContext";
import { updateUser, deleteUser } from "../../api/auth";
import ConfirmModal from "../../components/ConfirmModal/ConfirmModal";

const Setting = () => {
  const navigate = useNavigate();
  const { user, logout, updateUserContext } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");

  // Populate the form fields with user data on component mount
  useEffect(() => {
    if (user) {
      setName(user.username || "");
      setEmail(user.email || "");
      setMobile(user.phoneNumber || "");
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updatedUser = await updateUser({
        username: name,
        email,
        phoneNumber: mobile,
      });
      updateUserContext(updatedUser); // Update global user context
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await deleteUser();
      logout(); // Clear the auth context
      toast.success("Account deleted successfully");
      navigate("/login");
    } catch (error) {
      toast.error(error.message || "Failed to delete account");
    } finally {
      setIsLoading(false);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className={styles.settingsContainer}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="name">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="mobile">Mobile</label>
          <input
            type="tel"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <div className={styles.buttonGroup}>
          <button
            type="submit"
            className={styles.saveButton}
            disabled={isLoading}
          >
            Save Changes
          </button>
          <button
            type="button"
            className={styles.deleteButton}
            onClick={handleDeleteClick}
            disabled={isLoading}
          >
            Delete Account
          </button>
        </div>
      </form>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        message="Are you sure, you want to delete the account ?"
      />
    </div>
  );
};

export default Setting;
