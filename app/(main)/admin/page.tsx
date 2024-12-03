"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { SettingsModel } from "../../../components/SettingsModel";
import EditAssistantCard from "../../../components/EditAssistantCard";
import FileViewer from "../../../components/file-viewer";
import DashboardOverview from "@/components/DashboardOverview";
import UserManagement from "@/components/UserManagement";

interface FileData {
  name: string;
}

function DataManagement() {
  const [file, setFile] = useState<FileData | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
}

function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loginError, setLoginError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Check if admin is authenticated
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok) {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Login failed");
      }

      setIsAuthenticated(true);
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : "Login failed");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Admin Login
            </h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            {loginError && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{loginError}</div>
              </div>
            )}
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Admin email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <Admin
      sidebarItems={[
        { name: "Dashboard Overview", icon: LayoutDashboard },
        { name: "Training Management", icon: FileText },
        { name: "Client Management", icon: Users },
        { name: "Settings", icon: Settings },
      ]}
    />
  );
}

interface AdminProps {
  sidebarItems: { name: string; icon: any }[];
}

function Admin({ sidebarItems }: AdminProps) {
  const [activeTab, setActiveTab] = useState("Dashboard Overview");
  const [showSettings, setShowSettings] = useState(false);

  const toggleSettings = () => setShowSettings(!showSettings);

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
          <EditAssistantCard onClick={toggleSettings} />
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
              <div className="relative"></div>
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
}

export default AdminDashboard;