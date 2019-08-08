const mongoose = require("mongoose");
const url_mongo = "mongodb+srv://EiichiMS:chorrillo@eiichim-ossme.mongodb.net/test?retryWrites=true&w=majority";
mongoose.connect(url_mongo, { useNewUrlParser: true }, (err) => {
    !err
        ? console.log("Succesfully connected to MongoDB")
        : console.log("Shit")
});
const Schema = mongoose.Schema;
const storeShema = new Schema({
    store_name: String,
    direction: String,
    products: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product"
    }]
})
const productShema = new Schema({
    name: String,
    price: Number,
    stock: Number
}, { timestamps:true})
const Product= mongoose.model("Product",productShema)
const Store=mongoose.model("Store",storeShema)
module.exports={Product,Store}

