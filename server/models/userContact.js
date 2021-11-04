const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const userContactSchema = new mongoose.Schema(
  {
    userId: {
      type: ObjectId, ref: "User",
      required: true
    },
    groups: [{ 
        groupName: {
          type: String,
          require: true
        },
        list: []
      }]
    },
  { timestamps: true }
);

const userContact = mongoose.model("userContact", userContactSchema);
module.exports = userContact;