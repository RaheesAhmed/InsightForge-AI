"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  Plus,
  FileText,
  Trash2,
  Settings,
  Building2,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Brain,
  CircleChevronRight,
  PanelRightOpen,
  ArrowBigRight,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";
import SettingsSheet from "./SettingsSheet";

type MessageProps = {
  role: "user" | "assistant" | "code";
  content: string;
};

type SessionProps = {
  id: string;
  messages: MessageProps[];
  title?: string;
  createdAt: number;
};

interface SidebarProps {
  sessions: SessionProps[];
  activeSessionIndex: number | null;
  onNewChat: () => void;
  onSelectChat: (index: number) => void;
  onClearAllChats: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  activeSessionIndex,
  onNewChat,
  onSelectChat,
  onClearAllChats,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const getSessionTitle = (session: SessionProps) => {
    if (session.title) return session.title;
    return "New Chat";
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  // Group sessions by date
  const groupedSessions = React.useMemo(() => {
    const groups: { [key: string]: SessionProps[] } = {};
    sessions.forEach((session) => {
      const dateKey = formatDate(session.createdAt);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(session);
    });
    return groups;
  }, [sessions]);

  // Modify the New Chat button click handler
  const handleNewChat = () => {
    onNewChat(); // This will directly start a new chat
  };

  return (
    <TooltipProvider>
      <div
        data-sidebar
        className={cn(
          "fixed md:relative z-20 flex h-full flex-col bg-gray-50 border-r border-gray-200 transition-all duration-300",
          "transform -translate-x-full md:translate-x-0",
          isCollapsed ? "w-[60px]" : "w-[280px]"
        )}
      >
        {/* Logo Section */}
        <div className="flex items-center p-3 sm:p-4 border-b border-gray-200 bg-white justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-8 w-8 text-indigo-600" />
            {!isCollapsed && (
              <span className="text-xl font-bold text-white">
                <span className="text-indigo-600 font-bold text-2xl">
                  Virtu HelpX
                </span>
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="p-0 h-8 w-8  flex items-right justify-right "
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <ChevronRight className="h-8 w-8 ml-4 font-bold rounded bg-indigo-600 text-white" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Update the New Chat Button */}
        <div className="flex items-center p-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleNewChat} // Use the new handler
                className={cn(
                  "justify-start gap-2 bg-indigo-600 text-white hover:bg-indigo-700 transition-all duration-200",
                  isCollapsed ? "w-10 px-2" : "w-full"
                )}
              >
                <Plus className="h-5 w-5" />
                {!isCollapsed && "New Chat"}
              </Button>
            </TooltipTrigger>
            {isCollapsed && (
              <TooltipContent side="right">New Chat</TooltipContent>
            )}
          </Tooltip>
        </div>

        {/* Chat List */}
        <ScrollArea className="flex-1 px-2">
          {!isCollapsed &&
            Object.entries(groupedSessions).map(([date, dateSessions]) => (
              <div key={date}>
                <div className="px-3 py-2 text-xs text-gray-500 font-medium">
                  {date}
                </div>
                {dateSessions.map((session, index) => {
                  const actualIndex = sessions.findIndex(
                    (s) => s.id === session.id
                  );
                  return (
                    <Button
                      key={session.id}
                      onClick={() => onSelectChat(actualIndex)}
                      variant="ghost"
                      className={cn(
                        "mb-1 w-full justify-start gap-2 rounded-lg py-2 text-left transition-all duration-200",
                        actualIndex === activeSessionIndex
                          ? "bg-white text-indigo-600 border border-gray-200 shadow-sm"
                          : "text-gray-500 hover:bg-white hover:text-gray-600"
                      )}
                    >
                      <MessageSquare className="h-4 w-4 shrink-0" />
                      <span className="truncate text-sm">
                        {getSessionTitle(session)}
                      </span>
                    </Button>
                  );
                })}
              </div>
            ))}
          {isCollapsed &&
            sessions.map((session, index) => (
              <Tooltip key={session.id}>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => onSelectChat(index)}
                    variant="ghost"
                    className={cn(
                      "mb-1 w-10 p-0 justify-center rounded-lg transition-all duration-200",
                      index === activeSessionIndex
                        ? "bg-white text-indigo-600 border border-gray-200 shadow-sm"
                        : "text-gray-500 hover:bg-white hover:text-gray-600"
                    )}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {getSessionTitle(session)}
                </TooltipContent>
              </Tooltip>
            ))}
        </ScrollArea>

        {/* Bottom Actions */}
        <Separator className="bg-gray-200" />
        <div className="p-4 space-y-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onClearAllChats}
                variant="ghost"
                className={cn(
                  "justify-start gap-2 text-gray-500 hover:bg-white hover:text-gray-600 transition-all duration-200",
                  isCollapsed ? "w-10 px-2" : "w-full"
                )}
              >
                <Trash2 className="h-4 w-4" />
                {!isCollapsed && "Clear History"}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Clear all chats</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "justify-start gap-2 text-gray-500 hover:bg-white hover:text-gray-600 transition-all duration-200",
                  isCollapsed ? "w-10 px-2" : "w-full"
                )}
                onClick={() => setIsSettingsOpen(true)}
              >
                <Settings className="h-4 w-4" />
                {!isCollapsed && "Settings"}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              Configure your preferences
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Mobile Overlay */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-10 md:hidden transition-opacity duration-300 opacity-0 pointer-events-none"
        onClick={() => {
          const sidebar = document.querySelector("[data-sidebar]");
          sidebar?.classList.remove("translate-x-0");
          sidebar?.classList.add("-translate-x-full");
        }}
      />

      <SettingsSheet isOpen={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </TooltipProvider>
  );
};

export default Sidebar;
