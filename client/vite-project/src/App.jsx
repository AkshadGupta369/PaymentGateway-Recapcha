import axios from "axios"; 
import React,{useState} from "react";
import StripeCheckout from "react-stripe-checkout";
function App() {

// const buyNow=async()=>{
//   let response=await axios.post('http://localhost:3000/payment');
//   if(response&&response.status==200){
//     window.location.href=response.data.url
//     console.log(response.data);
//   }
// }

const [product,setProduct]=useState({
  name:"React from FB",
  price:10,
  productBy:"FB"
})

const makePayment=token=>{
  const body={
    token,
    product
  }
  const headers={
    "Content-type":"application/json"
  }
  return fetch(`http://localhost:3000/payment`,{
method:"POST",
headers,
body:JSON.stringify(body)
  }).then(response=>{
    console.log("Response"+response);
    const {status}=response;
    console.log(status);
  })
  .catch(err=>console.log(err));
}
  return (
<>
{/* <button onClick={buyNow}>
  Buy Now
</button> */}

  <StripeCheckout stripeKey="pk_test_51Q0faNRthcuTJA66LzGU2Za6Y5LmEDmnx1e5N46drrQSnZ4XgXIuEy3qPGYlvk6q0jfr7uR0qxIsi2clZ4AoQ4lI00n2R9gzHD" token={makePayment} name="Buy React" amount={product.price*100 } shippingAddress billingAddress>
<button className="btn-large blue">Buy React in {product.price}$ </button>
  </StripeCheckout>
</>
  )
}
 
export default App
