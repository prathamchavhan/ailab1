"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';

const navLinks = [
  { href: '/ai-interview', label: 'AI Interview' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/jobs', label: 'Jobs' },
  { href: '/news', label: 'News' },
  { href: '/events', label: 'Events' },
  { href: '/career-counselling', label: 'Career Counselling' },
  { href: '/assessments', label: 'Assessments (Quiz, Test)' },
  { href: '/billing', label: 'Billing' },
  { href: '/profile', label: 'Profile' },
  { href: '/settings', label: 'App Settings' }
];

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <nav className={`d-none d-md-block col-lg-3 ${styles.sidebar}`}>
      <div className={styles.logoContainer}>
        <Link href="/">
          <Image src="/images/logo.png" alt="AI Lab Logo" width={270} height={90} priority />
        </Link>
      </div>
      
      <ul className={styles.navList}>
        {navLinks.map((link) => {
          // ✅ ADD THIS LINE inside the map function
          const isActive = pathname.startsWith(link.href);
          
          return (
            // ✅ AND WRAP YOUR LINK IN THIS <li>
            <li 
              key={link.href} 
              className={`${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <Link href={link.href} className={styles.navLink}>
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Sidebar;