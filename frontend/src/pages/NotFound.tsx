import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary-600 dark:text-primary-400">404</h1>
        <p className="text-2xl font-semibold mt-4 text-gray-900 dark:text-gray-100">Page Not Found</p>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          The page you're looking for doesn't exist.
        </p>
        <Link to="/" className="btn btn-primary mt-6 inline-block">
          Go Home
        </Link>
      </div>
    </div>
  );
}
