import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchSales } from "./features/salesSlice";
import AnalyticsTab from "./components/AnalyticsTab";
import SalesTableTab from "./components/SalesTableTab";
import ActionsTab from "./components/ActionsTab";
import { AppDispatch } from "./store/store";
import { useTheme } from "./context/ThemeContext";

// Theme toggle button component
const ThemeToggle: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <button
      onClick={toggleDarkMode}
      className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
      aria-label="Toggle dark mode"
    >
      {isDarkMode ? (
        <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );
};

function App() {
  const [activeTab, setActiveTab] = useState(() => {
    // Get saved tab from localStorage or default to "analytics"
    return localStorage.getItem('activeTab') || "analytics";
  });
  const dispatch = useDispatch<AppDispatch>();

  // Save active tab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  React.useEffect(() => {
    dispatch(fetchSales({ 
      page: 1, 
      limit: 10,
      sortField: 'date',
      sortDirection: 'desc'
    }));
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="flex h-screen">
        {/* Left sidebar with tabs */}
        <aside className="w-64 bg-white dark:bg-gray-800 shadow-lg">
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Sales Dashboard</h1>
              <ThemeToggle />
            </div>
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab("analytics")}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  activeTab === "analytics"
                    ? "bg-blue-500 text-white"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                Analytics
              </button>
              <button
                onClick={() => setActiveTab("table")}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  activeTab === "table"
                    ? "bg-blue-500 text-white"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                Sales Table
              </button>
              <button
                onClick={() => setActiveTab("actions")}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  activeTab === "actions"
                    ? "bg-blue-500 text-white"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                Actions
              </button>
            </nav>
          </div>
        </aside>

        {/* Main content area */}
        <main className="flex-1 overflow-auto p-8">
          {activeTab === "analytics" && <AnalyticsTab />}
          {activeTab === "table" && <SalesTableTab />}
          {activeTab === "actions" && <ActionsTab />}
        </main>
      </div>
    </div>
  );
}

export default App;