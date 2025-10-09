'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { SlCalender } from "react-icons/sl";
import { supabase } from '../../lib/supabaseClient' // Keeping the Supabase import
import { FaSortAmountDown, FaFilter } from 'react-icons/fa'
import { Bell, User } from 'lucide-react'; // For the top header icons

const CategoryTabButton = ({ label, isActive, onClick }) => {
    const baseClasses = "px-5 py-2 text-sm rounded-lg transition font-medium cursor-pointer";
    
    // Classes applied based on the last image's style
    const activeClasses = "bg-[#d0f6fa] text-[#0494b5] shadow-inner"; 
    const inactiveClasses = "bg-gray-100 text-[#3f5773] shadow-md border border-gray-200";

    return (
        <button
            onClick={onClick}
            className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
        >
            {label}
        </button>
    );
};
// --- UI Helper Components for Structure and Style ---

// Custom Component for the Latest News Card (Large Gradient Card)
const LatestNewsCard = ({ news }) => (
    // Specific gradient color from the image: from-[#59c3e9] to-[#0494b5]
    <div className="bg-gradient-to-r from-[#59c3e9] to-[#0494b5] p-8 rounded-xl shadow-lg flex overflow-hidden h-[250px]">
        
        {/* Left Image Section */}
        <div className="w-1/3 flex-shrink-0 pr-6">
            <img
                src={news.image_url} // Replace with actual path/data
                alt={news.title}
                className="w-full h-full object-cover rounded-lg shadow-md"
            />
        </div>

        {/* Right Content Section */}
        <div className="w-2/3 flex flex-col justify-center text-white">
            <h2 className="text-3xl font-bold mb-3">
                {/* Using a fallback for the title if data isn't perfect */}
                {news.title || 'AI Job Market Trends 2025'} 
            </h2>
            <p className="text-sm mb-2 opacity-95 line-clamp-3">
                {news.description || 'AI jobs continue to grow worldwide, with rising demand in data science, prompt engineering, and AI ethics roles.'}
            </p>
            <div className="flex items-center text-xs opacity-80 mb-4">
                <SlCalender className="mr-1" />
                <span>{news.source || 'TechSource'} | {new Date(news.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            </div>
            
            <button className="self-start px-6 py-2 text-sm text-[#0494b5] font-semibold bg-white rounded-lg hover:bg-gray-100 transition shadow-md">
                Read More
            </button>
        </div>
    </div>
)

// Custom Component for the Announcement Card (Purple Gradient Card)
const AnnouncementCard = () => (
    // Specific gradient color from the image: from-[#7719a9] to-[#9b2ab4]
    <div className="bg-gradient-to-br from-[#7719a9] to-[#9b2ab4] p-6 rounded-xl shadow-lg text-white h-[250px] flex flex-col justify-center items-center text-center relative overflow-hidden">
        {/* Abstract background element simulation */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="z-10">
            <h2 className="text-3xl font-extrabold mb-2 leading-tight">
                Something <br/> New is Coming! <br/> Exciting News
            </h2>
            <p className="text-xs opacity-80 mt-4">
                Big improvements are on the way. Stay tuned for more details we can't wait to share!
            </p>
        </div>
    </div>
)

// Custom Component for the Recent News Card (Small Aqua Card)
const RecentNewsCard = ({ news }) => (
    // Specific light aqua background color from the image: #e0f7f9
    <div className="flex bg-[#e0f7f9] p-4 rounded-xl shadow-sm hover:shadow-md transition cursor-pointer h-full">
        
        {/* Left Image Section */}
        <div className="w-1/3 flex-shrink-0 mr-4">
            <img
                src={news.image_url} // Replace with actual path/data
                alt={news.title}
                className="w-full h-[80px] object-cover rounded-lg shadow-sm"
            />
        </div>

        {/* Right Content Section */}
       <div className="w-2/3 flex flex-col justify-between">
    <h3 className="text-xs font-medium text-gray-900 line-clamp-2">
        {/* News Title */}
        {news.title}
    </h3>
    <div className="flex justify-between items-center mt-2">
        {/* Date: Already text-xs */}
        <span className="text-xs text-gray-600">{new Date(news.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
        {/* Read More: Already text-xs */}
        <span className="text-xs font-semibold text-[#0494b5] hover:text-[#037c95] transition">Read More</span>
    </div>
</div>
    </div>
)

// --- Main Dashboard Component ---

export default function NewsDashboard() {
    const router = useRouter()

    const [newsList, setNewsList] = useState([])
    const [search, setSearch] = useState('')
    const [sortOrder, setSortOrder] = useState('newest')
    const [showSortOptions, setShowSortOptions] = useState(false)
    const [activeTab, setActiveTab] = useState('AI') // Set default active tab to 'AI' to match image

    // 1. SUPABASE DATA FETCHING (Kept original logic)
    useEffect(() => {
        const fetchNews = async () => {
            const { data, error } = await supabase
                .from('news')
                .select('*')
                .order('created_at', { ascending: false })

            // Inject mock image URLs and dummy descriptions/titles if data is empty or missing fields
            // NOTE: For a real app, ensure your 'news' table has title, description, created_at, and image_url.
            if (!error && data) {
                // This helps ensure the UI renders correctly even with minimal DB data.
                const processedData = data.map((item, index) => ({
                    ...item,
                    image_url: item.image_url || `/mock-images/image-${(index % 7) + 1}.jpg`, // Use a mock image path
                    title: item.title || `News Title ${item.id}`,
                    description: item.description || `This is a sample description for news item ${item.id}.`,
                    created_at: item.created_at || new Date().toISOString(),
                }));
                setNewsList(processedData);
            } else if (!error && data.length === 0) {
                // If the database is empty, you might load local mock data here for a better dev experience
                // (Omitted here to keep the code clean and focused on your Supabase connection).
            }
        }

        fetchNews()
    }, [])

    // 2. FILTERING AND SORTING LOGIC (Kept original logic and moved to useMemo for performance)
    const filteredNews = useMemo(() => {
        return newsList
            .filter(
                (item) =>
                    item.title?.toLowerCase().includes(search.toLowerCase()) ||
                    item.description?.toLowerCase().includes(search.toLowerCase())
            )
            .sort((a, b) => {
                if (sortOrder === 'newest') return new Date(b.created_at) - new Date(a.created_at)
                if (sortOrder === 'oldest') return new Date(a.created_at) - new Date(b.created_at)
                if (sortOrder === 'title') return a.title.localeCompare(b.title)
                return 0;
            })
    }, [newsList, search, sortOrder])


    // 3. UI LAYOUT LOGIC
    const latestNewsItem = filteredNews.length > 0 ? filteredNews[0] : null
    const recentNewsItems = filteredNews.slice(latestNewsItem ? 1 : 0)

    return (
        <div className="p-6 space-y-6 bg-[#f9f9fb] min-h-full">

            {/* --- Category Tabs (Modified to use 5 distinct components) --- */}
            <div className="flex space-x-6"> 
                {/* 5 distinct components created using the new CategoryTabButton */}
                <CategoryTabButton 
                    label="All" 
                    isActive={activeTab === 'All'} 
                    onClick={() => setActiveTab('All')} 
                />
                <CategoryTabButton 
                    label="Start up" 
                    isActive={activeTab === 'Start up'} 
                    onClick={() => setActiveTab('Start up')} 
                />
                <CategoryTabButton 
                    label="Founders" 
                    isActive={activeTab === 'Founders'} 
                    onClick={() => setActiveTab('Founders')} 
                />
                <CategoryTabButton 
                    label="Jobs" 
                    isActive={activeTab === 'Jobs'} 
                    onClick={() => setActiveTab('Jobs')} 
                />
                <CategoryTabButton 
                    label="AI" 
                    isActive={activeTab === 'AI'} 
                    onClick={() => setActiveTab('AI')} 
                />
            </div>
            {/* --- Latest News & Announcement (Main Row) --- */}
            <div className="flex gap-6">
                {/* Latest Tech News Section (2/3 width) */}
                <div className="w-2/3 space-y-4">
                    <h2 className="text-xl font-semibold text-gray-800 ml-1">Latest tech news</h2>
                    {latestNewsItem ? <LatestNewsCard news={latestNewsItem} /> : (
                        <div className="h-[250px] bg-gray-200 rounded-xl flex items-center justify-center">Loading Latest News...</div>
                    )}
                </div>
                
                {/* Announcement Section (1/3 width) */}
                <div className="w-1/3 space-y-4">
                    <h2 className="text-xl font-semibold text-gray-800 ml-1">Announcement</h2>
                    <AnnouncementCard />
                </div>
            </div>

            {/* --- Search, Filters, and Recent News --- */}
            <div className="space-y-4 pt-4">
                <h2 className="text-xl font-semibold text-gray-800 ml-1">Recent Tech News</h2>

                {/* Recent News Grid (3-column layout with the new aqua card style) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recentNewsItems.map((news) => (
                        <RecentNewsCard key={news.id} news={news} />
                    ))}
                </div>
                
                {/* Fallback for empty state */}
                {filteredNews.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        No news items found matching your criteria.
                    </div>
                )}
            </div>
        </div>
    )
}