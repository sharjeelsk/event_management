const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const reminderSchema = new mongoose.Schema(
  {
    itemId: {
        type: ObjectId
    },
    msg: {
        title: {
            type: String,
            require: true
        },
        body: {
            type: String,
            require: true
        }
    },
    schema: {
        type: String,
        enum: ['Event', "Bid", "Over"],
        require: true
    },
    users: [{type: ObjectId, ref: "User"}]
  },
  { timestamps: true }
);


const Reminder = mongoose.model("Reminder", reminderSchema);
module.exports = Reminder;