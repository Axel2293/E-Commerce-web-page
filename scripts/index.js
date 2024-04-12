/* 
    Functions for the index page
*/

function logIn(form) {
    let email = document.getElementById('log-email').value;
    sessionStorage.setItem("user", email)
    swal({
        title: "Welcome",
        icon: "success"
    })
}
/* 
    Recieves exp and search query object
*/
async function getProducts(exp, query) {
    let host = "https://products-dasw.onrender.com";
    let endpoint = "/api/products?";

    let url = host+endpoint;
    // Build search query string
    if (query != undefined) {
        for (const key in query) {
            if( typeof query[key] == 'string'){
                //Escape spaces
                query[key] = query[key].replace(' ', '+');
            }
            url+=key+'='+query[key];//Add param to URL
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
        
    });

    return dataProducts;
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

async function showProducts(query) {
    //Get product data
    setLoadingAnimation("products");
    let data = await getProducts(sessionStorage.getItem("exp"), query);
    sessionStorage.setItem("productsData", data); //Store data of products
    
    console.log("PORDUCTS: ", data)
    let productsContainer = document.querySelector("#products")
    let cards = "";
    for (let index = 0; index < data.length; index++) {
        cards+= prodToHTML(data[index]);
        console.log("Prod: ", prodToHTML(data[index]));
    }
    productsContainer.innerHTML = cards; // Add cards to products div
}

function aplicarFiltros() {
    let query = {}
    let name = document.querySelector("#name-input").value;
    if (name) {
        query["name"] = name;
    }

    let desc = document.querySelector("#description-input").value;
    if (desc) {
        query["description"] = desc;
    }

    let category = document.querySelector("#category-input").value;
    if (category) {
        query["category"] = category;
    }

    let min = document.querySelector("#min-input").value;
    if (min) {
        query["min"] = min;
    }

    let max = document.querySelector("#max-input").value;
    if (max) {
        query["max"] = max;
    }

    showProducts(query);
}

function addToCartModal(prod_id) {
    console.log(prod_id)
    swal({
        title: 'How many products do you want to add?',
        content: {
            element: "input",
            attributes: {
              placeholder: "Quantity",
              type: "text",
            },
        },
        buttons: {
            cancel: true,
            confirm: {
                text:"Add to cart"
            }
        }
    }).then(input => {
        
        if (input!=null) {
            if(input != ''){
                addToCart(prod_id);
                swal({
                    title: "Correctly added",
                    icon: "success"
                })
            }else{
                swal({
                    title: "Quantity field was empty",
                    icon: "warning"
                })
            }
        }
    });
}

function addToCart(prod_id) {
    //LOGIC FOR ADDING IT TO THE API
}


/* 
    STARTUP ROUTINES
*/

// Load exp to session storage
sessionStorage.setItem("exp", "742459");
showProducts();