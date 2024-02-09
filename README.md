# 🎥 **WeTube**

WeTube is a robust backend server for video and post sharing. It utilizes MongoDB for data management, Cloudinary for media management, and Express.js for handling HTTP requests. It offers a wide range of features including authentication, video uploading, tweeting, likes, comments, playlists, subscriptions, and more.

## 🚀 Features

-   🔐 User Authentication
-   📹 Video Uploading
-   🐦 Tweeting
-   👍 Likes and Comments
-   🎵 Playlists
-   📬 Subscriptions

## 🛠️ Technologies Used

-   **MongoDB**: A source-available cross-platform document-oriented database program.
-   **Cloudinary**: A cloud-based image and video management service.
-   **Express.js**: A web application framework for Node.js, designed for building web applications and APIs.
-   **Bcrypt**: A library to help you hash passwords.
-   **Cookie-parser**: Parse Cookie header and populate `req.cookies` with an object keyed by the cookie names.
-   **Cors**: A node.js package for providing a Connect/Express middleware that can be used to enable CORS with various options.
-   **Dotenv**: A zero-dependency module that loads environment variables from a `.env` file into `process.env`.
-   **Jsonwebtoken**: An implementation of JSON Web Tokens.
-   **Mongoose**: An Object Data Modeling (ODM) library for MongoDB and Node.js.
-   **Mongoose-aggregate-paginate-v2**: A mongoose plugin to paginate aggregation results.
-   **Multer**: A node.js middleware for handling `multipart/form-data`, which is primarily used for uploading files.

## 🏁 Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### 📋 Prerequisites

Before you begin, ensure you have met the following requirements:

-   🖥️ You have a recent version of **Node.js** installed. If not, you can download it from [here](https://nodejs.org/).
-   🧰 You have a package manager like **npm** (comes with Node.js) or **yarn** installed.
-   🛠️ You have **Git** installed. If not, you can download it from [here](https://git-scm.com/downloads).

## 🛠️ Installation & Set Up

1. 🔽 Clone the repository:

    ```bash
    git clone https://github.com/AnikAdhikari7/WeTube.git
    ```

2. 📂 Navigate into the directory:

    ```bash
    cd WeTube
    ```

3. 🌐 Install the dependencies:

    ```bash
    npm install
    ```

4. 🌿 Create a `.env` file and populate it with the necessary API keys and secrets:

    ```bash
    cp .env.example .env
    ```

    Open `.env` and replace the placeholders with your actual data.

5. 🚀 Run the application in development mode:
    ```bash
    npm run dev
    ```

## 🚀 Running the Application

After installing the dependencies, you can run the application using the following scripts defined in the `package.json` file:

-   To run the application in development mode, use:
    ```bash
    npm run dev
    ```
-   To start the application normally, use:
    ```bash
    npm start
    ```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## 🎉 Acknowledgments

-   Thanks to all contributors who have helped with pull requests and issues.

-   Thanks to all the developers who have created the libraries and tools used in this project.

-   Gratitude for the following resources that guided the development process:
    -   [Tutorial by Chai aur Javascript Backend](https://youtube.com/playlist?list=PLu71SKxNbfoBGh_8p_NS-ZAh6v7HhYqHW&si=yOimvgK66q6PCVyn) -> [GitHub Repo](https://github.com/hiteshchoudhary/chai-backend) for explaining how to set up a Node.js/Express.js server that too production grade level.
    -   [@hiteshchoudhary](https://github.com/hiteshchoudhary) for their helpful code snippets and solutions to issues.
