const mongoose = require('mongoose');

const stateSchema = new mongoose.Schema({
    stateCode: { type: String, required: true, unique: true },
    funfacts: [String]
});

const States = mongoose.model('States', stateSchema);

module.exports = States;