import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { Brain, MessageSquare, Home, CreditCard } from "lucide-react";
import Link from "next/link";

const NavBar = () => {
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

          <SignedIn>
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
          </SignedIn>

          <div className="flex items-center">
            <SignedIn>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: "h-8 w-8",
                  },
                }}
              />
            </SignedIn>

            <SignedOut>
              <div className="flex items-center space-x-4">
                <SignInButton mode="modal">
                  <button className="relative inline-flex items-center justify-center px-6 py-2.5 text-blue-600 font-medium bg-blue-50/40 rounded-full overflow-hidden hover:bg-blue-50 transition-all duration-300 hover:shadow-md hover:scale-105 active:scale-100">
                    <span className="relative">Log in</span>
                  </button>
                </SignInButton>

                <SignUpButton mode="modal">
                  <button className="relative inline-flex items-center justify-center px-6 py-2.5 text-white font-medium bg-blue-600 rounded-full overflow-hidden hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-blue-200 hover:scale-105 active:scale-100 hover:shadow-xl">
                    <span className="relative">Start free trial</span>
                  </button>
                </SignUpButton>
              </div>
            </SignedOut>
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
    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors duration-300 border-b-2 border-transparent hover:border-blue-600"
  >
    {icon}
    <span className="ml-2">{text}</span>
  </Link>
);

export default NavBar;
