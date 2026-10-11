const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx-6TwODt-zq7--9tpW3eaAkqwB7I3PlRkyIGr2QkIe0Bno6-aCl_YVSIg45eGvL0Dl/exec";

let currentProduct = {};
let currentQty = 1;

// Load all products on page load
window.addEventListener('DOMContentLoaded', () => {
    displayProducts(products);
});

// Render products function
function displayProducts(prods) {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = '';

    if (prods.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #777;">এই ক্যাটেগরিতে কোনো প্রডাক্ট নেই।</p>';
        return;
    }

    prods.forEach((p) => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.onclick = () => openProductDetails(p);
        card.innerHTML = `
            <img src="${p.image}" class="product-img">
            <h3 class="product-title">${p.title}</h3>
            <div class="product-price">৳ ${p.price}</div>
        `;
        grid.appendChild(card);
    });
}

// Filter products by category
function filterProducts(category, btn) {
    // Active class toggle
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    if (category === 'all') {
        displayProducts(products);
    } else {
        const filtered = products.filter(p => p.category === category);
        displayProducts(filtered);
    }
}

function openProductDetails(p) {
    currentProduct = p;
    currentQty = 1;

    document.getElementById('viewTitle').innerText = p.title;
    document.getElementById('viewPrice').innerText = '৳ ' + p.price;
    document.getElementById('viewImage').src = p.image;
    document.getElementById('viewDesc').innerText = p.desc;
    document.getElementById('qtyVal').innerText = currentQty;

    const varietySelect = document.getElementById('viewVariety');
    varietySelect.innerHTML = '';
    p.varieties.forEach(v => {
        let opt = document.createElement('option');
        opt.value = v;
        opt.innerText = v;
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
