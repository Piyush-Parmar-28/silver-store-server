const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    Product: {
        type: String,
    },
    Category: {
        type: String,
    },
    Brand: {
        type: String,
    },
    Price: {
        type: Number,
    },
    Stock: {
        type: Number,
    },
    Ratings: {
        type: Number,
    },
    Offers: {
        type: Number,
    },
    Tags: {
        type: [String],
    },
    ImageID: {
        type: String,
    },
    Desc: {
        type: String,
    },
});

productSchema.statics.getAllproducts = async () => {
    const products = await ProductObj.find();
    return products;
};
productSchema.statics.getProduct = async (item) => {
    console.log(item);
    const products = await ProductObj.find();
    const items = products.filter((data) => {
        for (let val of item) {
            if (!data.Tags.includes(val)) return false;
        }
        return true;
    });
    return items;
};

//  Creating collection named 'Product' (Mongoose will automatically append 's' to the collection name & hence make it 'Products')
//  Creating object of 'Product' collection named 'ProductObj'
const ProductObj = mongoose.model("Product", productSchema);

module.exports = ProductObj;
