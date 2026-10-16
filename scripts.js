const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx8H7N4KI-oWkATMPkwD_IPJSMhPjfuscE0QPDjB13pp5qCJgcUJeuAnTsJleMySvTJ/exec";

let allProducts = [];
let selectedProduct = null;
let currentQty = 1;
const ADMIN_PASSWORD = "579781"; // আপনার পছন্দমতো পাসওয়ার্ড দিতে পারেন

document.addEventListener("DOMContentLoaded", () => {
  fetchProducts();
  
  const orderForm = document.getElementById("orderForm");
  if (orderForm) {
    orderForm.addEventListener("submit", handleOrderSubmit);
  }

  const addProductForm = document.getElementById("addProductForm");
  if (addProductForm) {
    addProductForm.addEventListener("submit", handleAddProductSubmit);
  }
});

function fetchProducts() {
  const grid = document.getElementById("productsGrid");
  if (grid) {
    grid.innerHTML = "<p style='text-align:center; width:100%; padding: 20px;'>প্রডাক্ট লোড হচ্ছে...</p>";
  }

  fetch(GOOGLE_SCRIPT_URL)
    .then(response => response.json())
    .then(data => {
      allProducts = data;
      renderProducts(allProducts);
    })
    .catch(error => {
      console.error("Error fetching products:", error);
      if (grid) {
        grid.innerHTML = "<p style='text-align:center; color:red; width:100%; padding: 20px;'>প্রডাক্ট লোড করতে সমস্যা হয়েছে!</p>";
      }
    });
}

function renderProducts(products) {
  const grid = document.getElementById("productsGrid");
  if (!grid) return;

  grid.innerHTML = "";

  if (!products || products.length === 0) {
    grid.innerHTML = "<p style='text-align:center; width:100%; padding: 20px;'>কোনো প্রডাক্ট পাওয়া যায়নি!</p>";
    return;
  }

  products.forEach((product, index) => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.onclick = () => openProductModal(index);

    const imgUrl = product.image && product.image.startsWith("http") ? product.image : "https://via.placeholder.com/200";

    card.innerHTML = `
      <img src="${imgUrl}" alt="${product.title || 'Product'}" class="product-img">
      <h3 class="product-title">${product.title || ''}</h3>
      <p class="product-price">৳ ${product.price || '0'}</p>
    `;
    grid.appendChild(card);
  });
}

function filterProducts(category, btnElement) {
  const buttons = document.querySelectorAll(".cat-btn");
  buttons.forEach(btn => btn.classList.remove("active"));
  if (btnElement) {
    btnElement.classList.add("active");
  }

  if (category === "all") {
    renderProducts(allProducts);
  } else {
    const filtered = allProducts.filter(item => {
      return item.category && item.category.toString().toLowerCase().trim() === category.toLowerCase().trim();
    });
    renderProducts(filtered);
  }
}

function openProductModal(index) {
  selectedProduct = allProducts[index];
  if (!selectedProduct) return;

  document.getElementById("viewImage").src = selectedProduct.image || "https://via.placeholder.com/200";
  document.getElementById("viewTitle").innerText = selectedProduct.title || "";
  document.getElementById("viewPrice").innerText = "৳ " + (selectedProduct.price || 0);
  document.getElementById("viewDesc").innerText = selectedProduct.desc || "কোনো বিবরণ নেই।";

  const varietySelect = document.getElementById("viewVariety");
  varietySelect.innerHTML = "";
  if (selectedProduct.varieties) {
    const varieties = selectedProduct.varieties.split(",");
    varieties.forEach(v => {
      const opt = document.createElement("option");
      opt.value = v.trim();
      opt.innerText = v.trim();
      varietySelect.appendChild(opt);
    });
  } else {
    const opt = document.createElement("option");
    opt.value = "Standard";
    opt.innerText = "Standard";
    varietySelect.appendChild(opt);
  }

  currentQty = 1;
  document.getElementById("qtyVal").innerText = currentQty;

  openModal("productViewModal");
}

function updateQty(change) {
  currentQty += change;
  if (currentQty < 1) currentQty = 1;
  document.getElementById("qtyVal").innerText = currentQty;
}

function proceedToCheckout() {
  closeModal('productViewModal');
  
  const variety = document.getElementById("viewVariety").value;
  const totalPrice = (selectedProduct.price || 0) * currentQty;

  document.getElementById("finalProduct").value = `${selectedProduct.title} (${variety}) - Qty: ${currentQty}`;
  document.getElementById("finalPrice").value = `${totalPrice} ৳ (ডেলিভারি চার্জ ১৫০৳ সহ মোট: ${totalPrice + 150}৳)`;

  openModal("checkoutModal");
}

function openModal(modalId) {
  document.getElementById(modalId).style.display = "flex";
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = "none";
}

function checkAdminPass() {
  const pass = document.getElementById("adminPass").value;
  if (pass === ADMIN_PASSWORD) {
    closeModal('adminAuthModal');
    document.getElementById("adminPass").value = "";
    openModal('adminPanelModal');
  } else {
    alert("ভুল পাসওয়ার্ড! আবার চেষ্টা করুন।");
  }
}

function handleOrderSubmit(e) {
  e.preventDefault();

  const submitBtn = document.getElementById("submitBtn");
  submitBtn.disabled = true;
  submitBtn.innerText = "অর্ডার সাবমিট হচ্ছে...";

  const orderData = {
    action: "addOrder",
    product: document.getElementById("finalProduct").value,
    price: document.getElementById("finalPrice").value,
    name: document.getElementById("custName").value,
    phone: document.getElementById("custPhone").value,
    address: document.getElementById("custAddress").value,
    method: document.getElementById("payMethod").value,
    txnid: document.getElementById("custTxn").value
  };

  fetch(GOOGLE_SCRIPT_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData)
  })
  .then(() => {
    alert("সফলভাবে আপনার অর্ডারটি গ্রহণ করা হয়েছে! ধন্যবাদ।");
    document.getElementById("orderForm").reset();
    closeModal('checkoutModal');
    submitBtn.disabled = false;
    submitBtn.innerText = "অর্ডার নিশ্চিত করুন";
  })
  .catch(error => {
    console.error("Order Error:", error);
    alert("অর্ডার পাঠাতে সমস্যা হয়েছে।");
    submitBtn.disabled = false;
    submitBtn.innerText = "অর্ডার নিশ্চিত করুন";
  });
}

function handleAddProductSubmit(e) {
  e.preventDefault();

  const addBtn = document.getElementById("addProdBtn");
  addBtn.disabled = true;
  addBtn.innerText = "প্রডাক্ট সেভ হচ্ছে...";

  const productData = {
    action: "addProduct",
    title: document.getElementById("prodTitle").value,
    price: document.getElementById("prodPrice").value,
    image: document.getElementById("prodImage").value,
    desc: document.getElementById("prodDesc").value,
    varieties: document.getElementById("prodVarieties").value,
    category: document.getElementById("prodCategory").value
  };

  fetch(GOOGLE_SCRIPT_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(productData)
  })
  .then(() => {
    alert("নতুন প্রডাক্ট সফলভাবে যুক্ত হয়েছে!");
    document.getElementById("addProductForm").reset();
    closeModal('adminPanelModal');
    addBtn.disabled = false;
    addBtn.innerText = "প্রডাক্ট সেভ করুন";
    fetchProducts(); // পেজ না রিফ্রেশ করেই নতুন প্রডাক্ট লোড করবে
  })
  .catch(error => {
    console.error("Add Product Error:", error);
    alert("প্রডাক্ট যোগ করতে সমস্যা হয়েছে।");
    addBtn.disabled = false;
    addBtn.innerText = "প্রডাক্ট সেভ করুন";
  });
}
