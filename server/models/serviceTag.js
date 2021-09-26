const mongoose = require("mongoose");
// const { ObjectId } = mongoose.Schema.Types;

const serviceTagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
    },
    type: {
      type: String,
      require: true,
    },
    subType: {
      type: String,
      require: true,
    },
  },
  { timestamps: true }
);

const ServiceTag = mongoose.model("ServiceTag", serviceTagSchema);
module.exports = ServiceTag;
