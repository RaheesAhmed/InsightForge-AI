"use client";

import * as React from "react";
import {
  ArrowUp,
  PaperclipIcon,
  User,
  Bot,
  Plus,
  Trash2,
  MessageSquare,
  Building,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { AssistantStream } from "openai/lib/AssistantStream";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import Sidebar from "@/components/ChatSideBar";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

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

const Message = ({ role, content }: MessageProps) => {
  const isUser = role === "user";
  return (
    <div
      className={cn(
        "flex items-start gap-4 py-4 px-4 justify-start",
        isUser ? "bg-white" : "bg-slate-50"
      )}
    >
      <div
        className={cn(
          "rounded-full p-2 w-8 h-8 flex items-center justify-center",
          isUser ? "bg-slate-900" : "bg-yellow-400"
        )}
      >
        {isUser ? (
          <User className="h-4 w-4 text-white" />
        ) : (
          <Bot className="h-4 w-4 text-slate-900" />
        )}
      </div>
      <div className="flex-1 max-w-4xl prose prose-sm dark:prose-invert">
        {isUser ? (
          <p className="text-sm text-slate-800">{content}</p>
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({
                node,
                inline,
                className,
                children,
                ...props
              }: {
                node?: any;
                inline?: boolean;
                className?: string;
                children: React.ReactNode;
              }) {
                const match = /language-(\w+)/.exec(className || "");
                return !inline && match ? (
                  <SyntaxHighlighter
                    {...props}
                    style={oneDark}
                    language={match[1]}
                    PreTag="div"
                    className="rounded-md"
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                ) : (
                  <code {...props} className={className}>
                    {children}
                  </code>
                );
              },
              a: ({ node, ...props }) => (
                <a
                  {...props}
                  className="text-blue-500 hover:text-blue-700 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              ),
              table: ({ node, ...props }) => (
                <table
                  {...props}
                  className="border-collapse border border-slate-300"
                />
              ),
              th: ({ node, ...props }) => (
                <th
                  {...props}
                  className="border border-slate-300 px-4 py-2 bg-slate-100"
                />
              ),
              td: ({ node, ...props }) => (
                <td {...props} className="border border-slate-300 px-4 py-2" />
              ),
              blockquote: ({ node, ...props }) => (
                <blockquote
                  {...props}
                  className="border-l-4 border-slate-200 pl-4 italic my-4"
                />
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
};

export default function ChatPage() {
  const [messages, setMessages] = React.useState<MessageProps[]>([]);
  const [sessions, setSessions] = React.useState<SessionProps[]>(() => {
    if (typeof window !== "undefined") {
      const savedSessions = localStorage.getItem("chatSessions");
      return savedSessions ? JSON.parse(savedSessions) : [];
    }
    return [];
  });
  const [activeSessionIndex, setActiveSessionIndex] = React.useState<
    number | null
  >(null);
  const [userInput, setUserInput] = React.useState("");
  const [fileInfo, setFileInfo] = React.useState("");
  const [threadId, setThreadId] = React.useState("");
  const [isUploading, setIsUploading] = React.useState(false);
  const scrollAreaRef = React.useRef<HTMLDivElement>(null);
  const { user } = useUser();

  React.useEffect(() => {
    const createThread = async () => {
      const res = await fetch(`/api/assistants/threads`, { method: "POST" });
      const data = await res.json();
      setThreadId(data.threadId);
    };
    createThread();
  }, []);

  React.useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  React.useEffect(() => {
    if (activeSessionIndex !== null && sessions[activeSessionIndex]) {
      const updatedSessions = [...sessions];
      updatedSessions[activeSessionIndex] = {
        ...updatedSessions[activeSessionIndex],
        messages: messages,
      };
      setSessions(updatedSessions);
      localStorage.setItem("chatSessions", JSON.stringify(updatedSessions));
    }
  }, [messages, activeSessionIndex]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("/api/assistants/files/code-interpreter", {
          method: "POST",
          body: formData,
        });
        const result = await response.json();
        setFileInfo(`${file.name} (ID: ${result.fileId})`);
        setUserInput(`${file.name}`);
      } catch (error) {
        console.error("Error uploading file:", error);
      }
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploading || (!userInput.trim() && !fileInfo)) return;

    const messageContent = `${userInput} ${fileInfo}`.trim();
    sendMessage(messageContent);

    if (activeSessionIndex !== null && messages.length === 0) {
      const updatedSessions = [...sessions];
      updatedSessions[activeSessionIndex] = {
        ...updatedSessions[activeSessionIndex],
        title:
          messageContent.slice(0, 30) +
          (messageContent.length > 30 ? "..." : ""),
      };
      setSessions(updatedSessions);
      localStorage.setItem("chatSessions", JSON.stringify(updatedSessions));
    }

    setMessages((prev) => [...prev, { role: "user", content: messageContent }]);
    setUserInput("");
    setFileInfo("");
  };

  const sendMessage = async (text: string) => {
    if (!threadId) return;
    const response = await fetch(
      `/api/assistants/threads/${threadId}/messages`,
      {
        method: "POST",
        body: JSON.stringify({ content: text }),
      }
    );
    if (response.body) {
      const stream = AssistantStream.fromReadableStream(response.body);
      handleReadableStream(stream);
    }
  };

  const handleReadableStream = (stream: AssistantStream) => {
    stream.on("textCreated", () => appendMessage("assistant", ""));
    stream.on("textDelta", (delta) => {
      if (delta.value != null) appendToLastMessage(delta.value);
    });
  };

  const appendToLastMessage = (text: string) => {
    setMessages((prev) => {
      const lastMessage = prev[prev.length - 1];
      return [
        ...prev.slice(0, -1),
        { ...lastMessage, content: lastMessage.content + text },
      ];
    });
  };

  const appendMessage = (
    role: "user" | "assistant" | "code",
    content: string
  ) => {
    setMessages((prev) => [...prev, { role, content }]);
  };

  const handleNewChat = async () => {
    const res = await fetch(`/api/assistants/threads`, { method: "POST" });
    const data = await res.json();

    const newSession = {
      id: `session-${Date.now()}`,
      messages: [],
      title: "New Construction Project",
      createdAt: Date.now(),
    };

    setSessions((prevSessions) => [...prevSessions, newSession]);
    setActiveSessionIndex(sessions.length);
    setMessages([]);
    setThreadId(data.threadId);
  };

  const handleSelectChat = (index: number) => {
    if (index >= 0 && index < sessions.length) {
      setActiveSessionIndex(index);
      setMessages(sessions[index].messages);
    }
  };

  const handleClearAllChats = () => {
    setSessions([]);
    localStorage.removeItem("chatSessions");
    setActiveSessionIndex(null);
    setMessages([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex h-[100vh]">
      <Sidebar
        sessions={sessions}
        activeSessionIndex={activeSessionIndex}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onClearAllChats={handleClearAllChats}
      />
      <div className="flex flex-1 flex-col bg-white">
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold"></span>
          </div>
          <div className="text-sm">
            {user?.fullName || user?.username || "Construction Professional"}
          </div>
        </div>
        <ScrollArea
          className="flex-1"
          ref={scrollAreaRef}
          style={{ height: "calc(100vh - 144px)" }}
        >
          <div className="max-w-3xl mx-auto">
            {messages.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <Building className="h-12 w-12 mx-auto mb-4 text-yellow-400" />
                <h2 className="text-2xl font-bold mb-2">
                  Welcome to ConstructAI
                </h2>
                <p>
                  Your AI assistant for construction management. How can I help
                  you today?
                </p>
              </div>
            )}
            {messages.map((msg, index) => (
              <Message key={index} role={msg.role} content={msg.content} />
            ))}
          </div>
        </ScrollArea>
        <Separator />
        <div className="max-w-3xl mx-auto w-full px-4 py-4">
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 bg-white border border-slate-300 rounded-lg p-2"
          >
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="shrink-0"
              onClick={() => document.getElementById("file-upload")?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-yellow-400 border-t-transparent" />
              ) : (
                <PaperclipIcon className="h-4 w-4 text-slate-500" />
              )}
            </Button>
            <Textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask about contracts, schedules, or construction management..."
              className="min-h-[2.5rem] flex-1 resize-none border-0 focus-visible:ring-0"
            />
            <Button
              type="submit"
              size="icon"
              variant="ghost"
              className={cn(
                "shrink-0",
                !userInput.trim() && !fileInfo
                  ? "text-slate-400"
                  : "text-yellow-400"
              )}
              disabled={isUploading || (!userInput.trim() && !fileInfo)}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
      <input
        type="file"
        id="file-upload"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
