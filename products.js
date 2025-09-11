let allProducts = [];
let currentCategory = "All";

// show loading state
document.getElementById("product-grid").innerHTML = `
  <div class="text-center text-yellow-500 p-4">Loading products...</div>
`;

// ✅ Fetch products from backend API
fetch("https://one000homevibes.onrender.com/products")
  .then(res => res.json())
  .then(products => {
    // sort newest first by updatedAt or createdAt if present
    allProducts = (products || []).sort((a,b)=>{
      return new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0);
    });
    displayProducts(allProducts);
  })
  .catch(err => {
    console.error("❌ Failed to load products:", err);
    document.getElementById("product-grid").innerHTML = `
      <p class="text-red-400">Failed to load products. Please try again later.</p>
    `;
  });

function displayProducts(products) {
  const grid = document.getElementById("product-grid");
  grid.innerHTML = "";

  products.forEach(product => {
    const card = document.createElement("div");
    card.className = "product-card bg-white text-black p-4 rounded-xl shadow relative";
    card.dataset.category = (product.category || "").toLowerCase();
    card.dataset.title = (product.title || "").toLowerCase();

    // ✅ Currency aware price
    const currency = product.currency || "USD";
    const usdPrice = parseFloat(product.price) || 0;
    const ngnPrice = currency === "USD" ? usdPrice * 1500 : parseFloat(product.price) || 0;

    // ✅ Determine affiliate site name (fixed to use product.website)
    let affiliateSite = "Amazon"; // default
    if (product.website) {
      affiliateSite = product.website; // ✅ now uses admin dropdown value
    } else if (product.affiliateSite) {
      affiliateSite = product.affiliateSite;
    } else if ((product.mode || '').toLowerCase() === "ebay") {
      affiliateSite = "eBay";
    } else if ((product.mode || '').toLowerCase() === "jumia") {
      affiliateSite = "Jumia";
    }

    // images carousel array
    const images = [product.image, product.image2, product.image3].filter(Boolean);
    let currentImg = 0;

    const imgId = `img-${product.id}-${Math.random().toString(36).slice(2)}`;

    // ✅ Product card with affiliate + price
    card.innerHTML = `
      <img id="${imgId}" src="${images[0]}" alt="${product.title}" class="mb-4 rounded w-full h-48 object-cover" />
      <h3 class="font-normal text-xs mb-1">${product.title}</h3>
      <div class="mb-3">
        <p class="text-green-700 font-bold text-sm">
          ${currency === "USD" ? `$${usdPrice.toFixed(2)}` : `${usdPrice} ${currency}`}
        </p>
        ${
          currency === "USD"
            ? `<p class="text-gray-600 text-xs">₦${ngnPrice.toLocaleString()}</p>`
            : ""
        }
      </div>
      <button onclick="toggleSpecs(this)" class="bg-yellow-500 text-black px-3 py-1 mt-2 inline-block rounded hover:bg-yellow-400 text-xs font-semibold">
        Read Specs
      </button>
      <div class="specs hidden mt-3 text-xs text-gray-700">
        <p class="mb-2">${product.description || ''}</p>
        <a href="${product.buy_link}" onclick="trackClick('${product.title}')" target="_blank" 
           class="bg-yellow-500 text-black px-3 py-1 mt-2 mr-2 inline-block rounded hover:bg-yellow-400 text-xs font-semibold">
           Buy on ${affiliateSite}
        </a>
        <a href="product-wisdom.html?id=${product.id}" class="text-green-800 underline mt-2 block">Why This Product?</a>
      </div>
    `;

    grid.appendChild(card);

    // ✅ auto-rotate images if more than one
    if (images.length > 1) {
      setInterval(() => {
        currentImg = (currentImg + 1) % images.length;
        const imgEl = document.getElementById(imgId);
        if (imgEl) imgEl.src = images[currentImg];
      }, 4000);
    }
  });

  // Show "no products" message if empty
  document.getElementById("empty-state").classList.toggle("hidden", products.length > 0);
}

function toggleSpecs(button) {
  const specsDiv = button.nextElementSibling;
  if (specsDiv.classList.contains("hidden")) {
    specsDiv.classList.remove("hidden");
    button.textContent = "Hide Specs";
  } else {
    specsDiv.classList.add("hidden");
    button.textContent = "Read Specs";
  }
}

function filterProducts(category) {
  currentCategory = category;
  applyFilters();
}

document.getElementById("search-input").addEventListener("input", applyFilters);

function applyFilters() {
  const keyword = document.getElementById("search-input").value.toLowerCase();
  const filtered = allProducts.filter(p => {
    const productCategory = (p.category || "").toLowerCase();
    const matchCategory = currentCategory === "All" || productCategory === currentCategory.toLowerCase();
    const matchKeyword = (p.title || "").toLowerCase().includes(keyword);
    return matchCategory && matchKeyword;
  });
  displayProducts(filtered);
}

// 🔍 Track button click
function trackClick(productTitle) {
  if (typeof gtag === "function") {
    gtag("event", "click", {
      event_category: "Product",
      event_label: productTitle
    });
  }
}
