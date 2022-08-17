//  REQUIRING MODULES ---------------------------------------------------------------------------------------------
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
var ObjectId = require("mongodb").ObjectId;
var cors = require("cors");
const port = process.env.PORT || 8000;
const multer = require("multer");
const upload = multer();
const cookieParser = require("cookie-parser");
const path = require('path');
// Middleware Auth ------------------------------------------------------------------------------------------------
const auth = require("./Middleware/auth");
const loginCheck = require("./Middleware/loginCheck");

// Using Mongoose Models ------------------------------------------------------------------------------------------
const UserObj = require("./models/user");
const ProductObj = require("./models/product");
const ImageObj = require("./models/images");

// CREATING SERVER -------------------------------------------------------------------------------------------------
var app = express();
app.use(cookieParser());

//  USING MODULES --------------------------------------------------------------------------------------------------
app.use(express.static("public"));
app.use(cors());
app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: false,
    })
);

// CONNECTING SERVER TO MONGODB DATABASE ----------------------------------------------------------------------------
mongoose.connect("mongodb://127.0.0.1:27017/ECommerce");
var db = mongoose.connection;

db.on("error", console.log.bind(console, "Connection Error"));
db.once("open", () => {
    console.log("Connection Successful");
});

// ROUTES HERE -------------------------------------------------------------------------------------------------------

app.use(express.static(path.join(__dirname, 'public')));



//  2. Login Route
app.post("/login", async (req, res) => {
    try {
        const user = await UserObj.findByCredentials(
            req.body.Email,
            req.body.Password
        );
        const token = await user.generateAuthToken();
        res.cookie("jwt", token);
        return res.send({ message: "Login OK" })
        // res.redirect("/home");
    } catch (e) {
        // res.send("Invalid Credentials");
        return res.send({ status: 401, error: "Unauthorized response " })
    }
});

//  3. SignUp Route
app.post("/signUp", (req, res) => {
    // console.log("req.body is: "+ JSON.stringify(req.body));

    // Saving data with Mongoose Model
    const user = new UserObj({
        Fname: req.body.first_name,
        Lname: req.body.last_name,
        Email: req.body.Email,
        Password: req.body.Password,
        Phone: req.body.Phone,
        City: req.body.City,
        Country: req.body.Country,
        Address: req.body.Address,
        ImageURL:
            "https://api.multiavatar.com/" +
            Math.floor(Math.random() * 1000000) +
            ".svg",
        ImageData: 0,
    });

    user
        .save()
        .then(() => {
            // console.log(user);
            res.send({ status: 200, message: "OK! SignUp Successful" })
        })
        .catch((e) => {
            console.log(e);
            res.send(e);
        });
});

//  4. Get Profile Route
app.get("/getProfile", auth, async (req, res) => {
    res.set({
        "Access-Control-Allow-Origin": "*",
    });

    res.send(req.user)
});

//  6. Check Admin
app.get("/checkAdmin", auth, async (req, res) => {
    if (req.user.Email == "admin007@gmail.com" && req.user.Password == "iamadmin007") {
        res.send({ status: "admin" })
    }
    else {
        res.send({ status: "notAdmin" })
    }
})

//  5. Get Profile Image
app.get("/getProfileImage", auth, async (req, res) => {
    res.set({
        "Access-Control-Allow-Origin": "*",
    });
    res.set("Content-Type", "image/jpg");

    res.send(req.user.ImageData)
});

//  6. Upload Image
app.post('/uploadImage', auth, upload.single("image"), async (req, res) => {

    try {
        var image = req.file.buffer;
        if (image) {
            req.user.ImageURL = '';
            req.user.ImageData = image;
        };
        req.user.save()
        res.redirect('/profile')
    } catch (error) {
        res.send('error: please! upload Image')
    }

})

//  5. Update User Details Route
app.post("/updateDetails", auth, async (req, res) => {
    res.set({
        "Access-Control-Allow-Origin": "*",
    });
    try {
        var fName = req.body.first_name;
        var lName = req.body.last_name;
        var email = req.body.Email;
        var password = req.body.Password;
        var phone = req.body.Phone;
        var city = req.body.city;
        var country = req.body.country;
        var address = req.body.address;

        if (fName) req.user.Fname = fName;
        if (lName) req.user.Lname = lName;
        if (email) req.user.Email = email;
        if (password) req.user.Password = password;
        if (phone) req.user.Phone = phone;
        if (city) req.user.City = city;
        if (country) req.user.Country = country;
        if (address) req.user.Address = address;


        req.user.save()

        res.redirect('/profile')
    } catch (error) {
        res.send('error: something went wrong!')
    }

});

//  6. Save Image Route
app.post("/saveImage", auth, (req, res) => {
    var myImageURL = req.body.image;
    req.user.ImageURL = myImageURL;
    req.user.save()

    res.send({ status: 200 })
});

//  7. Add Products Route
app.post("/addProduct", upload.single("image"), (req, res) => {
    try {
        const id = new ObjectId();

        const products = new ProductObj({
            Product: req.body.product,
            Category: req.body.category,
            Brand: req.body.brand,
            Stock: req.body.stock,
            Price: req.body.price,
            Ratings: req.body.ratings,
            Tags: req.body.tags.split(","),
            Offers: req.body.offers,
            ImageID: id,
            Desc: req.body.desc,
        });

        console.log("product Added!");

        const imageData = new ImageObj({
            id,
            Image: req.file.buffer,
        });

        imageData.save();

        console.log("Image Added!");

        products
            .save()
            .then(() => {
                res.send("product Added!");
            })
            .catch((e) => {
                res.send(e);
            });
    } catch (error) {
        res.send('error: Add image!')
    }
});

//  8. Get Image Route
app.get("/add/:id/image", async (req, res) => {
    const id = req.params.id;
    // console.log(id);
    const product = await ImageObj.findOne({ id });
    // console.log("getting Image");
    res.set("Content-Type", "image/jpg");
    // console.log(product);
    res.send(product.Image);
});

//  9. Get Products Route
app.get("/get", async (req, res) => {
    res.set({
        "Access-Control-Allow-Origin": "*",
    });
    const products = await ProductObj.getAllproducts();
    // console.log("getting products");
    res.json(products);
});

//  10. Search Products Route
app.get("/SearchProducts", async (req, res) => {
    res.set({
        "Access-Control-Allow-Origin": "*",
    });

    //  Getting the data after 'item=' in the URL by using req.query
    //  req.query.item will give us the value of 'item' in the URL

    if (!req.query.item == '') {
        console.log(req.query.item.toLowerCase());

        //  Getting products related to any specific category
        if (req.query.item == "electronics" || req.query.item == "study" || req.query.item == "fashion" || req.query.item == "kitchen" || req.query.item == "beauty" || req.query.item == "sports" || req.query.item == "toys" || req.query.item == "home" ) {
            //  Just send all products. We will filter them in the bakend
            const products = await ProductObj.getAllproducts();
            console.log("getting all products");
            res.json(products);
        }

        //  Getting a searched product
        else{
            const products = await ProductObj.getProduct(
                req.query.item.toLowerCase().split(" ")
            );
            // console.log("getting products");
            res.json(products);
        }
        
    } else {
        res.redirect('/');
    }
});

//  10. Get Particular Product
app.get("/selected/:data", async (req, res) => {
    var myData = req.params.data;
    console.log("myData is: " + myData);

    const product = await ProductObj.findOne({ _id: ObjectId(myData) });
    var productCategory = product.Category;

    db.collection("products")
        .find({ Category: productCategory })
        .toArray((req, result) => {
            // console.log("result is: "+ result);
            res.send(result);
        });

});

//  11. Add To Cart
app.post("/AddToCart", auth, (req, res) => {
    const myProductID = req.body.productID;
    const price = req.body.itemPrice
    console.log("product ID: " + myProductID);

    //  Getting the object corresponding to the product ID (if it is available)
    var object
    req.user.Cart.forEach((cartItem) => {
        // console.log("cartItem.productID is: "+ cartItem.productID);
        if (cartItem.productID === myProductID) {
            object = cartItem
        }
    })
    const index = req.user.Cart.indexOf(object)

    // If the item is present in the Cart
    if (index != -1) {
        req.user.Cart[index].Quantity++;

    }
    else {
        console.log(req.user.Cart)
        req.user.Cart = req.user.Cart.concat({ productID: myProductID, Quantity: 1, Price: price });
    }

    req.user.save();
    res.send({ status: 200, message: "Added to cart!" });
});

//  11. Remove one item from cart
app.post("/removeOneFromCart", auth, (req, res) => {
    const myProductID = req.body.productID;
    const price = req.body.itemPrice
    console.log("product ID: " + myProductID);

    //  Getting the object corresponding to the product ID (if it is available)
    var object
    req.user.Cart.forEach((cartItem) => {
        // console.log("cartItem.productID is: "+ cartItem.productID);
        if (cartItem.productID === myProductID) {
            object = cartItem
        }
    })
    const index = req.user.Cart.indexOf(object)

    // If the item is present in the Cart
    if (index != -1) {

        if (req.user.Cart[index].Quantity == 1) {
            //  Remove the item from the cart
            req.user.Cart = req.user.Cart.filter((cartItem) => {
                // console.log("cartItem.productID is: "+ cartItem.productID);
                return cartItem.productID != myProductID
            })
        }

        else {
            req.user.Cart[index].Quantity--;
        }
    }
    else {
        req.user.Cart = req.user.Cart.concat({ productID: myProductID, Quantity: 1, Price: price });
    }

    req.user.save();
    res.send({ status: 200, message: "Removed one item from cart!" });
});

//  12. Clear Cart
app.get("/clearCart", auth, (req, res) => {
    req.user.Cart = []
    req.user.save();

    res.send(req.user.Cart)
})

//  12. Get Cart Data
app.get("/cartData", auth, (req, res) => {
    res.send(req.user.Cart);
});

//  13. Get Particular Product in cart
app.get("/getProduct/:data", async (req, res) => {
    var myData = req.params.data;
    // console.log("myData is: " + myData);

    const product = await ProductObj.findOne({ _id: ObjectId(myData) });
    res.json(product);
});

//  14. Remove Product Route
app.post("/removeProduct", auth, async (req, res) => {
    const productID = req.body.product
    // console.log("Product ID is: "+ productID);

    req.user.Cart = req.user.Cart.filter((cartItem) => {
        // console.log("cartItem.productID is: "+ cartItem.productID);
        return cartItem.productID != productID

    })
    await req.user.save()
    // console.log("cart Product after removal is: "+ req.user.Cart);
    res.redirect("/cart")
})

//  14. Logout Route
app.post("/logout", auth, async (req, res) => {
    req.user.tokens = req.user.tokens.filter(
        (token) => token.token != req.cookies.jwt
    );
    await req.user.save();
    res.clearCookie("jwt");
    res.redirect("/");
});


//  15. Total Price
app.get('/total', auth, (req, res) => {
    var total = 0

    req.user.Cart.forEach((item) => {
        total += item.Quantity * item.Price
    })

    res.send(total.toString())
})

//  16. Status Route
app.get("/status", loginCheck, (req, res) => {
    res.send({ status: req.status, fname: req.fname })
});

app.get('/allProducts',async (req,res)=>{
    const product = await ProductObj.getAllproducts()
    res.json(product)
})


app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });

// ROUTES ENDS HERE ---------------------------------------------------------------------------------------------------

app.listen(port);
console.log("Server Listening on port: " + port);