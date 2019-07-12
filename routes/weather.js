const express = require('express');
const router = express.Router();
const apiKey = 'b444c5202cf36bd44e029465dc5e2f76';
const request = require('request');

const q = 'http://api.openweathermap.org/data/2.5/'

router.get('/', (req, res) => {    

    let location = req.query.location;
    let when = req.query.when;

    let payload = {};
    payload.replies = [];
    payload.conversation = {};
    payload.conversation.memory = {
        "location": location,
        "when": when
    }

    // console.log(location + when);


    if (location && when.toUpperCase() === "CURRENT") {

        console.log("\nFirst If");

        // request(q + 'weather?q=' + location + '&APPID=' + apiKey + '&units=metric', { json: true }, (err,result, body) => {
        //     if (err) {
        //         return console.log(err);
        //     } else if(body){

        //         console.log(body)
        //         let replyTemperature = {
        //             "type": "text",
        //             "content": "Temperature is " + body.main.temp
        //         }

        //         payload.replies.push(replyTemperature);

        //         res.send({
        //             payload
        //         });
        //     }
        // });

    }else if(location && when.toUpperCase() === "TOMORROW"){
        console.log("\nSecond If");
        request(q + 'forecast?q=' + location + '&APPID=' + apiKey + '&units=metric&cnt=6', { json: true }, (err,result, body) => {
            if (err) {
                return console.log(err);
            } else if(body){
                console.log(body)

                let replyTemperature = {
                    "type": "text",
                    "content": "Temperature is " + body.list[4].main.temp
                }

                payload.replies.push(replyTemperature);

                res.send({
                    payload
                });
            }
        });
    }





});

module.exports = router;