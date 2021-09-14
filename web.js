import express from "express";
require("dotenv").config();
import request from "request";

//CONST connect to page server
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

let router = express.Router();

//initial router of the web
let initWebRouters = (app) => {
    router.get("/", getHomePage);
    router.get("/webhook", getWebhook);
    router.post("/webhook", postWebhook);
    return app.use("/", router);
};

let getHomePage = (req, res) => {
    return res.send("<h1 align=\"center\">Developing... See you soon!!</h1>");
};

//fom Facebook developer
let getWebhook = (req, res) => {

    let mode = req.query["hub.mode"];
    let token = req.query["hub.verify_token"];
    let challenge = req.query["hub.challenge"];

    if (mode && token) {
        if (mode === "subscribe" && token === VERIFY_TOKEN) {
            res.status(200).send(challenge);
        }
    } else {
        res.sendStatus(403);
    }
};

//fom Facebook developer
let postWebhook = (req, res) => {
    let body = req.body;

    if (body.object === "page") {
        body.entry.forEach(function(entry) {
            let webhook_event = entry.messaging[0];
            let sender_psid = webhook_event.sender.id;

            if (webhook_event.message) {
                handleMessage(sender_psid, webhook_event.message);
            }
        });
        res.status(200).send("EVENT_RECEIVED");
    } else {
        res.sendStatus(404);
    }
};

function handleMessage(sender_psid, received_message) {
    const message = received_message.text;

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

    response.text = "Developing...!!" + message;

    callSendAPI(sender_psid, response);

};

// Sends response messages via the Send API
function callSendAPI(sender_psid, response) {
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