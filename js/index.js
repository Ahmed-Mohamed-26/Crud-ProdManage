var productName = document.getElementById("ProductName");
var productPrice = document.getElementById("ProductPrice");
var productType = document.getElementById("ProductType");
var productDesc = document.getElementById("ProductDesc");
var productQuantity = document.getElementById("ProductQuantity");
var mainBtn = document.getElementById("mainBtn");
var salesSummary = document.getElementById("salesSummary");
var returnContainer = JSON.parse(localStorage.getItem("returns")) || [];
var productContainer = JSON.parse(localStorage.getItem('products')) || [];

if (productContainer.length !== 0) {
displayProducts(productContainer);
}

if (returnContainer.length !== 0) {
displayReturnSummary();
}
//////////////////////////////////////code Product List////////////////////////////////////////////////
// Filter the product names based on the selected product type
function filterPhoneModels() {
    const type = productType.value;
    if (type === 'iphone') {
        productName.innerHTML = `<option value="">Select iPhone Model</option>
            <option value="iPhone 14">iPhone 14</option>
            <option value="iPhone 13">iPhone 13</option>
            <option value="iPhone 12">iPhone 12</option>
            <option value="iPhone 11">iPhone 11</option>`;
    } else if (type === 'samsung') {
        productName.innerHTML = `<option value="">Select Samsung Model</option>
            <option value="Samsung Galaxy S23">Samsung Galaxy S23</option>
            <option value="Samsung Galaxy S22">Samsung Galaxy S22</option>`;
    } else {
        productName.innerHTML = `<option value="">Select Product</option>`;
    }
}
// Add product to the list
function addProduct() {
    if (!productName.value || !productType.value || !productPrice.value || !productQuantity.value) {
        alert("Please fill all fields!");
        return;
    }

    var product = {
        proName: productName.value,
        proPrice: parseFloat(productPrice.value),
        proType: productType.value,
        proDesc: productDesc.value,
        quantity: parseInt(productQuantity.value),
        totalSales: 0
    };
    productContainer.push(product);
    localStorage.setItem("products", JSON.stringify(productContainer));
    displayProducts(productContainer);
    clearForm();
}
// Display products in the main table
function displayProducts(productList) {
    let cartona = ``;
    for (let i = 0; i < productList.length; i++) {
        cartona += `<tr>
            <td>${i + 1}</td>
            <td>${productList[i].proName}</td>
            <td>${productList[i].proPrice} EGP</td>
            <td>${productList[i].proType}</td>
            <td>${productList[i].proDesc}</td>
            <td>${productList[i].quantity}</td>
            <td>
                <button class="btn btn-success" onclick="payProduct(${i})">Pay</button>
                <button class="btn btn-warning" onclick="updateProduct(${i})">Update</button>
                <button class="btn btn-danger" onclick="deleteProduct(${i})">Delete</button>
            </td>
        </tr>`;
    }
    document.getElementById("tableRow").innerHTML = cartona;
    updateSalesSummary();
}
//edit product details
function updateProduct(index) {
    let product = productContainer[index];
    productType.value = product.proType;
    filterPhoneModels();
    productName.value = product.proName;
    productPrice.value = product.proPrice;
    productDesc.value = product.proDesc;
    productQuantity.value = product.quantity;

    mainBtn.innerHTML = "Update Product";
    mainBtn.onclick = function() {
        updateProductDetails(index);
    };
}
// Update product details
function updateProductDetails(index) {
    if (!productName.value || !productType.value || !productPrice.value || !productQuantity.value) {
        alert("Please fill all fields!");
        return;
    }
    productContainer[index].proName = productName.value;
    productContainer[index].proPrice = parseFloat(productPrice.value);
    productContainer[index].proType = productType.value;
    productContainer[index].proDesc = productDesc.value;
    productContainer[index].quantity = parseInt(productQuantity.value);

    localStorage.setItem("products", JSON.stringify(productContainer));
    displayProducts(productContainer);
    clearForm();
    mainBtn.innerHTML = "Add Product";
    mainBtn.onclick = addProduct;
}
// Mark product as paid and decrease quantity
function payProduct(index) {
    let product = productContainer[index];
    let quantitySold = parseInt(prompt("Enter quantity sold:"));
    if (quantitySold <= product.quantity) {
        product.quantity -= quantitySold;
        product.totalSales += product.proPrice * quantitySold;
        localStorage.setItem("products", JSON.stringify(productContainer));
        displayProducts(productContainer);
        updateSalesSummary();
    } else {
        alert("Not enough stock available!");
    }
}
// Delete product from the main table
function deleteProduct(proNumber) {
    productContainer.splice(proNumber, 1);
    localStorage.setItem("products", JSON.stringify(productContainer));
    displayProducts(productContainer);
}
//////////////////////////////////////////////////////////////////code Total Sales////////////////////////////////

// Update total sales summary
function updateSalesSummary() {
    let summary = '';
    let totalSales = 0;
    let totalQuantity = 0;
    for (let i = 0; i < productContainer.length; i++) {
        if (productContainer[i].totalSales > 0) {
            let quantitySold = Math.floor(productContainer[i].totalSales / productContainer[i].proPrice);
            summary += `<tr>
                <td>${productContainer[i].proName}</td>
                <td>${quantitySold}</td>
                <td>${productContainer[i].totalSales} EGP</td>
               <td> <button class="btn btn-secondary" onclick="returnFromSales(${i})">Return</button></td>
            </tr>`;
            totalSales += productContainer[i].totalSales;
            totalQuantity += quantitySold;
        }
    }

    summary += `<tr>
        <td colspan="2">Total Sales:</td>
        <td>${totalSales} EGP</td>
    </tr>`;
    salesSummary.innerHTML = summary;
}
// Handle return from sales only (doesn't affect Product List stock)
function returnFromSales(index) {
    let product = productContainer[index];
    let quantityReturned = prompt("Enter quantity to return:");
    
    if (quantityReturned === null || quantityReturned.trim() === "") {
        return; 
    }

    quantityReturned = parseInt(quantityReturned);

    let returnReason = prompt("Enter reason for return (Leave empty if none):");

    let quantitySold = Math.floor(product.totalSales / product.proPrice);

    if (isNaN(quantityReturned) || quantityReturned <= 0 || quantityReturned > quantitySold) {
        alert("Invalid quantity to return!");
        return;
    }

    product.totalSales -= product.proPrice * quantityReturned;

    let returnRecord = {
        proName: product.proName,
        proPrice: product.proPrice,
        quantityReturned: quantityReturned,
        totalReturnValue: product.proPrice * quantityReturned,
        returnReason: returnReason && returnReason.trim() !== "" ? returnReason : "No reason provided",
        returnDate: new Date().toLocaleDateString()
    };

    returnContainer.push(returnRecord);

    localStorage.setItem("products", JSON.stringify(productContainer));
    localStorage.setItem("returns", JSON.stringify(returnContainer));

    updateSalesSummary();
    displayReturnSummary();
}

//////////////////////////////////////////////////////////////////code Returned Products////////////////////////////////
// Display return summary (returned products)
function displayReturnSummary() {
    let returnTable = ``;
    for (let i = 0; i < returnContainer.length; i++) {
        returnTable += `<tr>
            <td>${returnContainer[i].proName}</td>
            <td>${returnContainer[i].quantityReturned}</td>
            <td>${returnContainer[i].totalReturnValue} EGP</td>
            <td>${returnContainer[i].returnReason}</td>
            <td>
                <button class="btn btn-primary" onclick="addReturnToMain(${i})">Add</button>
                <button class="btn btn-danger" onclick="deleteReturn(${i})">Delete</button>
            </td>
        </tr>`;
    }
    document.getElementById("returnSummary").innerHTML = returnTable;
}

// Add return to main product table (this button won't affect the quantity of products directly)
function addReturnToMain(index) {
    let returnRecord = returnContainer[index];
    let product = productContainer.find(p => p.proName === returnRecord.proName);

    if (product) {
        product.quantity += returnRecord.quantityReturned;
        // product.totalSales -= returnRecord.totalReturnValue;

        localStorage.setItem("products", JSON.stringify(productContainer));
        displayProducts(productContainer);
        updateSalesSummary();
    }

    returnContainer.splice(index, 1);
    localStorage.setItem("returns", JSON.stringify(returnContainer));
    displayReturnSummary();
}

// Delete return record from the return table
function deleteReturn(index) {
    returnContainer.splice(index, 1);
    localStorage.setItem("returns", JSON.stringify(returnContainer));
    displayReturnSummary();
}

// Clear the input fields
function clearForm() {
    productName.value = '';
    productPrice.value = '';
    productType.value = '';
    productDesc.value = '';
    productQuantity.value = '';
}


