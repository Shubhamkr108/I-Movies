# IMovies – Premium Online Movie Ticket Booking Platform

A modern, responsive, and full-stack MERN cinema ticketing application crafted with an ultra-premium dark cinema theme, glassmorphism aesthetics, interactive seat booking, and administrative oversight.

---

## 🚀 Features

- **Cinematic Dark UI/UX**: Deep black/navy backgrounds with electric purple, vibrant red, and subtle gold accents.
- **Hero Banner Slider**: Dynamic hero showcase featuring trailers, ratings, and immediate booking hooks.
- **Movie Catalog & Filtering**: Search and filter by Genre, Language, Rating, Certificate, and Screening Status (`Now Showing`, `Coming Soon`).
- **Interactive 8-Step Seat Booking**:
  - City selection (`Mumbai`, `Delhi`, `Bangalore`, etc.)
  - Cinema hall & showtime picker
  - Interactive cinema seating layout categorized into **Platinum**, **Gold**, and **Silver**
  - Live seat price computation with real-time occupancy updates
  - Screen indicator and maximum seat booking thresholds
- **Promo Codes & Discounts**: Working coupon validation system (`IMOVIES30`, `WEEKEND100`, etc.)
- **Digital E-Tickets**: Instant QR code ticket generation for gate validation with print/save option.
- **User Dashboard**:
  - Upcoming and previous bookings
  - Ticket cancellation with automated refund initiation
  - Personal profile and password management
- **Admin Control Center**:
  - Live analytics & revenue metrics
  - Movie catalog management (Add/Delete movies)
  - Booking records inspection
  - User status management (Activate/Deactivate)

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide React, Framer Motion, Axios, React Hot Toast, QRCode.react
- **Backend**: Node.js, Express.js, MongoDB, Mongoose ODM, JWT, Bcrypt.js, Express Validator, Helmet, Morgan
- **Database**: MongoDB (Local or MongoDB Atlas)

---

## ⚡ Quick Start

### 1. Start Both Frontend & Backend (One Command)
From the root directory (`project/`):
```bash
npm run dev
```
- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)

---

### 2. Database Seeding (Sample Data)
To populate 12+ movies, 7 major Indian cinema halls, showtimes, and promo offers:
```bash
npm run seed
```

---

## 🔑 Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@imovies.com` | `Admin@123` |
| **Demo User** | `user@imovies.com` | `User@123` |

*(Quick-fill buttons are also available on the Login screen)*

---

## 📁 Project Structure

```
project/
├── client/                 # React + Vite Frontend
│   ├── src/
│   │   ├── components/     # Layout, Navbar, Footer, MovieCard, Modals
│   │   ├── context/        # AuthContext, BookingContext
│   │   ├── pages/          # Home, Movies, Details, Booking, Admin, etc.
│   │   ├── services/       # Axios API client
│   │   └── utils/          # Helpers & formatters
├── server/                 # Express REST API Backend
│   ├── controllers/        # Auth, Movies, Theatres, Bookings, Admin
│   ├── middleware/         # JWT Auth, Role verification
│   ├── models/             # User, Movie, Theatre, Showtime, Booking, Offer
│   ├── routes/             # REST API endpoints
│   ├── utils/              # Database seeder
│   └── server.js           # Express application entry
├── package.json            # Root workspace orchestrator (concurrently)
└── .env.example            # Environment variables reference
```
