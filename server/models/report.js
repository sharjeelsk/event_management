const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const reportSchema = new mongoose.Schema(
  {
    createdBy: {
        type: ObjectId, ref: "User",
    },
    collectionName: {
        type: String,
        enum: [
            "Event",
            "Bid",
            "User"
          ],
          require: true,
        },
    itemId: {
        type: String
    },
    status: {
      type: "string",
      default: "None"
    },
    reason: {
        type: String
    }
  },
  { timestamps: true }
);

const Report = mongoose.model("Report", reportSchema);
module.exports = Report;