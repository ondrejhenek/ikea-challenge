

(function(){

	if (window.location.hostname.search('ikea') < 0) return console.log('Not IKEA domain');


	/********
	Homepage and url
	********/

	// Return homepage on global homepage
	if (window.location.pathname === '/') return console.log('homepage');

	// The rest of the site seems localized so I try to transform URL...
	// IKEA resides on multiple domains (.com, .lt and subdomains canarias.ikea.com but all have /location/language in their path)
	// outputs array of 
	// [1] location
	// [2] language
	// [3] rest of path
	var path = window.location.pathname.match(/^(\/[^\/]+)(\/[^\/]+)(.*)/);
	if (path === null) {
		return console.log('Unexpected URL not matching pattern');
	}
	
	if (path[3] === '' || path[3] === '/') return console.log('homepage');


	/********
	Products
	********/
	

	// Won't work on https://www.ikea.pr/mayaguez/en/pd/spentrup-rug-high-pile-light-gray-turquoise-art-80514185
	// ignoring multilingual websites as the code would bloat incredibly (different decimal denominators, schema.org structure etc.)
	// Tested on
	// https://www.ikea.com/gb/en/p/foernuft-fork-stainless-steel-40428482/
	// https://www.ikea.com/us/en/p/salviken-hand-towel-light-green-10512547/
	// https://www.ikea.com/gb/en/p/spruttig-hanger-black-20317079/ - slash in price

	if (path[3].match(/^\/p\//)) {

		console.log(
			document.querySelector("#pip-buy-module-content div.pip-temp-price-module__name h1 span.pip-header-section__title--big.notranslate")
			.textContent.trim()
		);

		// alternative way to get price, it avoids the hassle of parsing discounts and additional text.
		var schemaData = [];
		var schemaNode = document.querySelectorAll('script[type="application/ld+json"]#pip-range-json-ld') || [];
		if (schemaNode[0]){
		    try {
		        const jsonData = JSON.parse(schemaNode[0].textContent);
		        schemaData.push(jsonData);
		        
		        var price;
		        if (schemaData[0].offers.price) {
		        	price = schemaData[0].offers.price;
		        } else if (schemaData[0].offers.offers && schemaData[0].offers.offers.length > 0) {
		        	price = schemaData[0].offers.offers[0].price;
		        }
		        console.log(parseFloat(price));

		    } catch (e) {
		        console.error("Failed to parse JSON data:", e);
		    }
		    //schema failed, add alternative method of finding product info, for example through traversing DOM.
		}
	}


	/*****
	CART
	******/
	if (document.body.classList.contains('checkout-shoppingbag')) {
		var prices = [];
		document.querySelectorAll("#one-checkout > main > div > div > div > div.shoppingBag_desktop_contentGrid__RPQ4V  div > div.productCard_productInformation__4aalr > div.productCard_priceModule__U6eeo.productCard_marginBottom__vreG3").forEach((item) => {
			var price = item.querySelector(".pricePerItem_pricePerItem__n52Hg .cart-ingka-price__sr-text");
		    if (!price || !price.innerText) {
		    	price = item.querySelector("div.cart-ingka-price-module__price .cart-ingka-price__sr-text");
		    }
		    prices.push(parseFloat(price.innerText.substring(2)));
		});
		console.log("Number of products:");
		console.log(prices.length);
		console.log("Average price:");
		console.log(prices.reduce((acc, cur) => acc + cur) / prices.length);
	}


	/*****
	Search 
	******/
	// If I am on a search page (should work cross-culture)
	if (document.location.search.match(/\?q=.+/) != null) {
		// I look for the search input field.
		var searchNode = document.querySelector("#ikea-search-input");
		if (searchNode) {
			console.log(searchNode.value);
		}

		// Limitation here is that if I double-click on the add-to-cart button, I register more events than what really happens.
		// I would have to take care that the button of a bag is present, not react on the checkmark...
		document.addEventListener('click', function(event) {
		    // Check if the clicked element is within a .plp-fragment-wrapper and has the class .plp-btn--icon-emphasised
		    let target = event.target;
		    while (target && target !== document) {
		        if (target.classList.contains('plp-btn--icon-emphasised')) {
		            // Find the closest .plp-fragment-wrapper ancestor
		            const parentWrapper = target.closest('.plp-mastercard');
		            if (parentWrapper) {
		                console.log('Added to cart: ', parentWrapper.dataset.productName);
		                break;
		            }
		        }
		        target = target.parentElement;
		    }
		});

	}
	



})()



// In the example the products URL of kallax shelving does not work. Probably they stopped selling it in yellow.
// Use for example https://www.ikea.com/gb/en/p/kallax-shelving-unit-black-brown-20275885/
