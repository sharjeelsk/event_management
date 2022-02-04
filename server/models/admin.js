const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const adminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
        type: String,
        required: true,
    }
  },
  { timestamps: true }
);

const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;