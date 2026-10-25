import { useNavigate } from "react-router-dom";
import DemoRoster from "../components/DemoRoster";
import "../css/CreatePosting.css";

function CustomerHome() {
  const navigate = useNavigate();

  const handleNavigationCustomerAvailablePostings = () => {
    navigate("/customer_view");
  };

  const handleNavigationCustomerOngoingJobs = () => {
    navigate("/customer_ongoing_jobs");
  };
  return (
    <div className="app-container">
      {/* Header Section */}
      <header className="app-header">
        <h1>JobMatch SA</h1>
        <p>Your Personal Job Assistant</p>
      </header>

      {/* Main Action Section */}
      <main className="app-main">
        <div className="job-options">
          {/* View Listings Card */}
          <div className="job-card">
            <h2>View Listings</h2>
            <p>Explore available job applicants and their skills.</p>
            <button
              onClick={() => handleNavigationCustomerAvailablePostings()}
              className="action-button"
            >
              View Available Listings
            </button>
          </div>

          {/* View Ongoing Listings Card */}
          <div className="job-card">
            <h2>View Ongoing Listings</h2>
            <p>Track and manage ongoing job listings.</p>
            <button
              onClick={() => handleNavigationCustomerOngoingJobs()}
              className="action-button"
            >
              View Ongoing Listings
            </button>
          </div>
        </div>
        <DemoRoster kind="employees" />
      </main>

      {/* Footer Navigation */}
      <footer className="footer-nav">
        <div className="nav-icon home"></div>
        <div className="nav-icon search"></div>
        <div className="nav-icon notifications"></div>
        <div className="nav-icon profile"></div>
      </footer>
    </div>
  );
}

export default CustomerHome;
