import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Page not found</h1>
        <p>
          <Link to="/">Back to JobMatch SA</Link>
        </p>
      </header>
    </div>
  );
}

export default NotFound;
