let editingCustomerId = null;

$(document).ready(function () {
  loadCustomers();
});

function openCustomerModal() {
  $('#customerModal').css('display', 'flex');
  $('.modal-title').text("Add a New Customer");
  clearCustomerForm();
}

function closeCustomerModal() {
  $('#customerModal').css('display', 'none');
  editingCustomerId = null;
}

function clearCustomerForm() {
  $('#firstName, #lastName, #email, #phone, #street, #city, #postcode').val('');
}

function loadCustomers() {
  $.get("customer_api.php", function (data) {
    $('#customerTable tbody').empty();
    data.forEach(c => {
      const row = `
        <tr data-id="${c.customer_id}">
          <td>${c.customer_id}</td>
          <td>${c.first_name} ${c.last_name}</td>
          <td>${c.email}</td>
          <td>${c.phone}</td>
          <td>${c.address}, ${c.city}, ${c.postal_code}</td>
          <td>
            <div class="action-buttons">
              <button class="action-button" onclick="editCustomer('${c.customer_id}')">✏️</button>
              <button class="action-button" onclick="deleteCustomer('${c.customer_id}')">🗑️</button>
            </div>
          </td>
        </tr>`;
      $('#customerTable tbody').append(row);
    });
  });
}

function saveCustomer() {
  const customer = {
    customer_id: editingCustomerId,
    first_name: $('#firstName').val().trim(),
    last_name: $('#lastName').val().trim(),
    email: $('#email').val().trim(),
    phone: $('#phone').val().trim(),
    address: $('#street').val().trim(),
    city: $('#city').val().trim(),
    postal_code: $('#postcode').val().trim()
  };

  if (!customer.first_name || !customer.last_name || !customer.email || !customer.address) {
    alert("Please fill all fields.");
    return;
  }

  $.ajax({
    url: 'customer_api.php',
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify(customer),
    success: function (res) {
      if (res.success) {
        closeCustomerModal();
        loadCustomers();
      } else {
        alert("Save failed: " + res.error);
      }
    }
  });
}

function editCustomer(id) {
  const row = $(`tr[data-id="${id}"]`);
  const cells = row.find('td');

  const [firstName, lastName] = cells.eq(1).text().split(' ');
  $('#firstName').val(firstName);
  $('#lastName').val(lastName);
  $('#email').val(cells.eq(2).text());
  $('#phone').val(cells.eq(3).text());

  const addressParts = cells.eq(4).text().split(',').map(s => s.trim());
  $('#street').val(addressParts[0]);
  $('#city').val(addressParts[1]);
  $('#postcode').val(addressParts[2]);

  editingCustomerId = id;
  $('.modal-title').text("Edit Customer");
  $('#customerModal').css('display', 'flex');
}

function deleteCustomer(id) {
  if (!confirm("Are you sure to delete this customer?")) return;

  $.ajax({
    url: 'customer_api.php',
    method: 'DELETE',
    data: { customer_id: id },
    success: function (res) {
      if (res.success) {
        loadCustomers();
      } else {
        alert("Delete failed: " + res.error);
      }
    }
  });
}
