var mysql = require("mysql");
var inquirer = require("inquirer");
var keys = require("./keys.js");

var connection = mysql.createConnection({
    host:'localhost',
    port:3306,
    user:'root',
    password:"010010110Up",
    database:'bamazon'
});
console.log(keys.bamazon_db.secret)
connection.connect(function(err){
    if(err) throw err;
    console.log('connected as id ' + connection.threadId);
    afterConnection();
});

function afterConnection (){
    connection.query('SELECT * FROM products', function(err,res){
        if (err) throw err;
        // console.log(res);
        displayInventory (res)
        connection.end();
    });
};


function displayInventory (response){
    console.log('-----------------------------------------------');
    console.log('ItemID' +' | '+ 'Product' +'  | '+ 'Department' +'  | '+ 'Price' +' | ' +'Stock'+ '\n')
    for(var i = 0; i < 11; i++){
    var itemId = response[i].item_id;
    var productName = response[i].product_name;
    var departmentName = response[i].department_name;
    var price = response[i].price;
    structorNumInGrid (price);
    var stock = '  '+parseInt(response[i].stock_quantity);

    
    console.log(itemId +' | '+ productName +' | '+ departmentName +' | '+ price +' | '+ stock + '\n');
   
    }
    console.log('-----------------------------------------------' + '\n');
    userPrompt ()
};

function structorNumInGrid (num){
    if (num < 9){
num + "       "

    }

}

function userPrompt (){
    inquirer.prompt([
        {
            message:"What is the item ID for the product you would like to purchase?",
            name:"id"

        },
        {
            message:"How many units would you like?",
            name:"units"
        }
    ]).then(function(res){

var purchases = res.purchases;
var unitsOrdered = res.units;

    })
};

