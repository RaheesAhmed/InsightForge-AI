"use client";

import { Brain, MessageSquare, Home, CreditCard } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/useAuth";

const NavBar = () => {
  const router = useRouter();
  const { user, updateAuthFromSession } = useAuth();

  useEffect(() => {
    // Check auth state on mount and every 5 minutes
    const checkAuth = async () => {
      await updateAuthFromSession();
    };

    // Initial check
    checkAuth();

    // Set up periodic checks
    const interval = setInterval(checkAuth, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [updateAuthFromSession]);

  return (
    <nav className="w-full bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold">
                <span className="text-blue-600">Virtu</span>
                <span className="text-gray-800">HelpX</span>
              </span>
            </Link>
          </div>

          {user && (
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <NavLink
                href="/"
                icon={<Home className="h-5 w-5" />}
                text="Home"
              />
              <NavLink
                href="/chat"
                icon={<MessageSquare className="h-5 w-5" />}
                text="Chat"
              />
              <NavLink
                href="/subscription"
                icon={<CreditCard className="h-5 w-5" />}
                text="Subscription"
              />
            </div>
          )}

          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">{user.name || user.email}</span>
                <button
                  onClick={() => useAuth.getState().logout()}
                  className="text-sm text-gray-600 hover:text-blue-600"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push("/sign-in")}
                  className="relative inline-flex items-center justify-center px-6 py-2.5 text-blue-600 font-medium bg-blue-50/40 rounded-full overflow-hidden hover:bg-blue-50 transition-all duration-300 hover:shadow-md hover:scale-105 active:scale-100"
                >
                  <span className="relative">Log in</span>
                </button>

                <button
                  onClick={() => router.push("/sign-up")}
                  className="relative inline-flex items-center justify-center px-6 py-2.5 text-white font-medium bg-blue-600 rounded-full overflow-hidden hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-blue-200 hover:scale-105 active:scale-100 hover:shadow-xl"
                >
                  <span className="relative">Start free trial</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

const NavLink = ({
  href,
  icon,
  text,
}: {
  href: string;
  icon: React.ReactNode;
  text: string;
}) => (
  <Link
    href={href}
    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-blue-600"
  >
    <span className="mr-2">{icon}</span>
    {text}
  </Link>
);

export default NavBar;
