import toast from "react-hot-toast";

export const notify = (message, type = "success") => {
  if (type === "success") {
    toast.success(message, {
      style: {
        border: "1px solid #1B48DA",
        padding: "8px 35px",
        color: "#000",
      },
      iconTheme: {
        primary: "#1B48DA",
        secondary: "#FFFAEE",
      },
    });
  } else if (type === "error") {
    toast.error(message, {
      style: {
        border: "1px solid #ff0000",
        padding: "8px 35px",
        color: "#ff0000",
      },
    });
  }
};
