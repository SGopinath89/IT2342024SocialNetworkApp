const mongoose = require("mongoose");

const ParticipantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    idNumber: {
        type: String,
        required: true
    },
    contactNumber: {
        type: String,
        required: true
    }
});

const EventSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    eventname: {
        type: String,
        required: true,
    },
    desc: {
        type: String,
        max: 500,
    },
    img: {
        type: String,
    },
    participants: [ParticipantSchema] // Array of participants
}, { timestamps: true });

module.exports = mongoose.model("Event", EventSchema);
