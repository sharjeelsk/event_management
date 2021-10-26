const eventModel = require("../models/event");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;
const { update } = require("../models/user");
const schedule = require('node-schedule');

// const date = "2021-10-14T18:39:00.943Z";
// const dat1 = "2021-10-14T18:40:00.943Z";


// const job = schedule.scheduleJob(date, function(){
//   console.log('1111111111111111111111111111111.');
// });
// const job2 = schedule.scheduleJob(dat1, function(){
//   console.log('22222222222222222222222222222222.');
// });



class Event {


    async getAllEvent(req, res) {
        try {
            let events = await eventModel.find({})
              .sort({ _id: -1 });
            if (events) {
              return res.status(200).json({ result: events, msg: "Success"});
                }
          } catch (err) {
            return res.status(500).json({ result: err, msg: "Error"});
          }
    }


    async getSingleEvent(req, res) {
        try {
                let {eventId} = req.body
                let event = await eventModel.findOne({_id: eventId})
                .populate([{
                    path: "bids",
                    model: "Bid",
                    populate: {
                      path: "userId",
                      model: "User"
                    }
                  },
                ])
            if (event) {
              return res.status(200).json({ result: event, msg: "Success"});
                }
          } catch (err) {
              console.log(err)
            return res.status(500).json({ result: err, msg: "Error"});
          }
    }


    async getUserEvents(req, res) {
        try {
            let user = await User.findOne({mobileNo: req.user.mobileNo}).populate("myEvents");
            if(user){
                return res.status(200).json({ result: user.myEvents, msg: "Success"});
            }
          } catch (err) {
            return res.status(500).json({ result: err, msg: "Error"});
          }
    }

    async createEvent(req, res) {
        try {
            let { mobileNo, email, address, name, description, type, location, start, end, reqServices, eventAddress} = req.body;
            if(!mobileNo || !email || !address || !name || !description || !type || !location || !start || !end || !reqServices || !eventAddress){
                return res.status(500).json({ result: "Data Missing", msg: "Error"});
            } else {
              console.log(start)
              console.log(end)
                    let event = new eventModel({
                        organiserId: req.user._id,
                        mobileNo, 
                        email, 
                        address, 
                        name, 
                        description, 
                        type, 
                        location,
                        start, 
                        end, 
                        reqServices,
                        totalSubs: 1,
                        eventAddress,
                        subs: req.user._id
                    })
                    await event.save().then(async(result) => {
                      const startEvent = schedule.scheduleJob(start, async () => {
                        let changeStatus = await eventModel.updateOne({_id: result._id}, {$set: {status: "Live"}})
                        .then((doc)=> {
                          console.log(doc)
                          console.log("Event Started")
                        })
                      })
                      const endEvent = schedule.scheduleJob(end, async () => {
                        let changeStatus = await eventModel.updateOne({_id: result._id}, {$set: {status: "Over"}})
                        .then((doc)=> {
                          console.log(doc)
                          console.log("Event Over")
                        })
                      })
                        console.log("Event Created Successfully... Updating User Events...")
                        await User.updateOne({mobileNo: req.user.mobileNo}, {$addToSet: {myEvents: result._id}})
                        .then( user => {
                            console.log("User Updated Successfully")
                            return res.status(200).json({ result: result, msg: "Success"});
                        })
                        .catch(err=>{
                          console.log(err)
                        })
                    })
                    .catch(err=>{
                      console.log(err)
                    })
            }
          } catch (err) {
            console.log(err)
            return res.status(500).json({ result: err, msg: "Error"});
          }
    }

    async updateEvent(req, res) {
        try {
            let { eventId } = req.body;
                if(!eventId){
                    return res.status(500).json({ result: "Data Missing", msg: "Error"});
                } else {
                  console.log(req.body.data)
                    let updateOps = {};
                    for(const ops of req.body.data){
                        updateOps[ops.propName] = ops.value;
                    }
                    console.log(updateOps)
                    let currentEvent = await eventModel.updateOne({_id: eventId}, {
                        $set: updateOps
                      });
                        if(currentEvent) {
                          return res.status(200).json({ result: currentEvent, msg: "Success" });
                        }
                }
          } catch (err) {
            console.log(err)
            return res.status(500).json({ result: err, msg: "Error"});
          }
    }

    async deleteEvent(req, res) {
        try {
            let { eventId } = req.body;
            if(!eventId){
                return res.status(500).json({ result: "Data Missing", msg: "Error"});
            } else {
                    let deletedEvent = await eventModel.deleteOne({_id: eventId})
                      if(deletedEvent) {
                        return res.status(200).json({ result: deletedEvent, msg: "Success" });
                      }
            }
          } catch (err) {
            console.log(err)
            return res.status(500).json({ result: err, msg: "Error"});
          }
    }

    async joinEvent(req, res) {
        try {
            let { eventId } = req.body;
            if(!eventId){
                return res.status(500).json({ result: "Data Missing", msg: "Error"});
            } else {
                        var query = {
                         _id: eventId,
                         subs: {$ne: req.user._id}
                          };
                        let eventInc = await eventModel.updateOne(query, {$inc: {totalSubs: "+1"}})
                        let updatedEvent = await eventModel.updateOne({_id: eventId}, {$addToSet: {subs: req.user._id}})
                        if(updatedEvent) {
                            let updatedUser= await User.updateOne({_id: req.user._id}, {$addToSet: {myEvents: eventId}})
                            if(updatedUser){
                                return res.status(200).json({ result: "Joined", msg: "Success" });
                            }
                        }
            }
          } catch (err) {
            console.log(err)
            return res.status(500).json({ result: err, msg: "Error"});
          }
    }

    async unSubEvent(req, res) {
      try {
          let { eventId } = req.body;
          if(!eventId){
              return res.status(500).json({ result: "Data Missing", msg: "Error"});
          } else {
                      var query = {
                       _id: eventId,
                       subs: {$ne: req.user._id}
                        };
                      let eventInc = await eventModel.updateOne(query, {$inc: {totalSubs: "-1"}})
                      let updatedEvent = await eventModel.updateOne({_id: eventId}, {$pull: {subs: req.user._id}})
                      if(updatedEvent) {
                          let updatedUser= await User.updateOne({_id: req.user._id}, {$pull: {myEvents: eventId}})
                          if(updatedUser){
                              return res.status(200).json({ result: "UnSubscribed", msg: "Success" });
                          }
                      }
          }
        } catch (err) {
          console.log(err)
          return res.status(500).json({ result: err, msg: "Error"});
        }
  }

  async getBidedEvent(req, res) {
    try {
            let user = await User.findOne({mobileNo: req.user.mobileNo})
                        .populate({
                          path: "bidedEvent",
                          model: "Event",
                          populate: {
                            path: "bids",
                            model: "Bid",
                            populate: {
                              path: "userId",
                              model: "User"
                            }
                          }
                        })
                        // .select("bidedEvent");
            if(user) {
                  return res.status(200).json({ result: user, msg: "Success" });
            }
      } catch (err) {
        console.log(err)
        return res.status(500).json({ result: err, msg: "Error"});
      }
    }
}

const eventController = new Event();
module.exports = eventController;