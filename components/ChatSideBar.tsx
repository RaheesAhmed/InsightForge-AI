"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Plus, FileText, Trash2, Settings, Building2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const getSessionTitle = (session: SessionProps) => {
    if (session.title) return session.title;
    return "New Contract";
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

  return (
    <TooltipProvider>
      <div className="flex h-full w-[280px] flex-col bg-gradient-to-b from-slate-900 to-slate-800 text-white">
        {/* Logo Section */}
        <div className="flex items-center p-4 border-b border-slate-700/50">
          <Building2 className="w-6 h-6 text-yellow-500 mr-2" />
          <span className="font-semibold">BuilderAssist AI</span>
        </div>

        {/* New Contract Button */}
        <div className="flex items-center p-4">
          <Button
            onClick={onNewChat}
            className="w-full justify-start gap-2 bg-gradient-to-r from-yellow-500 to-yellow-400 text-slate-900 hover:from-yellow-400 hover:to-yellow-300 transition-all duration-300"
          >
            <Plus size={16} />
            New Contract
          </Button>
        </div>

        {/* Contracts List */}
        <ScrollArea className="flex-1 px-2">
          {Object.entries(groupedSessions).map(([date, dateSessions]) => (
            <div key={date}>
              <div className="px-3 py-2 text-xs text-slate-400 font-medium">
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
                    className={cn(
                      "mb-1 w-full justify-start gap-2 rounded-lg py-3 text-left transition-all duration-200",
                      actualIndex === activeSessionIndex
                        ? "bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30"
                        : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                    )}
                  >
                    <FileText size={16} className="shrink-0" />
                    <span className="truncate text-sm">
                      {getSessionTitle(session)}
                    </span>
                  </Button>
                );
              })}
            </div>
          ))}
        </ScrollArea>

        {/* Bottom Actions */}
        <Separator className="my-2 bg-slate-700/50" />
        <div className="p-4 space-y-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onClearAllChats}
                variant="ghost"
                className="w-full justify-start gap-2 text-slate-400 hover:bg-slate-700/50 hover:text-white transition-colors"
              >
                <Trash2 size={16} />
                Clear History
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Clear all contracts</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className="w-full justify-start gap-2 text-slate-400 hover:bg-slate-700/50 hover:text-white transition-colors"
              >
                <Settings size={16} />
                Settings
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Configure your preferences</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Sidebar;
