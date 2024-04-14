const dataKey = "productsData";
const expKey = "exp";
const maxPagesKey = "maxPages";
const currPageKey = "currPage";
const userKey = "user";
const host = "https://products-dasw.onrender.com";
const prodEP = "/api/products";
const cartEP = "/api/cart";
/* 
    Functions for the index page
*/

/* LOGIN FUNCTION */
function logIn(form) {
    let email = document.getElementById('log-email').value;
    sessionStorage.setItem("user", email);
    swal({
        title: "Welcome",
        icon: "success"
    });
}
/* 
    This funcion searches the given id div and replaces the innerHTML with an animation of loading
*/
function setLoadingAnimation(divID) {
    if (divID) {
        let div = document.querySelector(`div#${divID}`);
        let anim = `
            <div class="loader" id ="loader">
                <h4>Cargando... </h4>
                <img src="../images/loading.gif" alt="loading" style="width: 40px; height: auto;">
            </div>
        `
        div.innerHTML = anim;
    }
}
/* 
    Recieves exp and search query object
        - Saves product data on Session Storage
        - key: "productsData"
*/
async function getProducts(exp, query) {
    let url = host+prodEP;
    // Build search query string
    if (query != undefined) {
        url+='?';
        for (const key in query) {
            if( typeof query[key] == 'string'){
                //Escape spaces
                query[key] = query[key].replace(' ', '+');
            }
            url+=key+'='+query[key]+'&'; //Add param to URL
        }
    }
    console.log(url);
    // Send GET request
    let dataProducts = await fetch(url, {
        method:"GET",
        headers:{
            "x-expediente": exp
        }
    }).then(res => {
        if (!res.ok) {
            swal({
                text:"Could not obtain the products data",
                icon: "error"
            });
        }
        else{
            return res.json();
        }
    }).catch(error =>{
        console.error("Fetch error: ", error);
        swal({
            text:"Could not comunicate with servers, check your internet connection.",
            icon:"error"
        });
        return null;
        
    });

        //Calculate max amount of pages
            //Every page has 4 products max
        console.log(dataProducts);
        sessionStorage.setItem(maxPagesKey, Math.ceil(dataProducts.length/4));
        sessionStorage.setItem(dataKey, JSON.stringify(dataProducts));
}



/* 
    Shows products on the products div
        - Manages pagination
*/
function showProducts(data) {
    let productsContainer = document.querySelector("#products");
    let cards = "";

    // Paginations
    let currPage = Number(sessionStorage.getItem(currPageKey)) -1;
    let startIdx = currPage*4;
    let endIdx = (currPage+1)*4;
    console.log("CURR: "+currPage+" START: "+startIdx+" END: "+endIdx);

    // Add products HTML to documen
    for (let idx=startIdx; idx<data.length && idx<endIdx; idx++) {
        cards+= prodToHTML(data[idx]);
        console.log("IDX: "+idx);
    }
    productsContainer.innerHTML = cards; // Add cards to products div
}

/* 
    Gets and shows the product data
*/
async function loadProducts(query, getData) {
    //Load products data
    setLoadingAnimation("products")
    if (getData) {
        await getProducts(sessionStorage.getItem(expKey), query);
        updateNavigationBar(sessionStorage.getItem(currPageKey), sessionStorage.getItem(maxPagesKey), true);
    }

    let data = JSON.parse(sessionStorage.getItem(dataKey));
    if (data != null) {
        showProducts(data);
        updateNavigationBar(sessionStorage.getItem(currPageKey), sessionStorage.getItem(maxPagesKey), false);
    }else{
        swal({
            title:"Error while loading products",
            icon:"error"
        });
    }
}
/* 
    Filters for searching products
*/
function applyFilters() {
    let query = {}
    let name = document.querySelector("#name-input").value;
    if (name!='') {
        query["name"] = name;
    }

    let desc = document.querySelector("#description-input").value;
    if (desc!='') {
        query["description"] = desc;
    }

    let category = document.querySelector("#category-input").value;
    if (category!='') {
        query["category"] = category;
    }

    let min = document.querySelector("#min-input").value;
    if (min!='') {
        if (!isNaN(min)) {
            query["min"] = min;
        }else{
            swal({
                title: `Min price should be a number, but got: "`+min+`"`,
                icon: "error"
            });
        }
    }

    let max = document.querySelector("#max-input").value;
    if (max!='') {
        if (!isNaN(max)) {
            query["max"] = max;    
        }else{
            swal({
                title: `Max price should be a number, but got: "`+max+`"`,
                icon: "error"
            });
        }
    }
    
    // Load products with given query
    loadProducts(query, true);
}

function searchByName() {
    let nameVal = document.getElementById("name-bar-input").value;
    if (nameVal!='') {
        loadProducts({
            "name":nameVal
        }, true);
    }
}

function updateNavigationBar(currPage, maxPage, addPages) {
    //Change navigation bar
    console.log(currPage);
    if (addPages) {
        let nav = document.getElementById("navbar-elems");
        let pages = `<li class="page-item disabled" id="previous">
                    <a class="page-link" onclick="goToPrevious()" href="#" aria-label="Previous">
                    <span aria-hidden="true">&laquo;</span>
                    </a>
                </li>`;
        // Add pages buttons
        for (let idx = 1; idx <= sessionStorage.getItem(maxPagesKey); idx++){
            if (currPage == idx) {
                pages+= `<li class="page-item active" aria-current="page" id="page${idx}">
                    <a class="page-link" href="#" onclick="goToPage(${idx})">${idx}</a>
                </li>`;
            }
            else{
                pages+= `<li class="page-item" aria-current="page" id="page${idx}">
                    <a class="page-link" href="#" onclick="goToPage(${idx})">${idx}</a>
                </li>`
            }
        }
        pages+=`<li class="page-item disabled" id="next">
                <a class="page-link" onclick="goToNext()" href="#" aria-label="Next">
                <span aria-hidden="true">&raquo;</span>
                </a>
            </li>`;
        nav.innerHTML = pages;
    }

    let prevElem = document.getElementById("previous");
    let nextElem = document.getElementById("next");

    if (maxPage>1) {
        if (currPage == 1) {
            prevElem.classList.add("disabled");
            nextElem.classList.remove("disabled");
        }
        else if(currPage == maxPage){
            prevElem.classList.remove("disabled");
            nextElem.classList.add("disabled");
        }
    }else{
        console.log("ONLY ONE PAGE");
        prevElem.classList.add("disabled");
        nextElem.classList.add("disabled");
    }

    if (maxPage>0) {
        console.log(maxPage);
        let currPageElem = document.querySelector(`#page${currPage}`);
        currPageElem.classList.add("active"); 
    }

}

function goToPrevious() {
    let currPage = Number(sessionStorage.getItem(currPageKey));

    if (currPage!=1) {
        let maxPage = Number(sessionStorage.getItem(maxPagesKey));
        currPage-=1;
        sessionStorage.setItem(currPageKey, currPage);
        loadProducts(undefined, false);

        //Update navbar
        updateNavigationBar(currPage, maxPage, false);
        document.getElementById(`page${currPage+1}`).classList.remove("active");

    }
}

function goToPage(page) {
    let currPage = Number(sessionStorage.getItem(currPageKey));
    console.log("MOVING TO PAGE ", page);
    if (currPage !=page) {
        sessionStorage.setItem(currPageKey, page);
        loadProducts(undefined, false);
        updateNavigationBar(page, sessionStorage.getItem(maxPagesKey), false);
        let oldPageElem = document.querySelector(`#page${currPage}`);
        oldPageElem.classList.remove("active");
    }
}

function goToNext() {
    let currPage = Number(sessionStorage.getItem(currPageKey));
    let maxPage = Number(sessionStorage.getItem(maxPagesKey));

    if (currPage!=maxPage) {
        currPage+=1;
        sessionStorage.setItem(currPageKey, currPage);
        loadProducts(undefined, false, false);

        //Update navbar
        updateNavigationBar(currPage, maxPage, false);

        document.getElementById(`page${currPage-1}`).classList.remove("active");
    }

}


async function addToCartModal(prod_id) {
    console.log(prod_id)
    let amount;
    await swal({
        title: 'How many products do you want to add?',
        content: {
            element: "input",
            attributes: {
              placeholder: "Quantity",
              type: "number",
            },
        },
        buttons: {
            cancel: true,
            confirm: {
                text:"Add to cart"
            }
        }
    }).then(input => {
        if(input!=null){
            amount = input;
        }
    });
    if (amount) {
        addToCart(prod_id, amount);
    }
}

async function addToCart(prod_id, amount) {
    let exp = sessionStorage.getItem(expKey);
    let usr = sessionStorage.getItem(userKey);

    if (usr) {
        //Add product to user cart
        let  res = await fetch(host+cartEP+"/"+prod_id, {
            method:"POST",
            headers:{
                "content-type":"application/json",
                "x-expediente":exp,
                "x-user": usr
            },
            body: JSON.stringify({
                amount:amount
            })
        }).then(res=>{
            if (res.status == 201)
                swal({
                    title: "Correctly added",
                    icon: "success"
                });
            else if(res.status == 200)
                swal({
                    title: "Correctly modified",
                    icon: "success"
                });
            else
                swal({
                    title: "Product was not added",
                    icon: "warning"
                });
            console.log(res);
        });
        
    }else{
        swal({
            title:"You have to be Loged In",
            icon:"warning"
        });
    }
}


/* 
    STARTUP ROUTINES
*/

function init() {
    // Load exp to session storage
    sessionStorage.setItem("exp", "742459");
    // Data for pagination
    sessionStorage.setItem("maxPages", "0");
    sessionStorage.setItem("currPage", "1");
    
    loadProducts(undefined, true);

}

init();