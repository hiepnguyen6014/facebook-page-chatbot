import express from "express";
import initWebRouters from "./web";
require("dotenv").config();

let app = express();

//config view engine
let configViewEngine = (app) => {
    app.set("view engine", "ejs");
};

//call function config
configViewEngine(app);

//parser request to json
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

//init web routers
initWebRouters(app);


let port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log("Running port " + port);
});