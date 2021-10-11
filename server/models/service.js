const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
        vendorId: {
            type: ObjectId, ref: "User",
            required: true
        },
        // mobileNo: {
        //     type: Number,
        //     // required: true,
        // },
        // email: {
        //     type: String,
        //     trim: true, 
        //     match: /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/,
        //     // required: true,
        //   },
        // address: {
        //     type: String,
        //     // required: true,
        // },
    // type: {
    //   type: String,
    //   require: true,
    // },
    subType: {
      type: String,
      require: true,
    },
    price:{
      type: Number,
      require: true,
    },
    // description: {
    //   type: String,
    //   required: true,
    //  },
        quantity: {
      type: Number,
      required: true,
     },
  },
  { timestamps: true }
);

const Service = mongoose.model("Service", serviceSchema);
module.exports = Service;

    // price: {
    //     value: {
    //         type: Number,
    //         required: true
    //     },
    //     currency: {
    //         type: String
    //     },
    //     discountType: {
    //         type: String,
    //         enum: ["FLAT", "PERCENT", "NONE"],
    //         required: true
    //     },
    //     discountedValue: {
    //         type: Number,
    //         required: true
    //     }
    // },
