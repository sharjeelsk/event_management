const eventModel = require("../models/event");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;
const { update } = require("../models/user");
const schedule = require('node-schedule');
const { notification } = require("../middleware/notification");

const Conversation = require("../models/conversation");

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

    async eventsNearMe(req, res) {
      try {
          let events = await eventModel.aggregate([
            {
              "$search": {
                "index": "nearByEvent",
                    
                      "geoWithin": {
                        "circle": {
                          "center": {
                            "type": "Point",
                            "coordinates": [req.body.position.longitude, req.body.position.latitude]
                          },
                          "radius": 20000
                        },
                        "path": "sLocation"
                      }
                    
              }
            }
          ])
          if (events) {
            return res.status(200).json({ count: events.length, result: events, msg: "Success"});
              }
        } catch (err) {
          console.log(err)
          return res.status(500).json({ result: err, msg: "Error"});
        }
  }

    async searchEvent(req, res) {
      try {
          let events = await eventModel.aggregate([
            {
              "$search": {
                "index": "eventSearch",
                "compound": {
                  "must": [
                    {
                      "autocomplete": {
                        "query": req.body.query,
                        "path": "name"
                      }
                    },
                    {
                      "geoWithin": {
                        "circle": {
                          "center": {
                            "type": "Point",
                            "coordinates": [req.body.position.longitude, req.body.position.latitude]
                          },
                          "radius": 50000
                        },
                        "path": "sLocation"
                      }
                    }
                  ]
                }
              }
            }
          ])
          if (events) {
            return res.status(200).json({ count: events.length, result: events, msg: "Success"});
              }
        } catch (err) {
          console.log(err)
          return res.status(500).json({ result: err, msg: "Error"});
        }
  }

    async allEventBids(req, res) {
      try {
          let events = await eventModel.find({})
            .sort({ _id: -1 })
            .populate([{
              path: "bids",
              model: "Bid",
              populate: {
                path: "organiserId",
                model: "User"
              }
            },
          ])
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
                console.log(eventId)
                await eventModel.findOne({_id: eventId})
                .then((event) => {
                  console.log(event)
                  return res.status(200).json({ result: event, msg: "Success"});
                })
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
              let contactList;
                if(type === "PRIVATE"){
                  let { contacts }= req.body;
                  contactList = contacts
                } else{
                  contactList = []
                }
                  // if type === "PRIVATE" then request ContactId and Groups
                  ///take ContactId and groups Array and set it on events Members field
                  // run a function on userCOntactId groups for sending notification to existing customer
                  // and sms to non existing user

                    let event = new eventModel({
                        organiserId: req.user._id,
                        organiserName: req.user.name,
                        mobileNo, 
                        email, 
                        address, 
                        name, 
                        description, 
                        type, 
                        location,
                        sLocation: { 
                          type: "Point", 
                          coordinates: [ location.longitude, location.latitude ] 
                        },
                        start, 
                        end, 
                        reqServices,
                        totalSubs: 1,
                        eventAddress,
                        subs: req.user._id,
                        members: contactList
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
                        .then( (user) => {
                            console.log("User Updated Successfully")
                            if(type === "PRIVATE") {
                              //function 
                            addUsersToEvent(result.members, result._id, req.user._id, result.name, req.user.expoPushToken) // add users to this event | inside this fucntion selected users will be notify
                            } else {
                              // notify to all user
                              notifyAllUsers("Event Found", result.name, result._id)
                            }
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
                    let currentEvent = await eventModel.findOneAndUpdate({_id: eventId}, {
                        $set: updateOps
                      });
                        if(currentEvent) {
                          notifySelectedUser("Event Updated", currentEvent.name, currentEvent.subs, currentEvent._id)
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
            console.log("IDDDDDDDDDDDDDDDD", eventId)
            if(!eventId){
                return res.status(500).json({ result: "Data Missing", msg: "Error"});
            } else {
              await eventModel.findOne({_id: eventId})
              .then( async (currentEvent) => {
                console.log(currentEvent)
                await User.updateMany({myEvents: {$in: eventId}}, {$pull: {myEvents: eventId}})
                .then( async () => {
                  await Conversation.deleteOne({eventId: eventId})
                  .then( async () => {
                    await eventModel.deleteOne({_id: eventId})
                    .then((deletedEvent)=> {
                      notifySelectedUser("Event Deleted", currentEvent.name, currentEvent.subs, currentEvent._id)
                      return res.status(200).json({ result: deletedEvent.deletedCount, msg: "Success" });
                    })
                  })
                })
              })
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
                        await eventModel.updateOne(query, {$inc: {totalSubs: "+1"}})
                        .then(async()=> {
                          await eventModel.updateOne({_id: eventId}, {$addToSet: {subs: req.user._id}})
                          .then(async()=> {
                            await User.updateOne({_id: req.user._id}, {$addToSet: {myEvents: eventId}})
                            .then(async()=> {
                              await Conversation.updateOne({eventId: eventId}, {$push: {members: req.user._id}})
                              .then(()=> {
                                return res.status(200).json({ result: "Joined", msg: "Success" });
                              })
                            })
                          })
                        })
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
                      // var query = {
                      //  _id: eventId,
                      //  subs: {$ne: req.user._id}
                      //   };
                      // let eventInc = await eventModel.updateOne(query, {$inc: {totalSubs: "-1"}})
                      await User.updateOne({_id: req.user._id}, {$pull: {myEvents: eventId}})
                      .then(async() => {
                        await Conversation.updateOne({eventId: eventId}, {$pull: {members: req.user._id}})
                        .then(async()=> {
                          await eventModel.updateOne({_id: eventId}, {$pull: {subs: req.user._id}, $inc: {totalSubs: "-1"}})
                          .then(() => {
                            return res.status(200).json({ result: "UnSubscribed", msg: "Success" });
                          })
                        })
                      })
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
            if(user) {
                  return res.status(200).json({ result: user, msg: "Success" });
            }
      } catch (err) {
        console.log(err)
        return res.status(500).json({ result: err, msg: "Error"});
      }
    }


}


//Add users to Event,
// send Sms who are not User,
// subscribe who are users and send notification,
// Create Group Conversation for Event
async function addUsersToEvent(contacts, eventId, userId, eventName, orgToken) {
  console.log("__________Inside Fumnction____________________")
  try {
    let contactArray = Object.keys(contacts[0])
    let existing = [userId];
    let pvtTokens = [orgToken];
    let count = 0
    await contactArray.forEach( async (contact, index) => {
      let user = await User.findOne({mobileNo: contact})
      if(user === null || !user){
        // Send Sms to Contatct
        count++;
        console.log(`sms send to ${contact}`)
      } else if(user){
        existing.push(user._id)
        pvtTokens.push(user.expoPushToken)
        count++;
        console.log(count, contactArray.length)
        // if(count === contactArray.length){
          let updatedUser = await User.findOneAndUpdate({mobileNo: contact}, {$addToSet: {myEvents: eventId}})
          if(updatedUser) {
           let updatedEvent = await eventModel.updateOne({_id: eventId}, {$addToSet: {subs: updatedUser._id}, $inc: {totalSubs: "+1"}})
           if(updatedEvent && index === contactArray.length - 1) {
             let newConversation = new Conversation({
               name: eventName,
               members: existing,
               type: "Group", // Event Group Conversation
               eventId: eventId
             })
             newConversation.save().then(()=> {
               console.log("Conversation Created.. sending notifn")
               // notify to members Array
               notification(pvtTokens, eventName, "Event Invitaion", eventId, "Event", existing)// title and body can be swap
             })
           }
          }
        // }  
      }
    })
    } catch (err) {
      console.log(err)
      return res.status(500).json({ result: err, msg: "Error"});
    }
  }

  // notify ALl Users
  async function notifyAllUsers(title, body, itemId){
    let users = await User.find({})
    console.log("usersssssssss", users)
    if(users) {
      let tokens = []
      let userIds = []
      await users.forEach((user) => {
        userIds.push(user._id)
        if (user.expoPushToken !== null){
          tokens.push(user.expoPushToken)
        }
      })
      notification(tokens, body, title, itemId, "Event", userIds)// title and body can be swap
    }
  }

  // notify Seleccted User
  async function notifySelectedUser(title, body, users, itemId){ 
    console.log("indsi")
    let tokens = [] 
    let userIds = []
    let loop = await users.forEach( async (user)=> {
      console.log(user)
      let currentUser = await User.findOne({_id: user._id})
        userIds.push(currentUser._id)
        if(currentUser.expoPushToken !== null){
        tokens.push(currentUser.expoPushToken)
      }
    })
    notification(tokens, body, title, itemId, "Event", userIds)// title and body can be swap

  }

  // // Un subscribe EVent And remove user from converation
  // async function unSubEvent(eventId, users) {
  //   let userCount = users.length
  //   console.log(userCount)
  //     await User.updateMany({myEvents: {$in: eventId}}, {$pull: {myEvents: eventId}})
  //     .then(async() => {
  //       await eventModel.updateOne({_id: eventId}, { $pull: { subs: { $in: users } }, $inc: {totalSubs: `-${userCount}`} }, {multi: true})
  //       .then(async ()=> {
  //         await Conversation.updateOne({eventId: eventId}, {$pull: {members: {$in: users}}}, {multi: true})
  //         console.log(`Usub Event with Given users: ${userCount} | Pull USers from Conversation`)
  //         // IMP //
  //         // Chat page should refresh whenever user visit it
  //       })
  //     })
  // }

const eventController = new Event();
module.exports = eventController;