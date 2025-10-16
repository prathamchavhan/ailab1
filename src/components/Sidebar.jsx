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
  Settings,
  BrainCircuit,
  ChevronDown // Icon for dropdown arrow
} from 'lucide-react';

// ✅ STEP 1: Update the data structure to include sub-links
const navLinks = [
  { href: '/ai-dashboard', label: 'AI Interview', icon: BrainCircuit },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/aptitude', label: 'Aptitude', icon: CloudSunRain},
      { href: '/assignment', label: 'Question bank', icon: CardSim},
  { href: '/jobs', label: 'Jobs', icon: Briefcase },
  { href: '/news', label: 'News', icon: Newspaper },
  { href: '/challenges', label: 'Challenges', icon: CalendarDays },
  { href: '/carrer', label: 'Career Counselling', icon: MessagesSquare },
  
  { href: '/billing', label: 'Billing', icon: CreditCard },
  { href: '/profilemain', label: 'Profile', icon: User },

];


const Sidebar = () => {
  const pathname = usePathname();

  // ✅ STEP 2: Add state to manage which dropdown is open
  const [openMenu, setOpenMenu] = useState(null);

  // This effect keeps the correct menu open when you navigate to a sub-page directly
  useEffect(() => {
    const activeParent = navLinks.find((link) =>
      link.subLinks?.some((sub) => pathname.startsWith(sub.href))
    );
    if (activeParent) {
      setOpenMenu(activeParent.href);
    }
  }, [pathname]);

  // Function to toggle the dropdown
  const handleMenuClick = (href) => {
    setOpenMenu(openMenu === href ? null : href);
  };

  return (
    <nav className={`d-none d-md-block ${styles.sidebar}`}>
      <div className={styles.logoContainer}>
        <Link href="/">
          <Image
            src="/images/logo.png"
            alt="AI Lab Logo"
            width={220}
            height={60}
            priority
          />
        </Link>
      </div>

      <ul className={styles.navList}>
        {navLinks.map((link) => {
          const isActive = pathname.startsWith(link.href);
          const Icon = link.icon;
          const isMenuOpen = openMenu === link.href;

          // ✅ STEP 3: Check if the link has sub-links and render accordingly
          if (link.subLinks) {
            return (
              <li
                key={link.href}
                className={`${styles.navItem} ${
                  isActive ? styles.active : ""
                } ${styles.hasSubmenu}`}
              >
                {/* This button toggles the dropdown */}
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
                {/* Conditionally render the sub-menu */}
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

          // Render a regular link if there are no sub-links
          return (
            <li
              key={link.href}
              className={`${styles.navItem} ${isActive ? styles.active : ""}`}
            >
              <Link href={link.href} className={styles.navLink}>
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
  );
};

export default Sidebar;
