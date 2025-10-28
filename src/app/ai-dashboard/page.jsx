"use client";

import AIInterviewForm from "../../components/AIInterviewForm";
import Announcement from "../../components/Announcement";
import Dashboard from "../../components/Dashboard";
import Header from "../../components/Header";
import PerformanceChart from "../../components/PerformanceChart";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#f9f9fb] mt-4">
      {/* Header */}
      <Header />

    
      <div>
        {/* Dashboard Layout */}
        <div className="p-6 grid grid-cols-3 gap-6">
          {/* Left Section */}
          <div className="col-span-2 space-y-6">
            <AIInterviewForm />
            <PerformanceChart />
          </div>

          {/* Right Section */}
          <div className="space-y-6">
            <div className="w-full mt-9 pl-11">
              <Announcement />
            </div>
            <Dashboard />
          </div>
        </div>
      </div>
    </div>
  );
}
