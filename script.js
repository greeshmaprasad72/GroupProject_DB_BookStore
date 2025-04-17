
/* Group 4 
Greeshma Prasad - 9042892 
Arya Reghu - 8960917 
Sitong Liu 8990939  
Dharanya Selvaraj - 8998287  */
function openModal() {
  document.getElementById('orderModal').style.display = 'flex';
  loadCustomers();
  fetchBooks();
}

function closeModal() {
  document.getElementById('orderModal').style.display = 'none';
}

function closePrintModal() {
  document.getElementById('printModal').style.display = 'none';
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

function printOrderReceipt(orderId) {
  fetch(`order_api.php?action=getOrderDetails&id=${orderId}`)
    .then(response => response.json())
    .then(orderData => {
      
      Promise.all([
        fetch(`order_api.php?action=getCustomerById&id=${orderData.customer_id}`).then(res => res.json()),
        fetch(`order_api.php?action=getBookById&id=${orderData.book_id}`).then(res => res.json())
      ]).then(([customer, book]) => {
        const totalPrice = (orderData.quantity * orderData.price_at_time_of_order).toFixed(2);
        
       
        const receiptHTML = `
          <div class="receipt">
            <h2>BookStore Receipt</h2>
            <div class="receipt-details">
              <p><strong>Order ID:</strong> ${orderData.order_id}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
              <hr>
              <p><strong>Customer:</strong> ${customer.first_name} ${customer.last_name}</p>
              <hr>
              <h3>Order Items</h3>
              <table class="receipt-table">
                <tr>
                  <th>Book</th>
                  <th>Price</th>
                  <th>Qty</th>
                  <th>Total</th>
                </tr>
                <tr>
                  <td>${book.title}</td>
                  <td>$${orderData.price_at_time_of_order}</td>
                  <td>${orderData.quantity}</td>
                  <td>$${totalPrice}</td>
                </tr>
              </table>
              <div class="receipt-total">
                <p><strong>Total Amount:</strong> $${totalPrice}</p>
              </div>
              <hr>
              <p class="receipt-footer">Thank you for shopping with us!</p>
            </div>
          </div>
        `;
        
        document.getElementById('printContent').innerHTML = receiptHTML;
        document.getElementById('printModal').style.display = 'flex';
      });
    })
    .catch(error => {
      console.error('Error fetching order details:', error);
      alert('Could not load order details. Please try again.');
    });
}

function printOrder() {
  const printContents = document.getElementById('printContent').innerHTML;
  const originalContents = document.body.innerHTML;
  
  document.body.innerHTML = printContents;
  window.print();
  document.body.innerHTML = originalContents;
  
  window.location.reload();
}

function saveOrder() {

  const customer = document.getElementById('customer').value;
  const book = document.getElementById('book').value;
  const price = document.getElementById('price').value;
  const quantity = document.getElementById('quantity').value;


  if (!customer || !book || !quantity) {
      alert("Please fill all required fields");
      return;
  }

  fetch('order_api.php?action=generateOrderID')
      .then(response => response.json())
      .then(data => {
          if (!data.order_id) {
              throw new Error("Failed to generate order ID");
          }

          const orderData = {
              order_id: data.order_id,
              customer: customer,
              book: book,
              price: parseFloat(price),
              quantity: parseInt(quantity),
          };

          return fetch('order_api.php?action=saveOrder', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify(orderData)
          });
      })
      .then(async response => {
          if (!response.ok) {
              const data = await response.json();
              throw new Error(data.error || 'An error occurred while saving the order');
          }
          return await response.json();
      })
      .then(data => {
          if (data.success) {
              alert("Order added successfully!");
              closeModal();
              loadOrders();
          } else {
              alert("Error: " + (data.error || "Unknown error"));
          }
      })
      .catch(error => {
          console.error('Error saving order:', error);
          alert("Failed to save order: " + error.message);
      });
}

function loadOrders() {
  fetch('order_api.php?action=getOrders')
      .then(response => response.json())
      .then(data => {
          const tbody = document.getElementById('orderTableBody');
          tbody.innerHTML = '';

          if (data.length === 0) {
              tbody.innerHTML = '<tr><td colspan="6">No orders found.</td></tr>';
              return;
          }

          data.forEach(order => {
              const totalPrice = (order.quantity * order.price_at_time_of_order).toFixed(2);
              const row = `
                  <tr>
                      <td>${order.customer_name}</td>
                      <td>${order.book_title}</td>
                      <td>${order.quantity}</td>
                      <td>$${totalPrice}</td>
                      <td>${order.order_date}</td>
                      <td>
                          <div class="action-buttons">
                              <button class="action-button" onclick="printOrderReceipt('${order.order_id}')">🖨️</button>
                          </div>
                      </td>
                  </tr>
              `;
              tbody.insertAdjacentHTML('beforeend', row);
          });
      })
      .catch(error => {
          console.log('Error loading orders:', error);
      });
}

function loadCustomers() {
  fetch('order_api.php?action=getCustomers')
      .then(response => response.json())
      .then(data => {
          const customerSelect = document.getElementById('customer');
          customerSelect.innerHTML = '<option value="">-- Select a Customer --</option>';

          data.forEach(c => {
              const option = document.createElement('option');
              option.value = c.customer_id;
              option.textContent = c.full_name;
              customerSelect.appendChild(option);
          });
      })
      .catch(error => {
          console.error('Error loading customers:', error);
      });
}

function fetchBooks() {
  fetch('order_api.php?action=getBooks')
      .then(response => response.json())
      .then(books => {
          const bookSelect = document.getElementById('book');
          bookSelect.innerHTML = '<option value="">-- Select Book --</option>';
          books.forEach(book => {
              const option = document.createElement('option');
              option.value = book.book_id;
              option.textContent = `${book.title} - $${book.price}`;
              bookSelect.appendChild(option);
          });
      })
      .catch(error => {
          console.error('Error fetching books:', error);
      });
}

document.addEventListener('DOMContentLoaded', loadOrders);
document.getElementById('quantity').addEventListener('input', updateTotalPrice);

document.getElementById('book').addEventListener('change', function () {
  const bookSelect = document.getElementById('book');
  const selectedOption = bookSelect.options[bookSelect.selectedIndex];
  const price = selectedOption.textContent.split('$')[1]; 
  document.getElementById('price').value = price; 
  updateTotalPrice();
});

function updateTotalPrice() {
  const quantity = parseInt(document.getElementById('quantity').value) || 0;
  const price = parseFloat(document.getElementById('price').value) || 0;
  const total = (quantity * price).toFixed(2);
  document.getElementById('totalPrice').textContent = total;
}

function increaseQuantity() {
  const qtyInput = document.getElementById('quantity');
  qtyInput.value = parseInt(qtyInput.value) + 1;
  updateTotalPrice();
}

function decreaseQuantity() {
  const qtyInput = document.getElementById('quantity');
  if (parseInt(qtyInput.value) > 1) {
    qtyInput.value = parseInt(qtyInput.value) - 1;
    updateTotalPrice();
  }
}