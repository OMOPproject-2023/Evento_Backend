const Event = require("../models/event");
const User = require("../models/user");
//The request body will contain the following key-value pair we will destructure it and will create the new event
const createEvent = async (req, res) => {
    const {
        eventName,
        category,
        address,
        hostEmail,
        isFree,
        eventDateTime,
        eventStatus,
        eventPhoto,
        eventDescription
    } = req.body;
    try {
        const event = await Event.create({
            hostEmail,
            eventName,
            category,
            address,
            isFree,
            eventDateTime,
            eventStatus,
            eventPhoto,
            eventDescription
        });
        console.log(event);
        return res.status(200).json({
            message: "Event added Successfully",
            event,
        });
    } catch (e) {
        return res.status(500).send(e);
    }
}

//Event page will be fetched by there unique id provided by mongoDb
const getEventById = async (req, res) => {
    const { eventId } = req.query;
    console.log(eventId);
    try {
        const eventDetails = await Event.findById({ _id: eventId });
        return res.status(200).json({
            message: "fetched event Details",
            eventDetails,
        });
    } catch (e) {
        console.log(e);
        return res.status(500).send(e);
    }
};

//All events will be fetched by there status and will be represented in the form of cards
const getEvents = async (req, res) => {
    const { eventStatus } = req.query;
    console.log(eventStatus);
    try {
        const events = await Event.find({ eventStatus: eventStatus });
        return res.status(200).json({
            message: "fetched events",
            events,
        });
    } catch (e) {
        console.log(e);
        return res.status(500).send(e);
    }
};

//All events of user where user is hosting the event will be fetched by there status and will be represented in the form of cards
const getEventsByhostEmail = async (req, res) => {
    const { hostEmail, eventStatus } = req.query;
    console.log(eventStatus);
    try {
        const events = await Event.find({ hostEmail: hostEmail, eventStatus: eventStatus });
        return res.status(200).json({
            message: "fetched your events",
            events,
        });
    } catch (e) {
        console.log(e);
        return res.status(500).send(e);
    }
};

//The event's inforation will be updated by passing the unique id of event
const updateEvent = async (req, res) => {
    const { _id } = req.query;
    const event = req.body;
    try {
        const updatedEvent = await Event.findByIdAndUpdate(
            _id,
            event
        );
        console.log(_id);
        if (updatedEvent) {
            console.log(updatedEvent);
            res.status(200).json({
                message: "Event updated successfully",
                updatedEvent,
            });
        } else {
            res.status(400).json({
                message: "Event not found",
            });
        }
    } catch (e) {
        console.log(e);
        return res.status(500).send(e);
    }
}

//After completion of the event user will end the event 
const endEvent = async (req, res) => {
    const { _id } = req.query;
    const { email } = req.query;
    console.log(email);
    try {
        const endEvent = await Event.findByIdAndUpdate(
            _id, {
            $set: { eventStatus: 'completed' },
        }
        );
        if (endEvent) {
            const user = await User.findOne({ email: email });
            var total = parseInt(user.totalEvents);
            total++;
            User.findOneAndUpdate(email, {
                $set: { totalEvents: total.toString() }
            }).then(() => {
                res.status(200).json({
                    message: "Event Finished",
                    endEvent,
                });
            })
        } else {
            res.status(400).json({
                message: "Event Not Found",
            });
        }

    } catch (e) {
        console.log(e);
        return res.status(500).send(e);
    }
}

//The user can cancel the event/delete the event only upcoming events can be deleted
const deleteEvent = async (req, res) => {
    const { eventId } = req.query;
    try {
        await Event.deleteOne({ id: eventId });
        res.status(200).json({
            message: "Event deleted",
        });
    } catch (e) {
        console.log(e);
        return res.status(500).send(e);
    }
}

module.exports = { createEvent, getEventById, getEvents, getEventsByhostEmail, updateEvent, endEvent, deleteEvent };
