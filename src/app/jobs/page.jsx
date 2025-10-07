'use client'

import React, { useState, useMemo, useRef, useEffect } from 'react';
import JobCard from '../../components/ui/JobCard'; // Assuming JobCard.jsx is in the same directory or imported correctly
import { FaSortAlphaUp, FaSortAmountUp, FaSortAmountDown } from 'react-icons/fa'; // Icons for visual indicators

// --- Mock Job Data (Matches UI) ---
const MOCK_JOBS = [
    { id: 1, company_name: "Netflix", company_logo: null, job_role: "UI/UX Designer", summary: "Description (short): Sets a high bar for design, usability, and visual aesthetics in UI. Responsible for developing highly usable...", salary_lakh: "12-14", work_mode: "Remote", job_type: "Full Time", location: "Design", apply_url: "#" },
    { id: 2, company_name: "Motto", company_logo: null, job_role: "Product Designer", summary: "Description (short): Sets a high bar for design, usability, and visual aesthetics in UI. Responsible for developing highly usable...", salary_lakh: "12-14", work_mode: "Remote", job_type: "Full Time", location: "Design", apply_url: "#" },
    { id: 3, company_name: "SideQuestVR", company_logo: null, job_role: "UI/UX Designer", summary: "Description (short): Sets a high bar for design, usability, and visual aesthetics in UI. Responsible for developing highly usable...", salary_lakh: "12-14", work_mode: "Remote", job_type: "Full Time", location: "Design", apply_url: "#" },
    { id: 4, company_name: "Triple Whale", company_logo: null, job_role: "UXA Designer", summary: "Description (short): Sets a high bar for design, usability, and visual aesthetics in UI. Responsible for developing highly usable...", salary_lakh: "12-14", work_mode: "Remote", job_type: "Full Time", location: "Design", apply_url: "#" },
    { id: 5, company_name: "Brooksource", company_logo: null, job_role: "UI/UX Designer", summary: "Description (short): Sets a high bar for design, usability, and visual aesthetics in UI. Responsible for developing highly usable...", salary_lakh: "12-14", work_mode: "Remote", job_type: "Full Time", location: "Design", apply_url: "#" },
    { id: 6, company_name: "Netflix", company_logo: null, job_role: "UI/UX Designer", summary: "Description (short): Sets a high bar for design, usability, and visual aesthetics in UI. Responsible for developing highly usable...", salary_lakh: "12-14", work_mode: "Remote", job_type: "Full Time", location: "Design", apply_url: "#" },
    { id: 7, company_name: "Netflix", company_logo: null, job_role: "UI/UX Designer", summary: "Description (short): Sets a high bar for design, usability, and visual aesthetics in UI. Responsible for developing highly usable...", salary_lakh: "12-14", work_mode: "Remote", job_type: "Full Time", location: "Design", apply_url: "#" },
];

// --- Dropdown Options (Matching image_507d71.png) ---
const SORT_OPTIONS = [
    { label: 'Most Recent', value: 'recent', icon: FaSortAmountUp },
    { label: 'Salary: High to Low', value: 'salary_desc', icon: FaSortAmountDown },
    { label: 'Salary: Low to High', value: 'salary_asc', icon: FaSortAmountUp },
    { label: 'Company Name (A-Z)', value: 'company_asc', icon: FaSortAlphaUp },
    { label: 'Company Name (Z-A)', value: 'company_desc', icon: FaSortAlphaUp },
];

/**
 * Parses a salary string (e.g., "12-14") to a numerical value for sorting.
 * Uses the low end for consistent sorting.
 */
const parseSalaryForSort = (salary_lakh) => {
    if (!salary_lakh) return 0;
    const parts = salary_lakh.toString().split('-').map(Number);
    return parts[0] || 0;
};

// --- Sort Dropdown Component ---
const SortByDropdown = ({ selectedSort, onSelectSort }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    const activeOption = SORT_OPTIONS.find(opt => opt.value === selectedSort) || SORT_OPTIONS[0];

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex justify-center items-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
                style={{ backgroundColor: '#E0F7FA', color: '#00A1F0', borderColor: '#00A1F0' }} // Matching the blue button style
            >
                Sort by
                <activeOption.icon className="ml-2 -mr-1 h-4 w-4" />
            </button>

            {isOpen && (
                <div
                    className="origin-top-right absolute right-0 mt-2 w-64 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 overflow-hidden"
                    style={{ minWidth: '200px' }} // Adjust width to match the visual
                >
                    <div className="py-1">
                        {/* Header mimicking the image */}
                        <div className="flex items-center px-4 py-2 text-sm font-bold text-gray-700 border-b border-gray-100">
                            <span>Sort by</span>
                            <FaSortAmountUp className="ml-auto h-4 w-4 text-gray-500" />
                        </div>

                        {SORT_OPTIONS.map((option) => (
                            <div
                                key={option.value}
                                onClick={() => {
                                    onSelectSort(option.value);
                                    setIsOpen(false);
                                }}
                                className={`flex items-center px-4 py-3 text-sm cursor-pointer transition duration-150 ${
                                    selectedSort === option.value
                                        ? 'bg-blue-100 text-blue-800 font-semibold' // Active style
                                        : 'text-gray-900 hover:bg-gray-50' // Inactive style
                                }`}
                                style={selectedSort === option.value ? { backgroundColor: '#E0F7FA', color: '#00A1F0' } : {}} // Match exact light blue for active
                            >
                                {option.label}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};


// --- Main Page Component (No Sidebar or Header) ---
export default function JobsPage() {
    const [jobs, setJobs] = useState(MOCK_JOBS);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSort, setSelectedSort] = useState(SORT_OPTIONS[0].value); // 'recent'
    const [filterActive, setFilterActive] = useState(false); // Placeholder for a filter state

    const sortedAndFilteredJobs = useMemo(() => {
        let sortedJobs = [...jobs];

        // 1. Sorting Logic
        switch (selectedSort) {
            case 'salary_desc':
                sortedJobs.sort((a, b) => parseSalaryForSort(b.salary_lakh) - parseSalaryForSort(a.salary_lakh));
                break;
            case 'salary_asc':
                sortedJobs.sort((a, b) => parseSalaryForSort(a.salary_lakh) - parseSalaryForSort(b.salary_lakh));
                break;
            case 'company_asc':
                sortedJobs.sort((a, b) => a.company_name.localeCompare(b.company_name));
                break;
            case 'company_desc':
                sortedJobs.sort((a, b) => b.company_name.localeCompare(a.company_name));
                break;
            case 'recent':
            default:
                // Assuming ID or a hidden 'posted_date' field for "Most Recent"
                sortedJobs.sort((a, b) => b.id - a.id); // Simple mock sort by ID
                break;
        }

        // 2. Search/Filtering Logic (Minimal implementation)
        if (searchTerm) {
            const lowerCaseSearch = searchTerm.toLowerCase();
            sortedJobs = sortedJobs.filter(job => 
                job.job_role.toLowerCase().includes(lowerCaseSearch) ||
                job.company_name.toLowerCase().includes(lowerCaseSearch) ||
                job.summary.toLowerCase().includes(lowerCaseSearch)
            );
        }

        return sortedJobs;
    }, [jobs, selectedSort, searchTerm]);

    return (
        // Main container, replacing the old layout wrappers
        <div className="min-h-screen bg-[#f9f9fb] p-6 md:p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Job Search Dashboard</h1>

            {/* Search, Sort, and Filter Row */}
            <div className="flex justify-between items-center space-x-4 pt-2 mb-6">
                
                {/* Search Input */}
                <div className="relative flex-1 max-w-lg">
                    <input
                        type="text"
                        placeholder="Search for roles, companies, or keywords..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                    {/* Search Icon */}
                    <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                </div>

                {/* Sort By Dropdown */}
                <SortByDropdown selectedSort={selectedSort} onSelectSort={setSelectedSort} />

                {/* Filter Button */}
                <button
                    onClick={() => setFilterActive(!filterActive)}
                    className={`inline-flex justify-center items-center rounded-lg border px-4 py-2 text-sm font-medium transition duration-150 ${
                        filterActive 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                >
                    Filter
                    <svg className="ml-2 -mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L13 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 019 17v-5.586L4.293 6.707A1 1 0 014 6V3z" clipRule="evenodd"></path></svg>
                </button>
            </div>

            {/* Jobs Grid and Announcement */}
            <div className="grid grid-cols-12 gap-6">
                {/* Jobs List (Spans 8/12) - Now spans full width on desktop */}
                <div className="col-span-12 lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {sortedAndFilteredJobs.map(job => (
                        <JobCard key={job.id} job={job} />
                    ))}
                </div>

                {/* Announcement (Spans 4/12) */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    <h2 className="text-xl font-semibold text-gray-800 invisible lg:visible">Announcement</h2>
                    <div className="p-6 rounded-xl text-white shadow-lg h-[250px] flex flex-col justify-center"
                        style={{ 
                            backgroundImage: 'linear-gradient(135deg, #7A42C8 0%, #4D2678 100%)',
                            position: 'relative',
                            overflow: 'hidden',
                        }}>
                        <div className="relative z-10">
                            <h3 className="text-3xl font-extrabold mb-1" style={{color: '#FFD700'}}>
                                Something New is Coming!
                            </h3>
                            <p className="text-lg font-bold mb-4">Exciting News</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
