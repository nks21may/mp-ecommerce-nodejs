var express = require("express");
var exphbs = require("express-handlebars");
require('dotenv').config()

const mercadopago = require("mercadopago");
const EXTERNAL_REFERENCE = process.env.EXTERNAL_REFERENCE || "nicolasdalessandro2@gmail.com";

mercadopago.configure({
    access_token: "APP_USR-6317427424180639-042414-47e969706991d3a442922b0702a0da44-469485398",
    integrator_id: "dev_24c65fb163bf11ea96500242ac130004"
});

var port = process.env.PORT || 3000;
var app = express();

app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");

app.use(express.static("assets"));

app.use("/assets", express.static(__dirname + "/assets"));

app.get("/", function (req, res) {
    res.render("home");
});

/* This is the code that creates the preference and redirects to the checkout page. */
app.get("/detail", function (req, res) {

    let preference = {
        items: [
            {
              id: 1234,
              title: req.query.title,
              description: "Dispositivo móvil de Tienda e-commerce",
              picture_url: "http://nks21may-mp-ecommerce-nodejs.herokuapp.com" + req.query.img?.substring(1),
              quantity: 1,
              unit_price: parseFloat(req.query.price),
            },
        ],
        external_reference: EXTERNAL_REFERENCE,
        back_urls: {
          success: req.headers.host + "/success", 
          pending: req.headers.host + "/pending", 
          failure: req.headers.host + "/error"
        },
        auto_return: "approved",
        notification_url: "http://nks21may-mp-ecommerce-nodejs.herokuapp.com/webhook",
        payer: {
          name: "lalo",
          surname: "landa",
          email: "test_user_63274575@testuser.com",
          phone: {
            area_code: "11",
            number: 22223333
          },
          address: {
            zip_code: "6300",
            street_name: "Falsa",
            street_number: 123
          }
        },
        payment_methods: {
          excluded_payment_methods: [
            {
              id: "visa",
            },
          ],
          installments: 6,
          default_installments: 6,
        },
    };
    console.log("preference: ", preference);
    mercadopago.preferences
      .create(preference)
      .then(function (response) {
          let body = {
            ... req.query,
            preference_id: response.body.id,
            init_point: response.body.init_point,
          };
          res.render("detail", body);
      })
      .catch(function (error) {
          console.log(error);
      });
});


/* Rendering the success page. */
app.get("/success", (req, res) => {
  res.render("success", req.query); 
});

/* Rendering the error page. */
app.get("/error", (req, res) => {
  res.render("error", req.query); 
});

/* Rendering the pending page. */
app.get("/pending", (req, res) => {
  res.render("pending", req.query); 
});

app.post("/webhook", (req, res) => {
  let body = "";
  req.on("data", chunk => {
    body += chunk.toString();
  });
  req.on("end", () => {
    console.log(body, "webhook response");
    res.end("ok");
  });
  return res.status(201);
});

app.listen(port);
