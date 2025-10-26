/* Cart & UI logic for functional mock pages */
document.addEventListener('DOMContentLoaded', function () {
  // Initialize Bootstrap dropdowns
  $('.dropdown-toggle').dropdown();
  
  // Dark Mode Toggle
  const darkModeToggle = document.getElementById('darkModeToggle');
  const body = document.body;
  
  // Check for saved dark mode preference
  if (localStorage.getItem('darkMode') === 'enabled') {
    body.classList.add('dark-mode');
    updateDarkModeIcon();
  }
  
  // Dark mode toggle functionality
  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', function() {
      body.classList.toggle('dark-mode');
      
      // Save preference to localStorage
      if (body.classList.contains('dark-mode')) {
        localStorage.setItem('darkMode', 'enabled');
      } else {
        localStorage.setItem('darkMode', 'disabled');
      }
      
      updateDarkModeIcon();
    });
  }
  
  function updateDarkModeIcon() {
    if (!darkModeToggle) return;
    
    const icon = darkModeToggle.querySelector('i');
    if (body.classList.contains('dark-mode')) {
      icon.classList.remove('fa-moon');
      icon.classList.add('fa-sun');
    } else {
      icon.classList.remove('fa-sun');
      icon.classList.add('fa-moon');
    }
  }
  
  // Back to top button
  const backToTopButton = document.querySelector('.back-to-top');
  if (backToTopButton) {
    window.addEventListener('scroll', function() {
      if (window.pageYOffset > 300) {
        backToTopButton.classList.add('show');
      } else {
        backToTopButton.classList.remove('show');
      }
    });
  }
  
  // Wishlist functionality
  const wishlistLink = document.getElementById('wishlist-link');
  const wishlistBadge = wishlistLink ? wishlistLink.querySelector('.badge') : null;
  
  function getWishlist() {
    return JSON.parse(localStorage.getItem('wishlist') || '[]');
  }
  
  function saveWishlist(wishlist) {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }
  
  function updateWishlistCount() {
    if (!wishlistBadge) return;
    const wishlist = getWishlist();
    wishlistBadge.textContent = wishlist.length;
  }
  
  // Initialize wishlist count
  updateWishlistCount();
  
  // Add wishlist buttons functionality
  document.querySelectorAll('.add-to-wishlist').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const id = this.dataset.id;
      const name = this.dataset.name;
      const price = parseInt(this.dataset.price, 10);
      const img = this.dataset.img || 'assets/images/product1.png';
      
      let wishlist = getWishlist();
      const existing = wishlist.find(i => i.id == id);
      
      if (!existing) {
        wishlist.push({id, name, price, img});
        saveWishlist(wishlist);
        updateWishlistCount();
        
        // Visual feedback
        this.innerHTML = '<i class="fas fa-heart"></i>';
        this.classList.add('active');
        
        // Show toast notification
        showToast('Product added to wishlist!');
      } else {
        // Remove from wishlist if already added
        wishlist = wishlist.filter(i => i.id != id);
        saveWishlist(wishlist);
        updateWishlistCount();
        
        // Visual feedback
        this.innerHTML = '<i class="far fa-heart"></i>';
        this.classList.remove('active');
        
        // Show toast notification
        showToast('Product removed from wishlist!');
      }
    });
  });
  
  // Toast notification function
  function showToast(message) {
    // Create toast element if it doesn't exist
    let toast = document.querySelector('.toast-notification');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast-notification';
      document.body.appendChild(toast);
    }
    
    // Set message and show
    toast.textContent = message;
    toast.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }
  
  // Quick view product functionality
  document.querySelectorAll('.quick-view-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const id = this.dataset.id;
      const name = this.dataset.name;
      const price = this.dataset.price;
      const img = this.dataset.img;
      const description = this.dataset.description || 'No description available.';
      
      // Populate quick view modal
      const modal = document.getElementById('quickViewModal');
      if (modal) {
        const modalImg = modal.querySelector('.product-img img');
        const modalTitle = modal.querySelector('.product-title');
        const modalPrice = modal.querySelector('.product-price');
        const modalDesc = modal.querySelector('.product-description');
        const addToCartBtn = modal.querySelector('.add-to-cart');
        
        if (modalImg) modalImg.src = img;
        if (modalTitle) modalTitle.textContent = name;
        if (modalPrice) modalPrice.textContent = formatPrice(price);
        if (modalDesc) modalDesc.textContent = description;
        
        if (addToCartBtn) {
          addToCartBtn.dataset.id = id;
          addToCartBtn.dataset.name = name;
          addToCartBtn.dataset.price = price;
          addToCartBtn.dataset.img = img;
        }
        
        // Show modal
        $(modal).modal('show');
      }
    });
  });
  // Utilities
  function getCart(){ return JSON.parse(localStorage.getItem('cart')||'[]'); }
  function saveCart(cart){ localStorage.setItem('cart', JSON.stringify(cart)); }
  function formatPrice(p){ return '₹'+p; }

  // Update cart count in header
  function updateCartCount(){
    const el = document.getElementById('cart-count');
    if(!el) return;
    const cart = getCart();
    el.textContent = cart.reduce((s,i)=>s+i.qty,0);
  }
  updateCartCount();

  // Add to cart buttons
  document.querySelectorAll('.add-to-cart').forEach(btn=>{
    btn.addEventListener('click', function(e){
      const id = this.dataset.id || this.getAttribute('data-id');
      const name = this.dataset.name || this.getAttribute('data-name');
      const price = parseInt(this.dataset.price || this.getAttribute('data-price')||0,10);
      const img = this.dataset.img || this.getAttribute('data-img')||'assets/images/product1.png';
      let cart = getCart();
      const existing = cart.find(i=>i.id==id);
      if(existing){ existing.qty += 1; } else { cart.push({id:id,name:name,price:price,img:img,qty:1}); }
      saveCart(cart);
      updateCartCount();
      this.textContent = 'Added';
      this.disabled = true;
    });
  });

  // CART PAGE: render cart table if present
  const cartTable = document.getElementById('cart-table-body');
  if(cartTable){
    function renderCartTable(){
      const cart = getCart();
      cartTable.innerHTML = '';
      if(cart.length===0){
        cartTable.innerHTML = '<tr><td colspan="6">Your cart is empty.</td></tr>';
        document.getElementById('checkout-btn').disabled = true;
        document.getElementById('cart-total').textContent = formatPrice(0);
        return;
      }
      let total = 0;
      cart.forEach((item,idx)=>{
        const row = document.createElement('tr');
        const subtotal = item.price * item.qty;
        total += subtotal;
        row.innerHTML = `
          <td>${idx+1}</td>
          <td><img src="${item.img}" width="60" /></td>
          <td>${item.name}</td>
          <td>${formatPrice(item.price)}</td>
          <td><input type="number" min="1" value="${item.qty}" class="form-control qty-input" data-id="${item.id}" style="width:80px"></td>
          <td>${formatPrice(subtotal)}</td>
          <td><button class="btn btn-sm btn-danger remove-btn" data-id="${item.id}">Remove</button></td>
        `;
        cartTable.appendChild(row);
      });
      document.getElementById('cart-total').textContent = formatPrice(total);
      // attach events for qty change and remove
      document.querySelectorAll('.qty-input').forEach(inp=>{
        inp.addEventListener('change', function(){
          const id = this.dataset.id;
          let cart = getCart();
          const it = cart.find(i=>i.id==id);
          if(!it) return;
          it.qty = Math.max(1, parseInt(this.value||1,10));
          saveCart(cart);
          renderCartTable();
          updateCartCount();
        });
      });
      document.querySelectorAll('.remove-btn').forEach(b=>{
        b.addEventListener('click', function(){
          const id = this.dataset.id;
          let cart = getCart();
          cart = cart.filter(i=>i.id!=id);
          saveCart(cart);
          renderCartTable();
          updateCartCount();
        });
      });
    }
    renderCartTable();
  }

  // CHECKOUT PAGE: populate summary and submit order
  const checkoutSummary = document.getElementById('checkout-summary');
  if(checkoutSummary){
    const cart = getCart();
    let total = 0;
    checkoutSummary.innerHTML = '';
    if(cart.length===0){
      checkoutSummary.innerHTML = '<p>Your cart is empty. Add items before checkout.</p>';
      document.getElementById('place-order-btn').disabled = true;
    } else {
      const table = document.createElement('table');
      table.className = 'table';
      table.innerHTML = '<thead><tr><th>#</th><th>Product</th><th>Qty</th><th>Price</th></tr></thead>';
      const tbody = document.createElement('tbody');
      cart.forEach((it,idx)=>{
        const subtotal = it.qty * it.price;
        total += subtotal;
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${idx+1}</td><td>${it.name}</td><td>${it.qty}</td><td>${formatPrice(subtotal)}</td>`;
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      checkoutSummary.appendChild(table);
      const p = document.createElement('p'); p.innerHTML = '<b>Total: </b><span id="checkout-total">'+formatPrice(total)+'</span>';
      checkoutSummary.appendChild(p);
    }

    const placeBtn = document.getElementById('place-order-btn');
    if(placeBtn){
      placeBtn.addEventListener('click', function(e){
        e.preventDefault();
        // simple form validation
        const name = document.getElementById('ship-name').value.trim();
        const addr = document.getElementById('ship-address').value.trim();
        if(!name || !addr){ alert('Please enter name and address'); return; }
        // create order object and save to localStorage as lastOrder
        const orderId = 'ORD'+Date.now();
        const order = { id: orderId, name: name, address: addr, items: getCart(), date: new Date().toISOString() };
        localStorage.setItem('lastOrder', JSON.stringify(order));
        // clear cart and redirect to confirmation
        localStorage.removeItem('cart');
        updateCartCount();
        window.location.href = 'order_confirmation.html?order='+orderId;
      });
    }
  }

  // ORDER CONFIRMATION: read lastOrder and display
  const orderContainer = document.getElementById('order-container');
  if(orderContainer){
    const order = JSON.parse(localStorage.getItem('lastOrder')||'null');
    if(!order){
      orderContainer.innerHTML = '<p>No recent order found.</p>';
    } else {
      orderContainer.innerHTML = `<h3>Thank you, ${order.name}!</h3>
        <p>Your order <b>${order.id}</b> placed on ${new Date(order.date).toLocaleString()} has been received.</p>
        <h5>Shipping to:</h5><p>${order.address}</p>
        <h5>Items:</h5>
      `;
      const ul = document.createElement('ul');
      order.items.forEach(it=>{
        const li = document.createElement('li');
        li.textContent = it.name + ' x ' + it.qty + ' - ' + formatPrice(it.price*it.qty);
        ul.appendChild(li);
      });
      orderContainer.appendChild(ul);
    }
  }

  // SEARCH PAGE: simple search over product list present in window.PRODUCTS (or fallback)
  if(window.location.pathname.endsWith('search.html')){
    const products = window.PRODUCTS || [
      {id:1,name:'Green Dress',price:400,img:'assets/images/product1.png',category:'Category 1'},
      {id:2,name:'Blue Shirt',price:350,img:'assets/images/product2.png',category:'Category 2'},
      {id:3,name:'Casual Shoes',price:1200,img:'assets/images/product3.png',category:'Category 1'},
      {id:4,name:'Red Dress',price:800,img:'assets/images/product2.png',category:'Category 3'},
      {id:5,name:'Black Jacket',price:1500,img:'assets/images/product1.png',category:'Category 2'},
      {id:6,name:'Sneakers',price:999,img:'assets/images/product3.png',category:'Category 1'}
    ];
    const qInput = document.getElementById('search-input');
    const results = document.getElementById('search-results');
    const doSearch = ()=>{
      const q = (qInput.value||'').toLowerCase().trim();
      results.innerHTML = '';
      if(!q){ results.innerHTML = '<p>Enter a search term to find products.</p>'; return; }
      const found = products.filter(p=>p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
      if(found.length===0){ results.innerHTML = '<p>No products found.</p>'; return; }
      const row = document.createElement('div'); row.className='row';
      found.forEach(p=>{
        const col = document.createElement('div'); col.className='col-md-4 col-12';
        col.innerHTML = `<div class="single_product shadow text-center p-1">
            <div class="product_img"><a href="product_detail.html"><img src="${p.img}" class="img img-fluid" alt=""></a></div>
            <div class="product-caption my-3"><h5><a href="product_detail.html">${p.name}</a></h5><div class="price"><b><span>₹${p.price}</span></b></div></div></div>`;
        row.appendChild(col);
      });
      results.appendChild(row);
    };
    if(qInput){ qInput.addEventListener('input', doSearch); }
    // prefill from query param
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    if(q && qInput){ qInput.value = q; doSearch(); }
  }

}); // DOMContentLoaded end
