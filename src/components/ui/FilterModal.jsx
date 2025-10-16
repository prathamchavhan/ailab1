import React from 'react';

// --- Placeholder Filter Data ---
const FILTER_DATA = {
    Mode: ['Remote', 'Hybrid', 'On-Site'],
    Experience: ['0-2 Years', '3-5 Years', '5+ Years'],
    Category: ['Software', 'Design', 'Marketing', 'Finance'],
};

const FilterModal = ({ isOpen, onClose, onApplyFilters, currentFilters }) => {
    // State to track local selections before applying
    const [selections, setSelections] = React.useState(currentFilters);

    // Update local selections when currentFilters change (e.g., when the modal is opened)
    React.useEffect(() => {
        setSelections(currentFilters);
    }, [currentFilters]);

    const handleToggle = (key, value) => {
        setSelections(prev => {
            const currentValues = prev[key] || [];
            if (currentValues.includes(value)) {
                // Remove the filter
                return { ...prev, [key]: currentValues.filter(v => v !== value) };
            } else {
                // Add the filter
                return { ...prev, [key]: [...currentValues, value] };
            }
        });
    };

    const handleApply = () => {
        onApplyFilters(selections);
        onClose();
    };

    const handleClear = () => {
        onApplyFilters({}); // Clear all filters
        onClose();
    };

    if (!isOpen) return null;

    return (
        // Modal Overlay
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            
            {/* Modal Content / Sidebar */}
            <div className="relative top-0 right-0 h-full w-full md:w-96 bg-white shadow-xl ml-auto">
                
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b sticky top-0 bg-white z-10">
                    <h7 className="text-lg font-bold text-[#09407F]">Filters</h7>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-900 text-2xl p-1">
                        &times;
                    </button>
                </div>

                {/* Filter Sections */}
                <div className="p-2 space-y-6 overflow-y-auto h-[calc(100%-120px)]">
                    
                    {Object.entries(FILTER_DATA).map(([key, values]) => (
                        <div key={key}>
                            <p className="text-[10px] font-semibold text-black mb-2 border-b pb-2">
                                {key}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {values.map(value => (
                                    <button
                                        key={value}
                                        onClick={() => handleToggle(key, value)}
                                        className={`px-3 py-1 rounded-full text-[10px] font-medium transition duration-150 border 
                                            ${(selections[key] || []).includes(value)
                                                ? 'bg-[#00A1F0] text-white border-[#00A1F0]' 
                                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        {value}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Buttons */}
                <div className="absolute bottom-0 w-full flex justify-end p-4 border-t bg-white">
                    <button 
                        onClick={handleClear} 
                        className="px-4 py-2 text-[10px] font-semibold text-[#09407F] bg-[#09407] rounded-lg mr-3 hover:bg-[#09407F]"
                    >
                        Clear All
                    </button>
                    <button 
                        onClick={handleApply} 
                        className="px-6 py-2 text-sm font-semibold text-white bg-[#00A1F0] rounded-lg hover:bg-[#09407F]"
                    >
                        Apply Filters
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FilterModal;