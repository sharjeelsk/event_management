const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const eventFromSchema = new mongoose.Schema(
  {
    event: {
        type: ObjectId, ref: "Event",
        required: true
    },
    formData: []
  },
  { timestamps: true }
);

const EventForm = mongoose.model("EventForm", eventFromSchema);
module.exports = EventForm;