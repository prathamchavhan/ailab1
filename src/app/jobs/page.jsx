'use client'

import React, { useState, useMemo, useRef, useEffect } from 'react';
import JobCard from '../../components/ui/JobCard'; 
import { FaSortAlphaUp, FaSortAmountUp, FaSortAmountDown, FaFilter } from 'react-icons/fa'; // Added FaFilter for consistency
import { supabase } from '../../lib/supabaseClient';

// --- Dropdown Options (Unchanged) ---
const SORT_OPTIONS = [
    { label: 'Most Recent', value: 'recent', icon: FaSortAmountUp },
    { label: 'Salary: High to Low', value: 'salary_desc', icon: FaSortAmountDown },
    { label: 'Salary: Low to High', value: 'salary_asc', icon: FaSortAmountUp },
    { label: 'Company Name (A-Z)', value: 'company_asc', icon: FaSortAlphaUp },
    { label: 'Company Name (Z-A)', value: 'company_desc', icon: FaSortAlphaUp },
];

const parseSalaryForSort = (salary_lakh) => {
    if (!salary_lakh) return 0;
    const parts = salary_lakh.toString().split('-').map(Number);
    return parts[0] || 0;
};

// --- Sort Dropdown Component (Unchanged) ---
// ... (The SortByDropdown component code remains the same as in the previous response)
const SortByDropdown = ({ selectedSort, onSelectSort }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const BLUE_COLOR = '#00A1F0'; 

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
                className="inline-flex justify-center items-center rounded-lg border shadow-sm px-4 py-2 bg-white text-sm font-medium text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
                style={{ borderColor: BLUE_COLOR }} 
            >
                Sort by
                <activeOption.icon className="ml-2 -mr-1 h-4 w-4" style={{ color: BLUE_COLOR }} />
            </button>

            {isOpen && (
                <div
                    className="origin-top-right absolute right-0 mt-2 w-64 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 overflow-hidden"
                    style={{ minWidth: '200px' }} 
                >
                    <div className="py-1">
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
                                className={`flex items-center px-4 py-3 text-sm cursor-pointer transition duration-150 text-gray-900 hover:bg-gray-50
                                    ${selectedSort === option.value ? 'font-semibold' : ''}`
                                }
                                style={selectedSort === option.value ? { backgroundColor: '#E0F7FA', color: BLUE_COLOR } : {}}
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


// --- Filter Dropdown Component (NEW) ---
const FilterDropdown = ({ isOpen, onClose, setFilterActive, handleApplyFilters }) => {
    // Note: Since this is just a mockup of the visual, we won't implement the full filter logic here,
    // but structure the menu as requested.
    
    // The items shown in the image are: Job Type, Mode, Experience, Category
    const menuItems = [
        { label: 'Job Type', isHeader: true, hasDropdown: true },
        { label: 'Mode', isHeader: false, key: 'Mode' },
        { label: 'Experience', isHeader: false, key: 'Experience' },
        { label: 'Category', isHeader: false, key: 'Category' },
    ];
    
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                onClose();
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef, onClose]);

    if (!isOpen) return null;

    return (
        // Dropdown Menu Container (Mimics the style in the image)
        <div 
            ref={dropdownRef}
            className="origin-top-right absolute right-0 mt-2 w-56 rounded-xl shadow-xl bg-white ring-1 ring-black ring-opacity-5 z-50 overflow-hidden"
            style={{ 
                // Adjust position relative to the button
                top: 'calc(100% + 8px)', 
                right: '0' 
            }}
        >
            <div className="py-1">
                {menuItems.map((item, index) => (
                    <div
                        key={index}
                        // Use special styling for the "Job Type" header
                        className={`flex items-center px-4 py-3 text-sm transition duration-150 cursor-pointer 
                            ${item.isHeader 
                                ? 'bg-[#E0F7FA] text-gray-900 font-semibold border-b border-[#00A1F0]/50' // Light blue BG for header
                                : 'text-gray-900 hover:bg-gray-50' // Regular menu items
                            }`}
                    >
                        {item.label}
                        {/* Dropdown icon for the header */}
                        {item.hasDropdown && (
                            <svg className="ml-auto h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        )}
                    </div>
                ))}
            </div>
            
            {/* Note: In a full implementation, clicking these would expand sub-menus or trigger the modal */}
        </div>
    );
};


// --- Main Page Component ---
export default function JobsPage() {
    const [jobs, setJobs] = useState([]);
    const [searchTerm, setSearchTerm] = useState(''); 
    const [selectedSort, setSelectedSort] = useState(SORT_OPTIONS[0].value); 
    const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false); // ⬅️ NEW: Dropdown visibility state
    const [activeFilters, setActiveFilters] = useState({}); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const BLUE_COLOR = '#00A1F0';
    const BLACK_TEXT = 'text-black';

    // ... (useEffect and fetchJobs logic remains the same)
    useEffect(() => {
        const fetchJobs = async () => {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('jobs')
                    .select('*')
                    .order('created_at', { ascending: false }); 

                if (error) {
                    throw error;
                }
                setJobs(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, []);

    const handleApplyFilters = (newFilters) => {
        setActiveFilters(newFilters);
    };

    const sortedAndFilteredJobs = useMemo(() => {
        let currentJobs = [...jobs];

        // ... (Filter and Sorting logic remains the same)
        // 1. Filter Logic
        if (Object.keys(activeFilters).length > 0) {
            currentJobs = currentJobs.filter(job => {
                let matches = true;
                
                if (activeFilters.Mode && activeFilters.Mode.length > 0) {
                    if (!activeFilters.Mode.includes(job.work_mode)) {
                        matches = false;
                    }
                }
                
                if (activeFilters.Category && activeFilters.Category.length > 0) {
                    if (!activeFilters.Category.includes(job.category)) {
                        matches = false;
                    }
                }

                return matches;
            });
        }
        
        // 2. Sorting Logic
        switch (selectedSort) {
            case 'salary_desc':
                currentJobs.sort((a, b) => parseSalaryForSort(b.salary_lakh) - parseSalaryForSort(a.salary_lakh));
                break;
            case 'salary_asc':
                currentJobs.sort((a, b) => parseSalaryForSort(a.salary_lakh) - parseSalaryForSort(b.salary_lakh));
                break;
            case 'company_asc':
                currentJobs.sort((a, b) => (a.company_name || '').localeCompare(b.company_name || ''));
                break;
            case 'company_desc':
                currentJobs.sort((a, b) => (b.company_name || '').localeCompare(a.company_name || ''));
                break;
            case 'recent':
            default:
                break;
        }

        return currentJobs;
    }, [jobs, selectedSort, activeFilters]);

    const isAnyFilterActive = useMemo(() => {
        return Object.values(activeFilters).some(arr => arr && arr.length > 0);
    }, [activeFilters]);

    if (loading) {
        return <div className="min-h-screen bg-[#f9f9fb] p-6 md:p-8 text-center">Loading...</div>;
    }

    if (error) {
        return <div className="min-h-screen bg-[#f9f9fb] p-6 md:p-8 text-center text-red-500">Error: {error}</div>;
    }

    return (
        <div className="min-h-screen bg-[#f9f9fb] p-6 md:p-8">

            {/* CONTROL ROW */}
            <div className="flex justify-end items-center space-x-4 pt-2 mb-8">
                <div className="flex space-x-4">
                    {/* Sort By Dropdown */}
                    <SortByDropdown selectedSort={selectedSort} onSelectSort={setSelectedSort} />

                    {/* Filter Button and Dropdown Container */}
                    <div className="relative"> {/* Added relative positioning for the dropdown */}
                        <button
                            onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)} // ⬅️ Toggle dropdown
                            // Apply the blue outline when open (mimicking the image)
                            className={`inline-flex justify-center items-center rounded-lg border shadow-sm px-4 py-2 text-sm font-medium transition duration-150 ${BLACK_TEXT} ${isFilterDropdownOpen ? 'ring-2 ring-offset-1 ring-blue-500' : ''}`}
                            style={{ borderColor: BLUE_COLOR }} 
                        >
                            Filter
                            {/* Filter icon, centered */}
                            <FaFilter 
                                className="ml-2 -mr-1 h-4 w-4" 
                                style={{ color: BLUE_COLOR }} 
                            />
                            {/* Filter active indicator */}
                            {isAnyFilterActive && <span className="absolute -top-1 -right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span></span>}
                        </button>
                        
                        {/* ⬅️ Filter Dropdown Menu */}
                        <FilterDropdown
                            isOpen={isFilterDropdownOpen}
                            onClose={() => setIsFilterDropdownOpen(false)}
                            // We pass these handlers even though the dropdown only shows the menu visually
                            setFilterActive={setActiveFilters} 
                            handleApplyFilters={handleApplyFilters}
                        />
                    </div>
                </div>
            </div>
            
            {/* JOB CARDS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {sortedAndFilteredJobs.length > 0 ? (
                    sortedAndFilteredJobs.map(job => (
                        <JobCard key={job.id} job={job} />
                    ))
                ) : (
                    <div className="md:col-span-2 xl:col-span-3 text-center py-10 text-lg text-gray-500">
                        No jobs found matching your criteria.
                    </div>
                )}
            </div>
        </div>
    );
}