const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const ConversationSchema = new mongoose.Schema(
  {
    name: [],
    members: {
        type: Array,
        require: true
    },
    type: {
      type: String,
      enum: ["Single", "Group"],
      require: true
    },
    eventId: {
      type: ObjectId, ref: "Event"
    }
  },
  { timestamps: true }
);

const Conversation = mongoose.model("Conversation", ConversationSchema);
module.exports = Conversation;