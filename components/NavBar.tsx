"use client";

import { Brain, MessageSquare, Home, CreditCard, Menu, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { motion, AnimatePresence } from "framer-motion";

const NavBar = () => {
  const router = useRouter();
  const { user, updateAuthFromSession } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      await updateAuthFromSession();
    };
    checkAuth();
    const interval = setInterval(checkAuth, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [updateAuthFromSession]);

  return (
    <nav className="fixed w-full backdrop-blur-xl bg-[#0A0F1E]/80 border-b border-white/10 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg blur opacity-60 group-hover:opacity-100 transition duration-300"></div>
                <Brain className="relative h-8 w-8 text-blue-400" />
              </div>
              <span className="text-xl font-bold">
                <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  Virtu
                </span>
                <span className="text-white">HelpX</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
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

          {/* Auth Buttons */}
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="px-4 py-2 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
                  <span className="text-sm text-gray-300">
                    {user.name || user.email}
                  </span>
                </div>
                <button
                  onClick={() => useAuth.getState().logout()}
                  className="relative px-6 py-2 text-gray-300 font-medium rounded-lg overflow-hidden group hover:text-white transition-colors"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push("/sign-in")}
                  className="relative px-6 py-2 text-gray-300 font-medium rounded-lg overflow-hidden group hover:text-white"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative">Log in</span>
                </button>

                <button
                  onClick={() => router.push("/sign-up")}
                  className="relative px-6 py-2 text-white font-medium rounded-lg overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-90 group-hover:opacity-100 transition-all duration-300"></div>
                  <span className="relative">Start free trial</span>
                </button>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden ml-4">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="relative p-2 text-gray-300 hover:text-white rounded-lg group"
              >
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity"></div>
                {isMenuOpen ? (
                  <X className="h-6 w-6 relative" />
                ) : (
                  <Menu className="h-6 w-6 relative" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="sm:hidden bg-[#0A0F1E]/95 backdrop-blur-xl border-b border-white/10"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {user ? (
                <>
                  <MobileNavLink
                    href="/"
                    icon={<Home className="h-5 w-5" />}
                    text="Home"
                  />
                  <MobileNavLink
                    href="/chat"
                    icon={<MessageSquare className="h-5 w-5" />}
                    text="Chat"
                  />
                  <MobileNavLink
                    href="/subscription"
                    icon={<CreditCard className="h-5 w-5" />}
                    text="Subscription"
                  />
                </>
              ) : (
                <div className="flex flex-col space-y-2 p-4">
                  <button
                    onClick={() => router.push("/sign-in")}
                    className="w-full px-4 py-2 text-gray-300 font-medium rounded-lg bg-white/5 hover:bg-white/10 backdrop-blur-sm transition-all duration-300"
                  >
                    Log in
                  </button>
                  <button
                    onClick={() => router.push("/sign-up")}
                    className="w-full px-4 py-2 text-white font-medium rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 hover:opacity-90 transition-all duration-300"
                  >
                    Start free trial
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-300 hover:text-white rounded-lg hover:bg-white/5 backdrop-blur-sm transition-all duration-200 group"
  >
    <span className="mr-2 group-hover:scale-110 transition-transform">
      {icon}
    </span>
    {text}
  </Link>
);

const MobileNavLink = ({
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
    className="flex items-center px-3 py-2 text-base font-medium text-gray-300 hover:text-white hover:bg-white/5 backdrop-blur-sm rounded-lg transition-all duration-200 group"
  >
    <span className="mr-3 group-hover:scale-110 transition-transform">
      {icon}
    </span>
    {text}
  </Link>
);

export default NavBar;
