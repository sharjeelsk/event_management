const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      // required: true,
    },
    email: {
      type: String,
      trim: true,
      // index: { unique: true },
      match: /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/,
    },
    mobileNo: {
      type: Number,
      unique: true ,
      require: true,
      // match: /^([+][9][1]|[9][1]|[0]){0,1}([7-9]{1})([0-9]{9})$/
    },
    address: {
      type: String,
      default: null
    },
    organisation: {
      type: String,
      default: null
    },
    myServices: [{
      type: ObjectId, ref: "Service"
    }],
    myEvents: [{
      type: ObjectId, ref: "Event"
    }],
    myBids: [{
      type: ObjectId, ref: "Bid"
    }],

  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
module.exports = User;

    // address: {
    //   name: {
    //       type: String,
    //       required: true,
    //       },
    //   type: {
    //       type: String, 
    //       enum: ['Point'],
    //       required: true
    //       },
    //   coordinates: {
    //       type: [Number],
    //       required: true
    //       }
    //   },
