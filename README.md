# Login and Sign-Up System

A simple React-based web application that implements a login and sign-up system with JWT authentication, styled with a dark gradient theme. The application connects to a backend API for user authentication and includes features like Google login, password reset, and role-based redirection.

## Features
- User sign-up with username, email, password, and role selection (user/admin).
- User login with username and password.
- Google OAuth integration for login and sign-up.
- Password reset functionality via email.
- Role-based redirection (dashboard for users, admin panel for admins).
- Success messages for login and sign-up actions.
- JWT token storage in `localStorage` for session management.

## Technologies Used
- **Frontend**: React, React Router, Axios, JWT Decode
- **Styling**: Custom CSS with gradient backgrounds and Tailwind-inspired classes
- **Backend**: Node.js/Express (assumed) with a RESTful API at `http://localhost:5000/api/auth`
- **Authentication**: JWT (JSON Web Tokens)

## Prerequisites
- Node.js (v14 or later)
- npm or yarn
- A backend server running at `http://localhost:5000` with endpoints:
  - `/api/auth/signup`
  - `/api/auth/login`
  - `/api/auth/google`
  - `/api/auth/forgot-password`

## Installation

1. **Clone the repository**:
   ```bash
   git clone <your-repository-url>
   cd <project-folder>
