const express = require('express')
require('dotenv').config()
const request = require('request')

//CONST connect to page server
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN
const VERIFY_TOKEN = process.env.VERIFY_TOKEN

let router = express.Router()

//initial router of the web
let initWebRouters = (app) => {
	router.get('/', (req, res) => {
		return res.send('<h1 align="center">Developing... See you soon!!</h1>')
	})
	router.get('/webhook', getWebhook)
	router.post('/webhook', postWebhook)
	return app.use('/', router)
}

//fom Facebook developer
let getWebhook = (req, res) => {
	let mode = req.query['hub.mode']
	let token = req.query['hub.verify_token']
	let challenge = req.query['hub.challenge']

	if (mode && token) {
		if (mode === 'subscribe' && token === VERIFY_TOKEN) {
			res.status(200).send(challenge)
		}
	} else {
		res.sendStatus(403)
	}
}

//fom Facebook developer
let postWebhook = (req, res) => {
	let body = req.body

	if (body.object === 'page') {
		body.entry.forEach(function (entry) {
			let webhook_event = entry.messaging[0]
			let sender_psid = webhook_event.sender.id

			if (webhook_event.message) {
				handleMessage(sender_psid, webhook_event.message)
			}
		})
		res.status(200).send('EVENT_RECEIVED')
	} else {
		res.sendStatus(404)
	}
}

//custom for personal
function handleMessage(sender_psid, received_message) {
	const message = received_message.text

	let response

	switch (message.toLowerCase()) {
		case 'help':
			response = processRequest(['1', '2'], 'Hiện tại chưa có gì!!')
			break
		default:
			response = {
				text: `"${message}" request not supported yet. Press "help" to know more about the command.`,
				quick_replies: [
					{
						content_type: 'text',
						title: 'help',
						payload: '<POSTBACK_PAYLOAD>',
					},
				],
			}
			break
	}

	callSendAPI(sender_psid, response)
}

function processRequest(arraySelect, message) {
	/* Form response
    {
        "text": "",
        "quick_replies": [{
            "content_type": "text",
            "title": "option 1",
            "payload": "<POSTBACK_PAYLOAD>"
        },
        {
            "content_type": "text",
            "title": "option 2",
            "payload": "<POSTBACK_PAYLOAD>"
        }]
    };
    */

	//the button for custom select by add to response.quick_replies.push(replies)
	let replies = {
		content_type: 'text',
		payload: '<POSTBACK_PAYLOAD>',
	}

	let response = {
		quick_replies: [],
	}

	//create button for user choose next message
	arraySelect.forEach((element) => {
		replies.title = element
		response.quick_replies.push(replies)
	})

	//message response
	response.text = message

	return response
}

// Sends response messages via the Send API (fom Facebook developer)
function callSendAPI(sender_psid, response) {
	let request_body = {
		recipient: {
			id: sender_psid,
		},
		message: response,
	}
	// Send the HTTP request to the Messenger Platform
	request({
		uri: 'https://graph.facebook.com/v2.6/me/messages',
		qs: { access_token: PAGE_ACCESS_TOKEN },
		method: 'POST',
		json: request_body,
	})
}

module.exports = initWebRouters
