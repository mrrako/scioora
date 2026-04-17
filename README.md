# Professional Social Media Dashboard

A high-performance, responsive social media analytics and messaging dashboard built with React, Sass, and Framer Motion. This project demonstrates modern UI/UX practices, including dark/light mode, real-time-like messaging, and advanced data visualization.

## 🚀 Git Workflow (GitFlow)

This project follows a professional branching strategy to maintain code quality and stability:

- **`main`**: Production-ready code only.
- **`develop`**: The primary integration branch for ongoing development.
- **`feature/*`**: Dedicated branches for individual features (e.g., `feature/ui-polish`).
- **`hotfix/*`**: Urgent production bug fixes.

### Standard Workflow:
1. Create a feature branch: `git checkout -b feature/name`
2. Commit changes: `git commit -m "feat: description"`
3. Merge into `develop`: `git checkout develop` -> `git merge feature/name`

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Framer Motion
- **Styling**: Sass (SCSS) with Glassmorphism and CSS Variables
- **Icons**: Lucide React
- **Charts**: Recharts
- **State Management**: React Context & Hooks
- **Persistence**: LocalStorage with custom hooks

## ✨ Key Features

- **Bidirectional Messaging**: Shared conversation history between users.
- **Theme Support**: Seamless Dark/Light mode toggle.
- **Responsive Layout**: Sidebar for desktop, Bottom Nav for mobile.
- **Real-time Polish**: Smooth page transitions and staggered animations.
- **Interactive Analytics**: Engagement trends and follower growth visualization.

## 📦 Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Start dev server: `npm run dev`
4. Build for production: `npm run build`
