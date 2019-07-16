const express = require('express');
const router = express.Router();
const request = require('request');
const axios = require('axios');

router.post('/', (req, res) => {

    let sendToCai = {
        replies: [],
        conversation: {
            language: "en"
        }
    };

    let reply = {
        outputSpeech: "SSML",
        type: "text",
        content: "Mock reply"
    };

    console.log(req.body);

    request.get('https://p2001172697trial-trial.apim1.hanatrial.ondemand.com:443/p2001172697trial/Workflow_approval/TaskCollection?sap-client=400&$format=json&$filter=Status%20eq%20%27READY%27', {
        'auth': {
            'user': 'pritamsa',
            'pass': 'rupu@0801'
        },
        'json': true
    }, (err, resp, body) => {
        if (resp.statusCode !== 200) {

            reply.content = "I'm facing issues answering that, please try again in a while.";
            sendToCai.replies.push(reply);
            sendToCai.conversation.memory = {}
            res.send(sendToCai);

            return console.log(err);
        }

        console.log(body);

        if (req.body.conversation.skill === "get_my_tasks") {
            if (body.d.results.length > 0) {
                reply.content = "You have " + body.d.results.length + " pending tasks.\n" + body.d.results[0].TaskTitle + "." +
                    "\nYou can say next, take action or ask for more details.";
                sendToCai.replies.push(reply);
                sendToCai.conversation.memory = {
                    "instanceId": body.d.results[0].InstanceID,
                    "purchOrder": body.d.results[0].TaskTitle.split("order ")[1].split(".")[0],
                    "task_index": 1
                }
                res.send(sendToCai);
            } else if (body.d.results.length <= 0) {
                reply.content = "You don't have any pending tasks.";
                sendToCai.replies.push(reply);
                sendToCai.conversation.memory = {}
                res.send(sendToCai);
            } else {
                reply.content = "I'm facing issues answering that, please try again in a while.";
                sendToCai.replies.push(reply);
                sendToCai.conversation.memory = {}
                res.send(sendToCai);
            }

        } else if (req.body.conversation.skill === "show_next_task") {
            if (body.d.results.length > 0 && req.body.conversation.memory.task_index < body.d.results.length) {
                reply.content = body.d.results[req.body.conversation.memory.task_index].TaskTitle + "." +
                    "\nYou can say next, take action or ask for more details.";
                sendToCai.replies.push(reply);
                sendToCai.conversation.memory = {
                    "instanceId": body.d.results[req.body.conversation.memory.task_index].InstanceID,
                    "purchOrder": body.d.results[req.body.conversation.memory.task_index].TaskTitle.split("order ")[1].split(".")[0],
                    "task_index": req.body.conversation.memory.task_index + 1
                }
                res.send(sendToCai);
            } else if (body.d.results.length > 0 && req.body.conversation.memory.task_index >= body.d.results.length) {
                reply.content = "No more tasks to show.";
                sendToCai.replies.push(reply);
                sendToCai.conversation.memory = {
                    "instanceId": req.body.conversation.memory.instanceId,
                    "purchOrder": req.body.conversation.memory.purchOrder,
                    "task_index": req.body.conversation.memory.task_index
                }
                res.send(sendToCai);
            } else if (body.d.results.length <= 0) {
                reply.content = "You don't have any pending tasks.";
                sendToCai.replies.push(reply);
                sendToCai.conversation.memory = {}
                res.send(sendToCai);
            } else if (req.body.conversation.memory.task_index === undefined) {
                reply.content = "I can get you your pending tasks. Please say show my tasks to get your task list.";
                sendToCai.replies.push(reply);
                sendToCai.conversation.memory = {}
                res.send(sendToCai);
            } else {
                reply.content = "I'm facing issues answering that, please try again in a while.";
                sendToCai.replies.push(reply);
                sendToCai.conversation.memory = {}
                res.send(sendToCai);
            }

        } else if (req.body.conversation.skill === "repeat_task") {
            if (req.body.conversation.memory.task_index === undefined) {
                reply.content = "I can get you your pending tasks. Please say, show my tasks to get your task list.";
                sendToCai.replies.push(reply);
                sendToCai.conversation.memory = {}
                res.send(sendToCai);
            } else if (body.d.results.length > 0 && req.body.conversation.memory.task_index <= body.d.results.length) {
                reply.content = body.d.results[req.body.conversation.memory.task_index - 1].TaskTitle + "." +
                    "\nSay next to show next task or, take action or, ask for more details.";
                sendToCai.replies.push(reply);
                sendToCai.conversation.memory = {
                    "instanceId": req.body.conversation.memory.instanceId,
                    "purchOrder": req.body.conversation.memory.purchOrder,
                    "task_index": req.body.conversation.memory.task_index
                }
                res.send(sendToCai);
            } else if (body.d.results.length <= 0) {
                reply.content = "You don't have any pending tasks.";
                sendToCai.replies.push(reply);
                sendToCai.conversation.memory = {}
                res.send(sendToCai);
            } else {
                reply.content = "I'm facing issues answering that, please try again in a while.";
                sendToCai.replies.push(reply);
                sendToCai.conversation.memory = {}
                res.send(sendToCai);
            }
        }
    });
});

router.post('/getDetails', (req, res) => {
    let sendToCai = {
        replies: [],
        conversation: {
            language: "en"
        }
    };

    let reply = {
        outputSpeech: {
            type: "SSML",
        },
        type: "text",
        content: "Mock reply"
    };

    let purchOrder = req.body.conversation.memory.purchOrder;
    let url = "C_PurchaseOrderFs(PurchaseOrder='" + purchOrder + "')?sap-client=400&$format=json";
    let url2 = "C_PurchaseOrderFs(PurchaseOrder='" + purchOrder + "')/to_PurchaseOrderItem?sap-client=400&$format=json";

    let config = {
        // `baseURL` will be prepended to `url` unless `url` is absolute.
        // It can be convenient to set `baseURL` for an instance of axios to pass relative URLs
        // to methods of that instance.
        baseURL: 'https://p2001172697trial-trial.apim1.hanatrial.ondemand.com/p2001172697trial/C_PURCHASEORDER_FS_SRV/',

        // `auth` indicates that HTTP Basic auth should be used, and supplies credentials.
        // This will set an `Authorization` header, overwriting any existing
        // `Authorization` custom headers you have set using `headers`.
        // Please note that only HTTP Basic auth is configurable through this parameter.
        // For Bearer tokens and such, use `Authorization` custom headers instead.
        auth: {
            username: 'pritamsa',
            password: 'rupu@0801'
        }
    }

    axios.all([
        axios.get(url, config),
        axios.get(url2, config)
    ]).then(axios.spread((response1, response2) => {
        console.log(response1.data);
        console.log(response2.data);
    })).catch(error => {
        console.log(error);
    });

    // request.get(url, {
    //     'auth': {
    //         'user': 'pritamsa',
    //         'pass': 'rupu@0801'
    //     },
    //     'json': true
    // }, (err, resp, body) => {
    //     if (resp.statusCode !== 200) {

    //         reply.content = "I'm facing issues answering that, please try again in a while.";
    //         sendToCai.replies.push(reply);
    //         sendToCai.conversation.memory = {}
    //         res.send(sendToCai);

    //         return console.log(err);
    //     }

    //     reply.content = body.d.PurchaseOrderType_Text + " <say-as interpret-as='spell-out'>" + body.d.PurchaseOrder + "</say-as> has a net amount of " + body.d.DocumentCurrency + " " + body.d.PurchaseOrderNetAmount +
    //         ". Supplier is " + body.d.SupplierName + " and was created by " + body.d.CreatedByUser + ".";

    //     sendToCai.replies.push(reply);
    //     sendToCai.conversation.memory = {
    //         "instanceId": req.body.conversation.memory.instanceId,
    //         "purchOrder": req.body.conversation.memory.purchOrder,
    //         "task_index": req.body.conversation.memory.task_index
    //     }
    //     res.send(sendToCai);
    // });

});

module.exports = router;