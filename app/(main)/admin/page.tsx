"use client";

import { useEffect, useState } from "react";
import {
  Users,
  FileText,
  MessageSquare,
  TrendingUp,
  CreditCard,
  BarChart,
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

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>(defaultStats);
  const [assistant, setAssistant] = useState<Assistant>(defaultAssistant);
  const [isLoading, setIsLoading] = useState(true);
  const [isAssistantLoading, setIsAssistantLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

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
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Dashboard Overview</h2>
          <p className="text-sm text-gray-400">
            Manage your AI assistant and monitor system usage
          </p>
        </div>
      </div>

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
          `${stats.usageStats.averageQuestionsPerUser.toFixed(1)} avg/user`,
          MessageSquare,
          "text-purple-500",
          "bg-purple-500/10"
        )}
        {renderStatsCard(
          "Total Documents",
          stats.usageStats.totalDocuments,
          `${stats.usageStats.averageDocumentsPerUser.toFixed(1)} avg/user`,
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

      {/* Assistant Management Section */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <EditAssistantCard
          assistant={assistant}
          isLoading={isAssistantLoading}
          onUpdate={handleEditAssistant}
        />
        <FileViewer />
      </div>

      {/* User Management Section */}
      <UserManagement />
    </div>
  );
}
