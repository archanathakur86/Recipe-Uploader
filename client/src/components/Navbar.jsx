import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <header
        style={{
          maxWidth: 1120, // ~max-w-6xl
          marginTop: 16, // mt-4
          borderRadius: 16, // rounded-2xl
          background: 'rgba(255, 255, 255, 0.9)', // bg-white/90
          backdropFilter: 'blur(16px)', // backdrop-blur-lg
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.12)', // shadow-xl
          border: '1px solid #F3F4F6', // border-gray-100
          width: '100%',
          pointerEvents: 'auto'
        }}
      >
        <div
          style={{
            maxWidth: 1120,
            margin: '0 auto',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          {/* Brand */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800, color: '#111827', textDecoration: 'none' }}>
            <span
              style={{
                width: 32,
                height: 32,
                borderRadius: 9999,
                background: 'linear-gradient(135deg, #E85D04, #F48C06)',
                display: 'inline-block',
                boxShadow: '0 8px 24px rgba(232, 93, 4, 0.35)'
              }}
              aria-hidden
            />
            HomePlate
          </Link>

          {/* Nav Links - Floating Pill Group */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Dashboard */}
            <Link
              to="/dashboard"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                textDecoration: 'none',
                padding: '10px 16px',
                borderRadius: 9999,
                fontWeight: isActive('/dashboard') ? 800 : 600,
                color: isActive('/dashboard') ? '#EA580C' : '#4B5563', // active orange text
                background: isActive('/dashboard') ? 'rgba(253, 230, 138, 0.6)' : 'transparent',
                transition: 'all 200ms ease'
              }}
              onMouseEnter={(e) => {
                if (!isActive('/dashboard')) {
                  e.currentTarget.style.background = '#F3F4F6'; // gray pill hover
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive('/dashboard')) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              {/* Layout Icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
              </svg>
              Dashboard
            </Link>

            {/* Add Recipe */}
            <Link
              to="/add"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                textDecoration: 'none',
                padding: '10px 16px',
                borderRadius: 9999,
                fontWeight: isActive('/add') ? 800 : 600,
                color: isActive('/add') ? '#EA580C' : '#4B5563',
                background: isActive('/add') ? 'rgba(253, 230, 138, 0.6)' : 'transparent',
                transition: 'all 200ms ease'
              }}
              onMouseEnter={(e) => {
                if (!isActive('/add')) {
                  e.currentTarget.style.background = '#F3F4F6';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive('/add')) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              {/* Plus Icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add Recipe
            </Link>

            {/* Public Feed */}
            <Link
              to="/feed"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                textDecoration: 'none',
                padding: '10px 16px',
                borderRadius: 9999,
                fontWeight: isActive('/feed') ? 800 : 600,
                color: isActive('/feed') ? '#EA580C' : '#4B5563',
                background: isActive('/feed') ? 'rgba(253, 230, 138, 0.6)' : 'transparent',
                transition: 'all 200ms ease'
              }}
              onMouseEnter={(e) => {
                if (!isActive('/feed')) {
                  e.currentTarget.style.background = '#F3F4F6';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive('/feed')) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              {/* Globe Icon */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" />
              </svg>
              Public Feed
            </Link>
          </nav>
        </div>
      </header>
    </div>
  );
}
