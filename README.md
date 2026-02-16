# SCRS - Student Course Registration System

A comprehensive web application for student course registration and management.

## Project Overview

**SCRS** is a modern, responsive web application built for educational institutions to manage student course registrations efficiently. The system provides separate interfaces for students and administrators with complete registration workflow management.

## Features

### For Students:
- User-friendly registration process
- Course selection from multiple centers
- Application status tracking
- Flexible payment options (One-time/Installments)
- Secure login system

### For Administrators:
- Student application management
- Course management (Add/Edit/Delete)
- Approval workflow
- Student data analytics
- Secure admin dashboard

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **Build Tool**: Vite
- **Authentication**: Custom implementation with localStorage
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd register-wise-23
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
# Add your Supabase credentials
```

4. Start the development server
```bash
npm run dev
```

## Database Setup

1. Create a Supabase project
2. Run the migration files in `/supabase/migrations/`
3. Update the `.env` file with your Supabase credentials

## Admin Access

- Email: `admin@scrs.edu.in`
- Password: `SCRS@Admin2024`

## Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Application pages
├── hooks/              # Custom React hooks
├── integrations/       # External service integrations
├── lib/               # Utility functions
└── test/              # Test files
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and queries, contact the SCRS development team.