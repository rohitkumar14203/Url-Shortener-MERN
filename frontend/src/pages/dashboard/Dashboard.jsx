import { useState, useEffect, useCallback } from "react";
import { notify } from "../../utils/notify";
import styles from "./Dashboard.module.css";
import { API_BASE_URL } from "../../config/config";

const Dashboard = () => {
  const [links, setLinks] = useState([]);
  const [clicksByDate, setClicksByDate] = useState({});
  const [deviceStats, setDeviceStats] = useState({});
  const [totalClicks, setTotalClicks] = useState(0);

  const fetchLinks = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/url/all`, {
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to fetch links");
      }
      const data = await response.json();

      // Get URLs and visits from the response
      const { urls, visits } = data.data;

      // Sort URLs by creation date (newest first)
      const sortedUrls = urls.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setLinks(sortedUrls);
      processClickData(sortedUrls, visits);
    } catch (error) {
      notify(error.message, "error");
    }
  }, []);

  const processClickData = (urlsData, visitsData) => {
    let clicksPerDate = {};
    let deviceCounts = {};
    let total = 0;

    // Process total clicks from URLs
    urlsData.forEach((url) => {
      total += url.clicks || 0;
    });

    // Process visit details
    visitsData.forEach((visit) => {
      // Process date statistics
      const date = new Date(visit.timestamp).toLocaleDateString();
      clicksPerDate[date] = (clicksPerDate[date] || 0) + 1;

      // Process device statistics
      const device = visit.device || "Other";
      deviceCounts[device] = (deviceCounts[device] || 0) + 1;
    });

    // Calculate cumulative clicks
    const sortedDates = Object.keys(clicksPerDate).sort(
      (a, b) => new Date(a) - new Date(b)
    );

    let cumulativeClicks = {};
    let runningTotal = 0;

    sortedDates.forEach((date) => {
      runningTotal += clicksPerDate[date];
      cumulativeClicks[date] = runningTotal;
    });

    setTotalClicks(total);
    setClicksByDate(cumulativeClicks);
    setDeviceStats(deviceCounts);
  };

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  // Get the maximum value for scaling the bars
  const maxDateClicks = Math.max(...Object.values(clicksByDate), 1);
  const maxDeviceClicks = Math.max(...Object.values(deviceStats), 1);

  return (
    <div className={styles.container}>
      <div className={styles.totalClicks}>
        <h2>Total Clicks: {totalClicks}</h2>
      </div>

      <div className={styles.chartsContainer}>
        {/* Clicks by Date Chart */}
        <div className={styles.chartBox}>
          <h3>Date-wise Clicks</h3>
          <div className={styles.chart}>
            {Object.entries(clicksByDate)
              .sort((a, b) => new Date(b[0]) - new Date(a[0]))
              .slice(0, 7)
              .map(([date, clicks]) => (
                <div key={date} className={styles.barGroup}>
                  <div className={styles.barLabel}>{date}</div>
                  <div className={styles.barWrapper}>
                    <div
                      className={styles.bar}
                      style={{
                        width: `${(clicks / maxDateClicks) * 100}%`,
                      }}
                    />
                  </div>
                  <div className={styles.barCount}>{clicks}</div>
                </div>
              ))}
          </div>
        </div>

        {/* Device Stats Chart */}
        <div className={styles.chartBox}>
          <h3>Clicks by Device</h3>
          <div className={styles.chart}>
            {Object.entries(deviceStats).map(([device, clicks]) => (
              <div key={device} className={styles.barGroup}>
                <div className={styles.barLabel}>{device}</div>
                <div className={styles.barWrapper}>
                  <div
                    className={styles.bar}
                    style={{
                      width: `${(clicks / maxDeviceClicks) * 100}%`,
                    }}
                  />
                </div>
                <div className={styles.barCount}>{clicks}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
