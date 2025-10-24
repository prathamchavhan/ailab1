'use client'

import React, { useState, useMemo, useRef, useEffect } from 'react';
import JobCard from '@/components/ui/JobCard'; // Assuming JobCard.jsx is here
import { FaSortAlphaUp, FaSortAmountUp, FaSortAmountDown, FaSearch, FaChevronDown, FaSortAlphaDown, FaTimes } from 'react-icons/fa';
import { supabase } from '../../lib/supabaseClient'; // Ensure this path is correct
import Jobs_header from '@/components/Header/Jobs_header'; // Assuming Jobs_header.jsx is here

const BLUE_COLOR = '#00A1F0';
const GRADIENT_BG = 'linear-gradient(to right, #00C6FF, #0072FF)';
const DARK_TEAL_COLOR = '#1B7192';
const HOVER_TEXT_COLOR = '#09407F';
const TAG_BG_COLOR = '#1B7192';
const TAG_TEXT_COLOR = 'white';


const SORT_OPTIONS = [
    { label: 'Latest', value: 'latest', icon: FaSortAmountDown },
    { label: 'Oldest', value: 'oldest', icon: FaSortAmountUp },
    { label: 'Relevance', value: 'relevance', icon: FaSortAlphaUp },
    { label: 'A-Z', value: 'a_z', icon: FaSortAlphaUp },
    { label: 'Z-A', value: 'z_a', icon: FaSortAlphaDown },
    { label: 'By Exp (Low -> High)', value: 'exp_asc', icon: FaSortAmountUp },
    { label: 'By Exp (High -> Low)', value: 'exp_desc', icon: FaSortAmountDown },
];

const JOB_TYPE_OPTIONS = [
    { label: 'Interns', key: 'Internship' },
    { label: 'Full-Time', key: 'Full Time' },
    { label: 'Part-time', key: 'Part time' },
    { label: 'Freelance', key: 'Freelance' },
    { label: 'Contract', key: 'Contract' },
    { label: 'Temporary', key: 'Temporary' },
];

const MODE_OPTIONS = [
    { label: 'Onsite', key: 'Onsite' },
    { label: 'Remote', key: 'Remote' },
    { label: 'Hybrid', key: 'Hybrid' },
];

const EXPERIENCE_OPTIONS = [
    { label: 'Fresher', key: 'fresher' }, { label: '0–1 Year', key: '0_1' },
    { label: '1–3 Years', key: '1_3' },
    { label: '3–5 Years', key: '3_5' }, { label: '5+ Years', key: '5_plus' },
];

const CATEGORY_OPTIONS = [
    { label: 'Marketing', key: 'Marketing' },
    { label: 'Design', key: 'Design' },
    { label: 'Finance', key: 'Finance' },
    { label: 'HR / Recruitment', key: 'HR / Recruitment' },
    { label: 'Sales', key: 'Sales' },
    { label: 'Customer Support', key: 'Customer Support' },
    { label: 'Data Science', key: 'Data Science' },
    { label: 'Product Management', key: 'Product Management' },
    { label: 'Software Development', key: 'Software Development' },
];


const checkExperienceMatch = (jobExpYears, filterKey) => {
    if (jobExpYears === null || jobExpYears === undefined) {
      return !filterKey; 
    }
    switch (filterKey) {
        case 'fresher':
            return jobExpYears === 0;
        case '0_1':
            return jobExpYears >= 0 && jobExpYears <= 1;
        case '1_3':
            return jobExpYears >= 1 && jobExpYears <= 3;
        case '3_5':
            return jobExpYears >= 3 && jobExpYears <= 5;
        case '5_plus':
            return jobExpYears > 5;
        default:
            return true;
    }
};



const ActiveFilterTag = ({ type, label, onRemove }) => {
    if (label === null || label === 'Latest') return null; // Don't show tag for default sort
    return (
        <div
            className={`flex items-center px-2.5 py-1 mr-2 rounded-lg text-xs font-medium whitespace-nowrap mb-1`} // Added mb-1 for wrap spacing
            style={{
                backgroundColor: TAG_BG_COLOR,
                color: TAG_TEXT_COLOR
            }}
        >
            <span className="mr-2">
                {label}
            </span>
            <button
                onClick={() => onRemove(type)}
                className="text-white hover:text-red-300 transition duration-150"
            >
                <FaTimes className="w-3 h-3" />
            </button>
        </div>
    );
};

const getDropdownItemStyle = (isActive, isHovering) => ({
    backgroundColor: isActive || isHovering ? 'white' : DARK_TEAL_COLOR,
    color: isActive || isHovering ? HOVER_TEXT_COLOR : 'white',
    fontWeight: isActive ? '600' : '400',
});

const DropdownMenu = ({ options, activeSelection, filterType, onSelect, onClose }) => {
    const [hoverKey, setHoverKey] = useState(null);
    return (
        <div className="py-1">
            {options.map((item) => {
                const isActive = activeSelection === item.key || activeSelection === item.value;
                const isHovering = hoverKey === item.key || hoverKey === item.value;
                const selectionKey = item.key || item.value;
                const selectionLabel = item.label;
                return (
                    <div
                        key={selectionKey}
                        onClick={() => { onSelect(filterType, selectionKey, selectionLabel); onClose(); }}
                        className={`flex items-center px-4 py-2 text-xs cursor-pointer transition duration-150`}
                        style={getDropdownItemStyle(isActive, isHovering)}
                        onMouseEnter={() => setHoverKey(selectionKey)}
                        onMouseLeave={() => setHoverKey(null)}
                    >
                        {item.label}
                    </div>
                );
            })}
        </div>
    );
};

const SortByDropdown = ({ activeSelection, onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [dropdownRef]);

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex justify-center items-center px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none transition duration-150"
            >
                Sortby
                <FaChevronDown className="ml-2 h-3 w-3 text-gray-500" />
            </button>
            {isOpen && (
                <div
                    className="origin-top-right absolute right-0 mt-2 w-46 rounded-xl shadow-2xl ring-1 ring-black ring-opacity-5 z-50 overflow-hidden"
                    style={{ minWidth: '140px', backgroundColor: DARK_TEAL_COLOR, color: 'white' }}
                >
                    <DropdownMenu
                        options={SORT_OPTIONS}
                        activeSelection={activeSelection}
                        filterType="sort"
                        onSelect={onSelect}
                        onClose={() => setIsOpen(false)}
                    />
                </div>
            )}
        </div>
    );
};

const FilterDropdownContainer = ({ keyName, isOpen, onClose, activeSelection, onSelect, options, width = 'w-56' }) => {
    if (!isOpen) return null;
    return (
        <div
            className={`origin-top-left absolute left-0 mt-2 ${width} rounded-xl shadow-2xl ring-1 ring-black ring-opacity-5 z-50 overflow-hidden`}
            style={{ top: 'calc(100% + 8px)', left: '0', backgroundColor: DARK_TEAL_COLOR, color: 'white' }}
        >
            <DropdownMenu
                options={options}
                activeSelection={activeSelection}
                filterType={keyName}
                onSelect={onSelect}
                onClose={onClose}
            />
        </div>
    );
};

const FilterButton = ({ label, keyName, isOpen, onClick, activeSelection, handleSelect }) => {
    const handleClose = () => onClick(null);
    const dropdownProps = {
        isOpen, onClose: handleClose, activeSelection, onSelect: handleSelect,
    };
    return (
        <div className="relative">
            <button
                onClick={() => onClick(keyName)}
                className={`inline-flex items-center px-3 py-1.5 text-xs font-medium transition duration-150 text-gray-700 hover:bg-gray-50 focus:outline-none ${isOpen || activeSelection ? 'text-blue-600' : ''}`}
            >
                {label}
                <FaChevronDown className={`ml-2 h-3 w-3 ${isOpen || activeSelection ? 'text-blue-600' : 'text-gray-500'}`} />
            </button>

            {isOpen && keyName === 'job_type' && (
                 <FilterDropdownContainer {...dropdownProps} keyName={keyName} options={JOB_TYPE_OPTIONS} />
            )}
            {isOpen && keyName === 'mode' && (
                 <FilterDropdownContainer {...dropdownProps} keyName={keyName} options={MODE_OPTIONS} />
            )}
            {isOpen && keyName === 'experience' && (
                 <FilterDropdownContainer {...dropdownProps} keyName={keyName} options={EXPERIENCE_OPTIONS} />
            )}
            {isOpen && keyName === 'category' && (
                 <FilterDropdownContainer {...dropdownProps} keyName={keyName} options={CATEGORY_OPTIONS} width="w-48"/> // Adjusted width
            )}
        </div>
    );
};

export default function JobsPage() {
    const [jobs, setJobs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [openFilter, setOpenFilter] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [activeFilterValues, setActiveFilterValues] = useState({
        sort: { key: 'latest', label: 'Latest' },
        job_type: { key: null, label: null },
        mode: { key: null, label: null },
        experience: { key: null, label: null },
        category: { key: null, label: null },
    });

    const toggleFilterDropdown = (key) => {
        setOpenFilter(openFilter === key ? null : key);
    };

    const handleFilterSelect = (type, key, label) => {
        setActiveFilterValues(prev => ({
            ...prev,
            [type]: { key, label }
        }));
        setOpenFilter(null);
    };

    const handleFilterRemove = (type) => {
        const defaultSort = { key: 'latest', label: 'Latest' };
        setActiveFilterValues(prev => ({
            ...prev,
            [type]: type === 'sort' ? defaultSort : { key: null, label: null }
        }));
    };

    const handleClearAll = () => {
        setSearchTerm('');
        setOpenFilter(null);
        setActiveFilterValues({
            sort: { key: 'latest', label: 'Latest' },
            job_type: { key: null, label: null },
            mode: { key: null, label: null },
            experience: { key: null, label: null },
            category: { key: null, label: null },
        });
    };

    const activeTags = useMemo(() => {
        return Object.entries(activeFilterValues)
            .filter(([, value]) => value.label && value.label !== 'Latest')
            .map(([type, value]) => ({ type, label: value.label, key: value.key }));
    }, [activeFilterValues]);

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
                setJobs(data || []);

            } catch (error) {
                setError(error.message);
                console.error("Error fetching jobs:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, [supabase]); 

    const sortedAndFilteredJobs = useMemo(() => {
        let currentJobs = [...jobs];
        const { sort, job_type, mode, experience, category } = activeFilterValues;

       
        if (searchTerm) {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            currentJobs = currentJobs.filter(job =>
                (job.job_role && job.job_role.toLowerCase().includes(lowerCaseSearchTerm)) ||
                (job.company_name && job.company_name.toLowerCase().includes(lowerCaseSearchTerm)) ||
                (job.location && job.location.toLowerCase().includes(lowerCaseSearchTerm))
            );
        }
        if (job_type.key) {
            currentJobs = currentJobs.filter(job => job.job_type === job_type.key);
        }
        if (mode.key) {
            currentJobs = currentJobs.filter(job => job.work_mode === mode.key);
        }
        if (experience.key) {
            currentJobs = currentJobs.filter(job =>
                checkExperienceMatch(job.experience_years, experience.key)
            );
        }
        if (category.key) {
            currentJobs = currentJobs.filter(job => job.category === category.key);
        }

   
        const selectedSort = sort.key;
        switch (selectedSort) {
            case 'oldest':
                currentJobs.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
                break;
            case 'a_z':
                currentJobs.sort((a, b) => (a.job_role || '').localeCompare(b.job_role || ''));
                break;
            case 'z_a':
                currentJobs.sort((a, b) => (b.job_role || '').localeCompare(a.job_role || ''));
                break;
            case 'exp_asc':
                currentJobs.sort((a, b) => (a.experience_years ?? 0) - (b.experience_years ?? 0));
                break;
            case 'exp_desc':
                currentJobs.sort((a, b) => (b.experience_years ?? 0) - (a.experience_years ?? 0));
                break;
            case 'latest':
            case 'relevance':
            default:
                currentJobs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                break;
        }
        return currentJobs;
    }, [jobs, activeFilterValues, searchTerm]);

    if (loading) {
        return <div className="min-h-screen bg-[#f9f9fb] p-6 md:p-8 text-center">Loading...</div>;
    }
    if (error) {
        return <div className="min-h-screen bg-[#f9f9fb] p-6 md:p-8 text-center text-red-500">Error: {error}</div>;
    }

    return (
        <div className="bg-[#f9f9fb]">
            <div className='mt-4'>
                <Jobs_header/>
            </div>
            <div className="min-h-screen bg-[#f9f9fb] p-6 md:p-8">

                {/* Search Bar and Filters */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0 lg:space-x-8 mb-2 relative">
                    <div className="w-full lg:w-3/4">
                        <div className="p-[2px] rounded-2xl shadow-md" style={{ backgroundImage: GRADIENT_BG }}>
                            <div className="flex items-center w-full rounded-2xl bg-white px-4 py-2.5 transition duration-150">
                                <FaSearch className="mr-3 h-5 w-5" style={{ color: BLUE_COLOR }} />
                                <input
                                    type="text"
                                    placeholder="Search by job role or company..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full focus:outline-none text-gray-800 text-sm"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="w-full lg:w-auto relative z-20">
                        <div className="flex justify-start items-center bg-[#F7FEFF] rounded-xl px-1 py-1 transition duration-200 border-2 border-transparent text-[11px] hover:border-blue-500 hover:shadow-md">
                            <div className="flex items-center space-x-1 overflow-x-visible">
                                <SortByDropdown activeSelection={activeFilterValues.sort.key} onSelect={handleFilterSelect} />
                                <FilterButton label="Jobtype" keyName="job_type" isOpen={openFilter === 'job_type'} onClick={toggleFilterDropdown} activeSelection={activeFilterValues.job_type.key} handleSelect={handleFilterSelect} />
                                <FilterButton label="Mode" keyName="mode" isOpen={openFilter === 'mode'} onClick={toggleFilterDropdown} activeSelection={activeFilterValues.mode.key} handleSelect={handleFilterSelect} />
                                <FilterButton label="Experience" keyName="experience" isOpen={openFilter === 'experience'} onClick={toggleFilterDropdown} activeSelection={activeFilterValues.experience.key} handleSelect={handleFilterSelect} />
                                <FilterButton 
                                    label="Category" 
                                    keyName="category" 
                                    isOpen={openFilter === 'category'} 
                                    onClick={toggleFilterDropdown} 
                                    // ✅ FIXED: Typo "actions.category.key" -> "activeFilterValues.category.key"
                                    activeSelection={activeFilterValues.category.key} 
                                    handleSelect={handleFilterSelect} 
                                />
                            </div>
                        </div>
                        {activeTags.length > 0 && (
                            <button onClick={handleClearAll} className="text-[10px] font-medium text-[#09407F] hover:text-[#0052b3] transition duration-150 absolute right-0 top-full mt-2 mr-2 whitespace-nowFrap">
                                Clear All
                            </button>
                        )}
                    </div>
                </div>

                {/* Active Filters Display */}
                {activeTags.length > 0 && (
                    <div className="flex justify-start items-center mb-6 mt-4">
                        <div className="flex flex-wrap items-center">
                            {activeTags.map((tag) => (
                                <ActiveFilterTag key={tag.type} type={tag.type} label={tag.label} onRemove={handleFilterRemove} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Job Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-4">
                    {sortedAndFilteredJobs.length > 0 ? (
                        sortedAndFilteredJobs.map(job => (
                            <JobCard key={job.id} job={job} />
                        ))
                    ) : (
                        <div className="md:col-span-2 xl:col-span-3 text-center py-10 text-gray-500">
                            No jobs found matching your criteria.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}