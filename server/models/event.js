const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const eventSchema = new mongoose.Schema(
    {
            organiserId: {
                type: ObjectId, ref: "User",
                required: true
            },
            mobileNo: {
                type: Number,
                required: true,
            },
            email: {
                type: String,
                trim: true,
                match: /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/,
                required: true,
              },
            address: {
                type: String,
                required: true,
            },
        name: { 
            type: String,
            required: true,
            },
        description: {
            type: String,
            required: true,
            },
        type: {
            type: String,
            enum: [
                "Private",
                "Public",
              ],
              require: true,
            },
        location: {
            // name: {
            //     type: String,
            //     required: true,
            //     },
            type: {
                type: String, 
                enum: ['Point'],
                required: true
                },
            coordinates: {
                type: [Number],
                required: true
                }
            },
        status: {
            type: String,
            enum: ['Active', "InActive"],
            require: true
            },
        start: {
            type: Date,
            require: true
            },
        end: {
            type: Date,
            require: true
            },
        reqServices: [],
        totalBids: {
            type: Number,
            require: true,
            default: 0
        },
        bids: [{
            type: ObjectId, ref: "Bid",
            }],
        totalSubs: {
            type: Number,
            require: true,
            default: 0
        },
        subs: [{
            //Embed neccessary info
            type: ObjectId, ref: "User"
            }],
        },
    { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);
module.exports = Event;
