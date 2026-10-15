const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycby5rC0SBZzfqoAD93CZRZJ0jXleEPzmzU2BnkDPj_stDukdPmpohuMeK6J-yYCBJ3qx/exec";

let allProducts = [];
let selectedProduct = null;
let currentQty = 1;

// পেজ লোড হলে ডাটা আনবে
document.addEventListener("DOMContentLoaded", () => {
  fetchProducts();
  
  // অর্ডার ফর্ম সাবমিট হ্যান্ডলার
  const orderForm = document.getElementById("orderForm");
  if (orderForm) {
    orderForm.addEventListener("submit", handleOrderSubmit);
  }
});

// গুগল শিট থেকে ডাটা ফেচ করা
function fetchProducts() {
  const grid = document.getElementById("productsGrid");
  if (grid) {
    grid.innerHTML = "<p style='text-align:center; width:100%; padding: 20px;'>প্রডাক্ট লোড হচ্ছে...</p>";
  }

  fetch(GOOGLE_SCRIPT_URL)
    .then(response => response.json())
    .then(data => {
      console.log("Fetched Data:", data);
      allProducts = data;
      renderProducts(allProducts);
    })
    .catch(error => {
      console.error("Error fetching products:", error);
      if (grid) {
        grid.innerHTML = "<p style='text-align:center; color:red; width:100%; padding: 20px;'>প্রডাক্ট লোড করতে সমস্যা হয়েছে! ইন্টারনেট কানেকশন চেক করুন।</p>";
      }
    });
}

// প্রোডাক্ট গ্রিডে শো করানোর ফাংশন (CSS ক্লাসের সাথে সামঞ্জস্যপূর্ণ)
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
    card.onclick = () => openProductModal(index); // কার্ডে ক্লিক করলে ডিটেইলস মোডাল খুলবে

    const imgUrl = product.image && product.image.startsWith("http") ? product.image : "https://via.placeholder.com/200";

    card.innerHTML = `
      <img src="${imgUrl}" alt="${product.title || 'Product'}" class="product-img">
      <h3 class="product-title">${product.title || ''}</h3>
      <p class="product-price">৳ ${product.price || '0'}</p>
    `;
    grid.appendChild(card);
  });
}

// ক্যাটাগরি ফিল্টার করার ফাংশন
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

// প্রডাক্ট ভিউ মোডাল ওপেন করা
function openProductModal(index) {
  selectedProduct = allProducts[index];
  if (!selectedProduct) return;

  document.getElementById("viewImage").src = selectedProduct.image || "https://via.placeholder.com/200";
  document.getElementById("viewTitle").innerText = selectedProduct.title || "";
  document.getElementById("viewPrice").innerText = "৳ " + (selectedProduct.price || 0);
  document.getElementById("viewDesc").innerText = selectedProduct.desc || "কোনো বিবরণ নেই।";

  // ভ্যারাইটি ড্রপডাউন সেটআপ
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

  document.getElementById("productViewModal").style.display = "flex";
}

// পরিমাণ (Qty) আপডেট করা
function updateQty(change) {
  currentQty += change;
  if (currentQty < 1) currentQty = 1;
  document.getElementById("qtyVal").innerText = currentQty;
}

// চেকআউট মোডালে যাওয়া
function proceedToCheckout() {
  closeModal('productViewModal');
  
  const variety = document.getElementById("viewVariety").value;
  const totalPrice = (selectedProduct.price || 0) * currentQty;

  document.getElementById("finalProduct").value = `${selectedProduct.title} (${variety}) - Qty: ${currentQty}`;
  document.getElementById("finalPrice").value = `${totalPrice} ৳ (ডেলিভারি চার্জ ১৫০৳ সহ মোট: ${totalPrice + 150}৳)`;

  document.getElementById("checkoutModal").style.display = "flex";
}

// মোডাল বন্ধ করার ফাংশন
function closeModal(modalId) {
  document.getElementById(modalId).style.display = "none";
}

// অর্ডার সাবমিট করে গুগল শিটে পাঠানোর ফাংশন
function handleOrderSubmit(e) {
  e.preventDefault();

  const submitBtn = document.getElementById("submitBtn");
  submitBtn.disabled = true;
  submitBtn.innerText = "অর্ডার সাবমিট হচ্ছে...";

  const orderData = {
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
    headers: {
      "Content-Type": "application/json"
    },
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
    alert("অর্ডার পাঠাতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।");
    submitBtn.disabled = false;
    submitBtn.innerText = "অর্ডার নিশ্চিত করুন";
  });
}
