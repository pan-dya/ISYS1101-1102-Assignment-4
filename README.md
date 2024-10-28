# README

## Project Description
This project is a server-side application using **Express.js** and **MongoDB** to manage property listings and bookings. It includes basic functionality for creating, booking, and confirming property listings.

## Prerequisites
Make sure you have the following installed:

- **Node.js** (version 16 or higher)
- **npm** (comes with Node.js)

## Setup Guide
Follow these steps to set up and run the application:

1. **Extract the ZIP File**
Extract the provided project ZIP file to your desired location.

2. **Install Dependencies**
Open a terminal, navigate to the project directory, and run:

```
npm install
```

3. **Run the Server**
In the terminal, run the following command to start the server:

```
node app.js
```

4. **Testing the Application**
To test the application, follow these steps:

- Access the Homepage
Open your browser and go to:

`http://localhost:3000`

## Dependencies
The required Node.js packages are:

- **express** - Web framework for Node.js
- **body-parser** - Middleware to handle request bodies
- **dotenv** - For managing environment variables
- **mongodb** - MongoDB driver for Node.js

## Important Notes
1. **Port Configuration:** The default port is 3000, but you can change it in the `server/app.js` file if needed.
2. **MongoDB Connection:** Ensure your MongoDB server is running and accessible at the URI specified in the `.env` file.