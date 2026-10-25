import { useState } from "react";
import httpClient from "../httpClient";
import { useNavigate } from "react-router-dom";
import "../css/CreatePosting.css";

function CreatePosting() {
  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");
  const [payPerHour, setPayPerHour] = useState(0); //int in Rands

  const navigate = useNavigate();

  const navigateHome = () => {
    navigate("/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare data to send
    const jobData = {
      job_type: jobTitle,
      location: location,
      pay_per_hour: payPerHour,
    };

    try {
      // Make POST request to Flask backend
      const response = await httpClient.post("/add_job_listing", jobData);
      console.log("Job listing added with ID:", response.data.id);
      alert("Job listing added!");
    } catch (error) {
      console.error("Error adding job listing:", error);
    }

    setJobTitle("");
    setLocation("");
    setPayPerHour("");
  };

  return (
    <div className="app-container">
      {/* Header Section */}
      <header className="app-header">
        <button onClick={() => navigateHome()} className="home-button">
          Home
        </button>{" "}
        {/* Home Button */}
        <h1>JobMatch SA</h1>
        <p>State your job specification</p>
      </header>

      {/* Form Section */}
      <main className="app-main">
        <div className="form-container">
          <form onSubmit={handleSubmit}>
            {/* Job Type Dropdown */}
            <div className="form-group">
              <label htmlFor="jobTitle">Job Type</label>
              <select
                id="jobTitle"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                required
              >
                <option value="">Select Job Type</option>
                <option value="Gardening">Gardening</option>
                <option value="Cleaning">Cleaning</option>
                <option value="Cooking">Cooking</option>
              </select>
            </div>

            {/* Location Dropdown */}
            <div className="form-group">
              <label htmlFor="location">Location</label>
              <select
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              >
                <option value="">Select Location</option>
                <option value="Cape Town">Cape Town</option>
                <option value="Johannesburg">Johannesburg</option>
                <option value="Durban">Durban</option>
              </select>
            </div>

            {/* Pay Per Hour */}
            <div className="form-group">
              <label htmlFor="payPerHour">Pay Per Hour (R)</label>
              <input
                type="number"
                id="payPerHour"
                value={payPerHour}
                onChange={(e) => setPayPerHour(e.target.value)}
                required
              />
            </div>

            {/* Submit Button */}
            <button type="submit" className="action-button">
              Submit
            </button>
          </form>
        </div>
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

export default CreatePosting;
