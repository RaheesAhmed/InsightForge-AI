"use client";

import { useEffect, useState } from "react";
import {
  Users,
  FileText,
  MessageSquare,
  TrendingUp,
  CreditCard,
  BarChart,
  Settings,
  Bell,
  LogOut,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { adminApi, AdminStats } from "./api";
import FileViewer from "@/components/file-viewer";
import EditAssistantCard from "@/components/EditAssistantCard";
import UserManagement from "@/components/UserManagement";
import { Assistant } from "./api";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/useAuth";

const defaultStats: AdminStats = {
  overview: {
    totalUsers: 0,
    activeUsers: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
  },
  usageStats: {
    totalQuestions: 0,
    totalDocuments: 0,
    averageQuestionsPerUser: 0,
    averageDocumentsPerUser: 0,
  },
  subscriptions: {
    free: 0,
    pro: 0,
    enterprise: 0,
  },
  revenueHistory: [],
  userGrowth: [],
};

const defaultAssistant: Assistant = {
  id: "default",
  object: "assistant",
  created_at: Math.floor(Date.now() / 1000),
  name: "AI Assistant",
  description: "Your customizable AI assistant",
  model: "gpt-4",
  instructions: null,
  tools: [],
  file_ids: [],
  metadata: {},
};

const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>(defaultStats);
  const [assistant, setAssistant] = useState<Assistant>(defaultAssistant);
  const [isLoading, setIsLoading] = useState(true);
  const [isAssistantLoading, setIsAssistantLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();
  const router = useRouter();
  const { logout } = useAuth();

  const fetchStats = async () => {
    try {
      const data = await adminApi.getStats();
      if (data && data.overview) {
        setStats(data);
      } else {
        console.error("Invalid stats data received:", data);
        setStats(defaultStats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard statistics",
        variant: "destructive",
      });
      setStats(defaultStats);
    }
  };

  const fetchAssistantConfig = async () => {
    try {
      setIsAssistantLoading(true);
      const data = await adminApi.getAssistant();
      if (data && data.id && data.object === "assistant") {
        setAssistant(data);
      } else {
        console.error("Invalid assistant data received:", data);
        setAssistant(defaultAssistant);
      }
    } catch (error) {
      console.error("Error fetching assistant config:", error);
      toast({
        title: "Error",
        description: "Failed to fetch assistant configuration",
        variant: "destructive",
      });
      setAssistant(defaultAssistant);
    } finally {
      setIsAssistantLoading(false);
    }
  };

  useEffect(() => {
    const initializeDashboard = async () => {
      setIsLoading(true);
      try {
        await Promise.all([fetchStats(), fetchAssistantConfig()]);
      } catch (error) {
        console.error("Error initializing dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeDashboard();

    // Set up polling for real-time updates
    const interval = setInterval(fetchStats, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleEditAssistant = () => {
    fetchAssistantConfig();
  };

  const handleLogout = async () => {
    try {
      logout();
      router.push("/admin-login");
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of the admin panel",
      });
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const SidebarLink = ({ icon: Icon, label, active, onClick }: any) => (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 transition-all hover:text-white w-full",
        active && "bg-blue-500/10 text-white"
      )}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </button>
  );

  const renderStatsCard = (
    title: string,
    value: string | number,
    subtitle: string,
    Icon: any,
    color: string,
    bgColor: string
  ) => (
    <Card className="bg-[#0A0F1E]/50 backdrop-blur-xl border-white/10">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className={`rounded-lg p-2 ${bgColor}`}>
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-sm text-gray-400">{subtitle}</p>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-400">{title}</p>
        </div>
      </div>
    </Card>
  );

  const RevenueChart = () => (
    <Card className="col-span-2 bg-[#0A0F1E]/50 backdrop-blur-xl border-white/10 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">
        Revenue Overview
      </h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={stats.revenueHistory}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0088FE" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#0088FE" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
            <XAxis dataKey="date" stroke="#6B7280" />
            <YAxis stroke="#6B7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#111827",
                border: "1px solid #374151",
                borderRadius: "0.5rem",
              }}
            />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#0088FE"
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );

  const UserGrowthChart = () => (
    <Card className="col-span-2 bg-[#0A0F1E]/50 backdrop-blur-xl border-white/10 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">User Growth</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart data={stats.userGrowth}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
            <XAxis dataKey="date" stroke="#6B7280" />
            <YAxis stroke="#6B7280" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#111827",
                border: "1px solid #374151",
                borderRadius: "0.5rem",
              }}
            />
            <Bar dataKey="users" fill="#00C49F" />
          </RechartsBarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );

  const SubscriptionDistribution = () => (
    <Card className="col-span-1 bg-[#0A0F1E]/50 backdrop-blur-xl border-white/10 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">
        Subscription Distribution
      </h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={[
                { name: "Free", value: stats.subscriptions.free },
                { name: "Pro", value: stats.subscriptions.pro },
                {
                  name: "Enterprise",
                  value: stats.subscriptions.enterprise,
                },
              ]}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
            >
              {stats.subscriptions &&
                Object.values(stats.subscriptions).map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "#111827",
                border: "1px solid #374151",
                borderRadius: "0.5rem",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          <p className="text-sm text-gray-400">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <div className="w-64 border-r border-white/10 bg-[#0A0F1E]/50 p-6">
        <div className="flex flex-col gap-2">
          <SidebarLink
            icon={BarChart}
            label="Overview"
            active={activeTab === "overview"}
            onClick={() => setActiveTab("overview")}
          />
          <SidebarLink
            icon={Users}
            label="Users"
            active={activeTab === "users"}
            onClick={() => setActiveTab("users")}
          />
          <SidebarLink
            icon={FileText}
            label="Documents"
            active={activeTab === "documents"}
            onClick={() => setActiveTab("documents")}
          />
          <SidebarLink
            icon={MessageSquare}
            label="Assistant"
            active={activeTab === "assistant"}
            onClick={() => setActiveTab("assistant")}
          />
          <SidebarLink
            icon={Settings}
            label="Settings"
            active={activeTab === "settings"}
            onClick={() => setActiveTab("settings")}
          />
        </div>

        <div className="mt-auto pt-6">
          <Button
            variant="ghost"
            className="w-full justify-start text-gray-400 hover:text-white hover:bg-red-500/10"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-8 p-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </h2>
              <p className="text-sm text-gray-400">
                Manage your AI assistant and monitor system usage
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {activeTab === "overview" && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {renderStatsCard(
                  "Total Users",
                  stats.overview.totalUsers,
                  `${stats.overview.activeUsers} active`,
                  Users,
                  "text-blue-500",
                  "bg-blue-500/10"
                )}
                {renderStatsCard(
                  "Total Questions",
                  stats.usageStats.totalQuestions,
                  `${stats.usageStats.averageQuestionsPerUser.toFixed(
                    1
                  )} avg/user`,
                  MessageSquare,
                  "text-purple-500",
                  "bg-purple-500/10"
                )}
                {renderStatsCard(
                  "Total Documents",
                  stats.usageStats.totalDocuments,
                  `${stats.usageStats.averageDocumentsPerUser.toFixed(
                    1
                  )} avg/user`,
                  FileText,
                  "text-green-500",
                  "bg-green-500/10"
                )}
                {renderStatsCard(
                  "Monthly Revenue",
                  new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(stats.overview.monthlyRevenue / 100),
                  `${
                    stats.subscriptions.pro + stats.subscriptions.enterprise
                  } paid users`,
                  CreditCard,
                  "text-yellow-500",
                  "bg-yellow-500/10"
                )}
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                <RevenueChart />
                <SubscriptionDistribution />
              </div>
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <UserGrowthChart />
              </div>
            </>
          )}

          {activeTab === "users" && <UserManagement />}

          {activeTab === "assistant" && (
            <div className="grid grid-cols-1 gap-8">
              <EditAssistantCard
                assistant={assistant}
                isLoading={isAssistantLoading}
                onUpdate={handleEditAssistant}
              />
            </div>
          )}

          {activeTab === "documents" && <FileViewer />}

          {activeTab === "settings" && (
            <Card className="bg-[#0A0F1E]/50 backdrop-blur-xl border-white/10 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Settings
              </h3>
              {/* Add settings content here */}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
