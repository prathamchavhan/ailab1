"use client";

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/app/navbar/page.jsx'; // 1. Import the Header component

// ... other imports (keep only necessary ones)

const AppLayout = ({ children }) => {
    // ✅ Get the current URL path
    const pathname = usePathname();
    
    // ✅ Create a list of pages where the sidebar should be hidden
    // NOTE: If you don't want the Header on these pages, this logic is correct.
    const hideLayoutOn = ['/login', '/profile']; 

    // ✅ Check if the current page is in the list
    if (hideLayoutOn.includes(pathname)) {
        // If it is, just show the page content without any layout (no Header, no Sidebar)
        return <main>{children}</main>;
    }

    // Otherwise, show the full layout with the sidebar and header
    return (
        // Use a simple flex container for a cleaner layout model than bootstrap classes
        <div className="flex h-screen overflow-hidden bg-[#f9f9fb]"> 
            
            {/* Sidebar (Fixed Width) */}
            <Sidebar /> 

            {/* Main Content Area (Header + Page Content) */}
            <div className="flex-1 flex flex-col"> 
                
                {/* 2. HEADER/NAVBAR */}
                {/* The Header component you edited previously (with Supabase data fetching) */}
                <Header />

                {/* Main Page Content */}
                <main 
                    className="flex-1 p-6" // Add padding to the content area
                    style={{ overflowY: 'auto' }} // Allows content to scroll
                >
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AppLayout;