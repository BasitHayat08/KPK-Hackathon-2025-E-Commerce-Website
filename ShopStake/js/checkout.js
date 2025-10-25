// Checkout JS for ShopStake
const checkoutCart = document.getElementById('checkout-cart');
const checkoutTotalEl = document.getElementById('checkout-total');
const checkoutForm = document.getElementById('checkout-form');
const cartBadge = document.getElementById('cart-badge');
const toastContainer = document.getElementById('toast-container');

function getCart(){ return JSON.parse(localStorage.getItem('cart')||'[]'); }
function saveCart(cart){ localStorage.setItem('cart',JSON.stringify(cart)); updateBadge(); }
function updateBadge(){
  const cart=getCart();
  if(!cart.length) cartBadge.classList.add('d-none');
  else { cartBadge.classList.remove('d-none'); cartBadge.textContent=cart.length; }
}

// Render checkout cart
function renderCheckout(){
  const cart=getCart();
  checkoutCart.innerHTML='';
  if(!cart.length){
    checkoutCart.innerHTML='<li class="list-group-item bg-dark text-secondary text-center">Your cart is empty</li>';
    checkoutTotalEl.textContent='0.00';
    return;
  }
  let total=0;
  cart.forEach(item=>{
    const li=document.createElement('li');
    li.className='list-group-item bg-dark d-flex justify-content-between align-items-center';
    const itemTotal=(item.price*item.qty).toFixed(2);
    total+=Number(itemTotal);
    li.innerHTML=`${item.title} <span>$${itemTotal}</span>`;
    checkoutCart.appendChild(li);
  });
  checkoutTotalEl.textContent=total.toFixed(2);
}

// Toast
function showToast(message){
  const toast=document.createElement('div');
  toast.className='toast show align-items-center text-bg-dark border-0 mb-2';
  toast.style.minWidth='280px';
  toast.innerHTML=`
    <div class="d-flex">
      <div class="toast-body p-2">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" onclick="this.parentElement.parentElement.remove()"></button>
    </div>`;
  toastContainer.appendChild(toast);
  setTimeout(()=> toast.remove(),2500);
}

// Form submission
checkoutForm.addEventListener('submit',e=>{
  e.preventDefault();
  const cart = getCart();
  if(!cart.length){ showToast('Cart is empty!'); return; }
  // Simple validation done by required attributes
  const name=checkoutForm.name.value.trim();
  const email=checkoutForm.email.value.trim();
  const address=checkoutForm.address.value.trim();
  const payment=checkoutForm.payment.value;

  // Show fancy success toast
  showToast(`Thank you ${name}! Your order of $${checkoutTotalEl.textContent} is placed.`);
  
  // Clear cart
  localStorage.removeItem('cart');
  updateBadge();
  renderCheckout();

  // Redirect after 2.5s
  setTimeout(()=>{ window.location.href='index.html'; },2600);
});

// Init
updateBadge();
renderCheckout();
