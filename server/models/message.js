const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const MessageSchema = new mongoose.Schema(
  {
    conversationId: {
        type: ObjectId, ref: "Conversation",
    },
    sender: {
        type: ObjectId, ref: "User",
    },
    text: {
        type: String,
        require: true
    },
    // seen: {
    //   type: String
    // },
    seenBy: [{
      type: ObjectId, ref: "User",
      default: Array
  }]
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", MessageSchema);
module.exports = Message;