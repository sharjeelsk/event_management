const bidModel = require("../models/bid");
const User = require("../models/user");
const Event = require("../models/event");
const jwt = require("jsonwebtoken");
const { notification } = require("../middleware/notification");


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
              console.log(user.myBids)
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
                    console.log(event)
                    await event.bids.forEach(bid => {
                      
                          bider = bid.userId.equals(userId)
                          console.log(bider)
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
                            let eventInc = await Event.updateOne(query, {$inc: {totalBids: "+1", }})//totalSubs: "+1"
                            console.log("Bid Created Successfully... Updating User and Event...")
                            await Event.findOneAndUpdate({_id: eventId}, {$addToSet: {bids: result._id, }})//subs: userId
                            .then( async (currentEvent) => {
                                console.log("Event Updated Successfully")
                                await User.updateOne({mobileNo: req.user.mobileNo}, {$addToSet: {myBids: result._id, myEvents: eventId, bidedEvent: eventId}})
                                .then( (updatedUser) => {
                                    console.log("User Updated Successfully")
                                    notify(currentEvent.organiserId,`New Bid on ${currentEvent.name}`,`by ${req.user.name} - Vendor`, result._id, )// notification to Organiser // reminder
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
                    await bidModel.findOneAndUpdate({_id: bidId}, {$set: updateOps})
                      .then((updatedbid)=> {
                      console.log(updatedbid)
                        Event.findOne({_id: updatedbid.eventId})
                        .then((foundedEvent) => {
                          // notify(foundedEvent.organiserId, `Bid ${foundedEvent.name} Updated`, `${req.user.name} - Vendor`)
                        })
                        return res.status(200).json({ result: updatedbid, msg: "Success" });
                    })       
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
                    await bidModel.findByIdAndDelete({_id: bidId})
                    .then(async (deletedBid) => {
                      console.log(deletedBid)
                        await User.updateOne({_id: req.user._id}, {$pull: {myBids: bidId,  myEvents: deletedBid.eventId, bidedEvent: deletedBid.eventId}})
                        .then( async (a) => {
                          console.log(a)
                            await Event.updateOne({_id: deletedBid.eventId}, {$pull: {"bids": bidId}, $inc: {totalBids: -1}})
                            .then(()=> {
                              // no need of Notifying Organiser
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
                        let approvedBid = await bidModel.findByIdAndUpdate({_id: bidId}, {$set: {status: "Approved"}})
                        if(approvedBid) {
                          console.log("status Changed")
                          let foundEvent = await Event.findOne({_id: approvedBid.eventId})
                          if(foundEvent) {
                            console.log(foundEvent.name)
                            let newBid = {
                              name: foundEvent.name,
                              bid: approvedBid._id
                            }
                            console.log(newBid)
                            await User.updateOne({_id: req.user._id}, { $addToSet: {myApprovals: newBid} })
                            .then(()=> {
                              notify(approvedBid.userId, `Bid Approved For Event-${foundEvent.name}`, `by ${req.user.name} - Organiser`, approvedBid._id)
                              return res.status(200).json({ result: approvedBid, msg: "Success" });
                            })     
                          }
                        }
            }
          } catch (err) {
            console.log(err)
            return res.status(500).json({ result: err, msg: "Error"});
          }
    }

    async cancelBidOrganiser(req, res) {
      try {
          let { bidId } = req.body;
          if(!bidId){
              return res.status(500).json({ result: "Data Missing", msg: "Error"});
          } else {
                      let data = {
                        value: true,
                        date: new Date().toISOString()
                      }
                      let cancelBid = await bidModel.findByIdAndUpdate({_id: bidId}, {$set: {"cancel.organiser": data}})
                      if(cancelBid) {
                        console.log("cancelled")
                        let foundEvent = await Event.findOne({_id: cancelBid.eventId})
                        if(foundEvent) {
                          console.log(foundEvent.name)
                            notify(cancelBid.userId, `Bid Cancelled For Event-${foundEvent.name}`, `by ${req.user.name} - Organiser`, cancelBid._id)
                            return res.status(200).json({ result: cancelBid, msg: "Success" });
                        }
                      }
          }
        } catch (err) {
          console.log(err)
          return res.status(500).json({ result: err, msg: "Error"});
        }
  }

  
  async cancelBidVendor(req, res) {
    try {
        let { bidId } = req.body;
        if(!bidId){
            return res.status(500).json({ result: "Data Missing", msg: "Error"});
        } else {
          console.log("abcd")
                    let data = {
                      value: true,
                      date: new Date().toISOString()
                    }
                    await bidModel.findByIdAndUpdate({_id: bidId}, {$set: {"cancel.vendor": data, status: "Cancelled"}})
                    .then(async(cancelBid) => {
                      console.log("cancelled")
                      await Event.findOneAndUpdate({_id: cancelBid.eventId}, {$pull: {bids: cancelBid._id, subs: req.user._id}, $inc: {totalBids: -1, totalSubs: -1}})
                      .then(async(foundEvent) => {
                        console.log(foundEvent.name)
                        await User.updateOne({_id: req.user._id}, {$pull: {myEvents: cancelBid.eventId, bidedEvent: cancelBid.eventId}})
                        .then(async(updatedUser) => {
                            notify(foundEvent.organiserId, `Bid Cancellation Accepted For Event-${foundEvent.name}`, `by ${req.user.name} - Vendor`, cancelBid._id)
                            return res.status(200).json({ result: cancelBid, msg: "Success" });
                        })
                          // return res.status(200).json({ result: cancelBid, msg: "Success" });
                      })
                    })
                    
                      
                    
        }
      } catch (err) {
        console.log(err)
        return res.status(500).json({ result: err, msg: "Error"});
      }
}
}



async function notify(sendUserId, eventName, userName, itemIds) {
    await User.findOne({_id: sendUserId})
      .then((user)=> {
        notification(user.expoPushToken, eventName, userName, itemIds, "Bid", [user._id])
      })
}

const bidController = new Bid();
module.exports = bidController;