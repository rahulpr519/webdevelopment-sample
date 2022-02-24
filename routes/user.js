var express = require('express');
const productHelpers = require('../helpers/product-helpers');
var router = express.Router();
const userHelpers=require('../helpers/user-helpers')

// VERIFY LOGIN

const verifyLogin = (req,res,next)=>{
  if(req.session.user){
    next()
  }else{
    res.redirect('/login')
  }
}

// GET HOME PAGE

router.get('/',async function(req, res, next) {
  let user=req.session.user
  console.log(user);
  let cartCount=null
  if(req.session.user){
  cartCount=await userHelpers.getCartCount(req.session.user._id)
  }
  productHelpers.getAllProducts().then((products)=>{
    
    res.render('user/view-products',{products,user,cartCount});
  })
});

// LOGIN PAGE

router.get('/login',(req,res)=>{
  if(req.session.user){
    res.redirect('/')
  }else
    res.render('user/login',{"loginErr":req.session.userLoginErr})
    req.session.userLoginErr=false
})

// SIGN UP PAGE
router.get('/signup',(req,res)=>{
  res.render('user/signup')
})

// SIGN UP

router.post('/signup',(req,res)=>{
  userHelpers.doSignup(req.body).then((response)=>{
    console.log(response);
    
    req.session.user=response
    req.session.user.loggedIn=true
    res.redirect('/')
  })
})

// LOGIN 

router.post('/login',(req,res)=>{
  userHelpers.doLogin(req.body).then((response)=>{
    if(response.status){
      
      req.session.user=response.user
      req.session.user.loggedIn=true
      res.redirect('/');
    }else{
      req.session.userLoginErr="Invalid Username or password"
      res.redirect('/login')
    }
  })
})

// LOGOUT

router.get('/logout',(req,res)=>{
  req.session.user=null
  res.redirect('/');
})

// GET CART ITEMS

router.get('/cart',verifyLogin,async(req,res)=>{
  let products=await userHelpers.getCartProducts(req.session.user._id)
  let totalPrice=await userHelpers.getTotalAmount(req.session.user._id)
  console.log(products);
  res.render('user/cart',{products,user:req.session.user,totalPrice});
})

// ADD TO CART

router.get('/add-to-cart/:id',(req,res)=>{
  console.log('api call');
  userHelpers.addToCart(req.params.id,req.session.user._id).then(()=>{
    res.json({status:true})
  })
})

// CHANGE PRODUCT QUANTITY

router.post('/change-product-quantity',(req,res,next)=>{
  console.log(req.body);
  userHelpers.changeProductQuantity(req.body).then(async(response)=>{
    response.total=await userHelpers.getTotalAmount(req.body.user)
    res.json(response);
  })
})

// PLACE ORDER PAGE

router.get('/place-order',verifyLogin,async(req,res)=>{
  let total=await userHelpers.getTotalAmount(req.session.user._id)
  res.render('user/place-order',{total,user:req.session.user})
})


//PLACE ORDER

router.post('/place-order',async(req,res)=>{
  let products=await userHelpers.getCartProductList(req.body.userId)
  let totalPrice=0
  if(products.length>0){
    totalPrice=await userHelpers.getTotalAmount(req.body.userId)
  }
  userHelpers.placeOrder(req.body,products,totalPrice).then((orderId)=>{
    if(req.body['payment-method']==='COD'){
      res.json({codSuccess:true})
    }else{
      userHelpers.generateRazorpay(orderId,totalPrice).then((response)=>{
        res.json(response)
      })
    }
    
  })
  console.log(req.body)
})

// ORDER SUCCESS PAGE

router.get('/order-success',verifyLogin,async(req,res)=>{
  res.render('user/order-success')
})

// USER ORDER

router.get('/my-order',verifyLogin,async(req,res)=>{
  let order=await userHelpers.getOrderList(req.session.user._id)
  console.log('Order detstidjgdjmgdogdkgmdg    ....'+order);
  res.render('user/my-order',{order})
})

// ORDERED PRODUCTS

router.get('/view-order-products/:id',async(req,res)=>{
  let products=await userHelpers.getOrderProducts(req.params.id)
  res.render('user/view-order-products',{products})
})

// PAYMENT

router.post('/verify-payment',(req,res)=>{
  console.log(req.body);
  userHelpers.verifyPayment(req.body).then(()=>{
    userHelpers.changePaymentStatus(req.body['order[receipt]']).then(()=>{
      console.log('Payment succesfull');
      res.json({status:true})
    })
  }).catch((err)=>{
    console.log(err);
    res.json({status:false,err:'payment failed'})
  })
})
module.exports = router;
