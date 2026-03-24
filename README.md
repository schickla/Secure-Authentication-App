# 🔐 Secure Authentication App

A cybersecurity-focused web application built with Node.js and Express that demonstrates secure authentication, HTTPS deployment, and defensive security practices.

This project simulates how real-world systems protect user credentials, prevent brute-force attacks, and monitor authentication activity.

---

##  Features

* 🔑 User registration and login system
* 🔒 Password hashing using bcrypt
* 🍪 Secure session-based authentication
* 🚫 Brute-force protection with rate limiting
* 📊 Login attempt logging and monitoring
* 📈 Security dashboard displaying activity
* 🔐 HTTPS using a self-signed TLS certificate
* 🛡️ Security headers via Helmet

---

## 🧠 Security Concepts Demonstrated

* **Secure Password Storage**
  Passwords are hashed using bcrypt, preventing exposure in the event of a database compromise.

* **Encrypted Communication (HTTPS)**
  TLS encryption protects data in transit between client and server.

* **Session Security**
  HTTP-only, secure cookies prevent access via JavaScript and ensure transmission only over HTTPS.

* **Brute-Force Mitigation**
  Rate limiting and failed login tracking prevent repeated unauthorized login attempts.

* **Authentication Logging & Monitoring**
  Login attempts are recorded and displayed in a dashboard, simulating real-world monitoring systems.

---

## 🛠️ Technologies Used

* **Backend:** Node.js, Express
* **Templating:** EJS
* **Database:** SQLite (better-sqlite3)
* **Security:** bcrypt, express-session, express-rate-limit, Helmet
* **Environment Management:** dotenv
* **Protocol:** HTTPS (self-signed TLS certificate)

---
---

## ⚙️ Setup & Installation

### 1. Clone the repository

```
git clone https://github.com/schickla/Secure-Authentication-App.git
cd Secure-Authentication-App
```

---

### 2. Install dependencies

```
npm install
```

---

### 3. Create environment variables

Create a `.env` file in the root directory:

```
SESSION_SECRET=your-secret-key
PORT=3000
```

---

### 4. Generate TLS certificates

```
mkdir cert
cd cert
openssl req -x509 -newkey rsa:2048 -nodes -keyout key.pem -out cert.pem -days 365
cd ..
```

---

### 5. Run the application

```
npm run dev
```

---

### 6. Open in browser

```
https://localhost:3000
```

⚠️ A browser warning will appear due to the self-signed certificate. This is expected in development. Click “Advanced” → “Proceed”.

---

## 🎯 Project Purpose

This project was developed as a cybersecurity technical learning project to demonstrate how secure authentication systems are implemented in modern web applications.

It focuses on defending against common security threats such as:

* credential theft
* brute-force attacks
* insecure session handling
* unencrypted communication

---

## 💡 Future Improvements

* 🌍 IP geolocation for login attempts
* 📊 Data visualization of login trends
* 🔐 JWT-based authentication
* 🐳 Docker containerization
* ☁️ Cloud deployment

---

## 📜 License

This project is for educational purposes.

---

## 👤 Author

**Alex Schickling**
Computer Science / Cybersecurity Student

---
