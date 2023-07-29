const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
    hostEmail: {
        type: mongoose.Schema.Types.String,
        // ref: "Users",
        required: true,
    },
    eventName: {
        type: mongoose.Schema.Types.String,
        required: true,
    },
    category: {
        type: mongoose.Schema.Types.String,
        required: true,
    },
    address: {
        type: mongoose.Schema.Types.String,
        required: true,
    },
    isFree: {
        type: mongoose.Schema.Types.String,
        required: true
    },
    eventDateTime: {
        type: mongoose.Schema.Types.String,
        required: true
    },
    eventStatus: {
        type: mongoose.Schema.Types.String,
        enum: ['upcoming', 'ongoing', 'completed'],
        required: true
    },
    eventPhoto: {
        type: mongoose.Schema.Types.String,
        required: true
    },
    eventDescription: {
        type: mongoose.Schema.Types.String,
        required: true
    },
});

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;
