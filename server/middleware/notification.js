const fetch = require("node-fetch");
const Reminder = require("../models/reminder")

module.exports.notification  = function(expoPushTokens, title, body, itemId, schema, userIds) {
    // const expoPushToken ='ExponentPushToken[wxq10DBQLsbmBjr7cuPb5P]'
    console.log(expoPushTokens, title, body)
    const message = {
        to: expoPushTokens,
        sound: 'default',
        title: title,
        body: body,
        data: { someData: 'goes here' },
      };
      setTimeout(async () => {
        await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Accept-encoding': 'gzip, deflate',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
          })
          // Send reminder
          let newReminder = new Reminder({
            itemId,
            msg: {title: title,body: body},
            schema,
            users: userIds
          })
          await newReminder.save((reminder) => {
            console.log("send Reminders")
          })



      }, 3000);

      console.log("send Notifications")
      // res.send("send")
}

    
     

