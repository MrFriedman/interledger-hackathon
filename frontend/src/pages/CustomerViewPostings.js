import { useState, useEffect } from "react";
import httpClient from "../httpClient";
import { formatRand } from "../format";
import "../css/CustomerViewPostings.css";

function CustomerViewPostings() {
  // Sample job listings (you would fetch this data from the backend)
  const [jobListings, setJobListings] = useState([]);

  // Track the job card that is currently expanded
  const [expandedJobId, setExpandedJobId] = useState(null);

  // Track form data for each job listing
  const [formData, setFormData] = useState({
    address: "18 Avenue Fresnaye",
    startDate: "",
    hoursPerDay: "4",
    numDays: "2",
    jobDescription: "Please can you come scrub this dang stain off!!!",
  });

  // Track the selected filter type
  const [filterType, setFilterType] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const resp = await httpClient.get("/get_all_available_listings");
        setJobListings(resp.data);
        console.log("This is resp.data: ", resp.data);
      } catch (error) {
        console.log("Error retrieving available job listings");
      }
    })();
  }, []);

  // Toggle expanding the card for the selected job
  const toggleExpand = (id) => {
    if (expandedJobId === id) {
      setExpandedJobId(null); // Collapse if already expanded
    } else {
      setExpandedJobId(id); // Expand the selected job
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e, jobId) => {
    e.preventDefault();
    const jobOfferData = {
      job_type: jobListings.find((job) => job.id === jobId).job_type, // Get the job type from the job listings
      location: jobListings.find((job) => job.id === jobId).location, // Get the job location
      pay_per_hour: jobListings.find((job) => job.id === jobId).pay_per_hour, // Get the pay per hour
      applicant_id: jobListings.find((job) => job.id === jobId).applicant_id,
      address: formData.address,
      start_date: formData.startDate,
      hours_per_day: formData.hoursPerDay,
      num_days: formData.numDays,
      job_description: formData.jobDescription,
    };

    try {
      console.log(jobOfferData);
      const response = await httpClient.post(
        "/add_job_listing_offer",
        jobOfferData
      );
      console.log(response.data.message);
      // Optionally, you can reset the form or provide feedback to the user
      setExpandedJobId(null);
      alert("Offer Sent!");
    } catch (error) {
      console.log("Error adding job listing:", error);
    }

    console.log(`Submitting for Job ID ${jobId}`, formData);
  };

  // Filter job listings based on the selected filterType
  const filteredJobListings = jobListings.filter(
    (job) => filterType === "" || job.job_type === filterType
  );

  return (
    <div className="app-container">
      {/* Header Section */}
      <header className="app-header">
        <h1>JobMatch SA</h1>
        <p>View Available Job Postings</p>
      </header>

      {/* Filter Section */}
      <div className="filter-container">
        <label htmlFor="filterType">Filter by Job Type: </label>
        <select
          id="filterType"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="">All Jobs</option>
          <option value="Gardening">Gardening</option>
          <option value="Cleaning">Cleaning</option>
          <option value="Cooking">Cooking</option>
        </select>
      </div>

      {/* Main Action Section */}
      <main className="app-main">
        <div className="job-options">
          {filteredJobListings.map((job) => (
            <div className="job-card" key={job.id}>
              <h2>Offering: {job.job_type}</h2>
              {job.employee_name ? (
                <p className="job-details">
                  <strong>Worker:</strong> {job.employee_name}
                </p>
              ) : null}
              <p className="job-details">
                <strong>Location:</strong> {job.location}
              </p>
              <p className="job-details">
                <strong>Pay Per Hour:</strong> {formatRand(job.pay_per_hour)}
              </p>
              <button
                className="action-button"
                onClick={() => toggleExpand(job.id)}
              >
                {expandedJobId === job.id ? "Hide Details" : "Offer Job"}
              </button>

              {/* Render the form if this job is expanded */}
              {expandedJobId === job.id && (
                <div className="expanded-form">
                  <form onSubmit={(e) => handleSubmit(e, job.id)}>
                    <div className="form-group">
                      <label htmlFor="address">Address</label>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="startDate">Start Date/Time</label>
                      <input
                        type="datetime-local"
                        id="startDate"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="hoursPerDay">Hours Per Day</label>
                      <input
                        type="number"
                        id="hoursPerDay"
                        name="hoursPerDay"
                        value={formData.hoursPerDay}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="numDays">Number of Days</label>
                      <input
                        type="number"
                        id="numDays"
                        name="numDays"
                        value={formData.numDays}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="jobDescription">Job Description</label>
                      <textarea
                        id="jobDescription"
                        name="jobDescription"
                        value={formData.jobDescription}
                        onChange={handleInputChange}
                        required
                      />
                    </div>

                    <button type="submit" className="action-button">
                      Submit Application
                    </button>
                  </form>
                </div>
              )}
            </div>
          ))}
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

export default CustomerViewPostings;
