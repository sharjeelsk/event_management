// const Conversation = require("../models/conversation");
const reminderSchema= require("../models/reminder");
const User = require("../models/user");

const jwt = require("jsonwebtoken");

class Reminder {

    async getAllReminder(req, res) {
        try {
            await reminderSchema.find()
            // .populate([{
            //   path: "users",
            //   model: "User",
            // }])
            .sort({ _id: -1 })
            .then((reminder) => {
                console.log(reminder)
                return res.status(200).json({ result: reminder, msg: "Success"});
            })
          } catch (err) {
            console.log(err)
            return res.status(500).json({ result: err, msg: "Error"});
          }
    }

    async getUserReminder(req, res) {
      try {
          await reminderSchema.find({users: {$in: req.user._id}})
          .sort({ _id: -1 })
          .then((reminders) => {
              console.log(reminders)
              return res.status(200).json({ result: reminders, msg: "Success"});
          })
        } catch (err) {
          console.log(err)
          return res.status(500).json({ result: err, msg: "Error"});
        }
  }

  async deleteReminder(req, res) {
    try {
      let {reminderId} = req.body;
      if(!reminderId){
        return res.status(500).json({ result: "Data Missing", msg: "Success"});
      } else {
        await reminderSchema.updateOne({_id: reminderId}, {$pull: {users: req.user._id}})
        .then((reminders) => {
            console.log(reminders)
            return res.status(200).json({ result: "Deleted", msg: "Success"});
        })
        }
      } catch (err) {
        console.log(err)
        return res.status(500).json({ result: err, msg: "Error"});
      }
}

  
}

const reminderController = new Reminder();
module.exports = reminderController;