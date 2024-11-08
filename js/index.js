var productName = document.getElementById("ProductName");
var productPrice = document.getElementById("ProductPrice");
var productType = document.getElementById("ProductType");
var productDesc = document.getElementById("ProductDesc");
var productQuantity = document.getElementById("ProductQuantity");
var mainBtn = document.getElementById("mainBtn");
var salesSummary = document.getElementById("salesSummary");
var returnContainer = JSON.parse(localStorage.getItem("returns")) || [];
var productContainer = JSON.parse(localStorage.getItem('products')) || [];

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
                <button class="btn btn-secondary" onclick="returnProduct(${i})">Return</button>
            </td>
        </tr>`;
    }
    document.getElementById("tableRow").innerHTML = cartona;
    updateSalesSummary();
}

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

// Handle product return
function returnProduct(index) {
    let product = productContainer[index];
    let quantityReturned = parseInt(prompt("Enter quantity to return:"));
    let returnReason = prompt("Enter reason for return (Leave empty if none):");

    if (quantityReturned <= 0 || quantityReturned > product.quantity) {
        alert("Invalid quantity to return!");
        return;
    }

    if (returnReason) {
        // If there's a reason, record the return but don't modify the stock in the product list
        addReturnRecord(product, quantityReturned, returnReason);
        
        // Do not change the quantity in product list if there's a reason
        product.quantity = product.quantity;
    } else {
        // If there's no reason, return the quantity to stock and adjust total sales
        product.quantity += quantityReturned;
        product.totalSales -= product.proPrice * quantityReturned;
    }

    localStorage.setItem("products", JSON.stringify(productContainer));
    displayProducts(productContainer);
    updateSalesSummary();
}

// Add return record to the return table
function addReturnRecord(product, quantityReturned, reason) {
    let returnRecord = {
        proName: product.proName,
        proPrice: product.proPrice,
        quantityReturned: quantityReturned,
        totalReturnValue: product.proPrice * quantityReturned,
        returnReason: reason,
        returnDate: new Date().toLocaleDateString()
    };

    returnContainer.push(returnRecord);
    localStorage.setItem("returns", JSON.stringify(returnContainer));
    displayReturnSummary();
}

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
        product.totalSales -= returnRecord.totalReturnValue;

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

// Delete product from the main table
function deleteProduct(proNumber) {
    productContainer.splice(proNumber, 1);
    localStorage.setItem("products", JSON.stringify(productContainer));
    displayProducts(productContainer);
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

// Clear the input fields
function clearForm() {
    productName.value = '';
    productPrice.value = '';
    productType.value = '';
    productDesc.value = '';
    productQuantity.value = '';
}

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
