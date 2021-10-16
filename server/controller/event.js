const eventModel = require("../models/event");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;
const { update } = require("../models/user");
const schedule = require('node-schedule');

const date = "2021-10-14T18:39:00.943Z";
const dat1 = "2021-10-14T18:40:00.943Z";


const job = schedule.scheduleJob(date, function(){
  console.log('1111111111111111111111111111111.');
});
const job2 = schedule.scheduleJob(dat1, function(){
  console.log('22222222222222222222222222222222.');
});



class Event {


    async getAllEvent(req, res) {
        try {
            let decoded = jwt.verify(req.headers.token, process.env.JWT_REFRESH_TOKEN);
            let user = await User.findOne({mobileNo: decoded.data});
            if(user){
                let events = await eventModel.find({})
              // .populate()
              .sort({ _id: -1 });
            if (events) {
              return res.status(200).json({ result: events, msg: "Success"});
                }
            } else {
                return res.status(400).json({ result: "Unauthorised", msg: "Error"});
            }
          } catch (err) {
            return res.status(500).json({ result: err, msg: "Error"});
          }
    }


    async getSingleEvent(req, res) {
        try {
            let decoded = jwt.verify(req.headers.token, process.env.JWT_REFRESH_TOKEN);
            let user = await User.findOne({mobileNo: decoded.data});
            if(user){
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
                            console.log(event)
              // .populate()
            if (event) {
              return res.status(200).json({ result: event, msg: "Success"});
                }
            } else {
                return res.status(400).json({ result: "Unauthorised", msg: "Error"});
            }
          } catch (err) {
              console.log(err)
            return res.status(500).json({ result: err, msg: "Error"});
          }
    }


    async getUserEvents(req, res) {
        try {
            let decoded = jwt.verify(req.headers.token, process.env.JWT_REFRESH_TOKEN);
            let user = await User.findOne({mobileNo: decoded.data}).populate("myEvents");
            if(user){
                return res.status(200).json({ result: user.myEvents, msg: "Success"});
            } else {
                return res.status(400).json({ result: "Unauthorised", msg: "Error"});
            }
          } catch (err) {
            return res.status(500).json({ result: err, msg: "Error"});
          }
    }

    async createEvent(req, res) {
        try {
            let { mobileNo, email, address, name, description, type, location, start, end, reqServices, eventAddress} = req.body;
            console.log(req.body)
            if(!mobileNo || !email || !address || !name || !description || !type || !location || !start || !end || !reqServices || !eventAddress){
                return res.status(500).json({ result: "Data Missing", msg: "Error"});
            } else {
                let decoded = jwt.verify(req.headers.token, process.env.JWT_REFRESH_TOKEN);
                let user = await User.findOne({mobileNo: decoded.data});
                if(user) {
                    let event = new eventModel({
                        organiserId: user._id,
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
                        subs: user._id
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
                        await User.updateOne({mobileNo: decoded.data}, {$addToSet: {myEvents: result._id}})
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
                } else {
                    return res.status(400).json({ result: "Unauthorised", msg: "Error"});
                }
            }
          } catch (err) {
            console.log(err)
            return res.status(500).json({ result: err, msg: "Error"});
          }
    }

    async updateEvent(req, res) {
        try {
            let decoded = jwt.verify(req.headers.token, process.env.JWT_REFRESH_TOKEN);
            let { eventId } = req.body;
            let user = await User.findOne({mobileNo: decoded.data});
            if(user) {
                if(!eventId){
                    return res.status(500).json({ result: "Data Missing", msg: "Error"});
                } else {
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
            } else {
                return res.status(400).json({ result: "Unauthorised", msg: "Error"});
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
                let decoded = jwt.verify(req.headers.token, process.env.JWT_REFRESH_TOKEN);
                let user = await User.findOne({mobileNo: decoded.data});
                if(user) {
                    let deletedEvent = await eventModel.deleteOne({_id: eventId})
                      if(deletedEvent) {
                        return res.status(200).json({ result: deletedEvent, msg: "Success" });
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

    async joinEvent(req, res) {
        try {
            let { eventId } = req.body;
            if(!eventId){
                return res.status(500).json({ result: "Data Missing", msg: "Error"});
            } else {
                let decoded = jwt.verify(req.headers.token, process.env.JWT_REFRESH_TOKEN);
                let user = await User.findOne({mobileNo: decoded.data});
                if(user) {
                        var query = {
                         _id: eventId,
                         subs: {$ne: user._id}
                          };
                        let eventInc = await eventModel.updateOne(query, {$inc: {totalSubs: "+1"}})
                        let updatedEvent = await eventModel.updateOne({_id: eventId}, {$addToSet: {subs: user._id}})
                        if(updatedEvent) {
                            let updatedUser= await User.updateOne({_id: user._id}, {$addToSet: {myEvents: eventId}})
                            if(updatedUser){
                                return res.status(200).json({ result: "Joined", msg: "Success" });
                            }
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

    async unSubEvent(req, res) {
      try {
          let { eventId } = req.body;
          if(!eventId){
              return res.status(500).json({ result: "Data Missing", msg: "Error"});
          } else {
              let decoded = jwt.verify(req.headers.token, process.env.JWT_REFRESH_TOKEN);
              let user = await User.findOne({mobileNo: decoded.data});
              if(user) {
                      var query = {
                       _id: eventId,
                       subs: {$ne: user._id}
                        };
                      let eventInc = await eventModel.updateOne(query, {$inc: {totalSubs: "+1"}})
                      let updatedEvent = await eventModel.updateOne({_id: eventId}, {$addToSet: {subs: user._id}})
                      if(updatedEvent) {
                          let updatedUser= await User.updateOne({_id: user._id}, {$addToSet: {myEvents: eventId}})
                          if(updatedUser){
                              return res.status(200).json({ result: "Joined", msg: "Success" });
                          }
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

const eventController = new Event();
module.exports = eventController;