const jwt=require("jsonwebtokens");
const nodemailer=require("nodemailer");


const forgetPsssword=async(req,res)=>{
    try {
        const{email}=req.body;
        if(!email){
            res.status(200).send({message:"invalid email"});
        }

        const checkUser=await UserActivation.findOne(email);
        if(!checkUser){
            res.status(200).send({message:"not found"});
        }

        const token=jwt.sign({email},process.env.JWT_TOKEN,{expiresIn:"1hr"});
        const transpoter=nodemailer.createTransport({
            service:"gmail",
            secure:true,
            auth:{
                user:"",
                pass:"",
            }
        })

    } catch (error) {
        
    }
}