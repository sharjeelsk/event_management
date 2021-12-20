const Form = require("../models/eventForm");
const Event = require("../models/event");
const User = require("../models/user");
const jwt = require("jsonwebtoken");


class eventForm {


    async getEventForm(req, res) {
        try {
            let { eventId } = req.body;
            if(!eventId) {
                return res.status(500).json({ result: "Data Missing", msg: "Error"});
            } else {
                let event = await Event.findOne({_id: eventId})
                if(event){
                    return res.status(200).json({ result: event.form, msg: "Success"});
                }
            }
          } catch (err) {
            console.log(err)
            return res.status(500).json({ result: err, msg: "Error"});
          }
    }


    async postEventForm(req, res) {
        try {
            let { eventId, formData } = req.body;
            if(!eventId || !formData) {
                return res.status(500).json({ result: "Data Missing", msg: "Error"});
            } else {
                    let newForm = {
                        event: eventId,
                        formData
                    }

                        await Event.updateOne({_id: eventId},{$set:{form: newForm}})
                        .then(()=>{
                            console.log(newForm)
                        return res.status(200).json({ result: newForm, msg: "Success"});
                        })
                        
                    
                }
          } catch (err) {
            console.log(err)
            return res.status(500).json({ result: err, msg: "Error"});
          }
    }

    async updateEventForm(req, res) {
        try {
            let { eventId, formData } = req.body;
            if(!eventId || !formData) {
                return res.status(500).json({ result: "Data Missing", msg: "Error"});
            } else {
                    let newForm = new Form ({
                        event: eventId,
                        formData
                    })
                    newForm.save()
                    .then((savedForm) => {
                        console.log(savedForm)
                        return res.status(200).json({ result: savedForm, msg: "Success"});
                    })
                }
          } catch (err) {
            console.log(err)
            return res.status(500).json({ result: err, msg: "Error"});
          }
    }

    async eventFeedbacks(req, res) {
        try {
            let { eventId } = req.body;
            if(!eventId) {
                return res.status(500).json({ result: "Data Missing", msg: "Error"});
            } else {
                let feedbacks = await Form.find({event: eventId})
                if(feedbacks){
                    console.log(feedbacks)
                    return res.status(200).json({ result: feedbacks, msg: "Success"});
                }
            }
          } catch (err) {
            console.log(err)
            return res.status(500).json({ result: err, msg: "Error"});
          }
    }

    async submitForm(req, res) {
        try {
            let { eventId, formData } = req.body;
            if(!eventId || !formData) {
                return res.status(500).json({ result: "Data Missing", msg: "Error"});
            } else {
                let newForm = new Form ({
                    event: eventId,
                    formData
                })
                newForm.save()
                .then((savedForm) => {
                    console.log(savedForm)
                    return res.status(200).json({ result: savedForm, msg: "Success"});
                })
            }
          } catch (err) {
            console.log(err)
            return res.status(500).json({ result: err, msg: "Error"});
          }
    }
}

const eventFormController = new eventForm();
module.exports = eventFormController;
