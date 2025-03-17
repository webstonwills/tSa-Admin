# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/8c0968c1-b208-4f91-9df0-0dd849e71454

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/8c0968c1-b208-4f91-9df0-0dd849e71454) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with .

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/8c0968c1-b208-4f91-9df0-0dd849e71454) and click on Share -> Publish.

## I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)

# tSa Admin Hub

A comprehensive administration platform for tSa with role-based access control, user management, and departmental organization.

## Overview

The tSa Admin Hub provides a secure, role-based administration platform for various departments within the organization. Each role has access to specific dashboards and functionality tailored to their responsibilities.

## Role-Based Access Control

The system supports the following roles:

- **CEO**: Executive leadership dashboard with full oversight
- **Secretary**: Administrative and secretarial dashboard
- **Finance**: Financial management and reporting dashboard
- **Business Management**: Business operations dashboard
- **Auditor**: Audit and compliance dashboard
- **Welfare**: Employee welfare and benefits dashboard
- **Board Member**: Board information and governance dashboard
- **User**: Default role for new users until assigned to a department

## Features

- Secure authentication using Supabase
- Role-based access control
- User profile management
- Department selection and management
- Cross-departmental forum for communication
- Mobile-responsive design

## Technical Stack

- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **Database**: Supabase Postgres
- **State Management**: React Context API
- **Routing**: React Router
- **UI Components**: Custom components with Radix UI primitives

## Setup and Configuration

### Database Configuration

The application requires Supabase with the following tables:

1. **profiles**: User profile information linked to auth.users
   - Fields: id, first_name, last_name, email, role, department_id, created_at, updated_at

2. **departments**: Department information
   - Fields: id, name, department_code, description, created_at, updated_at

Run the included `supabase-maintenance.sql` script to set up and maintain the database.

### Authentication Settings

In the Supabase dashboard:

1. Enable Email Sign-up and Authentication
2. Configure Email Templates
3. Set up Row Level Security (RLS) policies as defined in the maintenance script

### Routes and Access Control

The application uses two types of route protection:

1. **ProtectedRoute**: Ensures user is authenticated
2. **RoleBasedRoute**: Ensures user has the required role for access

Example usage:

```jsx
// Protected route (any authenticated user)
<Route path="/dashboard/profile" element={
  <ProtectedRoute>
    <ProfilePage />
  </ProtectedRoute>
} />

// Role-based route (only specific roles)
<Route path="/dashboard/ceo" element={
  <RoleBasedRoute allowedRoles={['ceo', 'admin']}>
    <CEODashboard />
  </RoleBasedRoute>
} />
```

## Troubleshooting

### Common Issues

1. **Authentication Problems**:
   - Ensure Supabase API keys are correct
   - Check email confirmation settings in Supabase
   - Verify RLS policies are correctly set up

2. **Role-Based Access Issues**:
   - Ensure user profiles have a valid role
   - Check that department_id values match existing departments
   - Run the supabase-maintenance.sql script to fix mismatched roles

3. **Database Integration**:
   - Verify RLS policies for profiles and departments
   - Ensure the trigger for creating profiles on user signup exists
   - Check that relationships between tables are correct

## Maintenance

Run the included `supabase-maintenance.sql` script periodically to:

- Ensure all required tables and columns exist
- Fix any missing roles or permissions
- Update RLS policies
- Synchronize departments and roles

## Development

To contribute to this project:

1. Clone the repository
2. Install dependencies with `npm install`
3. Create a `.env` file with your Supabase credentials
4. Run `npm run dev` to start the development server

## License

This project is proprietary and confidential. Unauthorized copying, transfer, or reproduction of this code is strictly prohibited.
