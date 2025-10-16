// components/JobCard.jsx
import React from 'react';

const JobCard = ({ job }) => {
    
    const formatSalary = (salary) => {
        if (salary === null || salary === undefined || salary === 0) {
            return 'Salary Negotiable';
        }
        const numericSalary = Number(salary);
        if (isNaN(numericSalary)) {
            return 'Salary Negotiable';
        }
        // Assuming salary is in Lakhs and converting to K+ USD Annually for display consistency
        // This conversion logic might need adjustment based on your actual data
        return `Salary: $${Math.round(numericSalary * 1.2)}K+ Annually`; // Example conversion
    };

    return (
<div 
    className="bg-[#F5FDFF] p-3  rounded-xl transition-shadow shadow-[0_4px_6px_-1px_#CBCBCB40] hover:shadow-[0_10px_15px_-3px_#CBCBCB40]"
>      <div className="flex items-start mb-2">
                {/* Company Logo */}
                <div className="w-9 h-9 mr-2 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                    {job.company_logo ? (
                        <img 
                            src={job.company_logo} 
                            alt={`${job.company_name || 'Company'} logo`}
                            className="w-full h-full object-contain"
                        />
                    ) : (
                        <span className="text-[15px] font-bold text-red-600">
                            {(job.company_name || 'C').charAt(0)}
                        </span>
                    )}
                </div>
                
                {/* Job Title and Company */}
                <div>
                    {/* MODIFIED: Further reduced font sizes */}
                    <p className="font-semibold text-[12px] text-[#09407F] leading-tight">
                        {job.job_role || 'No Title Provided'}
                    </p>
                    <p className="text-[9px] text-[#09407F]">
                        {job.company_name || 'Company Name Unavailable'}
                    </p>
                </div>
            </div>

            {/* Short Description/Summary */}
            {/* MODIFIED: Reduced font size */}
            <p className="text-[12px] text-[#09407F] mb-2.5 line-clamp-2">
                {job.summary || job.job_description || 'No summary provided.'}
            </p>

            {/* Tags/Details */}
            {/* MODIFIED: Reduced font size and padding */}
            <div className="flex flex-wrap gap-1 mb-3 text-[10px] font-medium">
                {job.job_type && (
                    <span className="px-1.5 py-0.5 bg-[#D2FDFF] text-[#09407F] rounded-full">
                        {job.job_type}
                    </span>
                )}
                {job.location && (
                    <span className="px-1.5 py-0.5 bg-[#D2FDFF] text-[#09407F] rounded-full">
                        {job.location}
                    </span>
                )}
                {job.work_mode && (
                    <span className="px-1.5 py-0.5 bg-[#D2FDFF] text-[#09407F] rounded-full">
                        {job.work_mode}
                    </span>
                )}
                {job.experience_years && (
                    <span className="px-1.5 py-0.5 bg-[#D2FDFF] text-[#09407F] rounded-full">
                        {job.experience_years} Yrs Exp
                    </span>
                )}
            </div>

            {/* Salary and Apply */}
            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                {/* MODIFIED: Reduced font size */}
                <p className="text-[11px] font-medium text-blue-900">
                    {formatSalary(job.salary_lakh)}
                </p>
                <a 
    href="https://hyreso.com/" 
    target="_blank" 
    rel="noopener noreferrer"
    // MODIFIED: Updated for image-like styling
    className="!no-underline hover:no-underline px-4 py-1.5 text-[10px] border border-gray-300 font-bold !text-white bg-[#006389] rounded-lg hover:bg-[#006389] transition duration-150 "
>
    Apply Now
</a>
            </div>
        </div>
    );
};

export default JobCard;