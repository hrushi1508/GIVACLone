import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <p className="text-8xl font-serif text-giva-pink mb-4">404</p>
      <h1 className="text-3xl font-serif text-giva-dark mb-3">Page Not Found</h1>
      <p className="text-gray-500 mb-8 max-w-md">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="bg-giva-dark text-white px-8 py-3 rounded-xl uppercase tracking-widest text-xs font-bold hover:bg-black transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}
