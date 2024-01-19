// external imports
import {} from "dotenv/config";

// internal imports
import app from "./app.js";
import connectDB from "./db/index.js";

const port = process.env.PORT || 8080;

// db connection
connectDB()
    .then(() => {
        // handling app errors
        app.on("error", (error) => {
            console.log("ERROR: ", error);
            throw error;
        });

        app.listen(port, () => {
            console.log(`⚙️ Server is running at port: ${port}`);
        });
    })
    .catch((err) => {
        console.log("MongoDB connection failed!!!", err);
    });
