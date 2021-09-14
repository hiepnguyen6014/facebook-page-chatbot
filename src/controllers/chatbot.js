require("dotenv").config();
import request from "request";

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

const run = require("./data");

let getHomePage = (req, res) => {

    return res.send("Nguyen Dai Hiep");
};

let getWebhook = async(req, res) => {
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

let postWebhook = async(req, res) => {
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
            // console.log("Sender PSID: " + sender_psid);


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

/* async function getSchedule() {
    return await run();
} */


// Handles messages events
async function handleMessage(sender_psid, received_message) {

    const message = received_message.text;
    let data = "";
    if (message == "mon" || message == "tue" || message == "wed" || message == "thu" || message == "fri" || message == "sat" || message == "sun" || message == "today" || message == "tomorrow") {
        data = await run();
    }

    let helps = [
        "⇨ mon, tue, wed, thu, fri, sat, sun, today, tomorrow: see the class schedule.",
        "⇨ sleep: see the time you should wake up for health."
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
        }, {
            "content_type": "text",
            "title": "mon",
            "payload": "<POSTBACK_PAYLOAD>"
        }, {
            "content_type": "text",
            "title": "tue",
            "payload": "<POSTBACK_PAYLOAD>"
        }, {
            "content_type": "text",
            "title": "wed",
            "payload": "<POSTBACK_PAYLOAD>"
        }, {
            "content_type": "text",
            "title": "thu",
            "payload": "<POSTBACK_PAYLOAD>"
        }, {
            "content_type": "text",
            "title": "fri",
            "payload": "<POSTBACK_PAYLOAD>"
        }, {
            "content_type": "text",
            "title": "sat",
            "payload": "<POSTBACK_PAYLOAD>"
        }, {
            "content_type": "text",
            "title": "sun",
            "payload": "<POSTBACK_PAYLOAD>"
        }, {
            "content_type": "text",
            "title": "help",
            "payload": "<POSTBACK_PAYLOAD>"
        }]
    };
    switch (message.toLowerCase()) {
        case "mon":
            response.text = "Monday\n\n" + scheduleData(data, 2);
            break;
        case "tue":
            response.text = "Tuesday\n\n" + scheduleData(data, 3);
            break;
        case "wed":
            response.text = "Wednesday\n\n" + scheduleData(data, 4);
            break;
        case "thu":
            response.text = "Thursday\n\n" + scheduleData(data, 5);
            break;
        case "fri":
            response.text = "Friday\n\n" + scheduleData(data, 6);
            break;
        case "sat":
            response.text = "Saturday\n\n" + scheduleData(data, 7);
            break;
        case "sun":
            response.text = "Sunday\n\n" + scheduleData(data, 8);
            break;
        case "help":
            response.text = helps.join("\n");
            break;
        case "today":
        case "tomorrow":
            const date = new Date();
            const day = date.getDate();
            const month = date.getMonth() + 1; // Since getMonth() returns month from 0-11 not 1-12
            let orderDay = date.getDay();


            console.log(date.getMinutes());
            console.log(date.getHours());
            if (message == "tomorrow") {
                response.text = `Tomorrow (${day + 1}-${month})\n\n` + scheduleData(data, orderDay + 2);
            } else {
                response.text = `Today (${day}-${month})\n\n` + scheduleData(data, orderDay + 1);
            }
            break;
        default:
            response.text = `Your "${message}" request don't have in my server. Type "help" to know about this chatbot.`;
            break;
    }

    // Send the response message
    callSendAPI(sender_psid, response);

};

function scheduleData(data, date) {

    let result = []

    const processData = data.split('?')

    processData.forEach(e => {
        if (date == 0) {
            date = 8;
        }
        if (e[0] == date) {
            result.push("Shift: " + e[3] + " Subject: " + dataCl(e));
        }
    })

    if (result.length == 0) {
        return "You have no events scheduled.";
    }
    return result.join("\n\n");
}

function dataCl(str) {
    if (str.charAt(15) == " ") {
        return str.slice(16)
    }
    return str.slice(18)
}


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
        }
        /* ,
        		(err, res, body) => {
        			if (!err) {
        				console.log("message sent!");
        			} else {
        				console.error("Unable to send message:" + err);
        			}
        		}
        	 */
    );
}


module.exports = {
    getHomePage: getHomePage,
    getWebhook: getWebhook,
    postWebhook: postWebhook,
};
