const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const ExpressError = require("../utils/ExpressError.js");

const { listingSchema } = require("../schema.js");

const validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);

    if (error) {
        const errMsg = error.details
            .map((el) => el.message)
            .join(",");

        throw new ExpressError(400, errMsg);
    }

    next();
};

// ===============================
// INDEX ROUTE
// ===============================

router.get(
    "/",
    wrapAsync(async (req, res) => {
        console.log("Inside /listings route");

        const allListings = await Listing.find({});

        console.log("Total listings:", allListings.length);

        res.render("listings/index.ejs", {
            allListings
        });
    })
);

// ===============================
// NEW ROUTE
// ===============================

router.get("/new", (req, res) => {
    res.render("listings/new.ejs");
});

// ===============================
// SHOW ROUTE
// ===============================

router.get(
    "/:id",
    wrapAsync(async (req, res) => {

        const { id } = req.params;

        const listing = await Listing.findById(id).populate("reviews");

        // If listing does not exist
        if (!listing) {
            throw new ExpressError(404, "Listing not found");
        }

        res.render("listings/show.ejs", {
            listing
        });
    })
);

// ===============================
// CREATE ROUTE
// ===============================

router.post(
    "/",
    validateListing,
    wrapAsync(async (req, res) => {

        const newListing = new Listing(req.body.listing);

        await newListing.save();

        res.redirect("/listings");
    })
);

// ===============================
// EDIT ROUTE
// ===============================

router.get(
    "/:id/edit",
    wrapAsync(async (req, res) => {

        const { id } = req.params;

        const listing = await Listing.findById(id);

        if (!listing) {
            throw new ExpressError(404, "Listing not found");
        }

        res.render("listings/edit.ejs", {
            listing
        });
    })
);

// ===============================
// UPDATE ROUTE
// ===============================

router.put(
    "/:id",
    validateListing,
    wrapAsync(async (req, res) => {

        const { id } = req.params;

        console.log(req.body);

        await Listing.findByIdAndUpdate(
            id,
            {
                ...req.body.listing
            },
            {
                runValidators: true
            }
        );

        res.redirect(`/listings/${id}`);
    })
);

// ===============================
// DELETE ROUTE
// ===============================

router.delete(
    "/:id",
    wrapAsync(async (req, res) => {

        const { id } = req.params;

        const deletedListing =
            await Listing.findByIdAndDelete(id);

        console.log("Deleted listing:", deletedListing);

        res.redirect("/listings");
    })
);

module.exports = router;