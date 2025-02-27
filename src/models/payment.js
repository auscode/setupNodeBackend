const mongoose = require('mongoose');
const { Schema } = mongoose;


const paymentSchema = new Schema({

    proposalId:{
        // type: Schema.Types.ObjectId,
        // ref: 'Proposal',
        type:String,
        required: true
    },
    freelancerId:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    amount:{
        type:Number,
        required:true
    },
    status:{
        type:String,
        enum:['Pending','Approved','Rejected'],
        default:'Pending'
    }

  
}, { timestamps: true });

module.exports = mongoose.model('Payments', paymentSchema);
