const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();


const authRoute = require("./routes/auth");



const friendRoute = require("./routes/friend");


const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/friends", friendRoute);
app.use("/api/auth", authRoute);


const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("MongoDB connected");
}).catch((error) => console.log("DB connection error", error));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
