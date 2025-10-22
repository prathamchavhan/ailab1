'use client'; 

import React, { useState } from 'react'; 
import { X } from 'lucide-react'; 


const JobDescriptionModal = ({ job, onClose }) => {
  return (

    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4"
      onClick={onClose} 
    >

      <div 
        className="relative bg-white rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()} 
      >
       
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors"
        >
          <X size={24} />
        </button>

        
        <div className="flex items-center mb-4">
          {job.company_logo && (
            <img 
              src={job.company_logo} 
              alt={`${job.company_name} logo`}
              className="w-16 h-16 rounded-lg mr-4 object-contain border" 
            />
          )}
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{job.job_role}</h2>
            <p className="text-lg text-gray-700">{job.company_name}</p>
          </div>
        </div>

      
        <div className="prose prose-sm max-w-none text-gray-800">
          <h3 className="font-semibold text-gray-900">Job Description</h3>
        
          <p className="whitespace-pre-line">{job.job_description || "No description provided."}</p>

          {job.summary && (
            <>
              <h3 className="font-semibold text-gray-900 mt-4">Summary</h3>
              <p className="whitespace-pre-line">{job.summary}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const JobCard = ({ job }) => {
    
   
    const [isModalOpen, setIsModalOpen] = useState(false);
    
  
    const formatSalary = (salary) => {
        if (salary === null || salary === undefined || salary === 0) {
            return 'Salary Negotiable';
        }
        const numericSalary = Number(salary);
        if (isNaN(numericSalary)) {
            return 'Salary Negotiable';
        }
        return `Salary: ₹${numericSalary} LPA`;
    };


    const formatExperience = (exp) => {
        if (exp === 0) return 'Fresher';
        if (exp) return `${exp} Yrs Exp`;
        return null;
    };
    const experienceText = formatExperience(job.experience_years);

    return (

<React.Fragment> 
    <div 
        className="bg-[#F5FDFF] p-3 rounded-xl transition-shadow shadow-[0_4px_6px_-1px_#CBCBCB40] hover:shadow-[0_10px_15px_-3px_#CBCBCB40]"
    >      
     
        <div className="flex items-start justify-between mb-2">
     
            <div className="flex items-start">
                <div className="w-9 h-9 mr-2 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
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
                
                <div>
                    <p className="font-semibold text-[12px] text-[#09407F] leading-tight">
                        {job.job_role || 'No Title Provided'}
                    </p>
                    <p className="text-[9px] text-[#09407F]">
                        {job.company_name || 'Company Name Unavailable'}
                    </p>
                </div>
            </div>

      
            <button 
                onClick={() => setIsModalOpen(true)}
                className="font-medium text-[#006389] hover:underline z-10 flex-shrink-0 ml-2"
                style={{ fontSize: '10px' }} // Using inline style as requested
            >
                Read More
            </button>
        </div>

        
        <p className="text-[12px] text-[#09407F] mb-2.5 line-clamp-2">
            {job.summary || job.job_description || 'No summary provided.'}
        </p>

  
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
            
            {experienceText && (
                <span className="px-1.5 py-0.5 bg-[#D2FDFF] text-[#09407F] rounded-full">
                    {experienceText}
                </span>
            )}
        </div>


        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
            <p className="text-[11px] font-medium text-blue-900">
                {formatSalary(job.salary_lakh)}
            </p>
            <a 
           
                href={job.apply_url || '#'} 
                target="_blank" 
                rel="noopener noreferrer"
                className="!no-underline hover:no-underline px-4 py-1.5 text-[10px] border border-gray-300 font-bold !text-white bg-[#006389] rounded-lg hover:bg-[#006389] transition duration-150 "
            >
                Apply Now
            </a>
        </div>
    </div>

   
    {isModalOpen && (
        <JobDescriptionModal 
            job={job} 
            onClose={() => setIsModalOpen(false)} 
        />
    )}
</React.Fragment>
    );
};

export default JobCard;