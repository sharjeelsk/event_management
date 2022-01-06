const mongoose = require("mongoose");
const TrustedComms = require("twilio/lib/rest/preview/TrustedComms");
const { ObjectId } = mongoose.Schema.Types;

const bidSchema = new mongoose.Schema(
  {
   eventId: {type: ObjectId, ref: "Event"},
   userId: {type: ObjectId, ref: "user"},
   services: [],
    totalPrice: {
        type: Number,
        required: true
        },
    description: {
        type: String,
        required: true
        },
    // currency: {
    //     type: String
    //     },
    // discountType: {
    //     type: String,
    //     enum: ["FLAT", "PERCENT", "NONE"],
    //     required: true
    //     },
    // discountValue: {
    //     type: Number,
    //     required: true
    //     },
    //  discountedPrice: {
    //     type: Number,
    //     required: true
    //     },
    status: {
        type: String,
        enum: ["Pending", "Approved"],
        default: "Pending",
        required: true
        },
    cancel: {
        organiser: {
            value: {
                type: Boolean,
                default: false
            },
            date: Date
        },
        vendor: {
            value: {
                type: Boolean,
                default: false
            },
            date: Date
        }
    },
    rating: {
        type: Boolean,
        default: false
    }
  },
  { timestamps: true }
);


const Bid = mongoose.model("Bid", bidSchema);
module.exports = Bid;
