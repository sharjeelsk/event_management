const bidModel = require("../models/bid");
const User = require("../models/user");
const Event = require("../models/event");
const jwt = require("jsonwebtoken");

class Bid {


    async getAllBid(req, res) {
        try {
            let decoded = jwt.verify(req.headers.token, process.env.JWT_REFRESH_TOKEN);
            let user = await User.findOne({mobileNo: decoded.data});
            if(user){
                let bids = await bidModel.find({})
              // .populate()
              .sort({ _id: -1 });
            if (bids) {
              return res.status(200).json({ result: bids, msg: "Success"});
                }
            } else {
                return res.status(400).json({ result: "Unauthorised", msg: "Error"});
            }
          } catch (err) {
            return res.status(500).json({ result: err, msg: "Error"});
          }
    }


    async getSingleBid(req, res) {
        try {
            let decoded = jwt.verify(req.headers.token, process.env.JWT_REFRESH_TOKEN);
            let user = await User.findOne({mobileNo: decoded.data});
            if(user){
                let {bidId} = req.body
                let bid = await bidModel.findOne({_id: bidId})
              // .populate()
            if (bid) {
              return res.status(200).json({ result: bid, msg: "Success"});
                }
            } else {
                return res.status(400).json({ result: "Unauthorised", msg: "Error"});
            }
          } catch (err) {
              console.log(err)
            return res.status(500).json({ result: err, msg: "Error"});
          }
    }


    async getUserBid(req, res) {
        try {
            let decoded = jwt.verify(req.headers.token, process.env.JWT_REFRESH_TOKEN);
            let user = await User.findOne({mobileNo: decoded.data}).populate("myBids");
            if(user){
                return res.status(200).json({ result: user.myBids, msg: "Success"});
            } else {
                return res.status(400).json({ result: "Unauthorised", msg: "Error"});
            }
          } catch (err) {
            return res.status(500).json({ result: err, msg: "Error"});
          }
    }

    async createBid(req, res) {
        try {
            let { eventId, services, totalPrice, discountType, discountValue} = req.body;
            if(!eventId || !services || !totalPrice || !discountType || !discountValue){
                return res.status(500).json({ result: "Data Missing", msg: "Error"});
            } else {
                let decoded = jwt.verify(req.headers.token, process.env.JWT_REFRESH_TOKEN);
                let user = await User.findOne({mobileNo: decoded.data});
                if(user) {
                    let event = await Event.findOne({_id: eventId});
                    let condition = event.organiserId.equals(user._id)
                    if(condition === true){
                        return res.status(200).json({ result: "Orgainser Cant Bid", msg: "Success"});
                    } else {
                        let bid = new bidModel({
                            eventId,
                            userId: user._id,
                            services,
                            totalPrice,
                            discountType,
                            discountValue,
                            discountedPrice: totalPrice
                        })
                        await bid.save().then(async(result) => {
                            let query = {
                                _id: eventId,
                                bids: {$ne: user._id}
                                 };
                            let eventInc = await Event.updateOne(query, {$inc: {totalBids: "+1"}})
                            console.log("Bid Created Successfully... Updating User Bid...")
                            await Event.updateOne({_id: eventId}, {$addToSet: {bids: result._id}})
                            .then( async () => {
                                await User.updateOne({mobileNo: decoded.data}, {$addToSet: {myBids: result._id}})
                                .then( (updatedUser) => {
                                    console.log("User Updated Successfully")
                                return res.status(200).json({ result: updatedUser, msg: "Success"});
                                })   
                            })
                        })
                    }
                } else {
                    return res.status(400).json({ result: "Unauthorised", msg: "Error"});
                }
            }
          } catch (err) {
            console.log(err)
            return res.status(500).json({ result: err, msg: "Error"});
          }
    }

    async updateBid(req, res) {
        try {
            let decoded = jwt.verify(req.headers.token, process.env.JWT_REFRESH_TOKEN);
            let { bidId } = req.body;
            let user = await User.findOne({mobileNo: decoded.data});
            if(user) {
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
            } else {
                return res.status(400).json({ result: "Unauthorised", msg: "Error"});
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
                let decoded = jwt.verify(req.headers.token, process.env.JWT_REFRESH_TOKEN);
                let user = await User.findOne({mobileNo: decoded.data})
                if(user) {
                    await bidModel.findOneAndDelete({_id: bidId})
                    .then(async (deletedBid) => {
                        await User.updateOne({_id: user._id}, {$pull: {"myBids": bidId}})
                        .then( async () => {
                            await Event.updateOne({_id: deletedBid.eventId}, {$pull: {"bids": bidId}, $inc: {totalBids: -1}})
                            .then(()=> {
                                return res.status(200).json({ result: deletedBid, msg: "Success" });
                            })
                        })  
                    })
                } else {
                    return res.status(400).json({ result: "Unauthorised", msg: "Error"});
                }
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
                let decoded = jwt.verify(req.headers.token, process.env.JWT_REFRESH_TOKEN);
                let user = await User.findOne({mobileNo: decoded.data});
                if(user) {
                        let approvedBid = await bidModel.updateOne({_id: bidId}, {$set: {status: "Approved"}})
                        if(approvedBid) {
                            
                                return res.status(200).json({ result: approvedBid, msg: "Success" });
                            
                        }
                } else {
                    return res.status(400).json({ result: "Unauthorised", msg: "Error"});
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