import express from "express";
import viewEngine from "./config/viewEngine";
import initWebRouters from "./routers/web";
import bodyParser from "body-parser";
require("dotenv").config();

let app = express();

//config view engine
viewEngine(app);

//parser request to json
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

//init web routers
initWebRouters(app);



let port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log("Running port " + port);
});