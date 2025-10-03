"use client";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import AIInterviewForm from "../components/AIInterviewForm";
import PerformanceChart from "../components/PerformanceChart";
import Dashboard from "../components/Dashboard";
import Announcement from "../components/Announcement";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-[#F5F7FA]">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <div className="p-6 grid grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <AIInterviewForm />
            <PerformanceChart />
          </div>
          <div className="space-y-6">
            <Announcement />
            <Dashboard />
          </div>
        </div>
      </div>
    </div>
  );
}