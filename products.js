let allProducts = [];
let currentCategory = "All";

// ✅ Fetch products from backend API
fetch("https://one000homevibes.onrender.com/products")
  .then(res => res.json())
  .then(products => {
    allProducts = products;
    displayProducts(products);
  })
  .catch(err => {
    console.error("❌ Failed to load products:", err);
    document.getElementById("product-grid").innerHTML = `
      <p class="text-red-400">Failed to load products. Please try again later.</p>
    `;
  });

// 🔹 Helper to format price nicely
function formatPrice(product) {
  const price = parseFloat(product.price) || 0;
  const unit = product.price_unit || "USD";

  if (unit === "USD") {
    const ngn = price * 1500; // conversion rate
    return `
      <p class="text-green-700 font-bold">$${price.toFixed(2)}</p>
      <p class="text-gray-600 text-xs">₦${ngn.toLocaleString()}</p>
    `;
  } else if (unit === "NGN") {
    return `<p class="text-green-700 font-bold">₦${price.toLocaleString()}</p>`;
  } else if (unit === "EUR") {
    return `<p class="text-green-700 font-bold">€${price.toFixed(2)}</p>`;
  } else if (unit === "GBP") {
    return `<p class="text-green-700 font-bold">£${price.toFixed(2)}</p>`;
  }

  return `<p class="text-green-700 font-bold">${price}</p>`;
}

function displayProducts(products) {
  const grid = document.getElementById("product-grid");
  grid.innerHTML = "";

  products.forEach(product => {
    const card = document.createElement("div");
    card.className = "product-card bg-white text-black p-4 rounded-xl shadow relative";
    card.dataset.category = product.category;
    card.dataset.title = product.title.toLowerCase();

    // initial compact view
    card.innerHTML = `
      <img src="${product.image}" alt="${product.title}" class="mb-4 rounded w-full h-48 object-cover" />
      <h3 class="font-bold text-sm mb-1">${product.title}</h3>
      <div class="mb-3">
        ${formatPrice(product)}
      </div>
      <button onclick="toggleSpecs(this)" class="bg-yellow-500 text-black px-3 py-1 mt-2 inline-block rounded hover:bg-yellow-400 text-sm font-semibold">
        Read Specs
      </button>
      <div class="specs hidden mt-3 text-xs text-gray-700">
        <p class="mb-2">${product.description}</p>
        <a href="${product.buy_link}" onclick="trackClick('${product.title}')" target="_blank" 
           class="bg-yellow-500 text-black px-3 py-1 mt-2 mr-2 inline-block rounded hover:bg-yellow-400 text-sm font-semibold">Buy on Amazon</a>
        <a href="product-wisdom.html?id=${product.id}" class="text-green-800 underline mt-2 block">Why This Product?</a>
      </div>
    `;

    grid.appendChild(card);
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
    const matchCategory = currentCategory === "All" || p.category === currentCategory;
    const matchKeyword = p.title.toLowerCase().includes(keyword);
    return matchCategory && matchKeyword;
  });
  displayProducts(filtered);
}

// 🔍 Track Amazon button click
function trackClick(productTitle) {
  if (typeof gtag === "function") {
    gtag("event", "click", {
      event_category: "Product",
      event_label: productTitle
    });
  }
}
