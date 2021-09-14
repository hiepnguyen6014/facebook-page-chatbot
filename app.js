import express from "express";
import initWebRouters from "./web";
require("dotenv").config();

let app = express();

//config view engine
app.set("view engine", "ejs");


//parser request to json
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

//init web routers
initWebRouters(app);

//Running in the PORT or 8080
let port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log("Running port " + port);
});