# VoiceWatch Backend API

VoiceWatch is a backend API designed to help users manage their emergency contacts efficiently. Built with Node.js, Express, and Sequelize, it leverages Microsoft SQL Server for robust data management. This API facilitates user registration, authentication, and the management of emergency contacts, ensuring that users have quick access to their important connections during critical moments.

## 📄 Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Configuration](#configuration)
- [Technologies Used](#technologies-used)


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
- **Microsoft SQL Server**: Version 2016 or higher
- **SQL Server Management Studio (SSMS)**: For database management

## 🛠 Technologies Used

- **Node.js**: JavaScript runtime environment.
- **Express**: Web framework for Node.js.
- **Sequelize**: Promise-based ORM for Node.js.
- **Microsoft SQL Server**: Relational database management system.
- **Swagger UI**: Interactive API documentation.
- **Nodemon**: Utility that automatically restarts the server on file changes.
- **dotenv**: Module to load environment variables from a `.env` file.
- **bcryptjs**: Library to hash passwords.
- **jsonwebtoken**: Library to handle JWT authentication.

