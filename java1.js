//To add more shipping costs, just add additional elements to the SHIPPING 
// array. For example, if I wanted 4 items to ship for 5.99 as well, but 
// 6 or more to ship for 6.99, I would change the following:
// var SHIPPING = [
//     3.00,   //1 item
//     4.99,   //2 items
//     5.99,   //3 items
//     5.99,   //4 items
//     6.99,   //5+ items
// ];
var SHIPPING = [
    4.99,   //1 item
    4.99,   //2 items
    5.99,   //3 items
    6.99,   //4+ items
];

if (document.readyState == 'loading') {
    document.addEventListener('DOMContentLoaded', ready)
} else {
    ready()
}

function ready() {
    var removeCartItemButtons = document.getElementsByClassName('btn-danger')
    for (var i = 0; i < removeCartItemButtons.length; i++) {
        var button = removeCartItemButtons[i]
        button.addEventListener('click', removeCartItem)
    }

    var quantityInputs = document.getElementsByClassName('cart-quantity-input')
    for (var i = 0; i < quantityInputs.length; i++) {
        var input = quantityInputs[i]
        input.addEventListener('change', quantityChanged)
    }

    var addToCartButtons = document.getElementsByClassName('shop-item-button')
    for (var i = 0; i < addToCartButtons.length; i++) {
        var button = addToCartButtons[i]
        button.addEventListener('click', addToCartClicked)
    }

    //    document.getElementsByClassName('btn-purchase')[0].addEventListener('click', purchaseClicked)
}

function showCheckoutButton() {
    paypal.Buttons({
        createOrder: function (data, actions) {
            var items = collectCartItems();
            var total = getTotal(items);
            var order = {
                purchase_units: [{
                    amount: {
                        value: total.toString(),
                        currency_code: 'USD',
                        breakdown: {
                            item_total: {
                                currency_code: 'USD',
                                value: total.toString(),
                            }
                        },
                    },
                    soft_descriptor: "Novelty items",
                    description: "Items from Generics Novelty Store.",
                    items: items,
                }]
            };
            console.log(order);

            return actions.order.create(order);
        },
        onApprove: function (data, actions) {
            // This function captures the funds from the transaction.
            return actions.order.capture().then(function (details) {
                // This function shows a transaction success message to your buyer.
                alert('Transaction completed by ' + details.payer.name.given_name);
            });
        }
    }).render('#paypal-button-container');

}

function purchaseClicked() {
    alert('Thank you for your purchase')
    var cartItems = document.getElementsByClassName('cart-items')[0]
    while (cartItems.hasChildNodes()) {
        cartItems.removeChild(cartItems.firstChild)
    }
    updateCartTotal()
}

function removeCartItem(event) {
    var buttonClicked = event.target
    buttonClicked.parentElement.parentElement.remove()
    updateCartTotal()
    shouldRemoveShipping();
}

function quantityChanged(event) {
    var input = event.target
    if (isNaN(input.value) || input.value <= 0) {
        input.value = 1
    }
    updateCartTotal()
}

function addToCartClicked(event) {

    if (document.getElementById('paypal-button-container').childNodes.length < 1) {
        showCheckoutButton();
    }
    var button = event.target
    var shopItem = button.parentElement.parentElement
    var title = shopItem.getElementsByClassName('shop-item-title')[0].innerText
    var price = shopItem.getElementsByClassName('shop-item-price')[0].innerText
    var imageSrc = shopItem.getElementsByClassName('shop-item-image')[0].src
    addItemToCart(title, price, imageSrc)
    updateCartTotal()
}

function addItemToCart(title, price, imageSrc) {
    var cartRow = document.createElement('div')
    cartRow.classList.add('cart-row')
    var cartItems = document.getElementsByClassName('cart-items')[0]
    var cartItemNames = cartItems.getElementsByClassName('cart-item-title')
    for (var i = 0; i < cartItemNames.length; i++) {
        if (cartItemNames[i].innerText == title) {
            alert('This item is already added to the cart')
            return
        }
    }
    var cartRowContents = `
        <div class="cart-item cart-column">
            <img class="cart-item-image" src="${imageSrc}" width="100" height="100">
            <span class="cart-item-title">${title}</span>
        </div>
        <span class="cart-price cart-column">${price}</span>
        <div class="cart-quantity cart-column">
            <input class="cart-quantity-input" type="number" value="1">
            <button class="btn btn-danger" type="button">REMOVE</button>
        </div>`
    cartRow.innerHTML = cartRowContents
    cartItems.append(cartRow)
    cartRow.getElementsByClassName('btn-danger')[0].addEventListener('click', removeCartItem)
    cartRow.getElementsByClassName('cart-quantity-input')[0].addEventListener('change', quantityChanged);
    includeShipping();
}

function includeShipping() {
    var cartShipping = document.getElementsByClassName('cart-shipping');
    var numberItems = getNumberItemsInCart();
    var cost = SHIPPING[numberItems - 1];

    if (!cost) {
        cost = SHIPPING[SHIPPING.length - 1];
    }

    //Check if shipping already added so we don't add shipping twice.
    if (!cartShipping[0].getElementsByClassName('shipping').length) {
        var cartRow = document.createElement('div')
        cartRow.classList.add('cart-row')
        var cartItems = document.getElementsByClassName('cart-items');


        var cartRowContents = `
        <div class="cart-item cart-column shipping">
            <img class="cart-item-image shipping-image" src="./shipping-fast.svg" width="100" height="100">
            <span class="cart-item-title">Shipping</span>
        </div>
        <span class="cart-price cart-column shipping-cost">$${cost}</span>
        <div class="cart-quantity cart-column">

        </div>
        `
        cartRow.innerHTML = cartRowContents
        cartShipping[0].append(cartRow)
    }
    document.getElementsByClassName('shipping-cost')[0].innerText = `$${cost.toFixed(2)}`;
}

function shouldRemoveShipping() {
    var numberItems = getNumberItemsInCart();
    var cost = SHIPPING[numberItems - 1];

    if (!cost) {
        cost = SHIPPING[SHIPPING.length - 1];
    }

    let cartItems = document.getElementsByClassName('cart-items')[0];
    if (!cartItems.getElementsByClassName('cart-row').length) {
        let cartShipping = document.getElementsByClassName('cart-shipping')[0];
        while (cartShipping.childNodes.length) {
            cartShipping.removeChild(cartShipping.childNodes[0]);
        }
        document.getElementsByClassName('cart-total-price')[0].innerText = '$0.00';
    }
    else {
        document.getElementsByClassName('shipping-cost')[0].innerText = `$${cost.toFixed(2)}`;
    }

}

function updateCartTotal() {
    var cartItemContainer = document.getElementsByClassName('cart-items')[0]
    var cartRows = cartItemContainer.getElementsByClassName('cart-row')
    var total = 0
    for (var i = 0; i < cartRows.length; i++) {
        var cartRow = cartRows[i]
        var priceElement = cartRow.getElementsByClassName('cart-price')[0]
        var quantityElement = cartRow.getElementsByClassName('cart-quantity-input')[0]
        var price = parseFloat(priceElement.innerText.replace('$', ''))
        var quantity = quantityElement.value
        total = total + (price * quantity)
    }

    var shipping = document.getElementsByClassName('shipping-cost')[0];
    total += parseFloat(shipping.innerText.replace('$', ''));
    total = Math.round(total * 100) / 100
    document.getElementsByClassName('cart-total-price')[0].innerText = '$' + total
}

function getNumberItemsInCart() {
    var items = collectCartItems();
    var numberItems = 0;
    items.forEach(item => {
        if (item.name !== "Shipping") {
            numberItems += parseInt(item.quantity);
        }
    });

    return numberItems;
}

function collectCartItems() {
    var items = [];
    var cartRows = document.getElementsByClassName('cart-items')[0].getElementsByClassName('cart-row');
    Object.values(cartRows).forEach(function (row) {
        items.push({
            name: row.getElementsByClassName('cart-item-title')[0].innerText,
            unit_amount: {
                currency_code: 'USD',
                value: parseFloat(row.getElementsByClassName('cart-price')[0].innerText.replace('$', '')).toFixed(2).toString(),
            },
            quantity: row.getElementsByClassName('cart-quantity-input')[0].value,
        });
        //Make sure the calculated cost matches amount * quanitity fo each row.
    });

    var cartShipping = document.getElementsByClassName('cart-shipping')[0];
    //When first item is added to cart, cart shipping hasnt been added to DOM, so we need to
    //make sure we don't try to access it.
    if (cartShipping[0]) {
        items.push({
            name: cartShipping.getElementsByClassName('cart-item-title')[0].innerText,
            unit_amount: {
                currency_code: 'USD',
                value: parseFloat(cartShipping.getElementsByClassName('cart-price')[0].innerText.replace('$', '')).toFixed(2).toString(),
            },
            quantity: 1,
        });
    }

    return items;
}

function getTotal(items) {
    return items.reduce((acc, curr) => {
        return acc + (parseFloat(curr.unit_amount.value) * parseFloat(curr.quantity));
    }, 0).toFixed(2);
}

