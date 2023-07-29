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
    const { email, type } = req.query;
    let events;
    const date = new Date();
    date.setDate(date.getDate() - 1);
    try {
        events = await Event.find({eventStatus: 'upcoming' });
        for (var i = 0; i < events.length; i++) {
            var eventDate = events[i].eventDateTime.split('-');
            eventDate = new Date(eventDate[2], eventDate[1] - 1, eventDate[0]);
            if (eventDate < date) {
                await Event.remove({ _id: events[i]._id });
            }
        }
    } catch (e) {
        console.log(e);
        return res.status(500).send(e);
    }
    try {
        if (type === "host") {
            events = await Event.find({ hostEmail: email })
        } else {
            events = await Event.find({ hostEmail: { $ne: email } })
        }
        console.log(events);
        return res.status(200).json({
            message: "fetched events",
            events: {
                upcoming: events.filter(
                    (event) => event.eventStatus === "upcoming"
                ),
                ongoing: events.filter(
                    (event) => event.eventStatus === "ongoing"
                ),
                completed: events.filter(
                    (event) => event.eventStatus === "completed"
                ),
            },
        });
    } catch (e) {
        console.log(e);
        return res.status(500).send(e);
    }
};

//All events of user where user is hosting the event will be fetched by there status and will be represented in the form of cards
// const getEventsByhostEmail = async (req, res) => {
//     const { hostEmail, eventStatus } = req.query;
//     console.log(eventStatus);
//     try {
//         const events = await Event.find({ hostEmail: hostEmail, eventStatus: eventStatus });
//         return res.status(200).json({
//             message: "fetched your events",
//             events,
//         });
//     } catch (e) {
//         console.log(e);
//         return res.status(500).send(e);
//     }
// };

//The event's inforation will be updated by passing the unique id of event
const startEvent = async (req, res) => {
    const { _id } = req.query;
    const { email } = req.query;

    try {
        const startEvent = await Event.findByIdAndUpdate(
            _id, {
            $set: { eventStatus: 'ongoing' },
        }
        );
        if (startEvent) {
            res.status(200).json({
                message: "Event Started",
                startEvent,
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

//After completion of the event user will end the event 
const endEvent = async (req, res) => {
    const { _id } = req.query;
    const { email } = req.query;

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
            User.findOneAndUpdate(user._id, {
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
        const event = await Event.remove({ _id: eventId });
        res.status(200).json({
            message: "Event deleted",
            event: event
        });
    } catch (e) {
        console.log(e);
        return res.status(500).send(e);
    }
}

module.exports = { createEvent, getEventById, getEvents, startEvent, endEvent, deleteEvent };
