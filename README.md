# User Management System with Admin Role

## Overview

This project is a User Management System developed using Express.js, MongoDB, and JWT for authentication. It includes functionalities such as user signup, login, profile modification, and account deletion. Additionally, it supports user roles (Admin and User) with role-based access control.

## Setup

### Prerequisites

1. Node.js and npm installed
2. MongoDB server running
3. .env file with the following configurations:

```env
MONGODB_URI=<your_mongodb_uri>
SECRET_KEY=<your_secret_key>
```

### Installation

1. Clone the repository:

```bash
git clone https://github.com/Satyam5665/Assignment01.git
```

2. Install dependencies:

```bash
cd user-management-system
npm install
```

3. Run the application:

```bash
npm start
```

The server will be running on http://localhost:3000.

## API Endpoints

### 1. Signup

- **Endpoint:** `POST /signup`
- **Description:** Allows users to sign up with basic details including email, phone, name, password, and an optional profile image.
- **Request Body:**

```json
{
  "email": "user@example.com",
  "phone": "1234567890",
  "name": "John Doe",
  "password": "password123",
  "role": "user",
  "profileImage": "<base64_encoded_image>"
}
```

- **Response:**

```json
{
  "auth": true,
  "token": "<user_jwt_token>"
}
```

### 2. Login

- **Endpoint:** `POST /login`
- **Description:** Allows users to log in using their email, password, and role (user/admin).
- **Request Body:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "role": "user"
}
```

- **Response:**

```json
{
  "auth": true,
  "token": "<user_jwt_token>"
}
```

### 3. Profile Update

- **Endpoint:** `PUT /profile`
- **Description:** Allows users to update their profile details, including name and profile image.
- **Request Body:**

```json
{
  "name": "Updated Name",
  "profileImage": "<base64_encoded_image>"
}
```

- **Response:**

```json
{
  "message": "Profile updated successfully."
}
```

### 4. Account Deletion

- **Endpoint:** `DELETE /profile`
- **Description:** Allows users to delete their accounts.
- **Response:**

```json
{
  "message": "Account deleted successfully."
}
```

## Security Considerations

- Passwords are securely encrypted using bcrypt.
- JWT is used for authentication.
- Image uploads are handled securely using multer and stored locally in the 'uploads' directory.
