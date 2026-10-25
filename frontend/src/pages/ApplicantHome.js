import { useNavigate } from "react-router-dom";
import DemoRoster from "../components/DemoRoster";
import "../css/ApplicantHome.css";

function ApplicantHome() {
  const navigate = useNavigate();

  const handleNavigationCreatePosting = () => {
    navigate("/create_posting");
  };

  const handleNavigationViewOffers = () => {
    navigate("/view_offers");
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
          <div className="job-card">
            <h2>Create a Job Post</h2>
            <p>
              Share your skills and availability to attract potential clients.
            </p>
            <button
              onClick={() => handleNavigationCreatePosting()}
              className="action-button"
            >
              Create Post
            </button>
          </div>

          <div className="job-card">
            <h2>View Job Offers</h2>
            <p>Check and respond to offers from clients.</p>
            <button
              onClick={() => handleNavigationViewOffers()}
              className="action-button"
            >
              View Offers
            </button>
          </div>
        </div>
        <DemoRoster kind="employers" />
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

export default ApplicantHome;
