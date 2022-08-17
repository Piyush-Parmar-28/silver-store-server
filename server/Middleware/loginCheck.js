const jwt = require('jsonwebtoken')
const User = require('../models/user')

const loginCheck = async (req, res, next) => {
    try {
        const token = req.cookies.jwt
        const decoded = jwt.verify(token, 'silver')
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })

        if (!user) {
            req.status = false
            next()
        }

        req.status = true
        req.fname = user.Fname
        next()
    } catch (e) {
        req.status = false
        next()
    }
}

module.exports = loginCheck