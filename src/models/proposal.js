const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project', // Reference to the User Project schema
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the User schema
        required: true,
    },
    proposalTitle: {
        type: String,
    },
    proposalDescription: {
        type: String,
    },
    estimatedTime: {
        type: Number,
    },
    proposedBudget: {
        type: mongoose.Types.Decimal128,
    },
    status: {
        type: String,
        enum: ['Submitted', 'Reviewed', 'Accepted', 'Rejected'],
        default: 'Submitted'
    },
    address:{
        type: String,
    },
    proposalImage:{
        type:[String],
        required:false
    },
},{timestamps:true});

module.exports = mongoose.model('Proposal', proposalSchema)