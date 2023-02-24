import mongoose from 'mongoose'
const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: '',
    },
});
const Category = mongoose.model('Category', schema)
export default Category