const NotFoundPage = () => {
  return (
    <div className="not-found-page">
      <div className="not-found-container">
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>
          Sorry, the page you are looking for does not exist or has been moved.
        </p>
        <div className="not-found-actions">
          <Link to="/" className="primary-btn">
            Go Home
          </Link>
          <Link to="/dashboard" className="secondary-btn">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
