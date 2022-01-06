const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const serviceSchema = new mongoose.Schema(
  {
    categoryId: {
      type: ObjectId, ref: "Category",
      required: true
    },
    category: {
      type: String,
      required: true
    },
    user: {
      type: ObjectId, ref: "User",
      required: true
    },
    subCategory: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      // required: true
    },
    price: {
      type: Number,
      required: true
    }
  },
  { timestamps: true }
);

const Service = mongoose.model("Service", serviceSchema);
module.exports = Service;

// categoryId, categoryName, subCategoryName, quantity, price