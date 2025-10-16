"use client";

// This component encapsulates the gradient border and inner layout for all form fields.
export function GradientInput({
  id,
  label,
  children, // Use children to pass <input> or <select>
}) {
  return (
    <div className="h-16 flex items-center p-0.5 rounded-3xl bg-gradient-to-r from-[#1ee3ff] to-[#6f5af8] shadow-md">
      <div className="relative w-full h-full flex items-center bg-white rounded-[1.4rem]">
        <label
          htmlFor={id}
          className="absolute left-4 text-gray-700 text-base font-bold"
        >
          {label}
        </label>
        {/* The actual input/select element is passed as a child */}
        {children}
      </div>
    </div>
  );
}