# 🏕️ QuickStay

A seamless full-stack web application to explore and book beautiful lakeside stays.

---

## 🔗 Live Demo

| Link Type   | URL                                                |
|-------------|----------------------------------------------------|
| 🌐 Website  | [https://quickstay-lake.vercel.app](https://quick-stay-full-stack-65yryobc6-siddhant-dwivedis-projects.vercel.app/) |

---

## 🚀 Features

| Feature              | Description                                |
|----------------------|--------------------------------------------|
| 🔍 Property Browsing | View available lakeside properties         |
| 🧭 Filtering         | Filter stays by price, location, etc.      |
| ✅ Authentication    | JWT-based secure login and signup          |
| 📱 Responsive        | Mobile-friendly and adaptive UI            |
| 🧾 Booking System    | Users can book stays and view them         |

---

## 🧪 Tech Stack

| Layer        | Technology                                  |
|--------------|---------------------------------------------|
| 💻 Frontend  | React (Vite), Tailwind CSS, React Router    |
| ⚙️ Backend   | Node.js, Express                             |
| 🛢️ Database  | MongoDB + Mongoose                          |
| 🔐 Auth      | JSON Web Token (JWT)                        |
| 🚀 Deployment| Vercel (frontend), Render/Heroku (backend) |

---

## 📁 Folder Structure

| Folder                        | Purpose                          |
|-------------------------------|----------------------------------|
| `/client`                    | React frontend                   |
| `/client/src/components`     | Reusable UI components           |
| `/client/src/pages`          | Page-wise components             |
| `/server`                    | Express backend                  |
| `/server/controllers`        | Logic for each route             |
| `/server/routes`             | API endpoints                    |
| `/server/models`             | MongoDB Schemas                  |
| `/server/middleware`         | JWT, error handlers, etc.        |

---

## ⚙️ Setup Instructions

| Step             | Command / Action                                     |
|------------------|------------------------------------------------------|
| 1️⃣ Clone the Repo | `git clone https://github.com/Yungstunner/QuickStay.git` |
| 2️⃣ Backend Setup  | `cd server && npm install`                          |
| 3️⃣ Frontend Setup | `cd ../client && npm install`                       |
| 4️⃣ Create `.env`  | Inside `/server` folder:<br>`MONGO_URI=...`<br>`JWT_SECRET=...`<br>`PORT=5000` |
| 5️⃣ Run Backend    | `cd server && npm run dev`                          |
| 6️⃣ Run Frontend   | `cd ../client && npm run dev`                       |

---

## 🧪 API Overview

| Method | Endpoint            | Description                          |
|--------|---------------------|--------------------------------------|
| POST   | `/auth/register`    | Create a new user                    |
| POST   | `/auth/login`       | Authenticate user & get token       |
| GET    | `/properties`       | Get list of stays (with filters)    |
| GET    | `/properties/:id`   | Get property details by ID          |
| POST   | `/bookings`         | Book a stay (authentication required) |

---

## 🧑‍💻 Contributing

| Step    | Action                                 |
|---------|----------------------------------------|
| 1️⃣ Fork     | Click "Fork" on GitHub               |
| 2️⃣ Branch   | `git checkout -b feature/feature-name` |
| 3️⃣ Commit   | `git commit -m "Add new feature"`   |
| 4️⃣ Push     | `git push origin feature-name`      |
| 5️⃣ PR       | Open a Pull Request                 |

---

---

## 🙏 Acknowledgements

| Tool           | Link                                 |
|----------------|--------------------------------------|
| Vite           | [vitejs.dev](https://vitejs.dev)     |
| Tailwind CSS   | [tailwindcss.com](https://tailwindcss.com) |
| Render         | [render.com](https://render.com)     |
| Mongoose       | [mongoosejs.com](https://mongoosejs.com) |

---




