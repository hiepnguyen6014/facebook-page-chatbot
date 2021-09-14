import express from "express";
import chatbot from "../controllers/chatbot";

let router = express.Router();

let initWebRouters = (app) => {
    router.get("/", chatbot.getHomePage);

    router.get("/webhook", chatbot.getWebhook);
    router.post("/webhook", chatbot.postWebhook);

    return app.use("/", router);
};

module.exports = initWebRouters;