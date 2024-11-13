import React from "react";

interface AssistantFunctionsCardProps {
  onCardClick: (description: string) => void;
}

const data = [
  {
    icon: "🎯",
    title: "Strategy Analysis",
    description:
      "What are the key strategic insights and actionable steps for business content?",
  },
  {
    icon: "📈",
    title: "Growth & Scaling",
    description:
      "How can I apply growth strategies to scale my business effectively?",
  },
  {
    icon: "🚀",
    title: "Implementation Plan",
    description:
      "Help me create a step-by-step implementation plan for business content.",
  },
  {
    icon: "👥",
    title: "Leadership Insights",
    description:
      "What leadership principles can I learn and apply from business content?",
  },
  {
    icon: "⚡",
    title: "Quick Wins",
    description:
      "What are the most immediately actionable insights I can implement?",
  },
  {
    icon: "🎮",
    title: "Business Model",
    description:
      "How can I optimize my business model based on business content?",
  },
  {
    icon: "🎯",
    title: "Success Metrics",
    description:
      "What key metrics should I track to measure success in implementing these strategies?",
  },
  {
    icon: "🚧",
    title: "Challenge Solutions",
    description:
      "What common challenges might I face and how can I overcome them?",
  },
  {
    icon: "🔄",
    title: "Innovation Strategies",
    description:
      "How can I innovate and adapt my business using these principles?",
  },
];

const AssistantFunctionsCard: React.FC<AssistantFunctionsCardProps> = ({
  onCardClick,
}) => {
  return (
    <div className="w-full bg-white p-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">
          How can I help you with your business today?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {data.map((item, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-lg p-4 cursor-pointer hover:shadow-md transition-all duration-200 flex flex-col gap-2"
              onClick={() => onCardClick(item.description)}
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">{item.icon}</span>
                <h3 className="text-sm font-medium text-gray-900">
                  {item.title}
                </h3>
              </div>
              <p className="text-xs text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 text-center mt-4">
          Select a topic to start exploring business insights and strategies
        </p>
      </div>
    </div>
  );
};

export default AssistantFunctionsCard;
