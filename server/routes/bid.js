const express = require("express");
const router = express.Router();
const bidController = require("../controller/bid");
const { isAuthorized } = require("../middleware/reqAuth");

router.get("/all-bid", isAuthorized, bidController.getAllBid);
router.post("/single-bid", bidController.getSingleBid);
router.get("/user-bid", isAuthorized, bidController.getUserBid);

router.post("/create-bid", isAuthorized, bidController.createBid);
router.post("/update-bid", isAuthorized, bidController.updateBid);
router.post("/delete-bid", isAuthorized, bidController.deleteBid);

router.post("/approve-bid", isAuthorized, bidController.approveBid);
router.post("/cancel-org", isAuthorized, bidController.cancelBidOrganiser);
router.post("/cancel-ven", isAuthorized, bidController.cancelBidVendor);

module.exports = router;