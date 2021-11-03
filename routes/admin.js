const { response } = require('express');
var express = require('express');
const productHelpers = require('../helpers/product-helpers');
const adminHelpers = require('../helpers/admin-helpers');
var router = express.Router();

// const verifyLogin = (req,res,next)=>{
//   if(req.session.admin){
//     next()
//   }else{
//     res.redirect('/login')
//   }
// }

/* GET users listing. */
router.get('/', function (req, res, next) {
  if (req.session.admin) {
    productHelpers.getAllProducts().then((products) => {
      console.log(products);
      res.render('admin/view-products', { admin: true, products });
    })
  } else
    res.render('admin/login', { "loginErr": req.session.adminLoginErr })
    req.session.adminLoginErr = false


});

router.get('/admins',async(req, res) => {
  res.write('Thank U')
  await adminHelpers.addAdmin().then((response) => {
    console.log(response);
    req.session.admin = response
    req.session.admin.loggedIn = true
    res.write('Thank U')
  })
})

router.post('/login', (req, res) => {
  console.log(req.body);
  adminHelpers.adminLogin(req.body).then((response) => {
    if (response.status) {
      req.session.admin = response.admin
      req.session.admin.loggedIn = true
      res.redirect('/admin/')
    } else {
      req.session.adminLoginErr = "Invalid Userrrrname or password"
      res.redirect('/admin')
    }
  })
})

router.get('/add-product', (req, res) => {
  res.render('admin/add-product')
})
router.post('/add-product', (req, res) => {

  productHelpers.addProduct(req.body, (id) => {
    let image = req.files.Image
    image.mv('./public/product-images/' + id + '.jpg', (err) => {
      if (!err) {
        res.render('admin/add-product')
      } else {
        console.log(err);
      }
    })

  })

})
router.get('/delete-product/', (req, res) => {

  let proId = req.query.id
  console.log(proId);
  productHelpers.deleteProduct(proId).then((response) => {
    res.redirect('/admin/')
  })
})

router.get('/edit-product/:id', async (req, res) => {
  let product = await productHelpers.getProductDetails(req.params.id)
  console.log(product);
  res.render('admin/edit-product', { product });
})

router.post('/edit-product/:id', (req, res) => {


  productHelpers.updateProduct(req.params.id, req.body).then(() => {
    res.redirect('/admin')
    if (req.files.Image) {
      let image = req.files.Image
      image.mv('./public/product-images/' + req.params.id + '.jpg')
    }
  })
})




module.exports = router;
