"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Users, UserPlus, LogIn, Activity } from "lucide-react";

interface EmailAddress {
  emailAddress: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  emailAddresses: EmailAddress[];
  createdAt: string;
  lastSignInAt: string;
  lastActiveAt: string;
}

interface DashboardData {
  totalUsers: number;
  activeUsers: number;
  signUps: number;
  signIns: number;
  recentSignUps: User[];
  recentSignIns: User[];
}

interface StatTileProps {
  title: string;
  value: number;
  icon: React.ElementType;
}

const DashboardOverview = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalUsers: 0,
    activeUsers: 0,
    signUps: 0,
    signIns: 0,
    recentSignUps: [],
    recentSignIns: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/users");
        const users: User[] = response.data.users.data;
        processUserData(users);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchData();
  }, []);

  const processUserData = (users: User[]) => {
    const totalUsers = users.length;
    const recentSignUps = [...users]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 4);
    const recentSignIns = [...users]
      .sort(
        (a, b) =>
          new Date(b.lastSignInAt).getTime() -
          new Date(a.lastSignInAt).getTime()
      )
      .slice(0, 6);

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const activeUsers = users.filter(
      (user) =>
        new Date(user.lastActiveAt).getMonth() === currentMonth &&
        new Date(user.lastActiveAt).getFullYear() === currentYear
    ).length;
    const signUps = users.filter(
      (user) =>
        new Date(user.createdAt).getMonth() === currentMonth &&
        new Date(user.createdAt).getFullYear() === currentYear
    ).length;
    const signIns = users.filter(
      (user) =>
        new Date(user.lastSignInAt).getMonth() === currentMonth &&
        new Date(user.lastSignInAt).getFullYear() === currentYear
    ).length;

    setDashboardData({
      totalUsers,
      activeUsers,
      signUps,
      signIns,
      recentSignUps,
      recentSignIns,
    });
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const StatTile: React.FC<StatTileProps> = ({ title, value, icon: Icon }) => (
    <div className="bg-white hover:bg-gray-50 transition-colors duration-200 p-6 rounded-lg shadow-lg flex flex-col items-center justify-center border border-gray-300">
      <Icon className="w-8 h-8 mb-3 text-blue-600" />
      <h4 className="text-lg font-semibold mb-1 text-gray-800">{title}</h4>
      <p className="text-3xl font-bold text-blue-600">{value}</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6 min-h-screen">
      {/* Statistics Tiles */}
      <StatTile
        title="Total Users"
        value={dashboardData.totalUsers}
        icon={Users}
      />
      <StatTile
        title="Active Users"
        value={dashboardData.activeUsers}
        icon={Activity}
      />
      <StatTile
        title="Sign-ups"
        value={dashboardData.signUps}
        icon={UserPlus}
      />
      <StatTile title="Sign-ins" value={dashboardData.signIns} icon={LogIn} />

      {/* Recent Sign-ups */}
      <div className="col-span-full bg-white p-6 rounded-lg shadow-lg border border-gray-300">
        <h4 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
          <UserPlus className="w-6 h-6 mr-2 text-blue-600" />
          Recent Sign-ups
        </h4>
        <div className="space-y-4">
          {dashboardData.recentSignUps.map((user) => (
            <div
              key={user.id}
              className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold uppercase text-lg">
                {user.firstName[0]}
              </div>
              <div className="flex-grow">
                <p className="font-medium text-gray-800">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-sm text-gray-600">
                  {user.emailAddresses[0].emailAddress}
                </p>
              </div>
              <p className="text-sm text-gray-600">
                {formatDate(user.createdAt)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Sign-ins */}
      <div className="col-span-full bg-white p-6 rounded-lg shadow-lg border border-gray-300">
        <h4 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
          <LogIn className="w-6 h-6 mr-2 text-blue-600" />
          Recent Sign-ins
        </h4>
        <div className="space-y-4">
          {dashboardData.recentSignIns.map((user) => (
            <div
              key={user.id}
              className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold uppercase text-lg">
                {user.firstName[0]}
              </div>
              <div className="flex-grow">
                <p className="font-medium text-gray-800">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-sm text-gray-600">
                  {user.emailAddresses[0].emailAddress}
                </p>
              </div>
              <p className="text-sm text-gray-600">
                {formatDate(user.lastSignInAt)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
