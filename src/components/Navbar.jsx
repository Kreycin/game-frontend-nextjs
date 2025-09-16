// src/components/Navbar.jsx
'use client'; // <-- บอก Next.js ว่านี่คือ Client Component

import { usePathname } from 'next/navigation'; // <-- Import hook ใหม่สำหรับเช็ค URL
import Link from 'next/link'; // <-- Import Link จาก Next.js
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const navLinks = [
  { href: "/", text: "New character leaks" },
  { href: "/tier-list", text: "Tier List" },
  // { href: "/game-guide", text: "Game guide" },
];

const Navbar = () => {
  const { isLoggedIn, profile, logout } = useAuth();
  const pathname = usePathname(); // <-- Hook สำหรับอ่าน URL ปัจจุบัน

  return (
    <header className="navbar-container">
      <nav className="navbar-main-links">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={isActive ? 'nav-link active' : 'nav-link'}
            >
              {link.text}
            </Link>
          );
        })}
      </nav>

      <div className="navbar-right-section">
        {isLoggedIn ? (
          <div className="user-actions">
            <Link href="/profile" className="profile-link">
              {profile?.displayName || 'Profile'}
            </Link>
            <button onClick={logout} className="logout-button">
              Logout
            </button>
          </div>
        ) : (
          <div className="guest-actions">
            <Link href="/login" className="login-link">Login</Link>
            <Link href="/register" className="register-button">
              Register
            </Link>
          </div>
        )}

        {/* เราจะจัดการ Google Translate ในภายหลัง */}
      </div>
    </header>
  );
};

export default Navbar;