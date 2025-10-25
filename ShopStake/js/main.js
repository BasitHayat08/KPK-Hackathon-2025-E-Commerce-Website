// ShopStake Main JS
const API = 'https://fakestoreapi.com/products';
const productGrid = document.getElementById('product-grid');
const categorySelect = document.getElementById('categorySelect');
const priceRange = document.getElementById('priceRange');
const priceValue = document.getElementById('priceValue');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const cartBadge = document.getElementById('cart-badge');
const toastContainer = document.getElementById('toast-container');

const modalEl = document.getElementById('productModal');
const modalTitle = document.getElementById('modal-title');
const modalImage = document.getElementById('modal-image');
const modalDesc = document.getElementById('modal-desc');
const modalPrice = document.getElementById('modal-price');
const modalCategory = document.getElementById('modal-category');
const modalAddBtn = document.getElementById('modal-add');

const scrollTopBtn = document.getElementById('scrollTopBtn');

let ALL = [];
let VISIBLE = [];
let currentModalProduct = null;

// Fetch products with cache
async function fetchProducts() {
  const cached = JSON.parse(localStorage.getItem('cachedProducts') || 'null');
  const now = Date.now();
  if (cached && cached.ts && (now - cached.ts < 10*60*1000)) return cached.data;
  const res = await fetch(API);
  const data = await res.json();
  localStorage.setItem('cachedProducts', JSON.stringify({ ts: now, data }));
  return data;
}

// Skeleton loader
function showSkeletons(n=8) {
  productGrid.innerHTML = '';
  for(let i=0;i<n;i++){
    const col = document.createElement('div');
    col.className='col-md-4 col-sm-6';
    col.innerHTML=`<div class="card p-3 bg-dark border-0 shadow-sm" style="height:300px;"></div>`;
    productGrid.appendChild(col);
  }
}

// Render products
function render(list){
  productGrid.innerHTML='';
  const maxPrice = Number(priceRange.value);
  const cat = categorySelect.value || 'all';
  const query = searchInput.value.trim().toLowerCase();

  const filtered = list.filter(p=>{
    if(p.price>maxPrice) return false;
    if(cat!=='all' && p.category!==cat) return false;
    if(!p.title.toLowerCase().includes(query) && !p.description.toLowerCase().includes(query)) return false;
    return true;
  });

  if(!filtered.length){
    productGrid.innerHTML=`<div class="text-center text-muted py-5">No products found.</div>`;
    return;
  }

  const frag=document.createDocumentFragment();
  filtered.forEach(p=>{
    const col=document.createElement('div');
    col.className='col-md-4 col-sm-6';
    col.setAttribute('data-aos','fade-up');
    col.innerHTML=`
      <div class="card p-3 product-card bg-dark border-0 shadow-sm h-100">
        <div class="image-container d-flex align-items-center justify-content-center">
          <img data-src="${p.image}" alt="${p.title}" class="lazy-img product-thumb" style="max-height:200px;object-fit:contain;cursor:pointer;" data-id="${p.id}">
        </div>
        <div class="card-body text-center text-light">
          <h6 class="card-title text-truncate product-title" data-id="${p.id}" style="cursor:pointer;">${p.title}</h6>
          <p class="text-muted small mb-2">${p.category}</p>
          <div class="d-flex justify-content-center align-items-center gap-2">
            <span class="fw-bold">$${p.price.toFixed(2)}</span>
            <button class="btn btn-sm btn-outline-light add-btn" data-id="${p.id}">Add</button>
          </div>
        </div>
      </div>`;
    frag.appendChild(col);
  });
  productGrid.appendChild(frag);
  initLazy();
  attachAddButtons();
  attachDetailClicks();
}

// Lazy load images
function initLazy(){
  const imgs = document.querySelectorAll('img.lazy-img');
  const obs = new IntersectionObserver((entries, observer)=>{
    entries.forEach(entry=>{
      if(!entry.isIntersecting) return;
      const img=entry.target;
      img.src=img.dataset.src;
      img.onload=()=>img.classList.remove('lazy-img');
      observer.unobserve(img);
    });
  }, {rootMargin:'200px'});
  imgs.forEach(i=>obs.observe(i));
}

// Cart
function addToCart(product){
  const cart=JSON.parse(localStorage.getItem('cart')||'[]');
  const existing=cart.find(i=>i.id===product.id);
  if(existing) existing.qty=(existing.qty||1)+1;
  else cart.push({id:product.id,title:product.title,price:product.price,image:product.image,qty:1});
  localStorage.setItem('cart',JSON.stringify(cart));
  updateBadge();
  showToast('Added to cart',product);
}
function updateBadge(){
  const cart=JSON.parse(localStorage.getItem('cart')||'[]');
  if(!cart.length) cartBadge.classList.add('d-none');
  else { cartBadge.classList.remove('d-none'); cartBadge.textContent=cart.length; }
}

// Add button handlers
function attachAddButtons(){
  document.querySelectorAll('.add-btn').forEach(btn=>{
    btn.removeEventListener('click', onAdd);
    btn.addEventListener('click', onAdd);
  });
}
function onAdd(e){
  const id=Number(e.currentTarget.dataset.id);
  const product=ALL.find(p=>p.id===id);
  if(!product) return;
  addToCart(product);
}

// Product detail clicks
function attachDetailClicks(){
  document.querySelectorAll('.product-thumb, .product-title').forEach(el=>{
    el.removeEventListener('click', onDetailClick);
    el.addEventListener('click', onDetailClick);
  });
}
function onDetailClick(e){
  const id=Number(e.currentTarget.dataset.id);
  const product=ALL.find(p=>p.id===id);
  if(!product) return;
  openProductModal(product);
}

// Modal
function openProductModal(product){
  currentModalProduct=product;
  modalTitle.textContent=product.title;
  modalImage.src=product.image;
  modalDesc.textContent=product.description;
  modalPrice.textContent=`$${product.price.toFixed(2)}`;
  modalCategory.textContent=product.category;
  const bs=new bootstrap.Modal(modalEl);
  bs.show();
}
modalAddBtn.addEventListener('click',()=>{
  if(currentModalProduct) addToCart(currentModalProduct);
  const bs=bootstrap.Modal.getInstance(modalEl);
  if(bs) bs.hide();
});

// Toast
function showToast(message,product=null){
  const toast=document.createElement('div');
  toast.className='toast show align-items-center text-bg-dark border-0 mb-2';
  toast.style.minWidth='280px';
  toast.innerHTML=`
    <div class="d-flex">
      <div class="toast-body p-2">
        ${product? `<div class="d-flex align-items-center gap-2">
          <img src="${product.image}" style="width:44px;height:36px;object-fit:contain;border-radius:6px;">
          <div>
            <div class="fw-bold">${product.title.slice(0,30)}…</div>
            <div class="small text-muted">Added • $${product.price.toFixed(2)}</div>
          </div>
        </div>` : message}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" onclick="this.parentElement.parentElement.remove()"></button>
    </div>`;
  toastContainer.appendChild(toast);
  setTimeout(()=> toast.remove(),2500);
}

// Scroll top
window.addEventListener('scroll',()=>{
  if(window.scrollY>300) scrollTopBtn.style.display='block';
  else scrollTopBtn.style.display='none';
});
scrollTopBtn.addEventListener('click',()=> window.scrollTo({top:0,behavior:'smooth'}));

// Debounce
function debounce(fn,ms=300){ let t; return (...args)=>{ clearTimeout(t); t=setTimeout(()=>fn(...args),ms); }; }

// Filters
priceRange.addEventListener('input',()=>{ priceValue.textContent=priceRange.value; render(VISIBLE); });
searchBtn.addEventListener('click',()=> render(VISIBLE));
searchInput.addEventListener('input',debounce(()=>render(VISIBLE),250));
categorySelect.addEventListener('change',()=> render(VISIBLE));

// Init
async function init(){
  updateBadge();
  showSkeletons(6);
  try{
    const products = await fetchProducts();
    ALL = products;
    VISIBLE = [...ALL];

    // categories
    const cats = ['all', ...Array.from(new Set(ALL.map(p=>p.category)))];
    categorySelect.innerHTML = cats.map(c=>`<option value="${c}">${c[0].toUpperCase()+c.slice(1)}</option>`).join('');

    render(ALL);
  }catch(e){
    productGrid.innerHTML='<div class="text-center text-danger py-5">Failed to load products. Refresh page.</div>';
    console.error(e);
  }
}

init();
