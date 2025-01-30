import styles from "./ConfirmModal.module.css";

const ConfirmModal = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <p className={styles.message}>{message}</p>
        <div className={styles.buttonGroup}>
          <button
            onClick={onClose}
            className={`${styles.button} ${styles.cancelButton}`}
          >
            No
          </button>
          <button
            onClick={onConfirm}
            className={`${styles.button} ${styles.confirmButton}`}
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
