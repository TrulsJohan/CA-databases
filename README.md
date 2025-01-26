# Movie API

This is a RESTful API built with **Node.js**, **Express.js**, and **MySQL**. It allows users to register, log in, and manage a collection of movies.

## Features
- **User Registration & Login** with JWT authentication.
- **CRUD operations** for movies.
- **Protected Routes** requiring authentication.

## Prerequisites
Make sure you have the following installed:
- [Node.js](https://nodejs.org/)
- [MySQL](https://www.mysql.com/)
- [Postman](https://www.postman.com/) (optional, for API testing)

## Installation

### 1. Clone the repository
```sh
git clone <repository-url>
cd <repository-folder>
```

### 2. Install dependencies
```sh
npm install
```

### 3. Set up environment variables
Create a `.env` file in the project root and add the following variables:
```env
DB_HOST=your_database_host
DB_NAME=movies_db
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_PORT=3306
SECRET=jwt-secret
```

### 4. Start the server
```sh
npm start
```
The API will run on **http://localhost:3000**.

## API Endpoints

### **Authentication**
#### Register a new user
```
POST /registration
```
**Request Body:**
```json
{
  "username": "user123",
  "password": "password123"
}
```
**Response:**
```json
{
  "message": "User registered successfully"
}
```

#### Login
```
POST /login
```
**Request Body:**
```json
{
  "username": "user123",
  "password": "password123"
}
```
**Response:**
```json
{
  "message": "Success",
  "accessToken": "your-jwt-token",
  "user_id": 1
}
```

### **Movies**
#### Get all movies
```
GET /movies
```
**Response:**
```json
{
  "message": "Movies retrieved successfully.",
  "data": [ {"id": 1, "title": "Inception", ...} ]
}
```

#### Get movies by user (protected)
```
GET /movies/user/:user_id
Authorization: Bearer <token>
```
**Response:**
```json
{
  "message": "Movies retrieved successfully.",
  "data": [{ "title": "Interstellar", ...}]
}
```

#### Add a movie (protected)
```
POST /movies/user/:user_id
Authorization: Bearer <token>
```
**Request Body:**
```json
{
  "title": "Inception",
  "description": "A mind-bending thriller",
  "img_url": "https://image-url.com"
}
```
**Response:**
```json
{
  "message": "Movie added successfully!",
  "movieId": 1
}
```

#### Get a single movie by ID (protected)
```
GET /movies/:movie_id
Authorization: Bearer <token>
```
**Response:**
```json
{
  "message": "Movie retrieved successfully.",
  "data": { "id": 1, "title": "Inception", ... }
}
```

#### Update a movie (protected)
```
PUT /movies/update/:movie_id/:user_id
Authorization: Bearer <token>
```
**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "img_url": "https://new-image-url.com"
}
```
**Response:**
```json
{
  "message": "Movie with ID 1 updated successfully."
}
```

#### Delete a movie (protected)
```
DELETE /movies/:id
Authorization: Bearer <token>
```
**Response:**
```json
{
  "message": "Movie with ID 1 deleted successfully"
}
```

## License
This project is open-source and available under the MIT License.

