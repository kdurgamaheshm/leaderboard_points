import React, { useState, useEffect, useRef } from "react";
import "./App.css";

const API_BASE = "http://localhost:5000/api";

const tabs = ["e Ranking", "Hourly Ranking", "Family Ranking", "Wealth Ranking"];
const subTabs = {
  "e Ranking": ["Daily", "Monthly"],
  "Hourly Ranking": ["Hourly Live List", "Hourly Party List"],
  "Family Ranking": ["Weekly Contribution Ranking", "Weekly Charm Ranking"],
  "Wealth Ranking": ["Daily", "Monthly"],
};

function App() {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [claimPoints, setClaimPoints] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [activeSubTab, setActiveSubTab] = useState(subTabs[tabs[0]][0]);

  // useRef to hold interval ID for polling
  const pollingIntervalRef = useRef(null);

  // Fetch users from backend
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/users`);
      const data = await res.json();
      setUsers(data);
      // Set default selected user if none selected
      if (!selectedUserId && data.length > 0) {
        setSelectedUserId(data[0]._id);
      }
    } catch (err) {
      setError("Failed to fetch users");
    }
  };

  useEffect(() => {
    fetchUsers();

    // Set up polling every 5 seconds to refresh leaderboard
    pollingIntervalRef.current = setInterval(() => {
      fetchUsers();
    }, 5000);

    // Cleanup interval on unmount
    return () => {
      clearInterval(pollingIntervalRef.current);
    };
  }, []);

  // Add new user
  const addUser = async () => {
    if (!newUserName.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newUserName.trim() }),
      });
      if (!res.ok) {
        const errData = await res.json();
        setError(errData.msg || "Failed to add user");
      } else {
        setNewUserName("");
        await fetchUsers();
      }
    } catch (err) {
      setError("Failed to add user");
    }
    setLoading(false);
  };

  // Claim points for selected user
  const claimPointsForUser = async () => {
    if (!selectedUserId) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUserId }),
      });
      if (!res.ok) {
        const errData = await res.json();
        setError(errData.msg || "Failed to claim points");
      } else {
        const data = await res.json();
        setClaimPoints(data.points);
        // Refresh users after claim to update leaderboard
        await fetchUsers();
      }
    } catch (err) {
      setError("Failed to claim points");
    }
    setLoading(false);
  };

  return (
    <div className="app-container">
      {/* Header with tabs and help button */}
      <header className="app-header">
        <button className="back-button">←</button>
        <nav className="main-tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`tab-button ${activeTab === tab ? "active" : ""}`}
              onClick={() => {
                setActiveTab(tab);
                setActiveSubTab(subTabs[tab][0]);
              }}
            >
              {tab}
            </button>
          ))}
        </nav>
        <button className="help-button">?</button>
      </header>

      {/* Sub-tabs */}
      <div className="sub-tabs">
        {subTabs[activeTab].map((subTab) => (
          <button
            key={subTab}
            className={`sub-tab-button ${activeSubTab === subTab ? "active" : ""}`}
            onClick={() => setActiveSubTab(subTab)}
          >
            {subTab}
          </button>
        ))}
      </div>

      {/* Settlement timer and rewards button */}
      <div className="settlement-timer">
        Settlement time 14 days 01:45:47
        <button className="rewards-button">🎁 Rewards</button>
      </div>

      {/* Leaderboard display */}
      <div className="leaderboard-container">
        {/* Top 3 users */}
        <div className="top-three">
          {users.slice(0, 3).map((user, index) => (
            <div key={user._id} className={`top-user rank-${index + 1}`}>
              <div className="rank-badge">{index + 1}</div>
              <div className="user-avatar">
                <img
                  src={`https://i.pravatar.cc/150?img=${index + 1}`}
                  alt={user.name}
                />
              </div>
              <div className="user-name">{user.name}</div>
              <div className="user-points">{user.totalPoints.toLocaleString()}</div>
            </div>
          ))}
        </div>

        {/* Other users */}
        <div className="other-users">
          {users.slice(3).map((user, index) => (
            <div key={user._id} className="user-row">
              <div className="user-rank">{index + 4}</div>
              <div className="user-avatar">
                <img
                  src={`https://i.pravatar.cc/150?img=${(index + 4) % 70}`}
                  alt={user.name}
                />
              </div>
              <div className="user-name">{user.name}</div>
              <div className="user-points">{user.totalPoints.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Claim points section */}
      <div className="claim-section">
        <div className="user-selection">
          <label htmlFor="userSelect">Select User:</label>
          <select
            id="userSelect"
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
          >
            {users.map((user) => (
              <option key={user._id} value={user._id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>

        <div className="add-user">
          <input
            type="text"
            placeholder="Add new user"
            value={newUserName}
            onChange={(e) => setNewUserName(e.target.value)}
            disabled={loading}
          />
          <button onClick={addUser} disabled={loading}>
            Add User
          </button>
        </div>

        <button
          className="claim-button"
          onClick={claimPointsForUser}
          disabled={loading || !selectedUserId}
        >
          Claim Points
        </button>

        {/* Display claimed points message */}
        {claimPoints !== null && (
          <div className="claim-points-message">
            You claimed {claimPoints} point{claimPoints > 1 ? "s" : ""}
          </div>
        )}

        {/* Display error message */}
        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
}

export default App;
