import mongoose from "mongoose";

const schema = new mongoose.Schema({
  users: {
    type: Number,
    default: 0,
  },

//subscripton wala part future me krenge
//   subscription: {
//     type: Number,
//     default: 0,
//   },

  views: {
    type: Number,
    default: 0,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Stats = mongoose.model("Stats", schema);