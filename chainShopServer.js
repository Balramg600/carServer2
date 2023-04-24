let express=require('express');
let app=express();
app.use(express.json());
app.use(function(req, res, next){
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Methods',
        'GET, POST, OPTIONS, PUT, PATCH, DELETE, HEAD'
    );
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});

const {Pool}=require("pg");
const client=new Pool({
    user:"postgres",
    password:"jU9b0FzDHK9A51P3",
    database:"postgres",
    port:5432,
    host:"db.cfdhexebrdpjmzmfwdcg.supabase.co",
    ssl:{rejectUnauthorized:false},
});
client.connect(function(err){
    if(err)throw err;
  });

const port= process.env.PORT || 2411;
app.listen(port, ()=>console.log(`Node app listening on port ${port}!`));

/****************** Changes ******************/

let maxIdShop=0;
let maxIdProducts=0;
let maxIdPurchases=0;
function getIds(){
    let sql1="Select * from shops";
    client.query(sql1, (err, result)=>{
        if(err) console.log(err);
        else{
            maxIdShop=result.rows.length;
        }
    })

    let sql2="Select * from products";
    client.query(sql2, (err, result)=>{
        if(err) console.log(err);
        else{
            maxIdProducts=result.rows.length;
        }
    })

    let sql3="Select * from purchases";
    client.query(sql3, (err, result)=>{
        if(err) console.log(err);
        else{
            maxIdPurchases=result.rows.length;
        }
    })
}    
getIds();
app.get ('/shops', (req, res)=>{
    let sql= 'Select * from shops'
    client.query(sql, (err, result)=>{
        if(err){
            res.status(404).send(err);
            console.log('err shop1')
        }
        else{
            let arr=result.rows;
            arr=arr.map(n=>({shopId:n.shopid, name:n.name, rent:n.rent}))
            res.send(arr);
            console.log('correct');
        }
    });
})

app.post('/shops', (req, res)=>{
    // console.log(maxIdShop)
    maxIdShop+=1;
    let body=req.body;
    let params=[maxIdShop, body.name, body.rent];
    let sql="Insert into shops (shopid, name, rent) values ($1, $2, $3)";
    client.query(sql, params, function(err, result){
        if(err) res.status(404).send(err);
        else {
            let sql2="Select * from shops";
            client.query(sql2, function(err, result){
                if(err) res.status(404).send(err);
                else res.send(result.rows);
            })
        } 
    });
})

/************products**************/
app.get ('/products', (req, res)=>{
    let sql= 'Select * from products'
    client.query(sql, (err, result)=>{
        if(err){
            res.status(404).send(err);
            console.log('err product1')
        }
        else{
            let arr=result.rows;
            arr=arr.map(n=>({productId:n.productid, productName:n.productname, category:n.category, description:n.description}))
            res.send(arr);
            console.log('correct');
        }
    });
})

app.get ('/products/:id', (req, res)=>{
    let id=+req.params.id;
    let sql= 'Select * from products where productid=$1'
    client.query(sql, [id], (err, result)=>{
        if(err){
            res.status(404).send(err);
            console.log('err product1')
        }
        else{
            let arr=result.rows;
            arr=[{productId:arr[0].productid, productName:arr[0].productname, category:arr[0].category, description:arr[0].description}]
            res.send(arr);
            console.log('correct');
        }
    });
})

app.post('/products', (req, res)=>{
    // console.log(maxIdShop)
    maxIdProducts+=1
    let body=req.body;
    let params=[maxIdProducts, body.productName, body.category, body.description];
    let sql="Insert into products (productid, productname, category, description) values ($1, $2, $3, $4)";
    client.query(sql, params, function(err, result){
        if(err) res.status(404).send(err);
        else {
            let sql2="Select * from products";
            client.query(sql2, function(err, result){
                if(err) res.status(404).send(err);
                else res.send(result.rows);
            })
        } 
    });
})

app.put('/products/:id', (req, res)=>{
    let body=req.body;
    let id=+req.params.id;
    let params=[body.productName, body.category, body.description, id];
    let sql="UPDATE products SET  productname=$1, category=$2, description=$3 where productId=$4";
    client.query(sql, params, function(err, result){
        if(err) res.status(404).send(err);
        else {
            let sql2="Select * from products";
            client.query(sql2, function(err, result){
                if(err) res.status(404).send(err);
                else res.send(result.rows.find(n=>n.productid==id));
            })
        } 
    });
});

/****************Purchases***************/
// app.get ('/purchases', (req, res)=>{
//     let {products, shop, sort}=req.query;
//    let sql="Select * from purchases"
//     client.query(sql, (err, result)=>{
//         if(err){
//             res.status(404).send(err);
//             console.log('err purchases1')
//         }
//         else{
//             let purchases=result.rows;
//             let sql2="Select * from shops"
//             client.query(sql2, (err, result2)=>{
//                 if(err){
//                     res.status(404).send(err);
//                     console.log('purchases2');
//                 }
//                 else{
//                     let shops=result2.rows;
//                     let sql3="Select * from products"
//                     client.query(sql3, (err, result3)=>{
//                         if(err){
//                             res.status(404).send(err);
//                             console.log('purchases2');
//                         }
//                         else{
//                             let productArr=result3.rows;
//                             let prodList=products?products.split(','):[];
                            
//                             let prods=productArr.filter(n=>prodList.includes(n.productname));
//                             let prodsIds=prods.map(n=>n.productid)
//                             console.log(prodsIds, prods, prodList);
//                             let shopId=(shops.findIndex(n=>n.name==shop))+1;
//                             if(products)purchases=purchases.filter(n=>prodsIds.includes(n.productid));
//                             if(shop) purchases=purchases.filter(n=>n.shopid==shopId);
//                             if(sort){
//                                 if(sort=='QtyAsc') purchases=purchases.sort((a,b)=>a.quantity-b.quantity);
//                                 else if(sort=='QtyDesc') purchases=purchases.sort((a,b)=>b.quantity-a.quantity);
//                                 else if(sort=='ValueAsc') purchases=purchases.sort((a,b)=>a.quantity*a.price-b.quantity*b.price);
//                                 else if(sort=='ValueDesc') purchases=purchases.sort((a,b)=>b.quantity*b.price-a.quantity*a.price);
//                             }
//                             purchases=purchases.map(n=>({purchaseId:n.purchaseid, shopId:n.shopid, productid:n.productid, quantity:n.quantity, price:n.price}))
//                             res.send(purchases);
//                             console.log('correct');
//                         }
//                     })
//                 }
//             })
//         }
//     });
// })

app.get ('/purchases', (req, res)=>{
    let {products, shop, sort}=req.query;
   let sql="Select * from purchases"
    client.query(sql, (err, result)=>{
        if(err){
            res.status(404).send(err);
            console.log('err purchases1')
        }
        else{
            let prodList=products?products.split(','):[];
            prodsIds=prodList.map(n=>+n.substring(2));
            let shopIds=shop?shop.substring(2):''
            let purchase=result.rows;
            if(products)purchase=purchase.filter(n=>prodsIds.includes(n.productid));
            if(shop) purchase=purchase.filter(n=>n.shopid==shopIds);
            
            if(sort){
                if(sort=='QtyAsc') purchase=purchase.sort((a,b)=>a.quantity-b.quantity);
                else if(sort=='QtyDesc') purchase=purchase.sort((a,b)=>b.quantity-a.quantity);
                else if(sort=='ValueAsc') purchase=purchase.sort((a,b)=>a.quantity*a.price-b.quantity*b.price);
                else if(sort=='ValueDesc') purchase=purchase.sort((a,b)=>b.quantity*b.price-a.quantity*a.price);
            }
            purchase=purchase.map(n=>({purchaseId:n.purchaseid, shopId:n.shopid, productid:n.productid, quantity:n.quantity, price:n.price}))

            res.send(purchase);
        }
    });
})


app.get('/purchases/shops/:id', (req, res)=>{
    sql='Select * from purchases where shopid=$1';
    let id=+req.params.id;
    client.query(sql, [id], (err, result)=>{
        if(err) res.status(404).send(err);
        else{
            let purchases=result.rows;
            purchases=purchases.map(n=>({purchaseId:n.purchaseid, shopId:n.shopid, productid:n.productid, quantity:n.quantity, price:n.price}));
            res.send(purchases);
        }
    })
})

app.get('/purchases/products/:id', (req, res)=>{
    sql='Select * from purchases where productid=$1';
    let id=+req.params.id;
    client.query(sql, [id], (err, result)=>{
        if(err) res.status(404).send(err);
        else{
            let purchases=result.rows;
            purchases=purchases.map(n=>({purchaseId:n.purchaseid, shopId:n.shopid, productid:n.productid, quantity:n.quantity, price:n.price}));
            res.send(purchases);
        }
    });
})

app.get('/totalPurchase/shop/:id', (req, res)=>{
    let id=+req.params.id;
    let sql="Select * from purchases";
    client.query(sql, (err, result)=>{
        if(err) res.status(404).send(err);
        else{
            let purchases=result.rows;
             purchases=purchases.filter(n=>n.shopid==id);
            let pur=[]
            for(let i=1;i<=maxIdProducts;i++){
                let quantity=purchases.reduce((acc, curr)=>curr.productid==i?acc+curr.quantity:acc,0)
                console.log(quantity)
                let x=purchases.find(n=>n.productid==i);
                let price=0;
                if(x) price=x.price;
                let pr={purchaseId:i,shopId:id, productid:i, quantity:quantity, price:price}
                pur.push(pr);
            }
            res.send(pur);
            
        }
    })
})

app.get('/totalPurchase/product/:id', (req, res)=>{
    let id=+req.params.id;
    let sql="Select * from purchases";
    client.query(sql, (err, result)=>{
        if(err) res.status(404).send(err);
        else{
            let purchases=result.rows;
             purchases=purchases.filter(n=>n.productid==id);
            let pur=[]
            for(let i=1;i<=maxIdShop;i++){
                let quantity=purchases.reduce((acc, curr)=>curr.shopid==i?acc+curr.quantity:acc,0)
                console.log(quantity)
                let x=purchases.find(n=>n.shopid==i);
                let price=0;
                if(x) price=x.price;
                let pr={purchaseId:i,shopId:i, productid:id, quantity:quantity, price:price}
                pur.push(pr);
            }
            res.send(pur);
        }
    })
})

app.get('/shops/resetData',(req, res)=>{
    let sql1='Delete From purchases';
    client.query(sql1, (err, result)=>{
        if(err){
            res.status(404).send(err);
            console.log('err1')
        }
        else{
            let sql2='Delete From shops';
            client.query(sql2, (err, result2)=>{
                if(err){
                    res.status(404).send(err);
                    console.log('err2')
                }
                else{
                    let sql3='Delete From products';
                    client.query(sql3, (err, result3)=>{
                        if(err){
                            res.status(404).send(err);
                            console.log('err3')
                        }
                        else{
                            let {allData}=require('./allData.js');
                            let shops=allData.shops;
                            let products=allData.products;
                            let purchases=allData.purchases;
                            let arr1=shops.map(p=>[p.shopId, p.name, p.rent]);
                            let arr2=products.map(p=>[p.productId, p.productName, p.category, p.description]);
                            let arr3=purchases.map(p=>[p.purchaseId, p.shopId ,p.productid, p.quantity, p.price]);

                    
                            for(row of arr1){
                                let sql4=`INSERT INTO shops (shopId, name, rent) VALUES ($1, $2, $3)`;
                                client.query(sql4,row, (err, result)=>{
                                    if(err){
                                        res.status(404).send(err);
                                    }
                                    else{
                                        console.log("done shop")
                                    }
                                })
                            }

                            for(row of arr2){
                                let sql5=`INSERT INTO products (productId, productName, category, description) VALUES ($1, $2, $3, $4)`;
                                client.query(sql5,row, (err, result)=>{
                                    if(err){
                                        res.status(404).send(err);
                                    }
                                    else{
                                        console.log("done product")
                                    }
                                })
                            }
                        
                        
                            async function fetchs(){
                                await console.log("fine")
                            }

                            {for(row of arr3){
                                let sql6=`INSERT INTO purchases (purchaseId, shopId ,productid, quantity, price) VALUES ($1, $2, $3, $4, $5)`;
                                client.query(sql6,row, (err, result)=>{
                                    if(err){
                                        res.status(404).send(err);
                                    }
                                    else{
                                        console.log("done purchase")
                                    }
                                })
                            }}
                    }
                    })
        }
            })

        }
    })
})
