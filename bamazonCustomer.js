require("dotenv").config();
var mysql = require("mysql");
var inquirer = require("inquirer");
var keys = require("./keys.js");
var orders = [];


var connection = mysql.createConnection({
    host:keys.bamazon_db.hst,
    port: keys.bamazon_db.port,
    user: keys.bamazon_db.usr,
    password: keys.bamazon_db.secret,
    database: keys.bamazon_db.db
});


connection.connect(function(err){
    if(err) throw err;
    console.log('connected as id ' + connection.threadId);
    afterConnection();
});

// This function connects to the bamazon database.
function afterConnection (){
    connection.query('SELECT * FROM products', function(err,res){
        if (err) throw err;
        
        displayInventory (res)
        
    });
};

    // This function displays the bamazon products to the terminal.
    function displayInventory (response){
        console.log('-----------------------------------------------');
        console.log('ItemID' +' | '+ 'Product' +'  | '+ 'Department' +'  | '+ 'Price' +' | ' +'Stock'+ '\n')
        for(var i = 0; i < 11; i++){
        var itemId = response[i].item_id;
        var productName = response[i].product_name;
        var departmentName = response[i].department_name;
        var price = response[i].price;
        var stock = '  '+parseInt(response[i].stock_quantity);

        
        console.log(itemId +' | '+ productName +' | '+ departmentName +' | '+ price +' | '+ stock + '\n');
    
        }
        console.log('-----------------------------------------------' + '\n');
        userPrompt ()
    };

        // This function prompts the user for a product id and the number of units desired from the list of products in the bamazon database.
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

        var purchaseID = res.id;
        var unitsOrdered = res.units;

        if(purchaseID === ''){
            console.log('PLEASE INDICATE AN ITEM ID AND/OR UNIT NUMBER BEFORE PROCEEDING.');
            userPrompt();
            
        }
        else if(unitsOrdered === ''){
            console.log('PLEASE INDICATE AN ITEM ID AND/OR UNIT NUMBER BEFORE PROCEEDING.');
            userPrompt();
        }


        else if (purchaseID && unitsOrdered){
        checkingDB(purchaseID, unitsOrdered);
        }

            })
            
        };

// This function checks the database to ensure that the number of products available are consistent with the number of products the customer requires.
function checkingDB (id,units){
                
                connection.query('SELECT * FROM products WHERE item_id=?',[id],
                function(err,res){
                    var itemID = res[0].item_id;
                    var name = res[0].product_name; 
                    var dpName = res[0].department_name;
                    var price = res[0].price;
                    var qty = res[0].stock_quantity;

                    console.log('quantity '+ qty + ' name '+ name)
                    if(qty < units ){
                        
                        choiceToProceed ();
                        
                    }
                    else if(qty > units){
                    qty = qty - units;
                    updatingDB (qty,itemID);
                    processOrder (price, units, name)
                    choiceToProceed ();
                    
                    
                    return 0;
                    }
                    else{
                        console.log("Thank you for shopping Bamazon! Have a good day.");
                        return 0;
                    }

                    if (err) throw err;
                
                
                
                });
};

    // This function updates the database after each customer purchase. Primarily updating the quantity values.
    function updatingDB (newqty,itemId){
                    connection.query("UPDATE products SET ? WHERE ?",
                    [
                        {
                            stock_quantity:newqty
                        },
                        {
                            item_id:itemId
                        }
                    ],
                    function(err, res){
                        if(err) throw err;
                        
                    });
    };

        // This function outputs the order just executed by the customer after responding to the prompts, then pushing the customers order to an array to be stored and calculated on checkout.
        function processOrder (itemPrice, itemQty, itemName){
                                var total = parseFloat(itemPrice) * parseFloat(itemQty);
                                console.log("-------------------------\n");
                                console.log("Order Summary \n");
                                console.log("Item: " + itemName + "\n");
                                console.log("Quantity of items ordered: " + itemQty + "\n");
                                console.log("Price per unit: " + itemPrice + "\n");
                                console.log("Total: $" + total + "\n");
                                console.log("-------------------------");

                                var order = {
                                    item: itemName,
                                    qty: itemQty,
                                    price:itemPrice,
                                    total:total
                                }

                                orders.push(order);
                                

        };

// This function adds choices to the user after asking for items that are no longer in stock.
function choiceToProceed (){
        inquirer.prompt([
            {
                type:'list',
                message:"We do not have this many units in stock. Would you like to continue shopping or head to the register? ",
                name:"choice",
                choices:['Continue ordering', 'EXIT']

            }
        ]).then(function(res){

    if(res.choice === 'Continue ordering'){
        console.log(res.choice);
        userPrompt ();
        
    }else if(res.choice === 'EXIT'){
        totalAllOrders(orders);
        console.log('Thank you for shopping Bamazon. Would that be cash or credit?');
        
        return 0;
    }
        });
};

    // This function adds up all product prices and quantities ordered by the customer and output it. 
    function totalAllOrders(arrOfOrders){
            var len = arrOfOrders.length;
            var totalCost = 0;
            var quantity = 0;


            // console.log('------------');
            for(var j = 0; j < len; j++){
                totalCost = arrOfOrders[j].total + totalCost;
                quantity = parseInt(arrOfOrders[j].qty) + quantity;
            }
            console.log('------------');
            console.log('Order Summary');
            console.log("Total number of units ordered: " + quantity);
            console.log("Total Cost: $" + totalCost);
            console.log('------------');
            
    };






