"use client";

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
// ... other imports

const AppLayout = ({ children }) => {
  // ... (your logic to hide layout on certain paths)

  return (
    <div className="container-fluid">
      {/* This .row ensures its children (Sidebar and main) have the same height */}
      <div className="row">
        {/* Desktop Sidebar (now flexible height) */}
        <Sidebar />
        
        {/* Main Content Area */}
   <main 
          className="col-lg-9 ms-auto px-md-4"
          style={{ height: '100vh', overflowY: 'auto' }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;