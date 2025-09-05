let allProducts = [];
let currentCategory = "All";

fetch('products.json')
  .then(res => res.json())
  .then(products => {
    allProducts = products;
    displayProducts(products);
  });

function displayProducts(products) {
  const grid = document.getElementById("product-grid");
  grid.innerHTML = "";
  products.forEach(product => {
    const card = document.createElement("div");
    card.className = "product-card bg-white text-black p-4 rounded-xl shadow";
    card.dataset.category = product.category;
    card.dataset.title = product.title.toLowerCase();
    card.innerHTML = `
      <img src="${product.image}" alt="${product.title}" class="mb-4 rounded w-full h-48 object-cover" />
      <h3 class="font-bold text-lg">${product.title}</h3>
      <p class="text-sm mb-2">${product.description}</p>
      <a href="${product.buy_link}" onclick="trackClick('${product.title}')" target="_blank" class="bg-yellow-500 text-black px-4 py-2 mt-2 mr-2 inline-block rounded hover:bg-yellow-400 font-semibold">Buy on Amazon</a>
      <a href="product.html?id=${product.id}" class="bg-yellow-500 text-black px-4 py-2 mt-2 inline-block rounded hover:bg-yellow-400 font-semibold">Read Specs</a>
      <a href="product-wisdom.html?id=${product.id}" class="text-yellow-300 underline mt-2 block">Why This Product?</a>
    `;
    grid.appendChild(card);
  });
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
    gtag('event', 'click', {
      'event_category': 'Product',
      'event_label': productTitle
    });
  }
}