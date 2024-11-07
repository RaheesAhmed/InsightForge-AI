import React from "react";
import {
  Building,
  Calendar,
  FileText,
  MessageSquare,
  Bell,
  Users,
  ChevronRight,
} from "lucide-react";

export default function Homepage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="container mx-auto flex items-center justify-between px-4 py-4 lg:max-w-6xl">
          <div className="flex items-center space-x-2">
            <Building className="h-8 w-8 text-yellow-400" />
            <span className="text-xl font-bold">ConstructAI</span>
          </div>
          <div className="hidden space-x-6 md:flex">
            <a href="#features" className="hover:text-yellow-400">
              Features
            </a>
            <a href="#pricing" className="hover:text-yellow-400">
              Pricing
            </a>
            <a href="#about" className="hover:text-yellow-400">
              About
            </a>
          </div>
          <button className="rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 px-6 py-2 font-semibold text-slate-900 shadow-md transition-all hover:shadow-lg">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 py-20 text-white">
        <div className="absolute inset-0 opacity-5 mix-blend-overlay">
          <svg
            className="h-full w-full"
            xmlns="http://www.w3.org/2000/svg"
            width="100%"
            height="100%"
          >
            <defs>
              <pattern
                id="construction-pattern"
                width="40"
                height="40"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M0 0L40 40ZM40 0L0 40Z"
                  stroke="white"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect
              width="100%"
              height="100%"
              fill="url(#construction-pattern)"
            />
          </svg>
        </div>
        <div className="container relative mx-auto px-4 lg:max-w-6xl">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
            <div>
              <div className="mt-12 mb-8 inline-block rounded-full bg-yellow-400 px-4 py-1 text-sm font-semibold text-slate-900">
                AI-Powered Construction Assistant
              </div>
              <h1 className="mb-6 text-4xl font-bold leading-tight sm:text-5xl">
                Your Personal AI Helper for Construction Management
              </h1>
              <p className="mb-8 text-lg text-slate-300">
                Streamline your construction business with our AI assistant.
                Manage appointments, generate contracts, and communicate with
                clients effortlessly.
              </p>
              <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                <button className="rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 px-8 py-3 font-semibold text-slate-900 shadow-md transition-all hover:shadow-lg">
                  Start Free Trial
                </button>
                <button className="flex items-center justify-center space-x-2 rounded-full border-2 border-white px-8 py-3 font-semibold transition-all hover:bg-white hover:text-slate-900">
                  <span>Learn More</span>
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="relative hidden md:block">
              {/* AI Assistant Illustration */}
              <svg
                className="absolute right-0 top-0 h-full w-full"
                viewBox="0 0 400 400"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="50"
                  y="50"
                  width="300"
                  height="300"
                  rx="20"
                  fill="#0F172A"
                />
                <circle cx="200" cy="180" r="80" fill="#FDB913" />
                <rect
                  x="120"
                  y="280"
                  width="160"
                  height="20"
                  rx="10"
                  fill="#FDB913"
                />
                <rect
                  x="140"
                  y="310"
                  width="120"
                  height="20"
                  rx="10"
                  fill="#FDB913"
                />
                <path
                  d="M200 140V220M160 180H240"
                  stroke="#0F172A"
                  strokeWidth="20"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4 lg:max-w-6xl">
          <h2 className="mb-12 text-center text-4xl font-bold">
            Powerful Features
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                icon: FileText,
                title: "Smart Contract Generation",
                description:
                  "AI-powered contract creation based on your templates and client information.",
              },
              {
                icon: Calendar,
                title: "Appointment Management",
                description:
                  "Seamless integration with Google Calendar for efficient scheduling.",
              },
              {
                icon: MessageSquare,
                title: "Client Communication",
                description:
                  "Automated SMS reminders and notifications to keep clients informed.",
              },
              {
                icon: Users,
                title: "Lead Management",
                description:
                  "Organize and track potential clients throughout the sales process.",
              },
              {
                icon: Bell,
                title: "Reminders & Notifications",
                description:
                  "Stay on top of tasks with intelligent reminders for you and your team.",
              },
              {
                icon: Building,
                title: "Construction Expertise",
                description:
                  "Tailored assistance specific to the construction industry.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group rounded-lg bg-white p-6 shadow-md transition-all hover:shadow-lg"
              >
                <div className="mb-4 inline-block rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 p-3 text-slate-900 shadow-md transition-all group-hover:shadow-lg">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        className="bg-gradient-to-b from-slate-50 to-white py-20"
      >
        <div className="container mx-auto px-4 lg:max-w-6xl">
          <h2 className="mb-12 text-center text-4xl font-bold">
            Simple, Transparent Pricing
          </h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              { name: "Starter", users: 10, price: 99 },
              { name: "Growth", users: 20, price: 199, popular: true },
              { name: "Enterprise", users: 50, price: 499 },
            ].map((plan, index) => (
              <div
                key={index}
                className={`relative rounded-lg bg-white p-8 shadow-md ${
                  plan.popular ? "border-2 border-yellow-400" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-yellow-400 px-4 py-1 text-sm font-semibold text-slate-900">
                    Most Popular
                  </div>
                )}
                <h3 className="mb-4 text-2xl font-bold">{plan.name}</h3>
                <p className="mb-6 text-4xl font-bold">
                  ${plan.price}
                  <span className="text-base font-normal text-slate-600">
                    /month
                  </span>
                </p>
                <ul className="mb-8 space-y-2 text-slate-600">
                  <li>Up to {plan.users} team members</li>
                  <li>Unlimited contracts</li>
                  <li>Email & SMS notifications</li>
                  <li>24/7 AI assistance</li>
                  <li>Google Calendar integration</li>
                </ul>
                <button
                  className={`w-full rounded-full ${
                    plan.popular
                      ? "bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900"
                      : "bg-slate-200 text-slate-800"
                  } px-6 py-3 font-semibold transition-all hover:shadow-md`}
                >
                  Choose Plan
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-slate-900 to-slate-800 py-20 text-white">
        <div className="container mx-auto px-4 text-center lg:max-w-4xl">
          <h2 className="mb-6 text-4xl font-bold">
            Ready to Revolutionize Your Construction Business?
          </h2>
          <p className="mb-8 text-xl">
            Join hundreds of construction companies already using ConstructAI to
            streamline their operations.
          </p>
          <button className="rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 px-8 py-3 font-semibold text-slate-900 shadow-md transition-all hover:shadow-lg">
            Start Your Free Trial
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-12 text-slate-300">
        <div className="container mx-auto px-4 lg:max-w-6xl">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center space-x-2">
                <Building className="h-8 w-8 text-yellow-400" />
                <span className="text-xl font-bold text-white">
                  ConstructAI
                </span>
              </div>
              <p className="text-sm">
                AI-powered assistance for modern construction management.
              </p>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-semibold text-white">Product</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-yellow-400">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-yellow-400">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-yellow-400">
                    Case Studies
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-semibold text-white">Company</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-yellow-400">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-yellow-400">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-yellow-400">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-semibold text-white">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-yellow-400">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-yellow-400">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-yellow-400">
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-slate-800 pt-8 text-center text-sm">
            © 2023 ConstructAI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
