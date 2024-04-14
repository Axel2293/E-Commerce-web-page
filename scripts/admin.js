const dataKey = "productsData";
const expKey = "exp";
const host = "https://products-dasw.onrender.com";
const prodEP = "/api/products";



function prodToHTML(product) {
    let cardModelTemplate= Handlebars.compile( `
        <tr id="{{uuid}}">
            <td>{{name}}</td>
            <td>{{unit}}</td>
            <td>{{desc}}</td>
            <td>{{stock}}</td>
            <td>{{price}}</td>
            <td>{{cat}}</td>
            <td>{{img}}</td>
            <td>
                <button type="button" class="btn btn-warning" onclick=editProduct("{{uuid}}")>
                    <i class="bi bi-pencil-square"></i>
                </button></td>
            <td>
                <button type="button" class="btn btn-danger" onclick=deleteProduct("{{uuid}}")>
                    <i class="bi bi-trash3-fill"></i>
                </button>
            </td>
        </tr>
    `);

    // Complete template
    return cardModelTemplate({
        name:product["name"],
        unit:product["unit"],
        desc:product["description"],
        stock:product["stock"],
        price:product["pricePerUnit"],
        cat:product["category"],
        img:product["imageUrl"],
        unit:product["unit"],
        uuid: product["uuid"]
    });
}

function setLoadingAnimation(divID) {
    if (divID) {
        let div = document.getElementById(`${divID}`);
        let anim = `
            <div class="loader" id ="loader">
                <h4>Cargando... </h4>
                <img src="../images/loading.gif" alt="loading" style="widtd: 40px; height: auto;">
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
        metdod:"GET",
        headers:{
            "x-expediente": exp,
            "x-auth":"admin"
        }
    }).then(res => {
        if (!res.ok) {
            swal({
                text:"Could not obtain tde products data",
                icon: "error"
            });
        }
        else{
            return res.json();
        }
    }).catch(error =>{
        console.error("Fetch error: ", error);
        swal({
            text:"Could not comunicate witd servers, check your internet connection.",
            icon:"error"
        });
        return null;
        
    });


    console.log(dataProducts);
    sessionStorage.setItem(dataKey, JSON.stringify(dataProducts)); //Save data on session storage
}



/* 
    Shows products on tde products table
*/
function showProducts(data) {
    let productsContainer = document.getElementById("products");
    let rows = "";

    // Add products HTML to document
    data.forEach(element => {
        rows+= prodToHTML(element);
    });
    productsContainer.innerHTML = rows; // Add cards to products div
}

/* 
    Gets and shows tde product data
*/
async function loadProducts(query, getData) {
    //Load products data
    if (getData) {
        await getProducts(sessionStorage.getItem(expKey), query);
    }

    let data = JSON.parse(sessionStorage.getItem(dataKey));
    console.log(data)
    if (data != null) {
        showProducts(data);
    }else{
        swal({
            title:"Error while loading products",
            icon:"error"
        });
    }
}

function applyFilters() {
    let query = {}

    let category = document.getElementById("categoryFilter").value;
    if (category!='') {
        query["category"] = category;
    }

    let min = document.getElementById("minPrice").value;
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

    let max = document.getElementById("maxPrice").value;
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
    
    // Load products witd given query
    loadProducts(query, true);
}

async function saveChanges() {
    let keys = ["name", "unit", "description", "stock", "pricePerUnit", "category", "imageUrl"];

    let prod = {};

    keys.forEach(key => {
        prod[key] = document.getElementById(`product-${key}`).value;
    });
    console.log(prod)
    let res = await fetch(host+prodEP+"/"+document.getElementById("product-uuid").value,{
        method:"PUT",
        headers: {
            "content-type": "application/json",
            "x-auth":"admin",
            "x-expediente": sessionStorage.getItem(expKey)
        },
        body: JSON.stringify(prod)
    }).then(res=>{
        if (!res.ok) {
            swal({
                title:"Product was not saved correctly",
                icon:"error"
            })
        }else{
            swal({
                title:"Product saved correctly",
                icon:"success"
            })
        }
    })
}

function editProduct(uuid) {
    $('#modifyProductModal').modal('show');
    let data = JSON.parse(sessionStorage.getItem(dataKey));
    let keys = ["uuid", "name", "unit", "description", "stock", "pricePerUnit", "category", "imageUrl"];

    let product = data.find(prod=>
        prod.uuid == uuid
    );

    console.log(product);
    keys.forEach(key => {
        document.getElementById(`product-${key}`).value = product[key];
    });
    
}

async function deleteProduct(uuid) {
    let res = await fetch(host+prodEP+"/"+uuid,{
        method:"DELETE",
        headers:{
            "x-auth":"admin",
            "x-expediente": sessionStorage.getItem(expKey)
        }
    }).then(res=>{
        if (!res.ok) {
            swal({
                title:"Product was not deleted correctly",
                icon:"error"
            })
        }else{
            swal({
                title:"Product deleted correctly",
                icon:"success"
            })
        }
    });

    $(`#${uuid}`).remove();
}

async function addProduct(){
    let keys = ["name", "unit", "description", "stock", "pricePerUnit", "category", "imageUrl"];

    let prod = {};

    keys.forEach(key => {
        prod[key] = $('#product'+key).val();
        console.log(key);
    });
    console.log(prod);

    let res = await fetch(host+prodEP,{
        method:"POST",
        headers: {
            "content-type": "application/json",
            "x-auth":"admin",
            "x-expediente": sessionStorage.getItem(expKey)
        },
        body: JSON.stringify(prod)
    }).then(res=>{
        if (!res.ok) {
            swal({
                title:"Product was not created correctly",
                icon:"error"
            })
        }else{
            swal({
                title:"Product created correctly",
                icon:"success"
            })
        }
    })
}

/* 
    STARTUP ROUTINES
*/

function init() {
    // Load exp to session storage
    sessionStorage.setItem("exp", "742459");
    
    loadProducts(undefined, true);

}

init();

