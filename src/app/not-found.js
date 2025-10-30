"use client"; // This component needs to be a client component for Link to work efficiently.
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6">
      <div className="text-center bg-gray-800 p-12 rounded-xl shadow-2xl border border-gray-700">
        <h1 className="text-8xl font-extrabold text-[#2DC7DB] mb-4 tracking-wider [text-shadow:0_0_10px_rgba(45,199,219,0.7)]">
          404
        </h1>
        <h2 className="text-4xl font-bold mb-6 text-gray-100">
          Page Not Found
        </h2>
        <p className="text-lg text-gray-400 mb-8 max-w-md mx-auto">
          The link you followed may be broken, or the page may have been removed. 
          Please check the URL or return to the dashboard.
        </p>
        <Link 
          href="/dashboard" 
          className="inline-flex items-center justify-center px-8 py-3 text-base font-medium text-white bg-[#2B7ECF] rounded-lg shadow-lg hover:bg-[#2DC7DB] transition duration-300 transform hover:scale-[1.03] focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}