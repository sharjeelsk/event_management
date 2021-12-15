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
      type: String,
      unique: true ,
      require: true,
    },
    country: {
      type: String,
      require: true,
    },
    city: {
      type: String,
      require: true,
    },
    address: {
      type: String,
      default: null
    },
    organisation: {
      type: String,
      default: null
    },
    img: {
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
    bidedEvent: [{
      type: ObjectId, ref: "Event"
    }],
    myApprovals: [{
      name: {
        type: String,
        require: true
      },
      bid: {
        type: ObjectId, ref: "Bid",
        // unique: true
      }
    }],
    contactId: {
      // type: ObjectId, ref: "userContact",
      type: String,
      default: null
    },
    expoPushToken: {
      type: String,
      default: null
    },
    rating: {
      avg: {
        type: Number,
        default: 0
      },
      count: {
        type: Number,
        default: 0
      },
      total: {
        type: Number,
        default: 0
      }

    }


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
