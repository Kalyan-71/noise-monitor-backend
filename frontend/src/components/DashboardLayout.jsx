import { useState, useRef, useEffect } from 'react';
import { Bell, LogOut, Menu } from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router-dom';

const SidebarLink = ({ to, label, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className="block px-4 py-2 text-gray-700 hover:bg-blue-100 rounded-md"
  >
    {label}
  </Link>
);

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const sidebarRef = useRef(null);

  // Close sidebar when route changes (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Close sidebar when clicking outside (mobile only)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        window.innerWidth < 768
      ) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Fixed Navbar */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white shadow-md h-14 flex items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          {/* Hamburger for Mobile */}
          <button
            className="md:hidden text-gray-600"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu size={24} />
          </button>

          {/* Brand Name */}
          <h1 className="text-lg font-semibold text-blue-600">
            Hospital Noise Monitoring
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <Bell className="text-gray-600 cursor-pointer" />
          <button className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 flex items-center space-x-1">
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Content below Navbar */}
      <div className="pt-14 flex">
        {/* Sidebar */}
        <aside
          ref={sidebarRef}
          className={`bg-white w-64 shadow-md h-[calc(100vh-3.5rem)] p-4 z-30 transition-transform duration-200 ease-in-out
            fixed top-14 left-0 md:static
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            md:translate-x-0`}
          
        >
          <SidebarLink to="/dashboard" label="Dashboard" onClick={() => setSidebarOpen(false)} />
          <SidebarLink to="/realtime" label="Real-Time Graph" onClick={() => setSidebarOpen(false)} />
          <SidebarLink to="/analysis" label="Daily/Weekly/Monthly Analysis" onClick={() => setSidebarOpen(false)} />
          <SidebarLink to="/alerts" label="Alerts" onClick={() => setSidebarOpen(false)} />
          <SidebarLink to="/profile" label="User/Profile Settings" onClick={() => setSidebarOpen(false)} />
        </aside>

        {/* Main Content */}
        <main
          className="flex-1 p-4 transition-all duration-200"

          onClick={() => {
            if (sidebarOpen && window.innerWidth < 768) {
              setSidebarOpen(false);
            }
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
