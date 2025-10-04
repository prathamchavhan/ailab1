'use client'

import { useState, useEffect, useMemo } from 'react'
import { supabase } from '../../lib/supabaseClient' // Adjust path as necessary
import { Bell, Megaphone } from 'lucide-react' // You still need lucide-react for icons
import AdComponent from '@/components/AdComponent' // Import AdComponent

const CATEGORIES = ['All', 'Start up', 'Founders', 'Jobs', 'AI'];

// A helper component for the score circles in the header
const ScoreCircle = ({ score, label }) => (
  <div className="flex flex-col items-center gap-1">
    <div className="w-10 h-10 rounded-full bg-[#1B9CFC] border-2 border-white flex items-center justify-center">
      <span className="text-white font-semibold text-sm">{score}</span>
    </div>
    <span className="text-white text-xs font-medium">{label}</span>
  </div>
);

export default function NewsDashboard() {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [userName] = useState('Devashish Dhumal'); // Example user name

  // Using dummy data to ensure the UI looks correct immediately.
  const dummyNews = [
      { id: 1, title: 'AI Job Market Trends 2025', content: 'AI jobs continue to grow worldwide, with rising demand in data science, prompt engineering, and AI ethics roles.', image_url: 'https://images.unsplash.com/photo-1555066931-4365d1469de5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwxfDB8MXxyYW5kb218MHx8Y29kZSx0ZWNoLGRldmVsb3Blcnx8fHx8fDE3MjgxOTA2Mzc&ixlib=rb-4.0.3&q=80&w=1080', author: 'TechSource', created_at: '2025-09-25T10:00:00Z'},
      { id: 2, title: 'OnePlus 11 Powered by Snapdragon 8 Elite Gen 5', image_url: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', created_at: '2025-09-24T10:00:00Z' },
      { id: 3, title: 'Samsung Launches AI Home in India', image_url: 'https://images.unsplash.com/photo-1588507652199-a1da34e5f8d8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', created_at: '2025-09-24T09:00:00Z' },
      { id: 4, title: 'Google Expands AI Overviews In Search', image_url: 'https://images.unsplash.com/photo-1523961131990-5ea7c61b2107?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', created_at: '2025-09-24T08:00:00Z' },
      { id: 5, title: 'Github Introduces Copilot CLI (Preview)', image_url: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', created_at: '2025-09-24T07:00:00Z' },
      { id: 6, title: 'Flipkart Big Billion Days 2025 Goes Live', image_url: 'https://images.unsplash.com/photo-1593339790597-5334750953a8?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', created_at: '2025-09-24T06:00:00Z' },
      { id: 7, title: 'Cisco Zero-Day Security Alert Issued', image_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3', created_at: '2025-09-24T05:00:00Z' },
  ];
  
  useEffect(() => {
    // You can replace this with your Supabase fetch logic.
    setNewsList(dummyNews);
    setLoading(false);
    
    /*
    const fetchNews = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error) setNewsList(data);
      setLoading(false);
    };
    fetchNews();
    */
  }, []);

  const categorizedNews = useMemo(() => {
    if (selectedCategory === 'All') return newsList;
    const lower = selectedCategory.toLowerCase();
    return newsList.filter(
      item =>
        item.title?.toLowerCase().includes(lower) ||
        item.content?.toLowerCase().includes(lower) ||
        item.category?.toLowerCase() === lower
    );
  }, [newsList, selectedCategory]);

  const latestNewsItem = categorizedNews[0] || null;
  const recentNewsList = categorizedNews.slice(1, 7);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
        <div className="min-h-screen bg-[#F5F8FB] flex items-center justify-center">
            <div className="text-center text-gray-500">Loading news...</div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F8FB] p-6 md:p-8">
        {/* Header Bar */}
        <div className="bg-white px-6 py-3 rounded-2xl flex justify-between items-center mb-8 shadow-sm border border-gray-200">
            <div>
                <p className="text-lg font-semibold text-gray-800">
                    Hi <span className="font-bold">{userName}!</span> 👋
                </p>
            </div>
            <div className="flex items-center gap-4">
                <Bell className="w-6 h-6 text-gray-500 cursor-pointer hover:text-gray-800" />
                <ScoreCircle score="91" label="Interview score" />
                <ScoreCircle score="85" label="Profile score" />
            </div>
        </div>

        {/* Category Buttons */}
        <div className="flex flex-wrap gap-3 mb-8">
            {CATEGORIES.map(category => (
                <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                        selectedCategory === category
                            ? 'bg-[#0A3D62] text-white shadow-md'
                            : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                    }`}
                >
                    {category}
                </button>
            ))}
        </div>

        {/* Main Section Grid */}
        <div className="grid grid-cols-12 gap-8 mb-8">

            {/* Left Column - Latest Tech News */}
            <div className="col-span-12 lg:col-span-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Latest tech news
                </h2>
                {latestNewsItem ? (
                    <div className="flex bg-[#0A3D62] rounded-2xl shadow-lg overflow-hidden h-[280px]">
                        <div className="w-5/12 flex-shrink-0">
                            <img
                                src={latestNewsItem.image_url || '/placeholder-news.jpg'}
                                alt={latestNewsItem.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="w-7/12 p-6 flex flex-col justify-between text-white">
                            <div>
                                <h3 className="text-2xl font-bold mb-2 line-clamp-3">
                                    {latestNewsItem.title}
                                </h3>
                                <p className="text-xs text-gray-300">
                                    {formatDate(latestNewsItem.created_at)} | {' '}
                                    {latestNewsItem.author || 'TechSource'}
                                </p>
                            </div>
                            <div className="mt-auto">
                                <button className="text-sm font-semibold text-[#0A3D62] bg-white px-5 py-2.5 rounded-lg hover:bg-gray-200 transition">
                                    Read More
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white p-6 rounded-2xl text-center text-gray-500 h-[280px] flex items-center justify-center">
                        No latest news available.
                    </div>
                )}
            </div>

            {/* Right Column - Announcement */}
            <div className="col-span-12 lg:col-span-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Announcement
                </h2>
                <AdComponent />
            </div>
        </div>

        {/* Recent Tech News */}
        <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Recent Tech News
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentNewsList.length > 0 ? (
                    recentNewsList.map(news => (
                        <div
                            key={news.id}
                            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                        >
                            <img
                                src={news.image_url || '/placeholder-thumb.jpg'}
                                alt={news.title}
                                className="w-full h-32 object-cover rounded-lg mb-4"
                            />
                            <div>
                                <h4 className="font-semibold text-md text-gray-800 line-clamp-2 mb-2">
                                    {news.title}
                                </h4>
                                <div className="flex justify-between items-center text-xs text-gray-500">
                                    <span>{formatDate(news.created_at)}</span>
                                    <span className="font-semibold text-[#1B9CFC] hover:underline">
                                        Read More
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center p-6 bg-white rounded-2xl text-gray-500">
                        No recent news items found.
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}