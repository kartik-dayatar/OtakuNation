<div align="center">
  <img src="https://via.placeholder.com/150x150.png?text=OtakuNation+Logo" alt="OtakuNation Logo" width="150" />

  # OtakuNation 🏯✨

  **The Ultimate Anime Merchandise E-Commerce Platform**

  A full-stack, responsive, and feature-rich e-commerce application built with the MERN stack tailored for anime enthusiasts. It provides a seamless shopping experience for users, comprehensive order tracking, and a robust admin dashboard for complete store management.

  ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
  ![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
  ![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
  ![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
  ![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
</div>

<br />

## 🌟 Features

### For Users
* **Seamless Authentication:** Secure login and registration using JWT authentication.
* **Product Discovery:** Browse a catalog of anime merchandise with advanced filtering, sorting, and pagination.
* **Shopping Cart & Wishlist:** Fully synchronized cart and wishlist functionality that persists across sessions. 
* **Seamless Checkout:** Multi-step checkout process with **Razorpay** payment gateway integration and Cash on Delivery (COD) options.
* **Order Tracking:** Detailed order timeline with real-time status updates from placement to delivery.
* **Return & Cancellations:** Automated flows for order cancellations and return requests within the eligibility window.
* **Review System:** Leave verified reviews and ratings on purchased products.

### For Administrators
* **Advanced Admin Dashboard:** High-level overview of store metrics, recent orders, and revenue statistics.
* **Product Management:** Add, edit, and categorize products, including managing stock variations (sizes/colors) and image uploads.
* **Order Fulfillment:** Update order statuses, track deliveries, and manage customer return requests.
* **Customer Management:** View user profiles, purchase history, and manage accounts.
* **Marketing & Discounts:** Create and manage dynamic discount coupons and gift cards.
* **Store Configuration:** Update site branding, taxes, and shipping fees dynamically.

---

## 🛠️ Tech Stack

**Frontend (Client)**
* **Framework:** React 19 (via Vite)
* **State Management:** Zustand
* **Routing:** React Router DOM v7
* **Styling & UI:** Custom Vanilla CSS, Framer Motion (Animations), GSAP, Lucide React (Icons)
* **API Communication:** Axios

**Backend (Server)**
* **Runtime:** Node.js
* **Framework:** Express.js
* **Database:** MongoDB (via Mongoose)
* **Authentication:** JSON Web Tokens (JWT) & bcryptjs
* **File Uploads:** Multer (Local file storage)
* **Email Service:** Nodemailer
* **Payments:** Razorpay API
* **Task Scheduling:** Node-cron

---

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed on your local machine:
* [Node.js](https://nodejs.org/en/) (v16+)
* [MongoDB](https://www.mongodb.com/) (Local or Atlas)
* [Git](https://git-scm.com/)

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/kartik-dayatar/OtakuNation.git
cd OtakuNation
```

**2. Setup Backend**
```bash
cd server
npm install
```

Create a `.env` file in the `/server` directory and add the following variables:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key

# Email Config (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Payment Gateway (Razorpay)
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

**3. Setup Frontend**
```bash
cd ../client
npm install
```

Create a `.env` file in the `/client` directory and add the following variables:
```env
VITE_API_URL=http://localhost:5000/api
```

### Running the Application

Open two separate terminals to run both client and server concurrently.

**Terminal 1 (Backend)**
```bash
cd server
npm run dev
```

**Terminal 2 (Frontend)**
```bash
cd client
npm run dev
```

The app will now be running on `http://localhost:5173` (Frontend) and the API on `http://localhost:5000` (Backend).

---

## 📂 Project Structure

```text
OtakuNation/
├── client/                 # React Frontend (Vite)
│   ├── src/
│   │   ├── assets/         # Images, global resources
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Full page views (Admin, Shop, User, etc.)
│   │   ├── store/          # Zustand global state (auth, cart, products)
│   │   └── utils/          # Frontend helpers
│   └── package.json
│
└── server/                 # Express Backend
    ├── config/             # DB and Razorpay config
    ├── controllers/        # Route controllers / Business logic
    ├── middleware/         # Auth and error handling
    ├── models/             # Mongoose schemas
    ├── routes/             # API routes
    ├── utils/              # Email templates and helpers
    ├── uploads/            # Multer upload directory
    └── server.js           # Entry point
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! 
Feel free to check the [issues page](https://github.com/kartik-dayatar/OtakuNation/issues).

---

## 📝 License

This project is licensed under the [MIT License](LICENSE).
