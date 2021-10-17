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
        type: String
    }
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", MessageSchema);
module.exports = Message;