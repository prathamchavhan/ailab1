"use client";

import { usePathname } from "next/navigation";
import Sidebar from "../components/Sidebar";
// ... other imports

const AppLayout = ({ children }) => {
  // ✅ Get the current URL path
  const pathname = usePathname();

  // ✅ Create a list of pages where the sidebar should be hidden
  // const hideSidebarOn = ['/login','/' ,'/profile/create'];
  const hideSidebarOn = ["/login", "/", "/profile/create"];

  // ✅ Check if the current page is in the list
  if (hideSidebarOn.includes(pathname)) {
    // If it is, just show the page content without any layout
    return <main>{children}</main>;
  }

  // Otherwise, show the full layout with the sidebar
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-auto p-0">
          <Sidebar />
        </div>
        <div className="col p-0">
          <main
            className="px-md-4"
            style={{ height: "100vh", overflowY: "auto" }}
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
