const express = require('express');
const router = express.Router();
const request = require('request');

router.post('/getTasks', (req, res) => {

    let sendToCai = {
        "replies": [],
        "conversation": {
            "language": "en"
        }
    };
    
    let reply = {
        "outputSpeech": "SSML",
        "type": "text",
        "content": ""
    };
    

    request.get('https://p2001172697trial-trial.apim1.hanatrial.ondemand.com:443/p2001172697trial/Workflow_approval/TaskCollection?sap-client=400&$format=json&$filter=Status%20eq%20%27READY%27', {
        'auth': {
            'user': 'pritamsa',
            'pass': 'rupu@0801'
        },
        'json': true
    }, (err, resp, body) => {
        if (err) {
            return console.log(err);
        }
        
        console.log(body);
        
        reply.content = body.d.results[0].TaskTitle;
        sendToCai.replies.push(reply);
        sendToCai.conversation.memory = {
            "instanceId": body.d.results[0].InstanceID,
            "task_index": 0
        }

        res.json(sendToCai);       

    });

});

router.post('/getDetail', (req, res) => {

    res.send({ status: 'At cai' })

});

module.exports = router;