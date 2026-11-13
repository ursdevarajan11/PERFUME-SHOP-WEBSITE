# Perfume Shop — E-Commerce Application

A full-stack luxury perfume store built with **MongoDB, Express.js, React, and Node.js (MERN)**, featuring product browsing, user authentication, cart management, and admin controls.

## 🚀 Live Demo

- **Frontend (Live Website):** https://perfume-shop-frontend-igep.onrender.com
- **Backend API:** https://perfume-shop-backend-q8ci.onrender.com
- **GitHub Repository:** https://github.com/ursdevarajan11/PERFUME-SHOP-WEBSITE

> **Note:** Both services are hosted on Render's free tier. If the backend has been idle for 15+ minutes, the initial request may take 30–50 seconds while the server wakes up.

---

## 📌 Features

### 🛍️ Customer Features
- Browse available perfumes.
- View product details, images, and prices.
- User registration and login.
- Secure authentication using JWT.
- Add perfumes to the shopping cart.
- Update product quantities in the cart.
- Remove products from the cart.
- Responsive user interface.
- Easy product browsing and shopping experience.

### 🔐 Admin Features
- Admin authentication and access control.
- Add new perfume products.
- Update existing product details.
- Delete products.
- Manage perfume inventory.
- Manage product information.

### ⚙️ Backend Features
- RESTful API architecture.
- Node.js and Express.js backend.
- MongoDB Atlas database integration.
- Mongoose for database modeling.
- JWT-based authentication.
- Secure password handling.
- Environment variable configuration.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React.js | Frontend user interface |
| CSS3 | Styling and responsive design |
| React Router | Client-side navigation |
| Node.js | Backend runtime |
| Express.js | Backend API framework |
| MongoDB Atlas | Cloud database |
| Mongoose | MongoDB object modeling |
| JWT | Authentication |
| Render | Deployment and hosting |
| Git & GitHub | Version control |

---

## 📂 Project Structure

```text
PERFUME-SHOP-WEBSITE/
│
├── backend/
│   ├── index.js
│   ├── .env.example
│   ├── package.json
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── controllers/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── assets/
│   │   └── App.js
│   ├── package.json
│   └── .env.example
│
├── README.md
└── .gitignore
```

> The directory structure above is representative. Your actual repository may contain additional files or folders.

---

## 💻 Installation and Setup

Follow these steps to run the Perfume Shop application locally.

### 1. Clone the Repository

```bash
git clone https://github.com/ursdevarajan11/PERFUME-SHOP-WEBSITE.git
```

Navigate to the project directory:

```bash
cd PERFUME-SHOP-WEBSITE
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Install the dependencies:

```bash
npm install
```

Create a `.env` file inside the `backend` directory.

#### Backend Environment Variables

```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_random_32_character_secret_key
ADMIN_EMAILS=your_admin_email@example.com
```

**Environment Variable Description:**

| Variable | Description |
|---|---|
| `PORT` | Port number for the backend server |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key used for JWT authentication |
| `ADMIN_EMAILS` | Email address authorized for admin access |

> Keep your `.env` file private. Never upload database credentials or JWT secrets to GitHub.

Start the backend server:

```bash
npm start
```

The backend API will run at:

```text
http://localhost:5000
```

### 3. Frontend Setup

Open a new terminal and navigate to the frontend directory:

```bash
cd PERFUME-SHOP-WEBSITE/frontend
```

Install the dependencies:

```bash
npm install
```

Create a `.env` file inside the `frontend` directory.

#### Frontend Environment Variables

```env
REACT_APP_API_URL=http://localhost:5000
```

Start the frontend application:

```bash
npm start
```

The frontend will run at:

```text
http://localhost:3000
```

---

## 🗄️ MongoDB Atlas Configuration

This project uses MongoDB Atlas for cloud database storage.

### Steps to Configure MongoDB

1. Visit https://www.mongodb.com/atlas
2. Create an account or sign in.
3. Create a new MongoDB cluster.
4. Create a database user.
5. Configure Network Access to allow your development machine.
6. Obtain your MongoDB connection string.
7. Add the connection string to the backend `.env` file.

Example:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database-name>
```

Replace the placeholders with your actual MongoDB Atlas credentials.

---

## 🌐 Deployment

The Perfume Shop application is deployed using **Render**.

### Frontend Deployment

- Platform: Render Static Site
- Build Command: `npm install && npm run build`
- Publish Directory: `build`
- Environment Variable:

```env
REACT_APP_API_URL=https://perfume-shop-backend-q8ci.onrender.com
```

### Backend Deployment

- Platform: Render Web Service
- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`

Configure the following environment variables in Render:

```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_random_32_character_secret_key
ADMIN_EMAILS=your_admin_email@example.com
```

> Render provides the port through the `PORT` environment variable. Ensure the backend listens on `process.env.PORT`.

### Live Application

Visit the deployed website:

https://perfume-shop-frontend-igep.onrender.com

---

## 🔑 Authentication and Security

- JWT-based authentication.
- Secure password handling.
- Admin access control.
- Environment variables for sensitive configuration.
- Backend API validation and authorization.

---

## 📱 Responsive Design

The application is designed to provide a smooth shopping experience across:

- Desktop computers
- Laptops
- Tablets
- Mobile devices

---

## 🧪 Running the Application

Start the backend:

```bash
cd backend
npm install
npm start
```

Start the frontend in another terminal:

```bash
cd frontend
npm install
npm start
```

Open the application in your browser:

```text
http://localhost:3000
```

---

## 🔮 Future Enhancements

- Online payment integration.
- Order tracking system.
- Wishlist functionality.
- Product reviews and ratings.
- Advanced product search and filtering.
- Email notifications.
- Improved admin dashboard analytics.
- Product category management.

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository.
2. Create a new branch.
3. Make your changes.
4. Commit your changes.
5. Push to your branch.
6. Submit a Pull Request.

---

## 📄 License

This project is developed for educational and portfolio purposes.

---

## 👨‍💻 Author

**Devaraja Rajan**

- GitHub: https://github.com/ursdevarajan11
- Project Repository: https://github.com/ursdevarajan11/PERFUME-SHOP-WEBSITE

---

⭐ If you like this project, consider giving it a star on GitHub!

**Thank you for visiting the Perfume Shop project!**
