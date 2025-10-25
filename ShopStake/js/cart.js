// Cart JS for ShopStake
const cartBody = document.getElementById('cart-body');
const cartTotalEl = document.getElementById('cart-total');
const cartBadge = document.getElementById('cart-badge');

function getCart(){ return JSON.parse(localStorage.getItem('cart')||'[]'); }
function saveCart(cart){ localStorage.setItem('cart',JSON.stringify(cart)); updateBadge(); renderCart(); }
function updateBadge(){
  const cart=getCart();
  if(!cart.length) cartBadge.classList.add('d-none');
  else { cartBadge.classList.remove('d-none'); cartBadge.textContent=cart.length; }
}

// Render cart table
function renderCart(){
  const cart = getCart();
  if(!cart.length){
    cartBody.innerHTML=`<tr><td colspan="6" class="text-center text-muted py-4">Cart is empty</td></tr>`;
    cartTotalEl.textContent='0.00';
    return;
  }
  let total=0;
  cartBody.innerHTML='';
  cart.forEach(item=>{
    const row=document.createElement('tr');
    const itemTotal = (item.price * item.qty).toFixed(2);
    total += Number(itemTotal);
    row.innerHTML=`
      <td><img src="${item.image}" alt="${item.title}" style="width:50px;height:50px;object-fit:contain;"></td>
      <td>${item.title}</td>
      <td>$${item.price.toFixed(2)}</td>
      <td>
        <div class="d-flex gap-2 align-items-center">
          <button class="btn btn-sm btn-outline-light qty-btn" data-id="${item.id}" data-action="dec">-</button>
          <span>${item.qty}</span>
          <button class="btn btn-sm btn-outline-light qty-btn" data-id="${item.id}" data-action="inc">+</button>
        </div>
      </td>
      <td>$${itemTotal}</td>
      <td><button class="btn btn-sm btn-danger delete-btn" data-id="${item.id}"><i class="bi bi-trash"></i></button></td>
    `;
    cartBody.appendChild(row);
  });
  cartTotalEl.textContent = total.toFixed(2);
  attachCartEvents();
}

// Event listeners for + / - / delete
function attachCartEvents(){
  document.querySelectorAll('.qty-btn').forEach(btn=>{
    btn.removeEventListener('click',onQtyClick);
    btn.addEventListener('click',onQtyClick);
  });
  document.querySelectorAll('.delete-btn').forEach(btn=>{
    btn.removeEventListener('click',onDeleteClick);
    btn.addEventListener('click',onDeleteClick);
  });
}

function onQtyClick(e){
  const id=Number(e.currentTarget.dataset.id);
  const action=e.currentTarget.dataset.action;
  const cart = getCart();
  const item = cart.find(i=>i.id===id);
  if(!item) return;
  if(action==='inc') item.qty+=1;
  if(action==='dec'){ item.qty-=1; if(item.qty<1) item.qty=1; }
  saveCart(cart);
}

function onDeleteClick(e){
  const id=Number(e.currentTarget.dataset.id);
  let cart = getCart();
  cart = cart.filter(i=>i.id!==id);
  saveCart(cart);
}

// Initialize
updateBadge();
renderCart();
