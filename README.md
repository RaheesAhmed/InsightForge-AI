# VirtuHelpX - AI-Powered Chat Platform

VirtuHelpX is a sophisticated AI-powered chat platform built with Next.js, featuring user authentication, subscription management, and an intelligent AI assistant interface.

## 🚀 Features

- **AI Chat Assistant**: Intelligent conversational AI powered by advanced language models
- **Authentication System**: Secure user authentication with JWT
- **Subscription Management**: Tiered subscription plans with Stripe integration
- **File Management**: Upload and process documents for AI analysis
- **Admin Dashboard**: Comprehensive admin controls and analytics
- **Responsive Design**: Mobile-friendly interface with modern UI components

## 🛠️ Tech Stack

- **Frontend/Backend**: Next.js, React, TypeScript, Tailwind CSS
- **Database**: PostgreSQL
- **Authentication**: JWT, Custom Auth System
- **Payment Processing**: Stripe
- **AI Integration**: OpenAI API
- **UI Components**: Radix UI, Lucide Icons

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js (v16 or higher)
- PostgreSQL database
- Stripe account for payments
- OpenAI API key

## 🔧 Installation

1. Clone the repository:

```bash
git clone https://github.com/RaheesAhmed/InsightForge-AI.git
cd InsightForge-AI
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:
   Create a `.env` file in the root directory with:

```env
# JWT Configuration
JWT_SECRET=

# NextAuth Configuration
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=
NEXT_PUBLIC_CLERK_SIGN_UP_URL=
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=
NEXT_REDIRECT_URL=

# OpenAI Configuration
OPENAI_API_KEY=
OPENAI_ASSISTANT_ID=
OPENAI_VECTOR_STORE_ID=

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_STRIPE_SECRET_KEY=

# Database Configuration
DATABASE_URL=
DIRECT_URL=

# Debug Configuration
DEBUG=

# Admin Configuration
ADMIN_USER_IDS=


```

4. Run database migrations:

```bash
npx prisma migrate dev
```

5. Start the development server:

```bash
npm run dev
```

## 🏗️ Project Structure

```
virtuHelpX/
├── app/
│   ├── (auth)/           # Authentication routes
│   ├── (main)/           # Main application routes
│   └── api/              # API endpoints
├── components/
│   ├── ui/               # Reusable UI components
│   └── ...               # Feature-specific components
├── lib/                  # Utility functions and configurations
├── hooks/                # Custom React hooks
└── prisma/              # Database schema and migrations
```

## 🔐 API Endpoints

### Authentication

```
POST /api/users/login     # User login
POST /api/users/register  # User registration
```

### Subscriptions

```
GET  /api/subscriptions/plans    # Get available plans
POST /api/subscriptions         # Create/update subscription
POST /api/subscriptions/usage   # Track usage
```

### AI Assistant

```
POST /api/assistants/files              # Upload files
GET  /api/assistants/threads            # Get chat threads
POST /api/assistants/threads/{id}/messages  # Send messages
```

## 💳 Subscription Plans

- **Free Tier**

  - Limited document uploads
  - Basic chat functionality
  - Standard support

- **Premium Tier**
  - Unlimited documents
  - Advanced AI features
  - Priority support
  - Custom integrations

## 🔒 Security Features

- JWT-based authentication
- Secure password hashing
- Protected API routes
- Rate limiting
- Stripe payment security
- Data encryption

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Rahees Ahmed** - _Initial work_ - [RaheesAhmed](https://github.com/RaheesAhmed)

## 🙏 Acknowledgments

- OpenAI for AI capabilities
- Stripe for payment processing
- Next.js team for the amazing framework
- All contributors who have helped shape this project

## 📞 Support

For support, email support@virtuhelpx.com or join our Slack channel.

---

Built with ❤️ by the VirtuHelpX Team
