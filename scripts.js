const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby5rC0SBZzfqoAD93CZRZJ0jXleEPzmzU2BnkDPj_stDukdPmpohuMeK6J-yYCBJ3qx/exec";

let allProducts = []; // সব প্রোডাক্ট সেভ রাখার জন্য

// পেজ লোড হলে ডাটা আনবে
document.addEventListener("DOMContentLoaded", () => {
  fetchProducts();
});

// গুগল শিট থেকে ডাটা ফেচ করা
function fetchProducts() {
  const grid = document.getElementById("productsGrid");
  if (grid) {
    grid.innerHTML = "<p style='text-align:center; width:100%;'>প্রডাক্ট লোড হচ্ছে...</p>";
  }

  fetch(GOOGLE_SCRIPT_URL)
    .then(response => response.json())
    .then(data => {
      console.log("Fetched Data:", data);
      allProducts = data; // ডাটা গ্লোবাল ভ্যারিয়েবলে রাখা হলো
      renderProducts(allProducts); // সব প্রোডাক্ট প্রথম অবস্থায় দেখাবে
    })
    .catch(error => {
      console.error("Error fetching products:", error);
      if (grid) {
        grid.innerHTML = "<p style='text-align:center; color:red; width:100%;'>প্রডাক্ট লোড করতে সমস্যা হয়েছে!</p>";
      }
    });
}

// প্রোডাক্ট গ্রিডে শো করানোর ফাংশন
function renderProducts(products) {
  const grid = document.getElementById("productsGrid");
  if (!grid) return;

  grid.innerHTML = ""; // আগের বিষয়বস্তু খালি করা

  if (products.length === 0) {
    grid.innerHTML = "<p style='text-align:center; width:100%;'>কোনো প্রডাক্ট পাওয়া যায়নি!</p>";
    return;
  }

  products.forEach(product => {
    const card = document.createElement("div");
    card.className = "product-card"; // আপনার CSS-এর প্রোডাক্ট কার্ডের ক্লাস

    // ছবি সেট করা (ছবি না থাকলে ডিফল্ট বা নো-ইমেজ দেখাবে)
    const imgUrl = product.image || "https://via.placeholder.com/150";

    card.innerHTML = `
      <img src="${imgUrl}" alt="${product.title || 'Product'}">
      <h3>${product.title || ''}</h3>
      <p class="price">৳ ${product.price || '0'}</p>
      <p class="desc">${product.desc || ''}</p>
      <button class="order-btn" onclick="openOrderModal('${product.title}', '${product.price}')">অর্ডার করুন</button>
    `;
    grid.appendChild(card);
  });
}

// ক্যাটাগরি ফিল্টার করার ফাংশন
function filterProducts(category, btnElement) {
  // বাটনের active ক্লাস চেঞ্জ করা
  const buttons = document.querySelectorAll(".cat-btn");
  buttons.forEach(btn => btn.classList.remove("active"));
  if (btnElement) {
    btnElement.classList.add("active");
  }

  // ক্যাটাগরি অনুযায়ী ফিল্টার করা
  if (category === "all") {
    renderProducts(allProducts);
  } else {
    const filtered = allProducts.filter(item => {
      return item.category && item.category.toString().toLowerCase().trim() === category.toLowerCase().trim();
    });
    renderProducts(filtered);
  }
}
