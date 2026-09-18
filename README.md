# Kanban Task Manager

A full-stack MERN application for managing tasks with drag-and-drop Kanban boards.

## Features

- User authentication (JWT signup/login)
- Create, update, and delete boards
- Create, rename, and delete lists within a board
- Create, edit, and delete cards (description, labels, due date)
- Drag-and-drop cards between lists
- Comments on cards
- Board access restricted to owner/members

## Tech Stack

**Frontend**
- React 18 + TypeScript + Vite
- Redux Toolkit + RTK Query
- Tailwind CSS v4
- dnd-kit (drag-and-drop)
- React Router, React Hook Form

**Backend**
- Node.js + Express + TypeScript
- MongoDB + Mongoose
- JWT authentication, bcryptjs password hashing

## Project Structure

```
backend/    Express API (controllers, routes, models, middleware)
frontend/   React app (Vite, Redux Toolkit, dnd-kit)
```

## Quick Start

### Backend

```bash
cd backend
npm install
cp .env.example .env   # then edit MONGODB_URI / JWT_SECRET as needed
npm run dev             # http://localhost:5001
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev             # http://localhost:5173
```

Requires a running MongoDB instance (local or Atlas) reachable at the `MONGODB_URI` in `backend/.env`.

## API Endpoints

```
Auth
POST   /api/auth/signup
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
PUT    /api/auth/profile

Boards
GET    /api/boards
POST   /api/boards
GET    /api/boards/:id
PUT    /api/boards/:id
DELETE /api/boards/:id

Lists
POST   /api/lists
PUT    /api/lists/:id
DELETE /api/lists/:id

Cards
POST   /api/cards
PUT    /api/cards/:id
DELETE /api/cards/:id
POST   /api/cards/:id/comments
```

## License

MIT
