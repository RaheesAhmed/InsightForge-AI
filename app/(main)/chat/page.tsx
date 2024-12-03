"use client";

import * as React from "react";
import { Paperclip, User, Bot, Copy, Check, Brain, Send } from "lucide-react";
import { useAuth, getCurrentUser } from "@/lib/useAuth";
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
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useEffect, useState } from "react";
import PaymentModal from "@/components/PaymentModal";
import { toast } from "@/hooks/use-toast";
import AssistantFunctionsCard from "@/components/AssistantFunctionsCard";
import { Subscription, SubscriptionPlan } from "@/types/subscription";

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

interface CodeProps extends React.HTMLAttributes<HTMLElement> {
  node?: any;
  inline?: boolean;
  className?: string;
  children: React.ReactNode;
}

const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "FREE",
    name: "Free",
    description: "Basic features for personal use",
    price: "0",
    features: ["3 Documents/month", "20 Questions/month"],
    documentsPerMonth: 3,
    questionsPerMonth: 20,
  },
  // ... rest of the plans remain the same
];

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      className="absolute right-2 top-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors backdrop-blur-sm"
      onClick={handleCopy}
    >
      {copied ? (
        <Check className="h-4 w-4 text-green-400" />
      ) : (
        <Copy className="h-4 w-4 text-blue-400" />
      )}
    </button>
  );
};

const LoadingSpinner = () => {
  return (
    <div className="flex items-center space-x-2">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
      <span className="text-sm text-gray-400">Generating response...</span>
    </div>
  );
};

const Message = ({ role, content }: MessageProps) => {
  const { user } = useAuth();
  const isUser = role === "user";
  const isGenerating = content === "" && role === "assistant";

  return (
    <div
      className={cn(
        "group w-full border-b border-white/10",
        isUser ? "bg-white/5" : "bg-white/10",
        "backdrop-blur-sm"
      )}
    >
      <div className="text-base gap-4 md:gap-6 md:max-w-2xl lg:max-w-[38rem] xl:max-w-3xl p-4 md:py-6 lg:px-0 m-auto flex">
        <div className="flex-shrink-0 flex flex-col relative items-end">
          <div
            className={cn(
              "rounded-lg flex items-center justify-center",
              isUser
                ? "bg-gradient-to-r from-blue-500 to-indigo-500"
                : "bg-white/10",
              "w-[30px] h-[30px]"
            )}
          >
            {isUser ? (
              <User className="h-4 w-4 text-white" />
            ) : (
              <Bot className="h-4 w-4 text-blue-400" />
            )}
          </div>
        </div>
        <div className="relative flex w-[calc(100%-50px)] flex-col gap-1">
          {isUser ? (
            <p className="text-white/90">{content}</p>
          ) : isGenerating ? (
            <LoadingSpinner />
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
                }: CodeProps) {
                  const match = /language-(\w+)/.exec(className || "");
                  const code = String(children).replace(/\n$/, "");
                  return !inline && match ? (
                    <div className="relative">
                      <SyntaxHighlighter
                        {...props}
                        style={vscDarkPlus}
                        language={match[1]}
                        PreTag="div"
                        className="rounded-lg !bg-[#1a1b26] !mt-0 border border-white/10"
                        showLineNumbers
                        customStyle={{
                          margin: 0,
                          padding: "1.5rem 1rem",
                          paddingRight: "2.5rem",
                          background: "rgba(0, 0, 0, 0.3)",
                        }}
                      >
                        {code}
                      </SyntaxHighlighter>
                      <CopyButton text={code} />
                    </div>
                  ) : (
                    <code
                      {...props}
                      className={cn(
                        "bg-white/5 rounded px-1 py-0.5 text-blue-400",
                        className
                      )}
                    >
                      {children}
                    </code>
                  );
                },
                p: ({ children }) => (
                  <p className="text-gray-300">{children}</p>
                ),
                a: ({ node, ...props }) => (
                  <a
                    {...props}
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                ),
                table: ({ node, ...props }) => (
                  <table
                    {...props}
                    className="border-collapse border border-white/10"
                  />
                ),
                th: ({ node, ...props }) => (
                  <th
                    {...props}
                    className="border border-white/10 px-4 py-2 bg-white/5"
                  />
                ),
                td: ({ node, ...props }) => (
                  <td {...props} className="border border-white/10 px-4 py-2" />
                ),
                blockquote: ({ node, ...props }) => (
                  <blockquote
                    {...props}
                    className="border-l-4 border-blue-500/50 pl-4 italic my-4 text-gray-300"
                  />
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          )}
        </div>
      </div>
    </div>
  );
};

const autoResizeTextArea = (element: HTMLTextAreaElement) => {
  element.style.height = "inherit";
  element.style.height = `${Math.min(element.scrollHeight, 200)}px`; // Max height of 200px
};

const ChatPage = () => {
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
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  React.useEffect(() => {
    const createThread = async () => {
      const res = await fetch(`/api/assistants/threads`, { method: "POST" });
      const data = await res.json();
      setThreadId(data.threadId);
    };
    createThread();
  }, []);

  React.useEffect(() => {
    scrollToBottom();
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

  React.useEffect(() => {
    if (user?.subscription) {
      setSubscription(user.subscription as unknown as Subscription);
    }
  }, [user]);

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

    if (!checkSubscriptionLimit()) {
      return;
    }

    const messageContent = `${userInput} ${fileInfo}`.trim();
    setMessages((prev) => [...prev, { role: "user", content: messageContent }]);

    setTimeout(scrollToBottom, 100);

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

    setUserInput("");
    setFileInfo("");
    sendMessage(messageContent);
  };

  const sendMessage = async (text: string) => {
    if (!threadId) return;

    try {
      // Update question usage before sending message
      await updateUsage("question");

      // If there's a file attached, update document usage
      if (fileInfo) {
        await updateUsage("document");
      }

      const response = await fetch(
        `/api/assistants/threads/${threadId}/messages`,
        {
          method: "POST",
          body: JSON.stringify({ content: text }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      if (response.body) {
        const stream = AssistantStream.fromReadableStream(response.body);
        handleReadableStream(stream);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      showError("Failed to send message. Please try again.");
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
      const updatedMessages = [
        ...prev.slice(0, -1),
        { ...lastMessage, content: lastMessage.content + text },
      ];
      setTimeout(scrollToBottom, 100);
      return updatedMessages;
    });
  };

  const appendMessage = (
    role: "user" | "assistant" | "code",
    content: string
  ) => {
    setMessages((prev) => [...prev, { role, content }]);
  };

  const handleNewChat = () => {
    const newSession: SessionProps = {
      id: crypto.randomUUID(),
      messages: [],
      createdAt: Date.now(),
    };

    setSessions((prevSessions) => [newSession, ...prevSessions]);
    setMessages([]);
    setActiveSessionIndex(0);

    const createThread = async () => {
      const res = await fetch(`/api/assistants/threads`, { method: "POST" });
      const data = await res.json();
      setThreadId(data.threadId);
    };
    createThread();
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

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const showError = (message: string) => {
    toast({
      variant: "destructive",
      description: message,
    });
  };

  const checkSubscriptionLimit = () => {
    if (!user) {
      showError("Please sign in to continue");
      return false;
    }

    if (!subscription) {
      setShowPaymentModal(true);
      return false;
    }

    const {
      questionsUsed,
      questionsPerMonth,
      documentsUsed,
      documentsPerMonth,
    } = subscription;

    if (questionsPerMonth !== -1 && questionsUsed >= questionsPerMonth) {
      showError(
        "You've reached your monthly question limit. Please upgrade your plan."
      );
      setShowPaymentModal(true);
      return false;
    }

    if (
      fileInfo &&
      documentsPerMonth !== -1 &&
      documentsUsed >= documentsPerMonth
    ) {
      showError(
        "You've reached your monthly document limit. Please upgrade your plan."
      );
      setShowPaymentModal(true);
      return false;
    }

    return true;
  };

  const handleCardClick = (description: string) => {
    setUserInput(description);
  };

  const updateUsage = async (type: "question" | "document") => {
    try {
      const response = await fetch("/api/subscriptions/usage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type }),
      });

      if (!response.ok) {
        throw new Error("Failed to update usage");
      }

      const updatedSubscription = await response.json();

      // Update local subscription state
      setSubscription((prev) => ({
        ...prev,
        questionsUsed: updatedSubscription.questionsUsed,
        documentsUsed: updatedSubscription.documentsUsed,
      }));

      // Also update the user context if needed
      if (user) {
        user.subscription = {
          ...user.subscription,
          questionsUsed: updatedSubscription.questionsUsed,
          documentsUsed: updatedSubscription.documentsUsed,
        };
      }
    } catch (error) {
      console.error("Error updating usage:", error);
      showError("Failed to update usage count");
    }
  };

  return (
    <div className="flex h-[100vh] overflow-hidden bg-[#0A0F1E]">
      <Sidebar
        sessions={sessions}
        activeSessionIndex={activeSessionIndex}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onClearAllChats={handleClearAllChats}
      />
      <div className="relative flex h-full w-full flex-1 flex-col">
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full overflow-y-auto" ref={scrollAreaRef}>
            <div className="flex flex-col items-center text-sm h-full">
              {messages.length === 0 && (
                <div className="text-center px-3 py-10 text-gray-300">
                  <Brain className="h-12 w-12 mx-auto mb-4 text-blue-400" />
                  <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                    Welcome to VirtuHelpX
                  </h2>

                  <AssistantFunctionsCard onCardClick={handleCardClick} />
                </div>
              )}
              {messages.map((msg, index) => (
                <Message key={index} role={msg.role} content={msg.content} />
              ))}
              <div
                ref={messagesEndRef}
                className="h-32 md:h-48 flex-shrink-0"
              />
            </div>
          </ScrollArea>
        </div>
        <div className="absolute bottom-0 left-0 w-full border-t border-white/10 bg-gradient-to-b from-transparent via-[#0A0F1E] to-[#0A0F1E] pt-6">
          <form
            onSubmit={handleSubmit}
            className="stretch mx-2 flex flex-row gap-3 last:mb-2 md:mx-4 md:last:mb-6 lg:mx-auto lg:max-w-2xl xl:max-w-3xl"
          >
            <div className="relative flex h-full flex-1 items-center">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="absolute left-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:opacity-90"
                onClick={() => document.getElementById("file-upload")?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Paperclip className="h-4 w-4" />
                )}
              </Button>
              <Textarea
                value={userInput}
                onChange={(e) => {
                  setUserInput(e.target.value);
                  autoResizeTextArea(e.target);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="Message VirtuHelpX..."
                className="w-full resize-none bg-white/5 backdrop-blur-sm text-white px-3 pt-8 py-4 pl-16 pr-12 rounded-xl border border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.1)]"
                style={{
                  height: "inherit",
                  maxHeight: "200px",
                  minHeight: "52px",
                }}
              />
              <Button
                type="submit"
                size="icon"
                variant="ghost"
                className={cn(
                  "absolute right-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:opacity-90",
                  !userInput.trim() &&
                    !fileInfo &&
                    "opacity-50 cursor-not-allowed"
                )}
                disabled={isUploading || (!userInput.trim() && !fileInfo)}
              >
                <Send className="h-6 w-6" />
              </Button>
            </div>
          </form>
        </div>
      </div>
      <input
        type="file"
        id="file-upload"
        className="hidden"
        onChange={handleFileChange}
      />
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        subscription={subscription}
      />
    </div>
  );
};

export default ChatPage;
