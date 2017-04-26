var http = require('http');
var mongoose = require('mongoose');
var express = require('express');
var bodyParser = require('body-parser');
var urlEncodedParser = bodyParser.urlencoded({extended:false});
var app = express();
var productModel = require(__dirname + '/Server/Schemas/productSchema.js') ;
var userModel = require(__dirname + '/Server/Schemas/user.js') ;
var cartModel = require(__dirname + '/Server/Schemas/userCartSchema.js');

app.use(express.static('Client'));

app.use(bodyParser.json());

app.use(function(req,res,next){
    res.setHeader("Access-Control-Allow-Origin","*");
    res.setHeader("Access-Control-Allow-Methods","GET,POST,PUT,DELETE");
    res.setHeader("Access-Control-Allow-Headers","X-Requested-With,content-type");
    res.setHeader("Access-Control-Allow-Credentials",true);
    next();
});

app.get('/',function(req,res){
    res.sendFile(__dirname + '/Client/Views/index.htm');
})

mongoose.Promise = global.Promise;
app.post('/post',urlEncodedParser,function(req,res){

});



// mongoose.connect('mongodb://SMD-0860:27017/kCart');
mongoose.connect('mongodb://SMD-0718:27017/kCart');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  console.log('MONGO: successfully connected to db');
});

app.post('/addProduct',urlEncodedParser,function(req,res){
    console.log('called');
    console.log(req.body);
    productModel.create(req.body);
    res.send("Successfully");
});
app.get('/getProduct',function(req,res){   
 productModel.find(function(resp,product){
     console.log(product);
     return res.send(product);
 })   
});

//*************************************************************************************** */
// Following Code to Update a Product by ID
//*************************************************************************************** */
app.put('/updateProduct',urlEncodedParser,function(req,res){

    productModel.findById(req.body._id,function(err,Product){
        if(err) return res.json({
            success : false,
            message : 'Product Not Found'
        });

        console.log(req.body.name);
        
        Product.ProductName = req.body.ProductName;
        Product.Description = req.body.Description;
        Product.Price = req.body.Price;
       
       

        Product.save(function(err){
            if(err) return res.json({
                success : false,
                message : 'Could not Update the Product'
            });
            return res.json({
                success : true,
                message : 'Product Updated Successfully'
            });
        });
    })
});

//*************************************************************************************** */
// Following Code to Delete a User by ID
//*************************************************************************************** */
app.delete('/deleteproduct',urlEncodedParser,function(req,res){
    productModel.remove({_id:req.params.userID},
    function(err,user){
        if(err) return res.json({
            success : false,
            message : err
        });

        return res.json({
            success : true,
            message : "User Deleted Successfully"
        });
    });
});
//*************************************************************************************** */
app.post('/post',urlEncodedParser,function(req,res){
    console.log(req.body);
    //db.create(req.body);
});

app.post('/addToCart',urlEncodedParser,function(req,res){
    var order = req.body;
        cartModel.findOne({UserName : order.UserName},function(error,cart){

        var subTotal = order.Quantity * order.Price;    
        if(cart.length == 0){
            var createCart = new cartModel({
                    UserName : order.UserName,
                    Products : [{
                        Name : order.ProductName,
                        Quantity : order.Quantity,
                        Price : order.Price,
                        SubTotal : subTotal
                    }],
                    AddedDate : new Date() 
            });
            
            try{         
                cartModel.create(createCart);
                res.send('The product ' + order.ProductName + 'is added successfully to your cart');
            }
            catch(e){
                res.status(400);
            }
            
        }
        else{

            var IsProductPresent = cart.Products.find(function(cartProduct){
                return cartProduct.Name === order.ProductName;
            });
           
            if(IsProductPresent == undefined){

                var cartOrder = { Name : order.ProductName,Quantity : order.Quantity,Price : order.Price,SubTotal : subTotal };
                cart.Products.push(cartOrder);
                    cart.save(function(err){
                        if(err){
                            return res.status(400);
                        }else{
                            return res.send(order.ProductName +  ' is added successfully');
                        }
                    });
            }
            else{
                    IsProductPresent.Price = order.Price;
                    IsProductPresent.Quantity = order.Quantity;
                    IsProductPresent.SubTotal = subTotal;
                    cart.save(function(err){
                        if(err){
                            res.status(400).send();
                        }else{
                            return res.send(order.ProductName +  ' is updated successfully');
                        }
                    });
            }
            }
            
        });
});

app.get('/viewCart/:user',function(req,res){
    var User =  req.params.user;
    
         var Grarndtotal =   cartModel.aggregate([
                { 
                    "$match" : {'UserName' : User}
                },
                {
                    "$project" : {
                            "UserName" : "$UserName",
                            "Products" : "$Products",
                            "grandTotal" : {"$sum" : "$Products.SubTotal"}  
                            }
                }
            ],function(err,result){
                return res.send(result[0]);
            });
            
            //console.log(Grarndtotal);
    
        
})

app.delete('/deleteCartItem/:id',function(req,res){
    
    var OrderId = req.params.id;
    console.log(OrderId);
    try{
        cartModel.update({'UserName' : 'Welcome Rohan'},{
            $pull : { 'Products' : { _id : OrderId } }
        });
    }
    catch(e){
        console.log(e);
    }
    // cartModel.remove({_id : OrderId}, (err)=> {
    //     if(!err){
    //         cartModel.find({UserName : 'Welcome Rohan'} , function(err,orders){
    //             if(!err){
    //                 return res.send(orders);   
    //             }
    //             else{
    //                 return res.send();   
    //             }
    //         })
             
    //     }
    //     console.log('Delete Successfull');
    // })
    
  
})

app.post('/placeOrder',function(req,res){

    
})

//*************************************************************************************** */
// Following Code to Authenticate a new User
//*************************************************************************************** */
app.route('/authenticate').post(function(req,res){
    userModel.findOne({
        username : req.body.username,
        password : req.body.password
    },function(err,user){
        if(err) return res.json({
				success : false,
				message : err
			});

        if(!user)
        {
            return res.json({
				success : false,
				message : 'Authencation failed. User not found.'
			});
        }
        else{
            return res.json({
				success : true,
				message : "User Authenticated Successfully",
                username : user.username
			});
        }
    })
});
//*************************************************************************************** */

//*************************************************************************************** */
// Following Code to Register a new User
//*************************************************************************************** */
app.route('/registerUser').post(function(req,res){    
    var user = new userModel({
        name : req.body.name,
        email : req.body.email,
        username : req.body.username,
        password : req.body.password
    });

    user.save(function(err){
        if(err) return res.json({
            success : false,
            message : 'Could not Create the User'
        });
        return res.json({
            success : true,
            message : 'User Created Successfully'
        });
    });
});
//*************************************************************************************** */

//*************************************************************************************** */
// Following Code to get all Available Users
//*************************************************************************************** */
app.route('/getAllUsers').get(function(req,res){    
    userModel.find(function(err,users){
        if(err) return res.json({
            success : false,
            message : err
        });

        return res.json({
            success : true,
            users : users
        });
    });
});
//*************************************************************************************** */

//*************************************************************************************** */
// Following Code to Delete a User by ID
//*************************************************************************************** */
app.route('/deleteUser/:userID').delete(function(req,res){
    userModel.remove({_id:req.params.userID},
    function(err,user){
        if(err) return res.json({
            success : false,
            message : err
        });

        return res.json({
            success : true,
            message : "User Deleted Successfully"
        });
    });
});
//*************************************************************************************** */

//*************************************************************************************** */
// Following Code to Update a User by ID
//*************************************************************************************** */
app.route('/updateUser/:userID').put(function(req,res){
    console.log(req.params.userID);
    userModel.findById(req.params.userID,function(err,user){
        if(err) return res.json({
            success : false,
            message : 'User Not Found, provided User ID could be wrong'
        });

        console.log(req.body.name);
        
        user.name = req.body.name;
        user.email = req.body.email;
        user.username = req.body.username;
        user.password = req.body.password;

        user.save(function(err){
            if(err) return res.json({
                success : false,
                message : 'Could not Update the User'
            });
            return res.json({
                success : true,
                message : 'User Updated Successfully'
            });
        });
    })
});
//*************************************************************************************** */

//*************************************************************************************** */
// Following Code to Get a User by ID
//*************************************************************************************** */
app.route('/getUserByID/:userID').get(function(req,res){
    userModel.findOne({
        _id : req.params.userID
    },function(err,user){
        if(err) return res.json({
            success : false,
            message : err
        });

        return res.json({
            success : true,
            user : user
        });
    });
});
//*************************************************************************************** */

app.post('/addProduct', urlEncodedParser,  function(req,res){
    
    //console.log(req.body);
    var order = req.body;
    console.log(order);
    productModel.create(req.body);
    //userModel
});

app.put('/updateProduct', function(req, res){
	console.log("Product updated Successfully");
});
app.delete('/deleteProduct/:id', function(req, res){
	console.log("Product Deleted Successfully");
});

app.get('/getProducts',(req,res)=>{
productModel.find( function(error,users){
        return res.send(users);
    })
});

app.get('*', function (req, res) {
    res.sendFile(__dirname + '/Client/Views/index.htm');
});

var server = app.listen(9090, function(){
     var host = server.address().address;
    var port= server.address().port;

    console.log("Example app is listening at http://%s:%s", host,port);
});