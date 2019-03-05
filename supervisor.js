require("dotenv").config();
const inquirer = require("inquirer");
const mysql = require("mysql");
const chalk = require("chalk");
const strpad = require("strpad");
const cTable = require('console.table');
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
    taskMenu();
})


function taskMenu(){
     inquirer.prompt([
         {
             name: "what",
             message: "What would you like to do today?",
             type: "list",
             choices: ["View product sales by department", "Add a new department","Quit"]
         }
     ]).then(function(response){
         if (response.what === "View product sales by department"){
             departmentSales()
         }
         else if (response.what === "Add a new department"){
             newDepartment();
         }
         else if( response.what === "Quit"){
             console.log("Have a good day, Goodbye!")
             connection.end();
         }
     })
}

function departmentSales(){
    connection.query("select department_id, department_name, product_sales, over_head_costs,(product_sales - over_head_costs) total_profit from supervisor group by department_id", 
    function(error,response){
        if (error){
            throw error;
        }
        console.table(response)
        // response.forEach(function(item){
        //     console.log(chalk`\n ID:|{green ${item.department_id}}| Department:| {green ${strpad.right(item.department_name, 15)}}|Product Sales:| {green ${strpad.right(item.product_sales.toString(),5)}}| Overhead:| {green ${strpad.right(item.over_head_costs.toString(), 5)}} |Total Profit:| {green ${strpad.right(item.total_profit.toString(), 5)}}\n`)
        // })
    taskMenu()
    })
}

function newDepartment() {
    inquirer.prompt([
        {
            name:"name",
            message: "What is the name of the department you would like to add?",
            type: "input"
        },
        {
            name: "overhead",
            message: "what are the overhead costs for the department? (do not include $ sign)",
            type:"input"
        }
    ]).then(function(response){
        let name=response.name;
        let overhead = response.overhead;

        connection.query("insert into supervisor (department_name, over_head_costs, product_sales) values ('" + name+"'," + overhead + ", 0)",function(error,response){
            if (error){
                throw error;
            }
          console.log(`You have added the department ${name} with an over-head of ${overhead}`)
          departmentSales();
        })
    })
   
}
