'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SlCalender } from "react-icons/sl";
import { supabase } from '../../lib/supabaseClient'
import { FaSortAmountDown, FaFilter } from 'react-icons/fa' // Keeping for functionality, though visually moved

// --- Utility Components for the New Layout ---

// 1. Component for the Large 'Latest Tech News' Card
const LatestNewsCard = ({ newsItem }) => {
  if (!newsItem) return null;
  
  // A dark-to-light blue/teal background gradient to match the image
  const cardGradient = "bg-gradient-to-r from-blue-500 to-teal-400"; 
  
  // Format the date for the display style in the image
  const dateStr = newsItem.created_at ? new Date(newsItem.created_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }) : 'September 26, 2025';

  return (
    <div className={`p-0 rounded-xl overflow-hidden shadow-lg flex w-full h-full ${cardGradient} text-white`}>
      {/* Image Section - Adjust width as needed */}
      <div className="w-1/3 min-w-[200px] h-full">
        {/* Use the news item's image or a placeholder */}
        <img
          src={newsItem.image_url || 'https://via.placeholder.com/600x400?text=AI+Workstation'}
          alt={newsItem.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content Section */}
      <div className="flex-1 p-6 flex flex-col justify-center">
        <h2 className="text-2xl font-bold mb-3 leading-snug">{newsItem.title || 'AI Job Market Trends 2025'}</h2>
        <p className="text-base mb-4 opacity-90">
          {/* Using a placeholder description or truncate the actual one */}
          {newsItem.description ? `${newsItem.description.substring(0, 100)}...` : 'AI jobs continue to grow worldwide, with rising demand in data science, prompt engineering, and AI ethics roles.'}
        </p>
        <div className="flex items-center text-sm font-light mb-4 border-b border-white/50 pb-2">
          <span>{dateStr}</span>
          <span className="mx-2">|</span>
          <span className="font-medium">{newsItem.author || 'TechSource'}</span>
        </div>
        <button
          onClick={() => console.log('Read more clicked')}
          className="mt-3 px-6 py-2 bg-white text-blue-600 font-semibold rounded-lg shadow hover:bg-gray-100 transition self-start"
        >
          Read More
        </button>
      </div>
    </div>
  );
};

// 2. Component for the 'Announcement' Box
const AnnouncementBox = () => {
    // A dark purple background to match the image
    const backgroundStyle = "bg-purple-800 bg-cover bg-center";
    const imageOverlayStyle = { 
      backgroundImage: "url('')",
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right top',
      backgroundSize: '35%'
    };

    return (
        <div className={`p-6 rounded-xl shadow-lg h-full min-h-[250px] text-white flex flex-col justify-center relative overflow-hidden`} 
             style={{...backgroundStyle, ...imageOverlayStyle}}>
            {/* Overlay to dim the background image for text clarity, similar to the image */}
            <div className="absolute inset-0 bg-purple-900/50"></div>
            <div className="relative z-10">
                <h3 className="text-xl font-medium mb-2">Announcement</h3>
                <h2 className="text-3xl font-extrabold mb-4 leading-tight">
                    Something New is <span className="text-yellow-300">Coming!</span> Exciting News
                </h2>
                <p className="text-sm opacity-80">
                    Big improvements are on the way. Stay tuned for more details we can't wait to share.
                </p>
            </div>
        </div>
    );
};

// 3. Component for the Smaller 'Recent Tech News' Cards
const RecentNewsCard = ({ news }) => {
    const formattedDate = new Date(news.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return (
        <div
            key={news.id}
            className="bg-white p-4 rounded-xl border border-gray-200 shadow hover:shadow-lg transition cursor-pointer"
        >
            <div className="flex items-start gap-4 mb-3">
                {/* Small Image/Icon on the left */}
                <img
                    src={news.image_url || 'https://via.placeholder.com/100x100?text=News+Icon'}
                    alt={news.title}
                    className="w-16 h-16 object-cover rounded-md flex-shrink-0 border border-gray-100"
                />
                
                {/* Title and date on the right */}
                <div>
                    <h2 className="font-semibold text-gray-900 leading-snug">{news.title}</h2>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <SlCalender className="inline" />
                        {formattedDate} | {news.author || 'TechSource'}
                    </p>
                </div>
            </div>
        </div>
    );
};

// --- Main Dashboard Component ---

export default function NewsDashboard() {
  const router = useRouter()

  const [newsList, setNewsList] = useState([])
  const [search, setSearch] = useState('')
  const [sortOrder, setSortOrder] = useState('newest')
  const [showSortOptions, setShowSortOptions] = useState(false)

  // Fetch news data
  useEffect(() => {
    const fetchNews = async () => {
      // Order by created_at descending to get the newest first
      const { data, error } = await supabase
        .from('news')
        .select('id, created_at, title, description, image_url, author') 
        .order('created_at', { ascending: false })

      if (!error) setNewsList(data)
    }

    fetchNews()
  }, [])

  // Filtering and Sorting logic (kept from original code)
  const sortedAndFilteredNews = newsList
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
    
  // Separate the data according to the image layout
  const latestNewsItem = sortedAndFilteredNews[0]; // The very first item for the large card
  const recentNewsItems = sortedAndFilteredNews.slice(1); // The rest of the items

  return (
    <div className="p-6 space-y-8 bg-[#f9f9fb] min-h-screen">
      
      {/* ========================================
        TOP SECTION: Latest Tech News + Announcement
        ======================================== 
      */}
      
      {/* Container for Latest News and Announcement (Side-by-side) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
        {/* Latest Tech News (Left, takes 2/3 width on large screens) */}
        <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold text-black mb-3">Latest Tech News</h2>
            <LatestNewsCard newsItem={latestNewsItem} />
        </div>
        
        {/* Announcement (Right, takes 1/3 width on large screens) */}
        <div className="lg:col-span-1">
            <h2 className="text-xl font-semibold text-black mb-3">Announcement</h2>
            <AnnouncementBox />
        </div>
      </div>
      
      {/* --- Horizontal Separator --- */}
      <hr className="border-gray-200" />
      
      {/* ========================================
        RECENT TECH NEWS SECTION + Filters
        ======================================== 
      */}

      <h2 className="text-xl font-semibold text-black">Recent Tech News</h2>

      {/* Search + Filters (Moved below the main visual elements) */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <input
          type="text"
          placeholder="Search news by title, content or author..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-300 text-gray-600 focus:outline-none "
        />

        <div className="flex items-center gap-2 relative">
          <button
            onClick={() => alert('Filter clicked')}
            className="border border-blue-600 px-4 py-2 text-blue-800 bg-gray-200 rounded-lg hover:bg-gray-100 flex items-center gap-2"
          >
            <FaFilter /> Filters
          </button>

          <div className="relative">
            <button
              onClick={() => setShowSortOptions(!showSortOptions)}
              className="border border-blue-600 text-blue-800 px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center gap-2"
            >
              <FaSortAmountDown />
              Sort: {sortOrder === 'newest' ? 'Newest' : sortOrder === 'oldest' ? 'Oldest' : 'Title (A-Z)'}
            </button>

            {showSortOptions && (
              <div className="absolute right-0 top-12 bg-white shadow-md rounded-lg text-black border border-gray-200 z-10">
                <ul>
                  {['newest', 'oldest', 'title'].map((item) => (
                    <li
                      key={item}
                      onClick={() => {
                        setSortOrder(item)
                        setShowSortOptions(false)
                      }}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                    >
                      {item === 'newest'
                        ? 'Newest First'
                        : item === 'oldest'
                        ? 'Oldest First'
                        : 'Title (A-Z)'}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Showing Count */}
      <p className="text-gray-600 text-sm">
        Showing {recentNewsItems.length} of {newsList.length} news items
      </p>

      {/* Recent News Cards (Grid Layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {recentNewsItems.map((news) => (
          // Using the new RecentNewsCard component
          <RecentNewsCard key={news.id} news={news} /> 
        ))}
      </div>
    </div>
  )
}