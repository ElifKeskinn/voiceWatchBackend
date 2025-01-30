# VoiceWatch Backend API

VoiceWatch is a backend API designed to help users manage their emergency contacts efficiently. Built with Node.js, Express, and Sequelize, it leverages PostgreSQL for robust data management. This API facilitates user registration, authentication, and the management of emergency contacts, ensuring that users have quick access to their important connections during critical moments.

## 📄 Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Configuration](#configuration)
- [Technologies Used](#technologies-used)
- [Sample `.env` File](#sample-env-file)



## ✨ Features

- **User Management**
  - User registration and authentication using JWT.
  - Secure password hashing with bcrypt.
  - Profile management with support for profile pictures.
  
- **Emergency Contact Management**
  - Add, update, and delete emergency contacts.
  - Define multiple emergency contacts per user.
  
- **Security**
  - JWT-based authentication for secure API access.
  - Input validation and error handling.
  
- **Documentation**
  - Comprehensive API documentation using Swagger UI.

## 🔧 Prerequisites

Before you begin, ensure you have met the following requirements:

- **Node.js**: Version 14.x or higher
- **npm**: Version 6.x or higher
- **Docker**: For containerized PostgreSQL setup
- **Docker Compose**: Optional, for orchestrating multi-container Docker applications
- **PostgreSQL**: Version 17.x (managed via Docker)
- **Sequelize CLI**: For database migrations and management

## 🛠 Technologies Used

- **Node.js**: JavaScript runtime environment.
- **Express**: Web framework for Node.js.
- **Sequelize**: Promise-based ORM for Node.js.
- **PostgreSQL**: Relational database management system.
- **Docker**: Containerization platform for deploying PostgreSQL.
- **Swagger UI**: Interactive API documentation.
- **Nodemon**: Utility that automatically restarts the server on file changes.
- **dotenv**: Module to load environment variables from a `.env` file.
- **bcryptjs**: Library to hash passwords.
- **jsonwebtoken**: Library to handle JWT authentication.
- **pgAdmin** / **DBeaver**: GUI tools for PostgreSQL database management.

### **Sample `.env` File:**

```env
# Server Configuration
PORT=5000
JWT_SECRET=your_jwt_secret_key

# Database Configuration
DB_HOST=localhost
DB_USER=user
DB_PASSWORD=pass
DB_NAME=dbname
DB_DIALECT=postgres
DB_PORT=5432
DATABASE_URL=postgresql://postgres:password@monorail.proxy.rlwy.net:34742/railway
NODE_ENV= production

# Twilio Configuration
TWILIO_ACCOUNT_SID=xxxx
TWILIO_AUTH_TOKEN=xxxx
TWILIO_PHONE_NUMBER=+xxxx

# Firebase Cloud Messaging Configuration
FCM_SERVICE_ACCOUNT_FILE=base64format of your file
