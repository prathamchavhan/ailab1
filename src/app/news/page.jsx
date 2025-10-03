'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SlCalender } from "react-icons/sl";
import { supabase } from '../../lib/supabaseClient'

import { FaPlus, FaUpload, FaSortAmountDown, FaFilter } from 'react-icons/fa'
import AdComponent from '../../components/AdComponent'

export default function NewsDashboard() {
  const router = useRouter()

  const [newsList, setNewsList] = useState([])
  const [search, setSearch] = useState('')
  const [sortOrder, setSortOrder] = useState('newest')
  const [showSortOptions, setShowSortOptions] = useState(false)

  useEffect(() => {
    const fetchNews = async () => {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error) setNewsList(data)
    }

    fetchNews()
  }, [])

  const filteredNews = newsList
    .filter(
      (item) =>
        item.title?.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOrder === 'newest') return new Date(b.created_at) - new Date(a.created_at)
      if (sortOrder === 'oldest') return new Date(a.created_at) - new Date(b.created_at)
      if (sortOrder === 'title') return a.title.localeCompare(b.title)
    })

  return (
    
    <div className="p-6 space-y-6 bg-[#f9f9fb] min-h-screen">

      {/* Top Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-semibold text-black">Latest News</h1>
        </div>

        {/* Ad slot - show on md+ */}
        <div className="hidden md:block md:w-72">
          <AdComponent />
        </div>
      </div>

      {/* Search + Filters */}
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
            className="border border-blue-600 px-4 py-2 text-blue-800  bg-gray-200 rounded-lg hover:bg-gray-100 flex items-center gap-2"
          >
            <FaFilter /> Filters
          </button>

          <div className="relative">
            <button
              onClick={() => setShowSortOptions(!showSortOptions)}
              className="border border-blue-600 text-blue-800 px-4 py-2 rounded-lg  bg-gray-200 hover:bg-gray-300 flex items-center gap-2"
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
        Showing {filteredNews.length} of {newsList.length} news items
      </p>

      {/* News Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredNews.map((news) => (
          <div
            key={news.id}
            className="bg-white p-4 rounded-xl border border-gray-200 shadow hover:shadow-md transition"
          >
           <div className="relative group mb-3">
  <img
    src={news.image_url}
    alt={news.title}
    className="w-full h-[160px] object-cover rounded-t-lg"
  />
  <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 flex items-end p-3 rounded-t-lg transition duration-300">
    <p className="text-white font-bold text-sm">
      Published by: {news.author || 'Unknown'}
    </p>
  </div>
</div>


            
            <p className="text-xs text-black mb-1"><SlCalender />{new Date(news.created_at).toLocaleDateString()}</p>
            <h2 className="font-semibold text-gray-900 truncate">{news.title}</h2>
            <p className="text-sm text-gray-600 truncate">{news.description}</p>
          </div>
        ))}
      </div>

      {/* Mobile ad slot (below news) */}
      <div className="block md:hidden mt-6">
        <AdComponent />
      </div>
    </div>
  )
}
