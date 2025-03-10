import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, "Product name is required."]

    },
    description:{
        type: String,
        required: true
    },
    price:{
        type: Number,
        min: 0,
        required: [true, "Price must be include."]
    },
    image:{
        type: String,
        required: [true, "Image is required"]
    },
    category:{
        type: String,
        required: true
    },
    isFeatured:{
        type: Boolean,
        default: false
    }
}, {timestamps: true})

const Product = mongoose.model("Prodcut", productSchema)
export default Product