// আপনার Google Apps Script URL
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz-vkMWecKUxj-ElOXFEqKF6G6oY18eiCGT0QiOyn_pK7VHBCG57Bri4vQ0gVXpuvXX/exec";

let products = [];
let currentProduct = {};
let currentQty = 1;

// পেজ লোড হওয়ার পর গুগল শিট থেকে প্রোডাক্ট নিয়ে আসবে
window.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
});

// গুগল শিট থেকে প্রোডাক্ট ফেচিং
async function fetchProducts() {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #555;">প্রোডাক্ট লোড হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...</p>';

    try {
        const response = await fetch(GOOGLE_SCRIPT_URL);
        const data = await response.json();
        
        if (data && data.length > 0) {
            products = data;
            displayProducts(products);
        } else {
            // যদি গুগল শিট ফাঁকা থাকে বা ফেচ না হয় তবে ডিফল্ট প্রোডাক্ট দেখাবে
            loadDefaultProducts();
        }
    } catch (error) {
        console.warn("গুগল শিট থেকে ডাটা আসতে সমস্যা হয়েছে, ডিফল্ট ডাটা দেখানো হচ্ছে।", error);
        loadDefaultProducts();
    }
}

// ব্যাকআপ / ডিফল্ট প্রোডাক্ট
function loadDefaultProducts() {
    products = [
        {
            title: "Wireless Bluetooth Headphones",
            price: 2500,
            image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
            desc: "• ১০ ঘণ্টা প্লে-টাইম ব্যাটারি ব্যাকআপ\n• সুপার বাস এবং ক্লিয়ার সাউন্ড কোয়ালিটি",
            varieties: ["Black", "White", "Blue"],
            category: "electronics"
        },
        {
            title: "Smart Fitness Watch Pro",
            price: 4200,
            image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
            desc: "• হার্ট রেট ও স্লিপ মনিটরিং ডিসপ্লে\n• ফুল ওয়াটারপ্রুফ মেটাল বডি",
            varieties: ["Black", "Silver"],
            category: "electronics"
        }
    ];
    displayProducts(products);
}

// প্রোডাক্ট গ্রিড রেন্ডার
function displayProducts(prods) {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = '';

    if (!prods || prods.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #777;">এই ক্যাটেগরিতে কোনো প্রডাক্ট নেই।</p>';
        return;
    }

    prods.forEach((p) => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.onclick = () => openProductDetails(p);
        card.innerHTML = `
            <img src="${p.image || 'https://via.placeholder.com/200'}" class="product-img">
            <h3 class="product-title">${p.title}</h3>
            <div class="product-price">৳ ${p.price}</div>
        `;
        grid.appendChild(card);
    });
}

// ক্যাটাগরি ফিল্টার
function filterProducts(category, btn) {
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    if (category === 'all') {
        displayProducts(products);
    } else {
        const filtered = products.filter(p => p.category && p.category.toLowerCase() === category.toLowerCase());
        displayProducts(filtered);
    }
}

// প্রোডাক্ট ডিটেইলস মোডাল
function openProductDetails(p) {
    currentProduct = p;
    currentQty = 1;

    document.getElementById('viewTitle').innerText = p.title;
    document.getElementById('viewPrice').innerText = '৳ ' + p.price;
    document.getElementById('viewImage').src = p.image || 'https://via.placeholder.com/200';
    document.getElementById('viewDesc').innerText = p.desc || '';
    document.getElementById('qtyVal').innerText = currentQty;

    const varietySelect = document.getElementById('viewVariety');
    varietySelect.innerHTML = '';
    
    // ভ্যারাইটি অ্যারে বা স্ট্রিং চেক
    let vars = Array.isArray(p.varieties) ? p.varieties : (p.varieties ? p.varieties.split(',') : ['Default']);
    vars.forEach(v => {
        let opt = document.createElement('option');
        opt.value = v.trim();
        opt.innerText = v.trim();
        varietySelect.appendChild(opt);
    });

    document.getElementById('productViewModal').style.display = 'flex';
}

function updateQty(change) {
    if (currentQty + change >= 1) {
        currentQty += change;
        document.getElementById('qtyVal').innerText = currentQty;
        document.getElementById('viewPrice').innerText = '৳ ' + (currentProduct.price * currentQty);
    }
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function proceedToCheckout() {
    closeModal('productViewModal');
    
    const selectedVariety = document.getElementById('viewVariety').value;
    const totalPrice = currentProduct.price * currentQty;

    document.getElementById('finalProduct').value = `${currentProduct.title} (${selectedVariety}) x ${currentQty}`;
    document.getElementById('finalPrice').value = `৳ ${totalPrice}`;

    document.getElementById('checkoutModal').style.display = 'flex';
}

// অর্ডার সাবমিট ফর্ম
document.getElementById('orderForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.innerText = "অর্ডার প্রসেসিং হচ্ছে...";

    const orderData = {
        date: new Date().toLocaleString('bn-BD'),
        product: document.getElementById('finalProduct').value,
        price: document.getElementById('finalPrice').value,
        name: document.getElementById('custName').value,
        phone: document.getElementById('custPhone').value,
        address: document.getElementById('custAddress').value,
        method: document.getElementById('payMethod').value,
        txn: document.getElementById('custTxn').value
    };

    fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
    }).then(() => {
        alert('অভিনন্দন! আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে।');
        submitBtn.disabled = false;
        submitBtn.innerText = "অর্ডার নিশ্চিত করুন";
        document.getElementById('orderForm').reset();
        closeModal('checkoutModal');
    }).catch(error => {
        alert('অর্ডার পাঠাতে সমস্যা হয়েছে, আবার চেষ্টা করুন।');
        submitBtn.disabled = false;
        submitBtn.innerText = "অর্ডার নিশ্চিত করুন";
    });
});
