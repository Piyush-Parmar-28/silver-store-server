const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({

    Email: {
        type: String,
    },
    Password: {
        type: String
    },
    Fname: {
        type: String
    },
    Lname: {
        type: String
    },
    Phone: {
        type: String
    },
    City: {
        type: String
    },
    Country: {
        type: String
    },
    Cart: [
        {
           productID:{
            type: String,
            required: true
           },
           Quantity: {
            type: Number
           },
           Price:{
            type:Number
           } 
        }
    ] ,
    Address: {
        type: String
    },
    ImageURL: {
        type: String
    },
    ImageData:{
        type: Buffer
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]

})

userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, 'silver')
    
    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token
}

userSchema.statics.findByCredentials = async (Email, Password) => {
    const user = await UserObj.findOne({ Email })

    if (!user) {
        throw new Error('Invalid Credentials!')
    }

    if (Password === user.Password) {
        return user
    } else {
        throw new Error('Incorrect Password!')
    }
}


//  Creating a collection named 'User' (Mongoose will automatically append 's' to the collection name & hence make it 'Users')
//  Creating object of 'User' collection named 'UserObj'  
const UserObj = mongoose.model('User', userSchema)

module.exports = UserObj