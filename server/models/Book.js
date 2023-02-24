import mongoose from "mongoose"

const Schema = mongoose.Schema;

const bookSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  publisher: {
    type: String,
    required: true,
  },
  typeId: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  available: {
    type: Boolean,
  },
  image: {
    type: String,
    required: true,
  },
  star: {
    type: Number,
    default: 0
  },
  numOfReviews: {
    type: Number,
    default: 0
  }
},
{
  timestamps: true,
});

const Book = mongoose.model("Book", bookSchema);
export default Book