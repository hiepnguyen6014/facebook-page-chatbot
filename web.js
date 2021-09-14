import express from "express";
require("dotenv").config();
import request from "request";

//CONST connect to page server
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;


let router = express.Router();

let initWebRouters = (app) => {
    router.get("/", getHomePage);

    router.get("/webhook", getWebhook);
    router.post("/webhook", postWebhook);

    return app.use("/", router);
};

let getHomePage = (req, res) => {
    return res.send("<h1 align=\"center\">Developing... See you soon!!</h1>");
};

let getWebhook = (req, res) => {
    let mode = req.query["hub.mode"];
    let token = req.query["hub.verify_token"];
    let challenge = req.query["hub.challenge"];

    if (mode && token) {
        if (mode === "subscribe" && token === VERIFY_TOKEN) {
            console.log("WEBHOOK_VERIFIED");
            res.status(200).send(challenge);
        }
    } else {
        res.sendStatus(403);
    }
};

let postWebhook = (req, res) => {
    // Parse the request body from the POST
    let body = req.body;

    // Check the webhook event is from a Page subscription
    if (body.object === "page") {
        // Iterate over each entry - there may be multiple if batched
        body.entry.forEach(function(entry) {
            // Gets the body of the webhook event
            let webhook_event = entry.messaging[0];
            //console.log(webhook_event);

            // Get the sender PSID
            let sender_psid = webhook_event.sender.id;
            console.log("Sender PSID: " + sender_psid);


            // Check if the event is a message or postback and
            // pass the event to the appropriate handler function
            if (webhook_event.message) {
                handleMessage(sender_psid, webhook_event.message);
            }
        });

        // Return a '200 OK' response to all events
        res.status(200).send("EVENT_RECEIVED");
    } else {
        // Return a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404);
    }
};


function handleMessage(sender_psid, received_message) {

    // const message = received_message.text;

    let helps = [
        "⇨ mon, tue, wed, thu, fri, sat, sun, today, tomorrow: see the class schedule.",
    ]

    let response = {
        "text": "",
        "quick_replies": [{
            "content_type": "text",
            "title": "today",
            "payload": "<POSTBACK_PAYLOAD>"
        }, {
            "content_type": "text",
            "title": "tomorrow",
            "payload": "<POSTBACK_PAYLOAD>"
        }]
    };

    let rep = helps.join("\n");
    response.text = helps.join("\n");
    console.log(rep)

    // Send the response message
    callSendAPI(sender_psid, response);

};

// Sends response messages via the Send API
function callSendAPI(sender_psid, response) {
    console.log("Send");
    let request_body = {
        recipient: {
            id: sender_psid,
        },
        message: response,
    };
    // Send the HTTP request to the Messenger Platform
    request({
        uri: "https://graph.facebook.com/v2.6/me/messages",
        qs: { access_token: PAGE_ACCESS_TOKEN },
        method: "POST",
        json: request_body,
    });
}



module.exports = initWebRouters;