const express = require("express");
const cors = require("cors");
const stripe = require('stripe')('sk_test_51Q0faNRthcuTJA66OUtbo6whWUCJku5JhqQiwdQDeMy3Qzjg6a2NwtRuRQXkVvQ2JbjPBVZboYQ42Kz8GklohH0q00KHEXtSGJ');
const Captcha=require('node-captcha-generator');
const axios = require('axios');
const bodyParser = require('body-parser');
// const uuid=require("uuid/v4");
const { v4: uuidv4 } = require('uuid');


const app = express();

app.use(cors());
app.use(express.json()); 
// Middleware for parsing form data
app.use(bodyParser.urlencoded({ extended: true })); // To parse URL-encoded bodies
app.use(bodyParser.json()); // To parse JSON bodies

app.get("/", (req, res) => {
    res.send("Hello world");
});

// app.post('/payment', async (req, res) => {
//     try {
//         const product = await stripe.products.create({
//             name: "food"
//         });

//         if (product) {
//             let price = await stripe.prices.create({
//                 product: `${product.id}`,
//                 unit_amount: 100 * 100, // 100 INR
//                 currency: 'inr',
//             });

//             if (price.id) {
//                 let session = await stripe.checkout.sessions.create({
//                     line_items: [
//                         {
//                             price: `${price.id}`,
//                             quantity: 1,
//                         }
//                     ],
//                     mode: 'payment', // Fixed typo
//                     success_url: 'http://localhost:3000/success',
//                     cancel_url: 'http://localhost:3000/cancel',
//                     customer_email: 'demo@gmail.com'
//                 });

//                 return res.json({ url: session.url });
//             }
//         }

//         res.status(500).json({ error: "Failed to create price or session." });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// });



app.post("/payment",(req,res)=>{
    const{product,token}=req.body;
    console.log("Product"+product);
    console.log("Price"+product.price);
    const idempontencyKey=uuidv4();


    return stripe.customers.create({
        email:token.email,
        source:token.id
    }).then(customer=>{
        stripe.charges.create({
            amount:product.price*100,
            currency:"usd",
            customer:customer.id,
            receipt_email:token.email,
            description:product.name,
            shipping:{
                name:token.card.name,
                address:{
                    country:token.card.address._country,
                }
            }
        },{idempontencyKey})
    })
    .then(result=>res.status(200).json(result))
    .catch(err=>console.log(err))
})




app.post('/submit', async (req, res) => {
    const recaptchaResponse = req.body['g-recaptcha-response'];
    const secretKey = '6LcWm0kqAAAAAD2ztgH8u6CjOGrGRy_RyFoNS4UK';
  
    const verificationURL = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaResponse}`;
  
    try {
      const response = await axios.post(verificationURL);
    //   console.log(response);
      if (response.data.success) {
        // Proceed with your form submission process
        res.send('reCAPTCHA verified successfully!');
      } else {
        res.send('reCAPTCHA verification failed.');
      }
    } catch (error) {
      console.error('Error verifying reCAPTCHA:', error);
      res.send('Error during reCAPTCHA verification.');
    }
  });

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});





