require("dotenv").config();
const inquirer = require("inquirer");
const mysql = require("mysql");
const chalk = require("chalk");
const strpad = require("strpad");
const connection = mysql.createConnection({
    host: process.env.host,
    port: process.env.port,
    user: process.env.user,
    password: process.env.password,
    database: process.env.database
});

connection.connect(function(error){
    if (error){
        throw error;    
    }
    console.log(`connected as id: ${connection.threadId}`);
    showProducts();
})

function showProducts(){
    connection.query("select * from products", function(error,response){
       if(error) {
           throw error;
       }
       console.log(
           `\n Hello! Welcome to Bamazon! \n\n 
     Here are our products available for sale: `);
     console.log(strpad.right('-', 63, '-'));
     response.forEach(function(item){
         console.log(chalk
             `{green ${strpad.right(item.product_name, 20)}} | ID: {green ${strpad.right(item.item_id.toString(), 2)}} | $ {green ${strpad.right(item.price.toString(), 5)}} | {green ${strpad.right(item.department_name, 12)}} | InStock: {green ${item.stock_quantity}}
`)
            
     })
    placeOrder();
    })

}


function placeOrder(){
    inquirer.prompt([
        {
            name: "engage",
            message: "Would you like to make a purchase today?",
            type: "confirm"
    
        }
    ])
    .then(function(response){
        if (response.engage){
            inquirer.prompt([
                {
                    name:"ID",
                    message: "What is the ID of the item you would like to purchase?",
                    type: "input",
                    validate: function(input){
                        if (isNaN(input)){
                                return false
                        }
                        else {
                            return true
                        }
        
                    }
                },
                {
                    name: "howMany",
                    message:"How many would you like to purchase?",
                    validate: function(input){
                        if (isNaN(input)){
                            return false
                    }
                    else{
                        return true
                    }
                    }
                }
            ]).then(function(response){
                let itemID= response.ID;
                let amount = response.howMany;
                connection.query("select * from products where item_id="+ itemID, function(error,response){
                    if(error){
                        throw error;
                    }
                    if(amount > response[0].stock_quantity){
                        console.log(`Sorry, we only have ${response[0].stock_quantity} items in stock, please reduce your order.`)
                        placeOrder();
                    }
                    else{connection.query("update products set stock_quantity =(stock_quantity -" + amount + ") where item_id =" + itemID, function(error,response){
                            if (error) throw error;
                            connection.query("update products set items_sold =(items_sold +" + amount + ") where item_id =" + itemID, function(error,response){
                                if (error) throw error;
                                connection.query(" update supervisor set product_sales = (select sum(products.items_sold * products.price) from products where products.department_name = supervisor.department_name) where department_name = department_name;", function(error,response){
                                    if (error) throw error;
                                    
                            }) 
                        }) 
                    })
                   
               
                    console.log(`\n Congrats! you bought ${amount} x ${response[0].product_name}`)
                    console.log(chalk
                        `\n Total Cost: $ {green ${amount * response[0].price}}\n`)
                      inquirer.prompt([
                          {
                              name:"another",
                              message: "Would you like to purchase another item?",
                              type:"confirm"
                          }
                      ]).then(function(response){
                          if(response.another){
                              showProducts();
                          }
                          else{
                              console.log("Ok, have a great day, Goodbye!");
                              connection.end();
                          }
                      })
                    }
                })
            })
        }
        else{
             console.log("Ok, have a great day, Goodbye!")
             connection.end();
        }
    })
   
    
}


