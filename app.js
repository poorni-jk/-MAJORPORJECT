const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");

const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

// ===============================
// DATABASE CONNECTION
// ===============================

main()
    .then(() => {
        console.log("connected to DB");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(MONGO_URL);
}

// ===============================
// APP CONFIGURATION
// ===============================

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// ===============================
// ROOT ROUTE
// ===============================

app.get("/", (req, res) => {
    res.send("Hi, I am root");
});

app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);

// ===============================
// 404 ROUTE
// ===============================

app.use((req, res, next) => {

    console.log("404 URL:", req.originalUrl);

    next(
        new ExpressError(
            404,
            `Page Not Found: ${req.originalUrl}`
        )
    );
});

// ===============================
// ERROR HANDLER
// ===============================

app.use((err, req, res, next) => {

    console.error(err);

    const {
        statusCode = 500,
        message = "Something went wrong"
    } = err;

    res.status(statusCode).render("error.ejs", {
        err
    });
});

// ===============================
// START SERVER
// ===============================

app.listen(8080, () => {
    console.log("server is listening on port 8080");
});