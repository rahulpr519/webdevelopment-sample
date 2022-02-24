var express = require("express");
const productHelpers = require("../helpers/product-helpers");
const adminHelpers = require("../helpers/admin-helpers");
var router = express.Router();


//VERIFY ADMIN LOGIN

const verifyLogin = (req,res,next)=>{
  if(req.session.admin){
    next()
  }else{
    res.redirect('/admin')
  }
}

// GET PRODUCT LIST

router.get("/", function (req, res, next) {
  if (req.session.admin) {
    productHelpers.getAllProducts().then((products) => {
      res.render("admin/view-products", { admin: true, products });
    });
  } else {
      res.render("admin/login", { loginErr: req.session.adminLoginErr });
      req.session.adminLoginErr = false;
}
});

/* For adding admin testing */

// router.get("/admins", async (req, res) => {
//   let adminData = { email: "admin@gmail.com", password: "123456" }
//   await adminHelpers.addAdmin(adminData).then((response) => {
//     console.log(response);
//     req.session.admin = response;
//     req.session.admin.loggedIn = true;
//     res.send("Thank U");
//   });
// });

// router.get('/login',(req,res)=>{
//   res.render("admin/login")
// })

// ADMIN LOGIN

router.post("/login", (req, res) => {
  adminHelpers.adminLogin(req.body).then((response) => {
    if (response.status) {
      req.session.admin = response.admin;
      req.session.admin.loggedIn = true;
      res.redirect("/admin");
    } else {
      req.session.adminLoginErr = "Invalid Userrrrname or password";
      res.redirect("/admin");
    }
  });
});

// PAGE FOR ADD PRODUCTS

router.get("/add-product",verifyLogin,async (req, res) => {
  let categories = await productHelpers.getCategories();
  res.render("admin/add-product", { categories });
});

// ADD PRODUCT && ADD CATEGORY

const addProductCategory=(req,res)=>{
  productHelpers.addProduct(req.body, (id) => {
    let image = req.files.Image;
    image.mv("./public/product-images/" + id + ".jpg", (err) => {
      if (!err) {
        res.redirect("/admin/add-product");
      } else {
        console.log(err);
      }
    });
  });
}

router.post("/add-product", async (req, res) => {
  let categories = await productHelpers.getCategories();
  let Ctgry = categories.find(({ category }) => category == req.body.Category);
//   if (Ctgry) {
//     addProductCategory(req,res)
//   } else {
//     productHelpers.addNewCategory(req.body.Category).then((response) => {
//       if (response) {
//         addProductCategory(req,res)
//       }
//     }).catch((err)=>{
//       console.log(err);
//     })
//   }

// SAME STATEMENT USING TERNORY OPERATOR

    !Ctgry ?  await productHelpers.addNewCategory(req.body.Category)
      .catch((err)=>console.log(err))
       : addProductCategory(req,res)
       res.redirect('/admin/add-product')
});


// DELETE PRODUCT

router.get("/delete-product/",verifyLogin, (req, res) => {
  let proId = req.query.id;
  productHelpers.deleteProduct(proId).then((response) => {
    res.redirect("/admin/");
  });
});

// EDIT PRODUCT PAGE

router.get("/edit-product/:id",verifyLogin, async (req, res) => {
  let product = await productHelpers.getProductDetails(req.params.id);
  res.render("admin/edit-product", { product });
});

//EDIT PRODUCT

router.post("/edit-product/:id", (req, res) => {
  productHelpers.updateProduct(req.params.id, req.body).then(() => {
    res.redirect("/admin");
    if (req.files.Image) {
      let image = req.files.Image;
      image.mv("./public/product-images/" + req.params.id + ".jpg");
    }
  });
});

module.exports = router;
