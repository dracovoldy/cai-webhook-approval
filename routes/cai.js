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
        'json': true,
        'timeout': 1500
    }, (err, resp, body) => {
        if (err) {

            reply.content = "I'm facing issues answering that, please try again in a while.";
            sendToCai.replies.push(reply);
            sendToCai.conversation.memory = {}
            res.send(sendToCai);

            console.log(err);

            return;
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
                    "task_index": 1,
                    "last_skill": "get_my_tasks"
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
                    "task_index": req.body.conversation.memory.task_index + 1,
                    "last_skill": "get_my_tasks"
                }
                res.send(sendToCai);
            } else if (body.d.results.length > 0 && req.body.conversation.memory.task_index >= body.d.results.length) {
                reply.content = "No more tasks to show.";
                sendToCai.replies.push(reply);
                sendToCai.conversation.memory = {
                    "instanceId": req.body.conversation.memory.instanceId,
                    "purchOrder": req.body.conversation.memory.purchOrder,
                    "task_index": req.body.conversation.memory.task_index,
                    "last_skill": "get_my_tasks"
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
                    "task_index": req.body.conversation.memory.task_index,
                    "last_skill": "get_my_tasks"
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
        },

        // `timeout` specifies the number of milliseconds before the request times out.
        // If the request takes longer than `timeout`, the request will be aborted.
        timeout: 0 // default is `0` (no timeout)
    }

    axios.all([
        axios.get(url, config),
        axios.get(url2, config)
    ]).then(axios.spread((response1, response2) => {
        console.log(response1.data);
        console.log(response2.data);

        let header = response1.data.d;
        let item = response2.data.d;

        reply.content = header.PurchaseOrderType_Text + " <say-as interpret-as='digits'>" + header.PurchaseOrder + "</say-as> has a net amount of " + header.DocumentCurrency + " " + header.PurchaseOrderNetAmount +
            ". Supplier is " + header.SupplierName + " and was created by " + header.CreatedByUser + ".\n";

        reply.content = reply.content + "It has " + item.results.length + " order items.\n"

        let parseItems = (aItems) => {
            let itemsText = "";
            aItems.map(oItem => {
                let t = "Purchase order item <say-as interpret-as='digits'>" + parseInt(oItem.PurchaseOrderItem.substring(0, oItem.PurchaseOrderItem.length - 1)) + "</say-as>, is Material <say-as interpret-as='digits'>" + oItem.Material + "</say-as> " + oItem.PurchaseOrderItemText +
                    ", with quantity of " + oItem.OrderQuantity + ", and a net unit price of " + oItem.DocumentCurrency + " " + oItem.NetPriceAmount + ".\n";

                itemsText = itemsText + t;
            })
            return itemsText;
        };

        reply.content = reply.content + parseItems(item.results);

        sendToCai.replies.push(reply);
        sendToCai.conversation.memory = {
            "instanceId": req.body.conversation.memory.instanceId,
            "purchOrder": req.body.conversation.memory.purchOrder,
            "task_index": req.body.conversation.memory.task_index,
            "last_skill": "show_task_detail"
        }

        res.send(sendToCai);

    })).catch(error => {
        console.log(error);

        reply.content = "I'm facing issues answering that, please try again in a while.";
        sendToCai.replies.push(reply);
        sendToCai.conversation.memory = {}
        res.send(sendToCai);
    });

});

router.post('/approveTask', (req, res) => {
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
    let memory = req.body.conversation.memory;
    let nlp = req.body.nlp;


    console.log(req.body.conversation);


    if (memory.last_skill === 'show_task_detail') {
        // Dialog for approval
        reply.content = "Please say yes to approve Purchase Order: <say-as interpret-as='digits'>" + memory.purchOrder + "</say-as>.";
        sendToCai.replies.push(reply);
        sendToCai.conversation.memory = {
            "instanceId": req.body.conversation.memory.instanceId,
            "purchOrder": req.body.conversation.memory.purchOrder,
            "task_index": req.body.conversation.memory.task_index,
            "last_skill": "approve_task"
        }
        console.log(sendToCai);
        res.send(sendToCai);
    } else if (memory.last_skill === 'get_my_tasks') {
        //Show details and dialog for approval
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
            },

            // `timeout` specifies the number of milliseconds before the request times out.
            // If the request takes longer than `timeout`, the request will be aborted.
            timeout: 0 // default is `0` (no timeout)
        }

        axios.all([
            axios.get(url, config),
            axios.get(url2, config)
        ]).then(axios.spread((response1, response2) => {
            console.log(response1.data);
            console.log(response2.data);

            let header = response1.data.d;
            let item = response2.data.d;

            reply.content = header.PurchaseOrderType_Text + " <say-as interpret-as='digits'>" + header.PurchaseOrder + "</say-as> has a net amount of " + header.DocumentCurrency + " " + header.PurchaseOrderNetAmount +
                ". Supplier is " + header.SupplierName + " and was created by " + header.CreatedByUser + ".\n";

            reply.content = reply.content + "It has " + item.results.length + " order items.\n"

            let parseItems = (aItems) => {
                let itemsText = "";
                aItems.map(oItem => {
                    let t = "Purchase order item <say-as interpret-as='digits'>" + parseInt(oItem.PurchaseOrderItem.substring(0, oItem.PurchaseOrderItem.length - 1)) + "</say-as>, is Material <say-as interpret-as='spell-out'>" + oItem.Material + "</say-as> " + oItem.PurchaseOrderItemText +
                        ", with quantity of " + oItem.OrderQuantity + ", and a net unit price of " + oItem.DocumentCurrency + " " + oItem.NetPriceAmount + ".\n";

                    itemsText = itemsText + t;
                })
                return itemsText;
            };

            reply.content = reply.content + parseItems(item.results) + "\nPlease say yes to approve Purchase Order: <say-as interpret-as='digits'>" + memory.purchOrder + "</say-as>.";;

            sendToCai.replies.push(reply);
            sendToCai.conversation.memory = {
                "instanceId": req.body.conversation.memory.instanceId,
                "purchOrder": req.body.conversation.memory.purchOrder,
                "task_index": req.body.conversation.memory.task_index,
                "last_skill": "approve_task"
            }

            res.send(sendToCai);

        })).catch(error => {
            console.log(error);

            reply.content = "I'm facing issues answering that, please try again in a while.";
            sendToCai.replies.push(reply);
            sendToCai.conversation.memory = {}
            res.send(sendToCai);
        });

    } else if (memory.last_skill === 'approve_task' && (nlp.sentiment === "vpositive" || nlp.sentiment === "positive")) {
        //approve task

        let instanceId = memory.instanceId;

        var url2 = `https://p2001172697trial-trial.apim1.hanatrial.ondemand.com/p2001172697trial/Workflow_approval/Decision?sap-client=400&SAP__Origin='S4HMYINBOCLNT200'&InstanceID='${instanceId}'&DecisionKey='0001'&Comments='approve_from_alexa'`;
        // var url1 = `https://p2001172697trial-trial.apim1.hanatrial.ondemand.com/p2001172697trial/Workflow_approval/`;

        let config1 = {
            auth: {
                username: 'pritamsa',
                password: 'rupu@0801'
            },
            timeout: 0, // default is `0` (no timeout)
            headers: {
                'x-csrf-token': 'Fetch',
                'sap-contextid-accept': 'header'
            },
            withCredentials: true
        }

        axios.head(url2, config1)
            .then((response) => {
                let token = response.headers["x-csrf-token"];
                console.log(`\n=============HEADERS===========\n`);
                console.log(response.headers)
                console.log(`\n==========TOKEN===========\n`);
                console.log(token)
                let config2 = {
                    // `url` is the server URL that will be used for the request
                    url: `Decision?sap-client=400&SAP__Origin='S4HMYINBOCLNT200'&InstanceID='${instanceId}'&DecisionKey='0001'&Comments='approve_from_alexa'`,

                    // `method` is the request method to be used when making the request
                    method: 'post', // default
                    baseURL: 'https://p2001172697trial-trial.apim1.hanatrial.ondemand.com/p2001172697trial/Workflow_approval/',
                    auth: {
                        username: 'pritamsa',
                        password: 'rupu@0801'
                    },
                    timeout: 0,
                    headers: {                        
                        "sap-contextid-accept": 'header',
                        "Access-Control-Allow-Credentials": true,
                        "Access-Control-Allow-Origin": "*"
                    },
                    withCredentials: true
                }
                config2.headers["X-CSRF-Token"] = response.headers["x-csrf-token"];
                config2.headers["Cookie"] = response.headers["set-cookie"];

                axios.request(url2, config2)
                    .then((response) => {

                        // Success
                        reply.content = "Ok, Approved!";
                        sendToCai.replies.push(reply);
                        sendToCai.conversation.memory = {
                            "instanceId": req.body.conversation.memory.instanceId,
                            "purchOrder": req.body.conversation.memory.purchOrder,
                            "task_index": req.body.conversation.memory.task_index,
                            "last_skill": "confirm-approve"
                        }

                        res.send(sendToCai);

                    })
                    .catch((error) => {
                        console.log(`\n==========ERROR========\n`);
                        console.log(error);

                        reply.content = "Sorry faced some issues while approving, please try again later 2.";
                        sendToCai.replies.push(reply);
                        sendToCai.conversation.memory = {
                            "instanceId": req.body.conversation.memory.instanceId,
                            "purchOrder": req.body.conversation.memory.purchOrder,
                            "task_index": req.body.conversation.memory.task_index,
                            "last_skill": "approve_task"
                        }

                        res.send(sendToCai);
                    })
            })
            .catch((error) => {
                console.log(error);
                //Error
                reply.content = "Sorry faced some issues while approving, please try again later 1.";
                sendToCai.replies.push(reply);
                sendToCai.conversation.memory = {
                    "instanceId": req.body.conversation.memory.instanceId,
                    "purchOrder": req.body.conversation.memory.purchOrder,
                    "task_index": req.body.conversation.memory.task_index,
                    "last_skill": "approve_task"
                }
                res.send(sendToCai);

            })


    }

});

module.exports = router;