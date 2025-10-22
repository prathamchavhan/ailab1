'use client'

import { useState, useEffect, useMemo } from 'react'
import Announcement  from "../../components/Announcement";
import { supabase } from '../../lib/supabaseClient'
import News_header from '@/components/Header/News_header';
// --- All sub-components (CategoryTabButton, etc.) are included and are unchanged ---

const CategoryTabButton = ({ label, isActive, onClick }) => {
    const baseClasses = "px-3 py-1 text-sm rounded-xl transition font-medium cursor-pointer";
    const activeClasses = "bg-[#d0f6fa] text-[#09407F]"; 
    const inactiveClasses = "bg-gray-100 text-[#09407F] rounded-xl";
    return <button onClick={onClick} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>{label}</button>;
};

const LatestNewsCard = ({ news, onReadMore }) => (
    <div className="bg-gradient-to-r from-[#91E4F9] to-[#096285] p-4 rounded-xl shadow-lg flex overflow-hidden h-[200px] gap-6">
        <div className="w-1/3 flex-shrink-0 pr-4">
            <img src={news.image_url} alt={news.title} className="w-full h-[150px] object-cover rounded-lg" />
        </div>
        <div className="w-2/3 flex flex-col justify-center text-white">
            <p className="text-[15px] font-bold mb-1">{news.title}</p>
            <p className="text-[12px] mb-2 opacity-95 line-clamp-3">{news.description}</p>
            <div className='border-t w-60 mt-2 mb-0'></div>
            <div className="flex justify-between items-center mt-2">
                <div className="flex items-center text-xs text-white/80 mb-6 mt-0 pt-1">
                    <span>{news.source} | {new Date(news.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <button
                    onClick={() => onReadMore(news)}
                    className="self-end px-6 py-2 !text-[11px] text-black font-semibold bg-white hover:bg-gray-100 transition shadow-md"
                    style={{ borderRadius: '9px' }}
                >
                    Read More
                </button>
            </div>
        </div>
    </div>
);

const AnnouncementCard = () => (
    <div className="bg-gradient-to-br from-[#7719a9] to-[#9b2ab4] p-6 rounded-xl shadow-lg text-white h-[190px] flex flex-col justify-center items-center text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="z-10">
            <h2 className="text-3xl font-extrabold mb-2 leading-tight">Something <br/> New is Coming!</h2>
            <p className="text-xs opacity-80 mt-4">Big improvements are on the way. Stay tuned!</p>
        </div>
    </div>
);

const RecentNewsCard = ({ news, onReadMore }) => (
    <div onClick={() => onReadMore(news)} className="flex bg-[#DBF0F3] p-4 rounded-xl shadow-sm hover:shadow-md transition cursor-pointer h-full">
        <div className="w-1/3 flex-shrink-0 mr-4">
            <img src={news.image_url} alt={news.title} className="w-full h-[80px] object-cover rounded-lg shadow-sm" />
        </div>
        <div className="w-2/3 flex flex-col justify-between">
            <p className="text-[10px] font-medium text-gray-900 line-clamp-2">{news.title}</p>
            <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-600">{new Date(news.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                <span className="text-[10px] font-semibold text-[#0494b5] hover:text-[#037c95] transition">Read More</span>
            </div>
        </div>
    </div>
);

const NewsPopup = ({ news, onClose }) => {
    return (
        // The transparent backdrop to show the blur
        <div 
            className="fixed inset-0 bg-transparent z-50 flex justify-center items-center p-4"
            onClick={onClose}
        >
            {/* The popup content itself */}
            <div 
                className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()} // Prevents closing when clicking inside
            >
                {/* 1. Header with Title and Close Button */}
                <div className="flex justify-between items-center p-1 border-b">
                    <p className="text-sm font-bold text-gray-800">{news.title}</p>

                </div>

                {/* 2. Scrollable Content Area */}
                <div className="p-6 overflow-y-auto">
                    <img 
                        src={news.image_url} 
                        alt={news.title}
                        className="w-full h-56 object-cover rounded-md mb-4"
                    />
                    <div className="flex items-center text-[10px] text-gray-500 mb-4">
                    
                        <span>{news.source} | {new Date(news.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                        {news.content}
                    </p>
                </div>

                {/* 3. Footer with a Clear "Go Back" Button */}
                <div className="p-4 bg-gray-50 border-t text-right rounded-b-lg">
                                       <button onClick={onClose} className="text-gray-400 hover:text-gray-800 text-2xl">&times;</button>
                </div>
            </div>
        </div>
    );
};



// --- Main Dashboard Component ---
export default function NewsDashboard() {
    const [newsList, setNewsList] = useState([])
    const [activeTab, setActiveTab] = useState('All')
    const [popupNews, setPopupNews] = useState(null);

    useEffect(() => {
        const fetchNews = async () => {
            const { data, error } = await supabase.from('news').select('*').order('created_at', { ascending: false });
            if (!error && data) {
                const processedData = data.map((item, index) => ({
                    ...item,
                    image_url: item.image_url || `/mock-images/image-${(index % 7) + 1}.jpg`,
                    title: item.title || `News Title ${item.id}`,
                    description: item.description || `This is the full description for news item ${item.id}.`,
                    source: item.source || 'TechSource',
                    category: item.category || ['AI', 'Jobs', 'Start up', 'Founders'][index % 4]
                }));
                setNewsList(processedData);
            }
        }
        fetchNews()
    }, [])

    const filteredNews = useMemo(() => {
        let items = newsList;
        if (activeTab !== 'All') {
            items = items.filter(item => item.category?.toLowerCase() === activeTab.toLowerCase());
        }
        return items;
    }, [newsList, activeTab]);

    const latestNewsItem = filteredNews.length > 0 ? filteredNews[0] : null
    const recentNewsItems = filteredNews.slice(latestNewsItem ? 1 : 0)

    const handleShowPopup = (newsItem) => setPopupNews(newsItem);
    const handleClosePopup = () => setPopupNews(null);

    return (
      <div className='bg-[#f9f9fb]'> 
        <div className='mt-4 mb-3'>
      <News_header />
</div>
        <div className="bg-[#f9f9fb] min-h-screen">
            
            {/* --- 1. Main Page Content --- */}
            {/* We apply blur and pointer-events-none here when the popup is active */}
            <div className={`p-6 space-y-6 transition-all duration-300 ${popupNews ? 'blur-sm pointer-events-none' : ''}`}>
                <div className="flex space-x-6 gap-9 text-[13px]"> 
                    <CategoryTabButton label="All" isActive={activeTab === 'All'} onClick={() => setActiveTab('All')} />
                    <CategoryTabButton label="Start up" isActive={activeTab === 'Start up'} onClick={() => setActiveTab('Start up')} />
                    <CategoryTabButton label="Founders" isActive={activeTab === 'Founders'} onClick={() => setActiveTab('Founders')} />
                    <CategoryTabButton label="Jobs" isActive={activeTab === 'Jobs'} onClick={() => setActiveTab('Jobs')} />
                    <CategoryTabButton label="AI" isActive={activeTab === 'AI'} onClick={() => setActiveTab('AI')} />
                </div>
                
                <div className="flex gap-6">
                    <div className="w-2/3 space-y-4">
                        <p className="text-xl font-semibold text-[#09407F] ml-1">Latest tech news</p>
                        {latestNewsItem && <LatestNewsCard news={latestNewsItem} onReadMore={handleShowPopup} />}
                    </div>
                  
                       
                        <Announcement />
                  
                </div>

                <div className="space-y-4 pt-4">
                    <p className="text-xl font-semibold text-[#09407F] ml-1">Recent Tech News</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {recentNewsItems.map((news) => (
                            <RecentNewsCard key={news.id} news={news} onReadMore={handleShowPopup} />
                        ))}
                    </div>
                    {filteredNews.length === 0 && <div className="text-center py-10 text-gray-500">No news found.</div>}
                </div>
            </div>

            {/* --- 2. Popup (Rendered on top of the blurred content) --- */}
            {popupNews && <NewsPopup news={popupNews} onClose={handleClosePopup} />}
        </div>
        </div>
    )
}