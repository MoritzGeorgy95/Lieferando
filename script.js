/***
 * Lieferando Project
 *2022
 *Developer Akademie
 *
 ***/

//script variables
let emptyBasket = getElement("empty-basket");
let basket = getElement("product-basket-container");
let sumContainer = getElement("sum-container");
let productContainer = getElement("product-container");

/** 
Layout functions (change css or render templates) 
**/

//close Overlay and Restaurant Info
function closeOverlay() {
  let overlay = getElement("overlay");
  overlay.classList.add("d-none");
}

//show Overlay and Restaurant Info
function showOverlay() {
  let overlay = getElement("overlay");
  overlay.classList.remove("d-none");
}

// fill like icon with red color
function fillHeart() {
  let heart = getElement("heart");
  if (heart.classList.contains("red")) {
    heart.classList.remove("red");
  } else {
    heart.classList.add("red");
  }
}

//include templates

async function includeHTML() {
  let includeElements = document.querySelectorAll("[w3-include-html]");
  for (let i = 0; i < includeElements.length; i++) {
    const element = includeElements[i];
    file = element.getAttribute("w3-include-html"); // "includes/header.html"
    let resp = await fetch(file);
    if (resp.ok) {
      element.innerHTML = await resp.text();
    } else {
      element.innerHTML = "Page not found";
    }
  }
}

//responsive shopping basket

let open = false;

function showHideShoppingBasket() {
  let basket = getElement("content-right");
  if (!open) {
    basket.classList.remove("d-none-regular");
    open = true;
  } else {
    basket.classList.add("d-none-regular");
    open = false;
  }
}

//go up button

function showGoUpButton() {
  let button = getElement("goUp");
  if (scrollY == 0) {
    button.classList.add("d-none");
  } else {
    button.classList.remove("d-none");
  }
}

/**
 helper functions for shopping basket rendering
**/

//get Element helper function
function getElement(element) {
  return document.getElementById(element);
}

// set up local storage
function setLocalStorage() {
  let quantity_array = [];
  let dishes_array = [];
  let prices_array = [];
  localStorage.setItem("quantities", JSON.stringify(quantity_array));
  localStorage.setItem("dishes", JSON.stringify(dishes_array));
  localStorage.setItem("prices", JSON.stringify(prices_array));
}

//get elements from local storage
function getDishes() {
  return JSON.parse(localStorage.getItem("dishes"));
}
function getPrices() {
  return JSON.parse(localStorage.getItem("prices"));
}
function getQuantities() {
  return JSON.parse(localStorage.getItem("quantities"));
}
//update local storage
function updateDishes(dishes) {
  localStorage.removeItem("dishes");
  localStorage.setItem("dishes", JSON.stringify(dishes));
}

function updatePrices(prices) {
  localStorage.removeItem("prices");
  localStorage.setItem("prices", JSON.stringify(prices));
}

function updateQuantities(quantities) {
  localStorage.removeItem("quantities");
  localStorage.setItem("quantities", JSON.stringify(quantities));
}

/* Main Functions */

//onload
function init() {
  renderProducts(pizzas, 0);
  renderProducts(pastas, 1);
  renderProducts(desserts, 2);
  renderProducts(beverages, 3);
  renderShoppingBasket();
}

//render all available products from json
function renderProducts(array, index) {
  productContainer.innerHTML += `<div class="category shadow" id="${categories[index]}"><h3>${categories[index]}</h3></div>`;
  for (let i = 0; i < array.length; i++) {
    productContainer.innerHTML += /*html*/ `
          <div class="product flex-column shadow">
              <h3>${array[i].name}</h3>    
              <p class="description">${array[i].description}</p>
              <p class="orange"><b>${array[i].price} €</b</p>
              <i class="bi bi-plus-lg" onclick="addProduct('${encodeURIComponent(
                JSON.stringify(array)
              )}', ${i})"></i>
          </div>`;
  }
}

// render shopping basket
function renderShoppingBasket() {
  // load prodcuts from local storage
  if (localStorage.length > 0) {
    emptyBasket.innerHTML = "";
    emptyBasket.innerHTML += /*html*/ `<h3 class="text-center shadow">Warenkorb</h3>`;
    basket.innerHTML = "";
    let dishes = getDishes();
    let prices = getPrices();
    let quantities = getQuantities();
    for (let i = 0; i < dishes.length; i++) {
      basket.innerHTML += /*html*/ `
        <div class="basket-item flex-row">
            <div class="flex-column-start">
              <div class="flex-row-standard">
                  <div class="quantity">${quantities[i]}X</div>
                  <div class="dish"> ${dishes[i]}</div>
              </div>
              <div class="flex-row-standard plus-container">
                <i class="bi bi-plus-circle-fill" onclick="incrementQuantity(${i})"></i>
                <i class="bi bi-dash-circle-fill" onclick="decrementQuantity(${i})"></i>
                <img src="images/icons/trashbin.png" onclick="deleteItem(${i})">
              </div>
            </div>
          
            <div class="flex-row-start">
                <div class="description price">${(
                  prices[i] * quantities[i]
                ).toFixed(2)} €</div>
            </div>
        </div>
    `;
    }
    renderSum();
  } else {
    basket.innerHTML = "";
    sumContainer.innerHTML = "";
    emptyBasket.innerHTML = "";
    emptyBasket.innerHTML += /*html*/ `<h3 class="text-center shadow">Warenkorb</h3>
    <div class="shopping-basket-container flex-column-standard">
        <img src="images/icons/shopping-basket.png">
        <p class="text-center description">Wähle leckere Gerichte aus der Karte und bestelle dein Menü</p>
    </div>`;
  }
}

// Render final sum in shopping basket
function renderSum() {
  let prices = getPrices();
  let quantities = getQuantities();
  for (let i = 0; i < prices.length; i++) {
    prices[i] = prices[i] * quantities[i];
  }
  let sum = +prices.reduce((a, b) => a + b, 0).toFixed(2);
  let finalSum = (sum + 4.5).toFixed(2);
  sumContainer.innerHTML = "";
  sumContainer.innerHTML += /*html*/ `
    <div class="flex-column-standard"> 
      <div class="sum-item flex-row">
        <p>Zwischensumme:</p>
        <p>${sum} €</p>
      </div>
      <div class="sum-item flex-row">
        <p>Lieferkosten</p>
        <p>4.50 €</p>
      </div>
      <div class="sum-item flex-row">
        <p>Gesamt:</p>
        <p id="final-sum">${finalSum} €</p>
      </div>
      <button onclick="location.href='success.html'; storeFinalSum()">Bestellen (${finalSum} €)</button>
    </div>
  `;
}

//add product to shopping basket
function addProduct(array, index) {
  //convert parameter
  array = JSON.parse(decodeURIComponent(array));
  //update local storage
  if (localStorage.length > 0) {
    //add dish names
    let dishes = getDishes();
    if (dishes.includes(array[index].name)) {
      let dishes = getDishes();
      let position = dishes.indexOf(array[index].name);
      incrementQuantity(position);
    } else {
      dishes.push(array[index].name);
      updateDishes(dishes);
      //add corresponding prices
      let prices = getPrices();
      prices.push(array[index].price);
      updatePrices(prices);
      //add quantity
      let quantity = getQuantities();
      quantity.push(1);
      updateQuantities(quantity);
      //render basket again
      renderShoppingBasket();
    }
  } else {
    setLocalStorage();
    let prices = getPrices();
    prices.push(array[index].price);
    updatePrices(prices);
    let dishes = getDishes();
    dishes.push(array[index].name);
    updateDishes(dishes);
    let quantity = getQuantities();
    quantity.push(1);
    updateQuantities(quantity);
    //add dish names
    renderShoppingBasket();
  }
}

//change quantities or delete item functions

//add 1
function incrementQuantity(i) {
  let quantity = getQuantities();
  quantity[i] = quantity[i] + 1;
  updateQuantities(quantity);
  renderShoppingBasket();
}

//remove 1
function decrementQuantity(i) {
  let quantity = getQuantities();
  if (quantity[i] == 1) {
    deleteItem(i);
  } else {
    quantity[i] = quantity[i] - 1;
    updateQuantities(quantity);
    renderShoppingBasket();
  }
}

// delete Item from shopping basket
function deleteItem(i) {
  let dishes = getDishes();
  let prices = getPrices();
  let quantities = getQuantities();
  if (dishes.length == 1) {
    localStorage.clear();
    renderShoppingBasket();
  } else {
    quantities.splice(i, 1);
    dishes.splice(i, 1);
    prices.splice(i, 1);

    updateDishes(dishes);
    updatePrices(prices);
    updateQuantities(quantities);

    renderShoppingBasket();
  }
}

/* Purchase Logic for successful purchase
 */

// render purchase Details

function renderPurchaseDetails() {
  let animation = getElement("animation-container");
  let confirmation = getElement("confirmation-container");
  setTimeout(function () {
    animation.classList.add("d-none");
    confirmation.classList.remove("d-none");
    getElement("Bestellwert").innerHTML = localStorage.getItem("Bestellwert");
  }, 6000);
}

//store final sum after purchase button is clicked

function storeFinalSum() {
  let finalSum = getElement("final-sum").innerHTML;
  localStorage.setItem("Bestellwert", finalSum);
}
