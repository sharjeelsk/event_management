const bidModel = require("../models/bid");
const User = require("../models/user");
const Event = require("../models/event");
const jwt = require("jsonwebtoken");

class Bid {


    async getAllBid(req, res) {
        try {
            let bids = await bidModel.find({})
              .sort({ _id: -1 });
            if (bids) {
              return res.status(200).json({ result: bids, msg: "Success"});
                }
          } catch (err) {
            return res.status(500).json({ result: err, msg: "Error"});
          }
    }


    async getSingleBid(req, res) {
        try {
            let {bidId} = req.body
            let bid = await bidModel.findOne({_id: bidId})
            if (bid) {
              return res.status(200).json({ result: bid, msg: "Success"});
                }
          } catch (err) {
              console.log(err)
            return res.status(500).json({ result: err, msg: "Error"});
          }
    }


    async getUserBid(req, res) {
        try {
            let user = await User.findOne({mobileNo: req.user.mobileNo})
                        .populate("myBids")
                        .select("myBids")
            if(user){
                return res.status(200).json({ result: user, msg: "Success"});
            }
          } catch (err) {
            return res.status(500).json({ result: err, msg: "Error"});
          }
    }

    async createBid(req, res) {
        try {
            let { eventId, services, totalPrice, description} = req.body;
            let userId = req.user._id;
            if(!eventId || !services || !totalPrice || !description){
                return res.status(500).json({ result: "Data Missing", msg: "Error"});
            } else {
                    let event = await Event.findOne({_id: eventId})
                                .populate({path:'bids', select:'userId'})
                    let bider;
                    await event.bids.forEach(bid => {
                          bider = bid.userId.equals(userId)
                            if(bider === true){
                                return false
                            }
                        });
                        console.log(bider)
                    let condition = event.organiserId.equals(userId)
                    if(condition === true){
                        return res.status(200).json({ result: "Orgainser Cant Bid", msg: "Success"});
                    } else if (bider === true) {
                        return res.status(200).json({ result: "Already Bided", msg: "Success"});
                    } else {
                        
                        let bid = new bidModel({
                            eventId,
                            userId: userId,
                            services,
                            totalPrice,
                            description
                        })
                        await bid.save().then(async(result) => {
                            let query = {
                                _id: eventId,
                                bids: {$ne: userId}
                                 };
                            let eventInc = await Event.updateOne(query, {$inc: {totalBids: "+1", totalSubs: "+1"}})
                            console.log("Bid Created Successfully... Updating User and Event...")
                            await Event.updateOne({_id: eventId}, {$addToSet: {bids: result._id, subs: userId}})
                            .then( async () => {
                                console.log("Event Updated Successfully")
                                await User.updateOne({mobileNo: req.user.mobileNo}, {$addToSet: {myBids: result._id, myEvents: eventId, bidedEvent: eventId}})
                                .then( (updatedUser) => {
                                    console.log("User Updated Successfully")
                                return res.status(200).json({ result: updatedUser, msg: "Success"});
                                })   
                            })
                        })
                    }
            }
          } catch (err) {
            console.log(err)
            return res.status(500).json({ result: err, msg: "Error"});
          }
    }

    async updateBid(req, res) {
        try {
            let { bidId } = req.body;
                if(!bidId){
                    return res.status(500).json({ result: "Data Missing", msg: "Error"});
                } else {
                    let updateOps = {};
                    for(const ops of req.body.data){
                        updateOps[ops.propName] = ops.value;
                    }
                    console.log(updateOps)
                    let currentBid = await bidModel.updateOne({_id: bidId}, {
                        $set: updateOps
                      });
                        if(currentBid) {
                          return res.status(200).json({ result: currentBid, msg: "Success" });
                        }
                }
          } catch (err) {
            console.log(err)
            return res.status(500).json({ result: err, msg: "Error"});
          }
    }

    async deleteBid(req, res) {
        try {
            let { bidId } = req.body;
            if(!bidId){
                return res.status(500).json({ result: "Data Missing", msg: "Error"});
            } else {
                    await bidModel.remove({_id: bidId})
                    .then(async (deletedBid) => {
                      console.log(deletedBid)
                        await User.updateOne({_id: req.user._id}, {$pull: {"myBids": bidId, "bidedEvent": deletedBid.eventId}})
                        .then( async (a) => {
                          console.log(a)
                            await Event.updateOne({_id: deletedBid.eventId}, {$pull: {"bids": bidId}, $inc: {totalBids: -1}})
                            .then(()=> {
                                return res.status(200).json({ result: deletedBid, msg: "Success" });
                            })
                        })  
                    })
            }
          } catch (err) {
            console.log(err)
            return res.status(500).json({ result: err, msg: "Error"});
          }
    }

    async approveBid(req, res) {
        try {
            let { bidId } = req.body;
            if(!bidId){
                return res.status(500).json({ result: "Data Missing", msg: "Error"});
            } else {
                        let approvedBid = await bidModel.updateOne({_id: bidId}, {$set: {status: "Approved"}})
                        if(approvedBid) {
                                return res.status(200).json({ result: approvedBid, msg: "Success" });
                        }
            }
          } catch (err) {
            console.log(err)
            return res.status(500).json({ result: err, msg: "Error"});
          }
    }
}

const bidController = new Bid();
module.exports = bidController;