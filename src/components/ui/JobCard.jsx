// components/JobCard.jsx
import React from 'react';

// ... (JSDoc comments omitted for brevity)

const JobCard = ({ job }) => {
    
    // MODIFIED: Added robust type checking and updated formatting.
    const formatSalary = (salary) => {
        // Check if salary is null, undefined, or 0.
        if (salary === null || salary === undefined || salary === 0) {
            return 'Salary Negotiable';
        }

        // 🐛 FIX: Ensure salary is a number before calling .toFixed()
        const numericSalary = Number(salary);
        
        // If conversion results in NaN, treat it as unknown/negotiable
        if (isNaN(numericSalary)) {
            return 'Salary Negotiable';
        }

        // Format the salary without specifying "LPA" or "Lakh"
        // Using Math.round() for a whole number display, but you can keep .toFixed(1) if decimals are needed.
        return `Salary: ${Math.round(numericSalary)}K+ USD Annually`; // Example format
        
        // If you want one decimal point:
        // return `Salary: ${numericSalary.toFixed(1)}K+ Annually`;
    };

    return (
        <div className="bg-white p-4 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start mb-3">
                {/* Company Logo */}
                <div className="w-8 h-8 mr-3 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                    {/* Using first letter as fallback if logo is null/placeholder */}
                    {job.company_logo ? (
                        <img 
                            src={job.company_logo} 
                            alt={`${job.company_name} logo`} 
                            className="w-full h-full object-contain"
                        />
                    ) : (
                        <span className="text-sm font-bold text-red-600">{job.company_name.charAt(0)}</span>
                    )}
                </div>
                
                {/* Job Title and Company */}
                <div>
                    <h3 className="font-semibold text-lg text-gray-800">{job.job_role} - {job.company_name}</h3>
                </div>
            </div>

            {/* Short Description/Summary */}
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {job.summary || job.job_description || 'No summary provided.'}
            </p>

            {/* Tags/Details */}
            <div className="flex flex-wrap gap-2 mb-4 text-xs font-medium">
                {job.job_type && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                        {job.job_type}
                    </span>
                )}
                {job.location && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                        {job.location}
                    </span>
                )}
                {job.work_mode && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full">
                        {job.work_mode}
                    </span>
                )}
                {job.experience_years && (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                        {job.experience_years} Yrs Exp
                    </span>
                )}
            </div>

            {/* Salary and Apply */}
            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <p className="text-sm font-medium text-gray-700">
                    {formatSalary(job.salary_lakh)}
                </p>
                <a 
                    href={job.apply_url || '#'} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition duration-150"
                >
                    Apply Now
                </a>
            </div>
        </div>
    );
};

export default JobCard;