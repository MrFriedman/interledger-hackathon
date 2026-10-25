import { Link } from "react-router-dom";
import { isDemoMode } from "../httpClient";
import { resetDemoData } from "../demo/store";
import "../css/DemoBanner.css";

function DemoBanner() {
  const reset = () => {
    const confirmed = window.confirm(
      "Reset the demo back to the original sample jobs?"
    );
    if (confirmed) resetDemoData();
  };

  return (
    <header className="demo-banner">
      <a
        className="demo-banner-link"
        href="https://dylanfriedman.co.za"
        target="_blank"
        rel="noopener noreferrer"
      >
        Hackathon demo, Interledger Hackathon 2024
      </a>
      <p className="demo-banner-note">
        Payments on this deploy are simulated.
      </p>
      <nav className="demo-banner-nav" aria-label="Demo">
        <Link to="/">Worker</Link>
        <Link to="/customer_home">Employer</Link>
        {isDemoMode ? (
          <button type="button" onClick={reset}>
            Reset sample data
          </button>
        ) : null}
      </nav>
    </header>
  );
}

export default DemoBanner;
