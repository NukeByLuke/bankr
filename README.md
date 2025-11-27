# Bankr 💸

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)

Personal finance tracker I built for a software engineering class. It’s a budgeting app with a bank-style UI: track spending, set goals, and keep an eye on subscriptions all in one place.

> **Note:** This repo only contains application code – no real credentials or production database dumps live here. Use your own `.env` when you run it.

---

## ✨ Features

- 💰 Transaction tracking (income / expenses)
- 🧂 Category-based budgets
- 🎯 Savings goals
- 📉 Loan management
- 🔁 Subscription + recurring payments
- 📆 Calendar view for upcoming stuff
- 🌗 Dark / light mode

---

## 🧱 Tech Stack

| Frontend | Backend |
|----------|---------|
| React 18 | Node.js + Fastify |
| TypeScript | Prisma ORM |
| Vite | PostgreSQL |
| TailwindCSS | JWT auth |
| Zustand | Docker Compose |

---

## 🚀 Running Locally

You’ll need Docker installed.

```bash
git clone https://github.com/yourusername/bankr.git
cd bankr
cp .env.example .env
docker-compose up --build
```

Frontend: `http://localhost:5174`  
Backend: `http://localhost:3002`

### 🔑 Test Accounts

| Email | Password |
|-------|----------|
| free@bankr.local | password123 |
| premium@bankr.local | password123 |
| admin@bankr.local | password123 |

---

## 🛠️ Without Docker

If you don’t want Docker, you’ll need PostgreSQL running locally.

**Backend:**

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run seed
npm run dev
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

---

## 📁 Project Structure

```
bankr/
├── frontend/           # react frontend
│   └── src/
│       ├── components/
│       ├── pages/
│       └── store/
├── backend/            # node api
│   ├── src/
│   │   ├── routes/
│   │   └── middleware/
│   └── prisma/
└── docker-compose.yml
```

---

## 📡 API

All routes are under `/api`.

- `POST /auth/login` – login
- `POST /auth/register` – register  
- `GET /transactions` – list transactions
- `POST /transactions` – create transaction
- `GET /budgets` – list budgets
- `GET /goals` – list goals
- plus routes for loans, subscriptions, scheduled payments, etc.

---

## 📜 License

MIT

