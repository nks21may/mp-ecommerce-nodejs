var express = require("express");
var exphbs = require("express-handlebars");
require('dotenv').config()

const mercadopago = require("mercadopago");
mercadopago.configure({
    access_token: process.env.PROD_ACCESS_TOKEN || "PROD_ACCESS_TOKEN",
});

const EXTERNAL_REFERENCE = process.env.EXTERNAL_REFERENCE || "external_reference";
var port = process.env.PORT || 3000;
var app = express();

app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");

app.use(express.static("assets"));

app.use("/assets", express.static(__dirname + "/assets"));

app.get("/", function (req, res) {
    res.render("home");
});

app.get("/detail", function (req, res) {
    let preference = {
        items: [
            {
                id: "1234",
                title: req.query.title,
                description: "Dispositivo móvil de Tienda e-commerce",
                picture_url: req.headers.host + req.query.img,
                quantity: parseInt(req.query.unit) || 1,
                unit_price: parseFloat(req.query.price),
            },
        ],
        external_reference: EXTERNAL_REFERENCE,
        back_urls: {
          success: "https://localhost:3000/success", 
          pending: "https://localhost:3000.com/pending", 
          failure: "https://localhost:3000.com/error"
        },
        auto_return: "approved",
    };
    
    mercadopago.preferences
        .create(preference)
        .then(function (response) {
            let body = {
              ... req.query,
              preference_id: response.body.id,
              init_point: response.body.init_point,
              payment_methods: {
                excluded_payment_methods: [
                  {
                    id: "visa",
                  },
                ],
                installments: 6,
              },
            };
            res.render("detail", body);
        })
        .catch(function (error) {
            console.log(error);
        });
});

app.get("/success", (req, res) => {
  res.render("success", req.query); // TODO hacer la pagina
});

app.get("/error", (req, res) => {
  res.render("error", req.query); // TODO hacer la pagina
});

app.get("/pending", (req, res) => {
  res.render("pending", req.query); // TODO hacer la pagina
});

app.listen(port);
