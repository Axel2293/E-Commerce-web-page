

function prodToHTML(product) {
    let cardModelTemplate= Handlebars.compile(`
        <div class="card-product col col-sm-6 col-md-4 col-lg-3" id="{{uuid}}">
            <div class="card border-gray my-2">
            <div class="card-img">
                <img
                    class="card-img-top"
                    src={{imageUrl}}
                    alt="Title"
                />
            </div>
            <div class="card-body">
                <h4 class="card-title">{{name}}</h4>
                <p class="card-text">{{description}}</p>
                <p class="card-price">&nbsp;$ {{pricePerUnit}}&nbsp;</p>
            </div>
            <div class="card-footer" style="justify-content: center;">
                <button onclick=addToCartModal("{{uuid}}") style="margin: 0 auto;">
                <i class="bi bi-cart"></i> Add to cart
                </button>
            </div>
            </div>
        </div>
    `);

    // Complete template
    return cardModelTemplate({
        imageUrl: product["imageUrl"],
        name: product["name"],
        description: product["description"],
        uuid: product["uuid"],
        pricePerUnit: product["pricePerUnit"]
    }); ;
}