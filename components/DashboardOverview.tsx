"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Users, UserPlus, LogIn, Activity } from "lucide-react";

const DashboardOverview = () => {
  const [dashboardData, setDashboardData] = useState({
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
        const users = response.data.users.data;
        processUserData(users);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchData();
  }, []);

  const processUserData = (users) => {
    const totalUsers = users.length;
    const recentSignUps = users
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 4);
    const recentSignIns = users
      .sort((a, b) => b.lastSignInAt - a.lastSignInAt)
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

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const StatTile = ({ title, value, icon: Icon }) => (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center">
      <Icon className="w-8 h-8 mb-2 text-yellow-400" />
      <h4 className="text-lg font-semibold mb-1">{title}</h4>
      <p className="text-3xl font-bold text-yellow-400">{value}</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
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
      <div className="col-span-full bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-lg shadow-md">
        <h4 className="text-xl font-semibold mb-4 text-yellow-400">
          Recent Sign-ups
        </h4>
        <div className="space-y-4">
          {dashboardData.recentSignUps.map((user) => (
            <div
              key={user.id}
              className="flex items-center space-x-4 bg-slate-800 p-3 rounded-md"
            >
              <div className="h-10 w-10 rounded-full bg-yellow-400 flex items-center justify-center text-slate-900 font-bold uppercase">
                {user.firstName[0]}
              </div>
              <div className="flex-grow">
                <p className="font-medium">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-sm text-slate-400">
                  {user.emailAddresses[0].emailAddress}
                </p>
              </div>
              <p className="text-sm text-slate-400">
                {formatDate(user.createdAt)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Sign-ins */}
      <div className="col-span-full bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-lg shadow-md">
        <h4 className="text-xl font-semibold mb-4 text-yellow-400">
          Recent Sign-ins
        </h4>
        <div className="space-y-4">
          {dashboardData.recentSignIns.map((user) => (
            <div
              key={user.id}
              className="flex items-center space-x-4 bg-slate-800 p-3 rounded-md"
            >
              <div className="h-10 w-10 rounded-full bg-yellow-400 flex items-center justify-center text-slate-900 font-bold uppercase">
                {user.firstName[0]}
              </div>
              <div className="flex-grow">
                <p className="font-medium">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-sm text-slate-400">
                  {user.emailAddresses[0].emailAddress}
                </p>
              </div>
              <p className="text-sm text-slate-400">
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
