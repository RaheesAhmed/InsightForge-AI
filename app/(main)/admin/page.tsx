"use client";
import React, { useState } from "react";
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
    { name: "Contract Management", icon: FileText },
    { name: "Client Management", icon: Users },
    { name: "Appointments", icon: Calendar },
    { name: "Communications", icon: MessageSquare },
    { name: "Settings", icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "Dashboard Overview":
        return <DashboardOverview />;
      case "Contract Management":
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
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <div className="w-72 bg-gradient-to-b from-slate-900 to-slate-800 text-white shadow-xl">
        {/* Brand */}
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <Building2 className="w-8 h-8 text-yellow-400" />
            <div>
              <h1 className="text-xl font-bold">BuilderAssist AI</h1>
              <p className="text-sm text-slate-400">Administration Portal</p>
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-slate-700/50">
          <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-700/50 transition-colors">
            <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-slate-900 font-bold">
              {user?.firstName?.[0] || "A"}
            </div>
            <div className="flex-1 text-left">
              <div className="font-medium">
                {user?.fullName || "Admin User"}
              </div>
              <div className="text-sm text-slate-400">
                {user?.primaryEmailAddress?.emailAddress}
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          {sidebarItems.map((item) => (
            <button
              key={item.name}
              className={`w-full text-left p-3 flex items-center gap-3 rounded-lg mb-1 transition-all duration-200 ${
                activeTab === item.name
                  ? "bg-yellow-400 text-slate-900"
                  : "text-slate-300 hover:bg-yellow-400/20 hover:text-yellow-400"
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
        <header className="bg-white shadow-sm border-b border-slate-200">
          <div className="flex justify-between items-center px-8 py-4">
            <div>
              <h2 className="text-2xl font-semibold text-slate-800">
                {activeTab}
              </h2>
              <p className="text-sm text-slate-500">
                Manage your construction business
              </p>
            </div>

            <div className="flex items-center gap-6">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                />
              </div>

              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-yellow-400/20 transition-colors">
                <Bell className="w-5 h-5 text-slate-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-yellow-400 rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

const DataManagement = () => {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    console.log("Uploading file:", file.name);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {[
          { label: "Total Contracts", value: "1,234", change: "+12%" },
          { label: "Active Contracts", value: "789", change: "+5%" },
          { label: "Pending Review", value: "45", change: "-8%" },
          { label: "Templates", value: "28", change: "+2%" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-slate-50 rounded-lg p-4 border border-slate-200"
          >
            <p className="text-sm text-slate-600">{stat.label}</p>
            <div className="flex items-end gap-2 mt-1">
              <p className="text-2xl font-semibold text-slate-800">
                {stat.value}
              </p>
              <p
                className={`text-sm ${
                  stat.change.startsWith("+")
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {stat.change}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* File Management */}
      <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          Contract Templates
        </h3>
        <FileViewer />
      </div>
    </div>
  );
};

export default Admin;
