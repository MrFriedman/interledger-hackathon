import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFound from "./pages/NotFound";
import ApplicantHome from "./pages/ApplicantHome";
import CreatePosting from "./pages/CreatePosting";
import ApplicantViewOffers from "./pages/ApplicantViewOffers";
import CustomerHome from "./pages/CustomerHome";
import CustomerViewPostings from "./pages/CustomerViewPostings";
import CustomerOngoingJobs from "./pages/CustomerOngoingJobs";
import DemoBanner from "./components/DemoBanner";

import "mdb-react-ui-kit/dist/css/mdb.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

const Router = () => {
  return (
    <BrowserRouter>
      <div className="demo-shell">
      <DemoBanner />
      <Routes>
        <Route path="/" element={<ApplicantHome />} />
        <Route path="/create_posting" element={<CreatePosting />} />
        <Route path="/view_offers" element={<ApplicantViewOffers />} />
        <Route path="/customer_home" element={<CustomerHome />} />
        <Route path="/customer_view" element={<CustomerViewPostings />} />
        <Route
          path="/customer_ongoing_jobs"
          element={<CustomerOngoingJobs />}
        />
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      </div>
    </BrowserRouter>
  );
};

export default Router;
