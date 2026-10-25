import { useState, useEffect, useCallback } from "react";
import httpClient from "../httpClient";
import { formatRand, formatWhen, offerStateLabel, totalPay } from "../format";
import "../css/CustomerOngoingJobs.css";

function CustomerOngoingJobs() {
  const [ongoingJobs, setOngoingJobs] = useState([]);
  const [payingId, setPayingId] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [shownSteps, setShownSteps] = useState(0);

  const loadJobs = useCallback(async () => {
    const resp = await httpClient.get("/get_all_offer_listings");
    setOngoingJobs(
      resp.data.filter(
        (job) => job.state === "ongoing" || job.state === "complete"
      )
    );
  }, []);

  useEffect(() => {
    (async () => {
      try {
        await loadJobs();
      } catch (error) {
        console.log("Error retrieving available job listings");
      }
    })();
  }, [loadJobs]);

  useEffect(() => {
    if (!receipt || !receipt.steps) return undefined;
    setShownSteps(1);
    const total = receipt.steps.length;
    const timer = setInterval(() => {
      setShownSteps((count) => (count >= total ? count : count + 1));
    }, 280);
    const stop = setTimeout(() => clearInterval(timer), total * 280 + 40);
    return () => {
      clearInterval(timer);
      clearTimeout(stop);
    };
  }, [receipt]);

  const handlePayment = async (jobId) => {
    setPayingId(jobId);
    setReceipt(null);
    try {
      const resp = await httpClient.post("/make_payments", { jobId });
      setOngoingJobs((prevJobs) =>
        prevJobs.map((job) =>
          job.id === jobId ? { ...job, state: "complete" } : job
        )
      );
      setReceipt(resp.data);
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.error) ||
        "Payment could not be completed.";
      setReceipt({
        jobId,
        simulated: true,
        success: false,
        message,
        steps: [],
      });
      console.log("Error making payment");
    } finally {
      setPayingId(null);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>JobMatch SA</h1>
        <p>Your Ongoing Jobs</p>
      </header>

      <main className="app-main">
        <div className="job-options">
          {ongoingJobs.length === 0 ? (
            <p className="empty-state">
              No ongoing jobs yet. Accept an offer from the worker side, or pay the seeded clean that is already in progress.
            </p>
          ) : null}
          {ongoingJobs.map((job) => (
            <div
              className={`job-card ${
                job.state === "complete" ? "complete" : "ongoing"
              }`}
              key={job.id}
            >
              <h2>
                {job.job_type} - {job.location}
              </h2>
              {job.employer_name ? (
                <p>
                  <strong>Employer:</strong> {job.employer_name}
                </p>
              ) : null}
              {job.employee_name ? (
                <p>
                  <strong>Worker:</strong> {job.employee_name}
                </p>
              ) : null}
              <p>
                <strong>Address:</strong> {job.address}
              </p>
              <p>
                <strong>Start Date/Time:</strong> {formatWhen(job.start_date)}
              </p>
              <p>
                <strong>Pay Per Hour:</strong> {formatRand(job.pay_per_hour)}
              </p>
              <p>
                <strong>Hours Per Day:</strong> {job.hours_per_day}
              </p>
              <p>
                <strong>Number of Days:</strong> {job.num_days}
              </p>
              <p>
                <strong>Total Pay:</strong> {formatRand(totalPay(job))}
              </p>
              <p>
                <strong>Status:</strong> {offerStateLabel(job.state)}
              </p>

              {job.state === "ongoing" ? (
                <button
                  className="pay-button"
                  onClick={() => handlePayment(job.id)}
                  disabled={payingId === job.id}
                >
                  {payingId === job.id ? "Sending payment…" : "Pay"}
                </button>
              ) : (
                <div className="completed-rectangle">Completed!</div>
              )}

              {receipt && String(receipt.jobId) === String(job.id) ? (
                <div className="payment-receipt" role="status">
                  <p className="payment-receipt-title">{receipt.message}</p>
                  {receipt.success && receipt.amount ? (
                    <p>
                      {receipt.amount.display} from {receipt.sendingWallet.label}{" "}
                      to {receipt.receivingWallet.label}. No live Interledger
                      transfer was made.
                    </p>
                  ) : null}
                  {receipt.steps && receipt.steps.length > 0 ? (
                    <ol>
                      {receipt.steps.slice(0, shownSteps).map((step) => (
                        <li key={step.name}>
                          {step.name}: {step.status}
                          {step.id ? ` (${step.id})` : ""}
                          {step.note ? ` — ${step.note}` : ""}
                        </li>
                      ))}
                    </ol>
                  ) : null}
                </div>
              ) : null}
            </div>
          ))}
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

export default CustomerOngoingJobs;
