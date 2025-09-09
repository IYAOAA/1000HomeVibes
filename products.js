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

function displayProducts(products) {
  const grid = document.getElementById("product-grid");
  grid.innerHTML = "";

  products.forEach(product => {
    const card = document.createElement("div");
    card.className = "product-card bg-white text-black p-4 rounded-xl shadow relative";
    card.dataset.category = product.category;
    card.dataset.title = product.title.toLowerCase();

    // initial compact view (only image, title, price, and read specs button)
    card.innerHTML = `
      <img src="${product.image}" alt="${product.title}" class="mb-4 rounded w-full h-48 object-cover" />
      <h3 class="font-bold text-lg mb-1">${product.title}</h3>
      <p class="text-green-700 font-bold mb-3">$${product.price}</p>
      <button onclick="toggleSpecs(this)" class="bg-yellow-500 text-black px-4 py-2 mt-2 inline-block rounded hover:bg-yellow-400 font-semibold">
        Read Specs
      </button>
      <div class="specs hidden mt-3 text-sm text-gray-700">
        <p class="mb-2">${product.description}</p>
        <a href="${product.buy_link}" onclick="trackClick('${product.title}')" target="_blank" class="bg-yellow-500 text-black px-4 py-2 mt-2 mr-2 inline-block rounded hover:bg-yellow-400 font-semibold">Buy on Amazon</a>
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
