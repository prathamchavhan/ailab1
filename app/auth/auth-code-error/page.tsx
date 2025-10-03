"use client";

export default function AuthCodeError() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-4 text-red-600">Authentication Error</h1>
        <p className="text-center text-gray-700">
          There was an error during the authentication process. Please try again.
        </p>
      </div>
    </div>
  );
}
