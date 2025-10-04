# 💰 Expense Management System

A full-stack **Expense Management System** built with **MERN stack (MongoDB, Express.js, React.js, Node.js)**.  
The system allows Employees to submit expenses, Managers/Admins to approve or reject them, and provides role-based authentication.

---

## 🚀 Features

- **User Authentication (JWT-based)**
- Role-based Access:
  - **Employee** → Submit expenses, view status
  - **Manager** → Approve/reject employee expenses
  - **Admin** → Manage company, employees, vendors
- **Expense Management**
  - Submit expenses with receipt (OCR-enabled)
  - Approve/Reject expenses
- **Company Management**
  - Admin can create companies and assign employees
- **Dashboard**
  - Track pending, approved, rejected expenses
- **MongoDB Atlas Cloud Database**

---

## 🛠️ Tech Stack

### Frontend
- React.js
- Axios
- Tailwind CSS (basic styling)
- React Router

### Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- Multer (for file upload)
- Tesseract.js (for OCR on receipts)

### Database
- MongoDB Atlas Cloud

### Deployment
- **Backend** → Render
- **Frontend** → Vercel

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/<your-repo>.git
cd Odoo-Hackathon
