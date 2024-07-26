

(function(){

	if (window.location.hostname.search('ikea') < 0) return console.log('Not IKEA domain');


	/********
	Homepage and url
	********/

	// Return homepage on global homepage and stop all scripts
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
	
	if (path[3] === '' || path[3] === '/') {
		console.log('homepage');
	}


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

	/*****
	Carousel
	******/
	if (path[3] === '' || path[3] === '/') {

		(function() {
		    var css = `
		        .carousel {
		            position: relative;
		            width: 100%;
		            overflow: hidden;
		        }
		        .carousel-container {
		            display: flex;
		            transition: transform 0.5s ease;
		        }
		        .carousel-item {
		            box-sizing: border-box;
		            padding: 10px;
		            flex: 1 0 33.33%; /* 3 items visible */
		        }
		        .carousel-item > a > div {
		            position: absolute;
		            bottom: 0;
		            background: rgba(0, 0, 0, 0.6);
		            width: 100%;
		            color: white;
		            padding: 10px;
		        }
		        .carousel-item h3 {
		            color: white;
		        }
		        .carousel img {
		            width: 100%;
		            height: auto;
		        }
		        .original-price {
		            text-decoration: line-through;
		            position: relative;
		            top: -3px;
		        }
		        .sale-price {
		            margin-left: 6px;
		            font-size: 1.3em;
		            font-weight: bold;
		        }
		        .carousel-nav {
		            position: absolute;
		            top: 50%;
		            transform: translateY(-50%);
		            cursor: pointer;
		            z-index: 10;
		            background: black;
		            border-radius: 50%;
		            width: 40px;
		            line-height: 40px;
		            padding-left: 8px;
		            color: white;
		        }
		        .carousel-prev {
		            left: 0;
		        }
		        .carousel-next {
		            right: 0;
		        }
		        @media (max-width: 600px) {
		            .carousel-container {
		                width: 100%; /* 1 item visible */
		            }
		            .carousel-item {
		                flex: 1 0 100%; /* 1 item visible */
		            }
		        }
		    `;

		    var style = document.createElement('style');
		    style.type = 'text/css';
		    if (style.styleSheet) {
		        style.styleSheet.cssText = css;
		    } else {
		        style.appendChild(document.createTextNode(css));
		    }

		    document.head.appendChild(style);
		    // first section is targeted. Just the top of the content!
		    document.querySelector('section.gd8xc1c.v19w64p3.v18by0fb').insertAdjacentHTML('afterBegin',`
		        <div class="carousel">
		            <div class="carousel-container"></div>
		            <div class="carousel-nav carousel-prev"><svg focusable="false" viewBox="0 0 24 24" width="24" height="24" class="pub__svg-icon pub__btn__icon" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="m7 12.0009 8.0012-8.0007 1.4142 1.4142-6.587 6.5866 6.5859 6.5868L15 20.002l-8-8.0011z"></path></svg></div>
		            <div class="carousel-nav carousel-next"><svg focusable="false" viewBox="0 0 24 24" width="24" height="24" class="pub__svg-icon pub__btn__icon" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="m16.415 12.0011-8.0012 8.0007-1.4141-1.4143 6.587-6.5866-6.586-6.5868L8.415 4l8 8.0011z"></path></svg></div>
		        </div>`);


		    const carouselData = [
		        { "image": "https://picsum.photos/200/300", "price": "$20.00", "sale_price": "$15.00", "description": "A stylish and comfortable T-shirt made from 100% organic cotton.", "short_description": "Organic Cotton T-shirt", "title": "Eco-Friendly T-shirt", "link": "https://example.com/product/1" },
		        { "image": "https://picsum.photos/200/300", "price": "$35.00", "sale_price": "$25.00", "description": "A durable and spacious backpack with multiple compartments.", "short_description": "Spacious Backpack", "title": "Outdoor Backpack", "link": "https://example.com/product/2" },
		        { "image": "https://picsum.photos/200/300", "price": "$50.00", "sale_price": "$40.00", "description": "A sleek and modern wristwatch with a stainless steel band.", "short_description": "Modern Wristwatch", "title": "Stainless Steel Watch", "link": "https://example.com/product/3" },
		        { "image": "https://picsum.photos/200/300", "price": "$80.00", "sale_price": "$60.00", "description": "A pair of noise-cancelling over-ear headphones with superior sound quality.", "short_description": "Noise-Cancelling Headphones", "title": "Premium Headphones", "link": "https://example.com/product/4" },
		        { "image": "https://picsum.photos/200/300", "price": "$100.00", "sale_price": "$75.00", "description": "A compact and powerful portable speaker with Bluetooth connectivity.", "short_description": "Portable Bluetooth Speaker", "title": "Wireless Speaker", "link": "https://example.com/product/5" },
		        { "image": "https://picsum.photos/200/300", "price": "$150.00", "sale_price": "$120.00", "description": "A stylish and versatile smartwatch with fitness tracking features.", "short_description": "Smartwatch with Fitness Tracker", "title": "Fitness Smartwatch", "link": "https://example.com/product/6" },
		        { "image": "https://picsum.photos/200/300", "price": "$200.00", "sale_price": "$180.00", "description": "A high-quality DSLR camera for professional photography.", "short_description": "Professional DSLR Camera", "title": "DSLR Camera", "link": "https://example.com/product/7" },
		        { "image": "https://picsum.photos/200/300", "price": "$250.00", "sale_price": "$220.00", "description": "A modern tablet with a high-resolution display and powerful processor.", "short_description": "High-Resolution Tablet", "title": "Modern Tablet", "link": "https://example.com/product/8" },
		        { "image": "https://picsum.photos/200/300", "price": "$300.00", "sale_price": "$270.00", "description": "A premium laptop with high performance and sleek design.", "short_description": "High-Performance Laptop", "title": "Premium Laptop", "link": "https://example.com/product/9" }
		    ];

		    const carouselContainer = document.querySelector('.carousel-container');

		    function createCarouselItem(data) {
		        const item = document.createElement('div');
		        item.className = 'carousel-item';
		        item.innerHTML = `
		            <a href="${data.link}">
		                <img src="${data.image}" alt="${data.title}">
		                <div>
		                <h3>${data.title}</h3>
		                <p>${data.short_description}</p>
		                <p class="price"><span class="original-price">${data.price.slice(0,-3)}</span> <span class="sale-price">${data.sale_price.slice(0,-3)}</span></p>
		                </div>
		            </a>
		        `;
		        return item;
		    }

		    // Populate the carousel
		    carouselData.forEach(data => {
		        carouselContainer.appendChild(createCarouselItem(data));
		    });

		    let currentIndex = 0;
		    let itemsToShow = function(){if (window.innerWidth > 600){ return 3;} else {return 1;}};
		    const totalItems = carouselData.length;

		    function updateCarousel() {
		        const width = carouselContainer.querySelector('.carousel-item').offsetWidth;
		        const offset = -(currentIndex * width);
		        carouselContainer.style.transform = `translateX(${offset}px)`;
		        resetAutoScroll();
		    }

		    function showNextItems() {
		        currentIndex = (currentIndex + itemsToShow()) % totalItems;
		        updateCarousel();
		    }

		    function showPrevItems() {
		        currentIndex = (currentIndex - itemsToShow() + totalItems) % totalItems;
		        updateCarousel();
		    }

		    document.querySelector('.carousel-next').addEventListener('click', showNextItems);
		    document.querySelector('.carousel-prev').addEventListener('click', showPrevItems);

		    // Automatic scrolling every 2 seconds
		    function resetAutoScroll (){
		        clearInterval(document.bloomreach_autoScroll);
		        document.bloomreach_autoScroll = setInterval(showNextItems, 2000);
		    }
		    resetAutoScroll();
		})();
	}

	

})()
