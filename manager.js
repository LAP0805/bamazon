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
    console.log(`\n connected as id: ${connection.threadId} \n`);
    taskMenu();
})


function taskMenu(){
    inquirer.prompt([
        {
            name: "what",
            message: "What would you like to do today?",
            type: "list",
            choices: ["View products for sale", "View low inventory", "Add to inventory", "Add new product", "Quit"]
        }
    ]).then(function(response){
        if(response.what === "View products for sale"){
            showProducts();
        }
        else if(response.what === "View low inventory"){
            lowInventory();
        }
        else if(response.what === "Add to inventory"){
            addInventory();
        }
        else if(response.what === "Add new product"){
            addProduct();
        }
        else if(response.what === "Quit"){
            console.log("Thank you, Goodbye!")
            connection.end();
        }

    })
}

function showProducts(){
    connection.query("select * from products", function(error,response){
       if(error) {
           throw error;
       }
     console.log(strpad.right('-', 63, '-'));
     response.forEach(function(item){
         console.log(chalk
             `{green ${strpad.right(item.product_name, 20)}} | ID: {green ${strpad.right(item.item_id.toString(), 2)}} | $ {green ${strpad.right(item.price.toString(), 5)}} | {green ${strpad.right(item.department_name, 12)}} | InStock: {green ${item.stock_quantity}}
`)
            
     })
    taskMenu()
    })

}

function lowInventory(){
    connection.query(" select * from products where stock_quantity < 5", function(error, response){
        if (error){
            throw error
        }
        console.log(`\n Items with low inventory:`)
        if (!response[0]){
            console.log(`All items are sufficiently stocked!\n`)
        }
        else{
      response.forEach(function(item){
              console.log(chalk
                `\n{green ${strpad.right(item.product_name, 20)}} | ID: {green ${strpad.right(item.item_id.toString(), 2)}} | $ {green ${strpad.right(item.price.toString(), 5)}} | {green ${strpad.right(item.department_name, 12)}} | InStock: {green ${item.stock_quantity}}\n`)
      })
    }
      taskMenu();
    })
}

function addInventory(){
        inquirer.prompt([
            {
                name: "whichProduct",
                message: "What is the ID of the product you would like to stock?",
                type: "input",
                validate: function(input){
                    if(isNaN(input)){
                        return false
                    }
                    else{
                        return true
                    }
                }
            },
            {
                name:"howMany",
                message: "How many units would you like to add?",
                type: "input",
                validate: function(input){
                    if(isNaN(input)){
                        return false
                    }
                    else{
                        return true;
                    }
                }
            }
        ]).then(function(response){
            let item = response.whichProduct;
            let howMany= response.howMany;
            connection.query("update products set stock_quantity =(stock_quantity +" + howMany +" ) where item_id =" + item, function(error, response){
                if (error) {
                    throw error;
                }
                
                showProducts()
            })
        })
}

function addProduct(){
    inquirer.prompt([
        {
            name: "name",
            message: "Enter product name:",
            type:"input"
        },
        {
            name: "price",
            message: "Enter product price (do not include dollar sign):",
            type: "input"
        },
        {
            name: "department",
            message: "Enter product department:",
            type:"input"
        },
        {
            name: "inStock",
            message: "Enter number of items in stock",
            type: "input"
        }
    ]).then(function(response){
        let name = response.name;
        let price = response.price;
        let department = response.department;
        let inStock = response.inStock;
        connection.query("insert into products (product_name, price, department_name, stock_quantity) values ('" + name + "','" + price + "','" + department + "','" + inStock + "')", function(error, response){
            if(error) {
                throw error;
            }
            console.log(response);
            showProducts();
        })
    })
}