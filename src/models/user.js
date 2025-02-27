const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const ConnectionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status:{
        type:String,
        enum:['accepted','failed','pending']
    }
}, {
    timestamps: true
});

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    isClient: {
        type: Boolean,
        default: true,
    },
    connections: [ConnectionSchema],
    resetPasswordOTP: String, 
    resetPasswordExpires: Date, 
    isAdmin: {
        type: Boolean,
        default: false
    },
    profileImg:{
        type: String,
    },
    phoneNumber:{
        type: String
    }
},{timestamps:true});

// Hash password before saving user
// userSchema.pre('save', async function (next) {
//     if (this.isModified('password')) {
//         this.password = await bcrypt.hash(this.password, 10);
//     }
//     next();
// });

const User = mongoose.model('User', userSchema);

module.exports = User;