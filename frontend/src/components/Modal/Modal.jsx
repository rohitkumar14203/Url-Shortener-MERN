import { useState } from "react";
import styles from "./Modal.module.css";
import closeIcon from "../../assets/close.svg";

const Modal = ({ isOpen, onClose, onSubmit, initialData = null }) => {
  const [originalUrl, setOriginalUrl] = useState(
    initialData?.originalUrl || ""
  );
  const [remarks, setRemarks] = useState(initialData?.remarks || "");
  const [enableExpiration, setEnableExpiration] = useState(
    initialData?.expirationDate ? true : false
  );
  const [expirationDate, setExpirationDate] = useState(
    initialData?.expirationDate
      ? new Date(initialData.expirationDate).toISOString().split("T")[0]
      : ""
  );

  const clearAllFields = () => {
    setOriginalUrl("");
    setRemarks("");
    setEnableExpiration(false);
    setExpirationDate("");
  };

  const handleClose = () => {
    clearAllFields();
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    onSubmit({
      originalUrl,
      remarks,
      expirationDate: enableExpiration ? expirationDate : null,
    });
    clearAllFields();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>{initialData ? "Edit Link" : "Create New Link"}</h2>
          <button onClick={handleClose} className={styles.closeButton}>
            <img src={closeIcon} alt="Close" />
          </button>
        </div>
        <form id="linkForm" onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="originalUrl">
              Destination URL <span>*</span>
            </label>
            <input
              type="url"
              id="originalUrl"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              required
              placeholder="https://example.com"
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="remarks">
              Remarks <span>*</span>
            </label>
            <textarea
              id="remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              required
              placeholder="Enter remarks"
              className={styles.input}
              rows={4}
            />
          </div>
          <div className={styles.formGroup}>
            <div className={styles.toggleGroup}>
              <label htmlFor="enableExpiration">Link Expiration</label>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  id="enableExpiration"
                  checked={enableExpiration}
                  onChange={(e) => setEnableExpiration(e.target.checked)}
                />
                <span className={styles.slider}></span>
              </label>
            </div>
            {enableExpiration && (
              <input
                type="date"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className={styles.input}
              />
            )}
          </div>
        </form>
        <div className={styles.buttonGroup}>
          <button
            type="button"
            onClick={clearAllFields}
            className={styles.ClearButton}
          >
            Clear
          </button>
          <button type="submit" form="linkForm" className={styles.submitButton}>
            {initialData ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
