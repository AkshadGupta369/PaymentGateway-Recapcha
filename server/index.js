const express = require("express");
const cors = require("cors");
const stripe = require('stripe')('sk_test_51Q0faNRthcuTJA66OUtbo6whWUCJku5JhqQiwdQDeMy3Qzjg6a2NwtRuRQXkVvQ2JbjPBVZboYQ42Kz8GklohH0q00KHEXtSGJ');
const Captcha=require('node-captcha-generator');
const axios = require('axios');
const bodyParser = require('body-parser');
// const uuid=require("uuid/v4");
const { v4: uuidv4 } = require('uuid');
const nodemailer=require("nodemailer")


const app = express();

app.use(cors());
app.use(express.json()); 
app.set("view engine","ejs");
app.use(express.urlencoded({extended:false}))
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






//Payement gateway

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


//Recapcha



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











  //Forgot Password


  app.post("/forgot-password",async (req,res)=>{
    const{email}=req.body;
    try {
        if(!email){
            res.status(200).send({message:"invalid email"});
        }

        const oldUser=await User.findOne(email);
        if(!oldUser){
            res.status(200).send({message:"not found"});
        }
        const secret=JWT_SECRET+oldUser.password;
        const token=jwt.sign({email:oldUser.email,id:oldUser._id},secret,{expiresIn:"1hr"});
        const link=`http://localhost:3000/reset-password/${oldUser._id}/${token}`;
        var transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user:email,
            pass: 'ujvkvukjn'
          }
        });
        
        var mailOptions = {
          from: 'youremail@gmail.com',
          to: 'myfriend@yahoo.com',
          subject: 'Sending Email using Node.js',
          text: link
        };
        
        transporter.sendMail(mailOptions, function(error, info){
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response);
          }
        });
        console.log(link); 

    } catch (error) {
        
    }
  })

  app.get("/reset-password/:id/:token",async(req,res)=>{
    const {id,token}=req.params;
    console.log(req.params);
    const oldUser=await User.findOne({_id:id});
    if(!oldUser){
        res.status(200).send({message:"not found"});
    }
    const secret=JWT_SECRET+oldUser.password;
    try { 
        const verify=jwt.verify(token,secret);
        // res.send("verified");
        res.render("index",{email:verify.email,status:"inverified"});
    } catch (error) {
        res.send("not verified");
    }
    // res.send(done);
  })

  app.post("/reset-password/:id/:token",async(req,res)=>{
    const {id,token}=req.params;
   const {password}=req.body;
    const oldUser=await User.findOne({_id:id});
    if(!oldUser){
        res.status(200).send({message:"not found"});
    }
    const secret=JWT_SECRET+oldUser.password;
    try { 
        const verify=jwt.verify(token,secret);
        const encryptedPassword=await bcrypt.hash(password,10);
        await User.updateOne({
          _id:id,
        },{
          $set:{
            password:encryptedPassword,
          }
        })


        res.json({status:"password changed"});
        res.render("index",{email:verify.email,status:"verified"});
    } catch (error) {
        res.send("not verified");
    }
    // res.send(done);
  })
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});





