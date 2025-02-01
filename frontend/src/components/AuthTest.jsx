import { useState, useEffect } from "react";
import { API_BASE_URL } from "../config/config";

const AuthTest = () => {
  const [authStatus, setAuthStatus] = useState(null);

  const testAuth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/url/test-cookies`, {
        credentials: "include",
      });
      const data = await response.json();
      console.log("Auth test response:", data);
      setAuthStatus(data);
    } catch (error) {
      console.error("Auth test failed:", error);
      setAuthStatus({ error: error.message });
    }
  };

  useEffect(() => {
    testAuth();
  }, []);

  return (
    <div>
      <h2>Auth Test</h2>
      <pre>{JSON.stringify(authStatus, null, 2)}</pre>
      <button onClick={testAuth}>Test Auth Again</button>
    </div>
  );
};

export default AuthTest;
