"use client";
import React, { useState, ChangeEvent } from "react";
import { useUser } from "@clerk/clerk-react";
import { SettingsModel } from "../../../components/SettingsModel";
import EditCard from "../../../components/EditCard";
import FileViewer from "../../../components/file-viewer";
import DashboardOverview from "@/components/DashboardOverview";
import UserManagement from "@/components/UserManagement";
import {
  Building2,
  LayoutDashboard,
  Files,
  Users,
  Settings,
  FileText,
  Calendar,
  MessageSquare,
  Bell,
  ChevronDown,
  Search,
} from "lucide-react";

const Admin = () => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("Dashboard Overview");
  const [showSettings, setShowSettings] = useState(false);

  const toggleSettings = () => setShowSettings(!showSettings);

  const sidebarItems = [
    { name: "Dashboard Overview", icon: LayoutDashboard },
    { name: "Training Management", icon: FileText },
    { name: "Client Management", icon: Users },
    { name: "Settings", icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "Dashboard Overview":
        return <DashboardOverview />;
      case "Training Management":
        return <DataManagement />;
      case "Client Management":
        return <UserManagement />;
      case "Settings":
        return showSettings ? (
          <SettingsModel />
        ) : (
          <EditCard onClick={toggleSettings} />
        );
      default:
        return <div className="text-slate-800">Content for {activeTab}</div>;
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Sidebar */}
      <div className="w-72 bg-gradient-to-b from-blue-100 to-indigo-200 text-gray-800">
        {/* Brand */}
        <div className="p-6 border-b border-blue-200">
          <div className="flex items-center gap-3">
            <Building2 className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-800">VirtuHelpX</h1>
              <p className="text-sm text-gray-600">Administration Portal</p>
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-blue-200">
          <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-blue-200/50 transition-colors">
            <div className="w-4 h-4 p-4 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
              {user?.firstName?.[0] || "A"}
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium text-gray-800">
                {user?.fullName || "Admin User"}
              </div>
              <div className="text-sm text-gray-600">
                {user?.primaryEmailAddress?.emailAddress}
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          {sidebarItems.map((item) => (
            <button
              key={item.name}
              className={`w-full text-left p-3 flex items-center gap-3 rounded-lg mb-1 transition-all duration-200 ${
                activeTab === item.name
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-blue-200/50 hover:text-gray-900"
              }`}
              onClick={() => setActiveTab(item.name)}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-300">
          <div className="flex justify-between items-center px-8 py-4">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800">
                {activeTab}
              </h2>
              <p className="text-sm text-gray-600">
                Manage your VirtuHelpX platform
              </p>
            </div>

            <div className="flex items-center gap-6">
              {/* Search */}
              <div className="relative">
                {/* <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                /> */}
              </div>

              {/* Notifications */}
              {/* <button className="relative p-2 rounded-lg hover:bg-yellow-400/20 transition-colors">
                <Bell className="w-5 h-5 text-slate-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-yellow-400 rounded-full"></span>
              </button> */}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="bg-white rounded-xl shadow-sm border border-gray-300">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

interface FileData {
  name: string;
}

const DataManagement = () => {
  const [file, setFile] = useState<FileData | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    console.log("Uploading file:", file.name);
  };

  return (
    <div className="p-6 space-y-6 bg-white text-gray-800">
      {/* File Management */}
      <div>
        <FileViewer />
      </div>
    </div>
  );
};

export default Admin;
