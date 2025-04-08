function openModal() {
  document.getElementById('orderModal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('orderModal').style.display = 'none';
}

function updatePrice() {
  const bookSelect = document.getElementById('book');
  const priceInput = document.getElementById('price');
  const selectedOption = bookSelect.options[bookSelect.selectedIndex];
  
  if (selectedOption.value) {
      const price = parseFloat(selectedOption.getAttribute('data-price'));
      priceInput.value = price.toFixed(2);
      updateTotalPrice();
  } else {
      priceInput.value = "0.00";
      updateTotalPrice();
  }
}

function increaseQuantity() {
  const quantityInput = document.getElementById('quantity');
  quantityInput.value = parseInt(quantityInput.value) + 1;
  updateTotalPrice();
}

function decreaseQuantity() {
  const quantityInput = document.getElementById('quantity');
  const currentValue = parseInt(quantityInput.value);
  if (currentValue > 1) {
      quantityInput.value = currentValue - 1;
      updateTotalPrice();
  }
}

function updateTotalPrice() {
  const priceInput = document.getElementById('price');
  const quantityInput = document.getElementById('quantity');
  const totalPriceSpan = document.getElementById('totalPrice');
  
  const price = parseFloat(priceInput.value) || 0;
  const quantity = parseInt(quantityInput.value) || 1;
  
  const totalPrice = price * quantity;
  totalPriceSpan.textContent = totalPrice.toFixed(2);
}

function editOrder(orderId) {
  // Here you would fetch order details based on orderId
  // and populate the form fields
  openModal();
  // For demo purposes, let's set values for order #1
  if (orderId === 1) {
      document.getElementById('customer').value = "1";
      document.getElementById('book').value = "1";
      document.getElementById('price').value = "15.99";
      document.getElementById('quantity').value = "2";
      document.getElementById('status').value = "delivered";
      updateTotalPrice();
      document.querySelector('.modal-title').textContent = "Edit Customer Order";
  }
}

function deleteOrder(orderId) {
  if (confirm("Are you sure you want to delete this order?")) {
      // Here you would send a request to delete the order
      console.log("Deleting order:", orderId);
      // Then refresh the table
  }
}

function saveOrder() {
  // Get form values
  const customer = document.getElementById('customer').value;
  const book = document.getElementById('book').value;
  const price = document.getElementById('price').value;
  const quantity = document.getElementById('quantity').value;
  const status = document.getElementById('status').value;
  
  // Validate input
  if (!customer || !book || !quantity) {
      alert("Please fill all required fields");
      return;
  }
  
  // Here you would save the order data
  console.log("Saving order:", {
      customer,
      book,
      price,
      quantity,
      status,
      totalPrice: document.getElementById('totalPrice').textContent
  });
  
  // Close modal and refresh data
  closeModal();
  // Normally you would reload the table data here
}
