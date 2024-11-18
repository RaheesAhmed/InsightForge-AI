import React from 'react';
import { Check } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

const pricingPlans = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for getting started',
    features: [
      '3 preloaded documents',
      '3 self-uploaded documents',
      'Unlimited questions and interactions',
      'Basic summaries',
      'Standard support',
    ],
    highlighted: false,
  },
  {
    name: 'Starter',
    price: '$9.99',
    period: '/month',
    description: 'Great for individual professionals',
    features: [
      '5 preloaded documents',
      '7 self-uploaded documents',
      'Unlimited questions and interactions',
      'Advanced summaries',
      'Detailed Q&A',
      'Email support',
    ],
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$29.99',
    period: '/month',
    description: 'Perfect for growing teams',
    features: [
      '20 preloaded documents',
      '20 self-uploaded documents',
      'Unlimited questions and interactions',
      'AI-powered insights',
      'Integrations (Google Drive, Dropbox)',
      'Priority support',
    ],
    highlighted: true,
  },
  {
    name: 'Unlimited',
    price: '$59.99',
    period: '/month',
    description: 'For enterprises and large teams',
    features: [
      'Unlimited preloaded documents',
      'Unlimited self-uploaded documents',
      'Unlimited questions and interactions',
      'All features included',
      'Team collaboration',
      'Custom branding',
      'API access',
    ],
    highlighted: false,
  },
];

export const PricingTable: React.FC = () => {
  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Simple, transparent pricing
        </h2>
        <p className="mt-4 text-xl text-gray-600">
          Choose the perfect plan for your needs
        </p>
      </div>

      <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {pricingPlans.map((plan) => (
          <Card
            key={plan.name}
            className={`relative flex flex-col rounded-2xl ${
              plan.highlighted
                ? 'border-2 border-blue-600 shadow-xl'
                : 'border border-gray-200'
            }`}
          >
            {plan.highlighted && (
              <div className="absolute -top-5 left-0 right-0 mx-auto w-32 rounded-full bg-blue-600 px-3 py-2 text-sm font-semibold text-white text-center">
                Most Popular
              </div>
            )}

            <div className="p-6">
              <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
              <p className="mt-2 text-gray-500">{plan.description}</p>
              <div className="mt-4 flex items-baseline">
                <span className="text-4xl font-extrabold text-gray-900">
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="ml-1 text-xl text-gray-500">{plan.period}</span>
                )}
              </div>

              <ul className="mt-6 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <div className="flex-shrink-0">
                      <Check className="h-5 w-5 text-green-500" />
                    </div>
                    <span className="ml-3 text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-auto p-6 pt-0">
              <Button
                className={`w-full ${
                  plan.highlighted
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-800 hover:bg-gray-900'
                }`}
              >
                {plan.name === 'Free' ? 'Get Started' : 'Subscribe Now'}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PricingTable;