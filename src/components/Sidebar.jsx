"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./Sidebar.module.css";


import {
  CardSim,
  CloudSunRain,
  LayoutDashboard,
  Briefcase,
  Newspaper,
  CalendarDays,
  MessagesSquare,
  ClipboardCheck,
  CreditCard,
  User,
  BrainCircuit,
  ChevronDown, // Icon for dropdown arrow
  Menu, // NEW: Hamburger icon
  X // NEW: Close icon
} from 'lucide-react';

// Your navigation data remains the same
const navLinks = [
  { href: '/ai-dashboard', label: 'AI Interview', icon: BrainCircuit },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/aptitude', label: 'Aptitude', icon: CloudSunRain},
      { href: '/assignment', label: 'Question bank', icon: CardSim},
  { href: '/jobs', label: 'Jobs', icon: Briefcase },
  { href: '/news', label: 'News', icon: Newspaper },
  { href: '/cardchallenges', label: 'Challenges', icon: CalendarDays },
  { href: '/carrer', label: 'Career Counselling', icon: MessagesSquare },
  
  { href: '/billing', label: 'Billing', icon: CreditCard },
  { href: '/profilemain', label: 'Profile', icon: User },

];


const Sidebar = () => {
  const pathname = usePathname();

  // State to manage which dropdown is open
  const [openMenu, setOpenMenu] = useState(null);
  // NEW STATE: Manage responsive sidebar visibility
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Function to toggle the sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  // Function to toggle the dropdown
  const handleMenuClick = (href) => {
    setOpenMenu(openMenu === href ? null : href);
  };
  
  // Effect to handle active menu and close sidebar on navigation (mobile)
  useEffect(() => {
    // Determine active parent menu for dropdowns
    const activeParent = navLinks.find((link) =>
      link.subLinks?.some((sub) => pathname.startsWith(sub.href))
    );
    if (activeParent) {
      setOpenMenu(activeParent.href);
    }

    // Close sidebar when the path changes (important for mobile UX)
    if (isSidebarOpen) {
        setIsSidebarOpen(false);
    }
  }, [pathname]);


  return (
    <>
      {/* 1. HAMBURGER MENU BUTTON (Always visible, handles open/close) */}
      <button 
        className={styles.hamburgerMenu}
        onClick={toggleSidebar}
        aria-label="Toggle sidebar menu"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      
      {/* 2. MOBILE OVERLAY (Visible only when sidebar is open) */}
      {isSidebarOpen && <div className={styles.overlay} onClick={toggleSidebar}></div>}

      {/* 3. SIDEBAR NAVIGATION */}
      {/* Use conditional classes for mobile toggle */}
      <nav 
        className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ''}`}
      >
        <div className={styles.logoContainer}>
          <Link href="/">
            <Image
              src="/images/palloti.png"
              alt="AI Lab Logo"
              width={180}
              height={40}
              priority
            />
          </Link>
        </div>

        <ul className={styles.navList}>
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            const Icon = link.icon;
            const isMenuOpen = openMenu === link.href;

            // Render dropdown parent links (if subLinks exists)
            if (link.subLinks) {
              return (
                <li
                  key={link.href}
                  className={`${styles.navItem} ${
                    isActive ? styles.active : ""
                  } ${styles.hasSubmenu}`}
                >
                  <button
                    onClick={() => handleMenuClick(link.href)}
                    className={`${styles.navLink} ${styles.dropdownToggle}`}
                  >
                    <div className={styles.linkContent}>
                      <Icon className={styles.icon} />
                      <span>{link.label}</span>
                    </div>
                    <ChevronDown
                      className={`${styles.arrowIcon} ${
                        isMenuOpen ? styles.arrowOpen : ""
                      }`}
                    />
                  </button>
                  {isMenuOpen && (
                    <ul className={styles.subMenu}>
                      {link.subLinks.map((subLink) => {
                        const isSubActive = pathname === subLink.href;
                        return (
                          <li
                            key={subLink.href}
                            className={`${styles.subNavItem} ${
                              isSubActive ? styles.subActive : ""
                            }`}
                          >
                            <Link
                              href={subLink.href}
                              className={styles.subNavLink}
                            >
                              {subLink.label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            }

            // Render regular links
            return (
              <li
                key={link.href}
                className={`${styles.navItem} ${isActive ? styles.active : ""}`}
              >
                <Link href={link.href} className={styles.navLink} onClick={toggleSidebar}> {/* Close menu on link click */}
                  <div className={styles.linkContent}>
                    <Icon className={styles.icon} />
                    <span>{link.label}</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
};

export default Sidebar;