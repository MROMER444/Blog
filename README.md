# Blog Application

This repository contains the code for a simple blog application built using Node.js, Express, Prisma, and JWT authentication. The application includes features such as user registration, authentication, post creation, and commenting.

## Getting Started

### Prerequisites

- Node.js
- Prisma
- MySQL database
- JWT Secret (store in a `.env` file)

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/MROMER444/Blog.git
    cd Blog
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Set up the database using Prisma:

    ```bash
    npx prisma migrate dev
    ```

4. Create a `.env` file in the root directory and set your JWT secret:

    ```
    JWT_SECRET=your_jwt_secret_here
    ```

5. Run the application:

    ```bash
    npm start
    ```

## Structure

- **index.js:** Entry point for the Express application. Sets up routes and starts the server.

- **router/user.js:** Handles user registration and login functionality.

- **router/auth.js:** Provides middleware for user authentication and admin authorization.

- **prisma/schema.prisma:** Defines the data models for users, posts, and comments using Prisma.

- **middleware/admin.js:** Middleware to check if a user is an admin.

- **middleware/user_auth.js:** Middleware for user authentication using JWT.

## Features

1. **User Registration and Authentication:**
   - Users can register with a unique email and password.
   - JWT is used for authentication, and the token is stored in the header (`x-auth-togenerationToken`).

2. **Post Creation:**
   - Authenticated users can create posts with titles and content.

3. **Commenting:**
   - Authenticated users can add comments to existing posts.

4. **Admin Authorization:**
   - Some routes require admin privileges, and the application checks for admin status using middleware.

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
