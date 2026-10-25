import { useState, useEffect, useCallback } from "react";
import httpClient from "../httpClient";
import { formatRand, formatWhen, offerStateLabel, totalPay } from "../format";
import "../css/ApplicantViewOffers.css";

function ApplicantViewOffers() {
  const [jobOffers, setJobListings] = useState([]);

  const loadOffers = useCallback(async () => {
    const resp = await httpClient.get("/get_all_offer_listings");
    setJobListings(resp.data);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await loadOffers();
      } catch (error) {
        console.log("Error Receiving Job Listings");
      }
    })();
  }, [loadOffers]);

  const acceptOffer = async (offerId) => {
    try {
      const resp = await httpClient.post("/accept_offer", { id: offerId });
      console.log(resp.data.message);
      alert("You accepted this offer. The employer can now pay it from Ongoing jobs.");
      await loadOffers();
    } catch (error) {
      console.error("Error accepting the offer:", error);
    }
  };

  const rejectOffer = async (offerId) => {
    try {
      const resp = await httpClient.post("/reject_offer", { id: offerId });
      console.log(resp.data.message);
      alert("Offer declined.");
      await loadOffers();
    } catch (error) {
      console.error("Error rejecting the offer:", error);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>JobMatch SA</h1>
        <p>Your Job Offers</p>
      </header>

      <main className="app-main">
        <div className="job-options">
          {jobOffers.length === 0 ? (
            <p className="empty-state">No offers yet. Employers can send one from View Listings.</p>
          ) : null}
          {jobOffers.map((offer) => {
            const waiting = !offer.state || offer.state === "offered";
            return (
              <div className="job-card" key={offer.id}>
                <h2>
                  {offer.job_type} - {offer.location}
                </h2>
                {offer.employer_name ? (
                  <p>
                    <strong>Employer:</strong> {offer.employer_name}
                  </p>
                ) : null}
                {offer.employee_name ? (
                  <p>
                    <strong>Worker:</strong> {offer.employee_name}
                  </p>
                ) : null}
                <p>
                  <strong>Address:</strong> {offer.address}
                </p>
                <p>
                  <strong>Start Date/Time:</strong> {formatWhen(offer.start_date)}
                </p>
                <p>
                  <strong>Pay Per Hour:</strong> {formatRand(offer.pay_per_hour)}
                </p>
                <p>
                  <strong>Hours Per Day:</strong> {offer.hours_per_day}
                </p>
                <p>
                  <strong>Number of Days:</strong> {offer.num_days}
                </p>
                <p>
                  <strong>Total Pay:</strong> {formatRand(totalPay(offer))}
                </p>
                <p>
                  <strong>Status:</strong> {offerStateLabel(offer.state)}
                </p>
                {waiting ? (
                  <div className="offer-actions">
                    <button
                      className="accept-button"
                      onClick={() => acceptOffer(offer.id)}
                    >
                      Accept
                    </button>
                    <button
                      className="reject-button"
                      onClick={() => rejectOffer(offer.id)}
                    >
                      Reject
                    </button>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </main>

      <footer className="footer-nav">
        <div className="nav-icon home"></div>
        <div className="nav-icon search"></div>
        <div className="nav-icon notifications"></div>
        <div className="nav-icon profile"></div>
      </footer>
    </div>
  );
}

export default ApplicantViewOffers;
