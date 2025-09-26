"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/app/navbar/page.jsx"; // Renamed for clarity in structure

const AppLayout = ({ children }) => {
  const pathname = usePathname();

  // Pages where sidebar should be hidden
  const hideSidebarOn = ["/login", "/profile"];

  if (hideSidebarOn.includes(pathname)) {
    return (
      <div>
        <Navbar />
        <main>{children}</main>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />

      <div style={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <Navbar />

        <main style={{ flexGrow: 1, padding: '1rem', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;