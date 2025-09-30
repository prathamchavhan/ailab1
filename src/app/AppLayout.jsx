"use client";

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import AdComponent from '@/components/AdComponent';
// ... other imports

const AppLayout = ({ children }) => {
  // ✅ Get the current URL path
  const pathname = usePathname();
  
  // ✅ Create a list of pages where the sidebar should be hidden
  const hideSidebarOn = ['/login', '/profile'];

  // ✅ Check if the current page is in the list
  if (hideSidebarOn.includes(pathname)) {
    // If it is, just show the page content without any layout
    return <main>{children}</main>;
  }

  // Otherwise, show the full layout with the sidebar
  return (
    <div className="container-fluid">
      <div className="row">
        <Sidebar />
        <main 
          className="col-lg-8 px-md-4"
          style={{ height: '100vh', overflowY: 'auto' }}
        >
          {children}
        </main>
        <div className="col-lg-2">
          <AdComponent />
        </div>
      </div>
    </div>
  );
};

export default AppLayout;