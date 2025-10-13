"use client";

import AIInterviewForm from "../../components/AIInterviewForm";
import Announcement from "../../components/Announcement";
import Dashboard from "../../components/Dashboard";
import Header from "../../components/Header";
import PerformanceChart from "../../components/PerformanceChart";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      {/* Header */}
      <Header />

      {/* Main Content */}
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
            <Announcement />
            <Dashboard />
          </div>
        </div>
      </div>
    </div>
  );
}
