const usrKey = "user";
const expKey = "exp";
const host = "https://products-dasw.onrender.com";
const cartEP = "/api/cart";

/* LOGIN FUNCTION */
function logIn() {
    let email = document.getElementById('log-email').value;
    sessionStorage.setItem("user", email);
    swal({
        title: "Welcome",
        icon: "success"
    });
}

async function deleteFromCart(uuid) {
    let user = sessionStorage.getItem(usrKey);
    let exp = sessionStorage.getItem(expKey);
    let cartProduct = document.getElementById(uuid);

    let res = await fetch(host+cartEP+"/"+uuid, {
        method:"DELETE",
        headers:{
            "x-expediente": exp,
            "x-user": user
        }
    }).then(res =>{
        if(!res.ok){
            swal({
                title: "Could not delete product form cart",
                icon:"error"
            })
            return undefined;
        }else{
            swal({
                title: "Product deleted from cart",
                icon:"success"
            })
            document.getElementById(uuid).remove(); // Remove the product from cart HTML
            return res.json();
        }
    })

    console.log(res);
}

/* 
    Updates the given product on the cart
*/
async function upddateCartProduct(uuid, amount) {
    let user = sessionStorage.getItem(usrKey);
    let exp = sessionStorage.getItem(expKey);

    let res = await fetch(host+cartEP+"/"+uuid, {
        method: "POST",
        headers: {
            "content-type":"application/json",
            "x-expediente": exp,
            "x-user": user
        },
        body: JSON.stringify({
            amount:amount
        })
    }).then(res =>{
        if(!res.ok){
            swal({
                title: "Could not update product form cart",
                icon:"error"
            })
            return undefined;
        }else{
            swal({
                title: "Product updated",
                icon:"success"
            })
            return res.json();
        }
    });
}

function productCartToHTML(cartElem) {
    console.log(cartElem)
    let productCartTemplate = Handlebars.compile(`
        <li class="d-flex" id="{{uuid}}">
            <div class="flex-grow-0">
            <h5 class="mt-2 mx-2">
                {{name}}
                <a
                name="product-delete"
                id="delete-{{uuid}}"
                class="btn btn-primary"
                href="#"
                onclick=deleteFromCart("{{uuid}}")
                role="button"
                style="background-color: red; border-color: red"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        class="bi bi-trash-fill"
                        viewBox="0 0 16 16"
                    >
                        <path
                            d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0"
                        >
                    </svg>
                </a>
            </h5>
            <div class="product-info mx-2">
                <div class="input-group ">
                    <span class="input-group-text" id="QA"><i>Quantity:</i></span>
                    <input
                        type="number"
                        class="form-control"
                        name="amount"
                        id="amount-{{uuid}}"
                        uuid="{{uuid}}"
                        aria-describedby="helpId"
                        value={{amount}}
                    />
                    </div>
                    <div class="input-group">
                        <span class="input-group-text" id="QP"><i>Price:</i></span>
                        <input
                            type="text"
                            class="form-control disabled"
                            name="price"
                            id="price-{{price}}"
                            aria-describedby="helpId"
                            value={{price}}
                        />
                        <span class="input-group-text" id="CURR">MXN</span>
                    </div>
            </div>
            </div>
            <div class="flex-grow-1" style="float: right;">
            <img src="{{imageUrl}}" alt="" width="300" id="p-img"/>
            </div>
        </li>
    `);

    return productCartTemplate({
        imageUrl: cartElem["product"]["imageUrl"],
        name: cartElem["product"]["name"],
        uuid: cartElem["uuid"],
        price: cartElem["product"]["pricePerUnit"],
        amount: cartElem["amount"]
    });
}

/* 
    GET products in user cart
*/
async function getCartProducts(exp, usr) {
    let resp = await fetch(host+cartEP,{
        method:"GET",
        headers:{
            "x-expediente":exp,
            "x-user":usr
        }
    }).then(res=>{
        if (!res.ok){
            swal({
                title: "Algo salio mal al obtener tu carrito :(",
                icon: "error"
            });
            return undefined;
        }
        else
            return res.json();
    }).catch(error =>{
        console.error("Fetch error: ", error);
        swal({
            text:"Could not comunicate with servers, check your internet connection.",
            icon:"error"
        });
        return null;
        
    });

    return resp;
}
/* 
    Shows the products in the cart, also creates the event listeners for the update of amount
*/
function showCartProducts(cart) {
    let cartElem = document.getElementById("products");
    let cartHTML = "";

    cart.forEach(element => {
        cartHTML+=productCartToHTML(element);
    });

    cartElem.innerHTML = cartHTML;

    //Add event listeners
    console.log("SHOW CART", cart)
    for (let index = 0; index < cart.length; index++) {
        document.getElementById(`amount-${cart[index].uuid}`)
                .addEventListener("change", async e=>{    
                    e.preventDefault();
                    
                    let amount = e.target.value;

                    if (amount>0) {
                        await updateCartProduct(e.target.getAttribute("uuid"), e.target.value);
                        console.log("ON EVENT");
                        loadCartProducts(sessionStorage.getItem("exp"), sessionStorage.getItem("user"), false);
                    }else{
                        await deleteFromCart(e.target.getAttribute("uuid"));
                        loadCartProducts(sessionStorage.getItem("exp"), sessionStorage.getItem("user"), false);
                    }
                    
                });
    }
}

function updateCartSummary(cart, total) {
    let prodSumTemplate = Handlebars.compile(`
        <b>{{name}}:</b> {{amount}} x {{price}} MXN
        <br>
    `)

    let totalSumTemplate = Handlebars.compile(`
        <br>
        <b>Shipping cost:</b> 60.00 MXN
        <b>Total: {{total}}</b>

    `)

    let summary = "";
    cart.forEach(element => {
        summary += prodSumTemplate({
            name: element["product"]["name"],
            amount: element["amount"],
            price: element["product"]["pricePerUnit"]
        })    
    });
    summary+= totalSumTemplate({
        total: total
    });
    
    let summElem = document.getElementById("summary").innerHTML = summary;

}

async function loadCartProducts(exp, usr, show) {
    let res = await getCartProducts(exp, usr);
    console.log(res);
    if (res["cart"].length >0) {
        if (show) {
            showCartProducts(res["cart"]);
        }
        console.log("BEFORE  SUMMARY", res["cart"])
        updateCartSummary(res["cart"], res["total"])
    }
}

async function init() {
    let usr = sessionStorage.getItem(usrKey);
    let exp = sessionStorage.getItem(expKey);

    if (usr) {
        loadCartProducts(exp, usr, true);
    }
    else{
        swal({
            title: "you need to be Loged In",
            icon: "warning"
        })
    }
}

init()