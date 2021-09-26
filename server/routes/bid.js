const express = require("express");
const router = express.Router();
const bidController = require("../controller/bid");

router.get("/all-bid", bidController.getAllBid);
router.get("/single-bid", bidController.getSingleBid);
router.get("/user-bid", bidController.getUserBid);

router.post("/create-bid", bidController.createBid);
router.post("/update-bid", bidController.updateBid);
router.post("/delete-bid", bidController.deleteBid);

router.post("/approve-bid", bidController.approveBid);

module.exports = router;