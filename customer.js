let editingCustomerId = null;

function openCustomerModal() {
  document.getElementById('customerModal').style.display = 'flex';
  document.querySelector('.modal-title').textContent = "Add a New Customer";
  clearCustomerForm();
}

function closeCustomerModal() {
  document.getElementById('customerModal').style.display = 'none';
  editingCustomerId = null;
}

function clearCustomerForm() {
  document.getElementById('firstName').value = '';
  document.getElementById('lastName').value = '';
  document.getElementById('email').value = '';
  document.getElementById('phone').value = '';
  document.getElementById('street').value = '';
  document.getElementById('city').value = '';
  document.getElementById('postcode').value = '';
}

function generateCustomerID() {
  return 'C' + Math.floor(Math.random() * 100000);
}

function saveCustomer() {
  const firstName = document.getElementById('firstName').value.trim();
  const lastName = document.getElementById('lastName').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const street = document.getElementById('street').value.trim();
  const city = document.getElementById('city').value.trim();
  const postcode = document.getElementById('postcode').value.trim();

  if (!firstName || !lastName || !email || !phone || !street || !city || !postcode) {
    alert("Please fill all fields.");
    return;
  }

  if (editingCustomerId) {
    const row = document.querySelector(`tr[data-id="${editingCustomerId}"]`);
    row.innerHTML = buildCustomerRowHTML(editingCustomerId, firstName, lastName, email, phone, street, city, postcode);
    editingCustomerId = null;
  } else {
    const customerId = generateCustomerID();
    const newRow = document.createElement('tr');
    newRow.setAttribute('data-id', customerId);
    newRow.innerHTML = buildCustomerRowHTML(customerId, firstName, lastName, email, phone, street, city, postcode);
    document.querySelector('#customerTable tbody').appendChild(newRow);
  }

  closeCustomerModal();
}

function buildCustomerRowHTML(id, firstName, lastName, email, phone, street, city, postcode) {
  return `
    <td>${id}</td>
    <td>${firstName} ${lastName}</td>
    <td>${email}</td>
    <td>${phone}</td>
    <td>${street}, ${city}, ${postcode}</td>
    <td>
      <div class="action-buttons">
        <button class="action-button" onclick="editCustomer('${id}')">
          <div class="edit-icon">✏️</div>
        </button>
        <button class="action-button" onclick="deleteCustomer('${id}')">
          <div class="delete-icon">🗑️</div>
        </button>
      </div>
    </td>
  `;
}

function editCustomer(id) {
  const row = document.querySelector(`tr[data-id="${id}"]`);
  const cells = row.children;

  const nameParts = cells[1].textContent.split(' ');
  const [firstName, lastName] = nameParts;

  document.getElementById('firstName').value = firstName;
  document.getElementById('lastName').value = lastName;
  document.getElementById('email').value = cells[2].textContent;
  document.getElementById('phone').value = cells[3].textContent;

  const addressParts = cells[4].textContent.split(',').map(s => s.trim());
  document.getElementById('street').value = addressParts[0] || '';
  document.getElementById('city').value = addressParts[1] || '';
  document.getElementById('postcode').value = addressParts[2] || '';

  editingCustomerId = id;
  document.querySelector('.modal-title').textContent = "Edit Customer";
  document.getElementById('customerModal').style.display = 'flex';
}

function deleteCustomer(id) {
  if (confirm("Are you sure you want to delete this customer?")) {
    const row = document.querySelector(`tr[data-id="${id}"]`);
    row.remove();
  }
}
