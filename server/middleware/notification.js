const fetch = require("node-fetch");

module.exports.notification  = function(expoPushTokens, title, body) {
    // const expoPushToken ='ExponentPushToken[wxq10DBQLsbmBjr7cuPb5P]'
    console.log(expoPushTokens, title, body)
    const message = {
        to: "ExponentPushToken[k5U0xyEqSJHIBuICc1dV27]",
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
          });
      }, 3000);

      console.log("send Notifications")
      // res.send("send")
}

    
     

