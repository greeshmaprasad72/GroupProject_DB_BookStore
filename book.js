// <!-- Group 4 
// Greeshma Prasad - 9042892 
// Arya Reghu - 8960917 
// Sitong Liu 8990939  
// Dharanya Selvaraj - 8998287 -->

// Open modal
function openBookModal() {
  document.getElementById('bookModal').style.display = 'flex';
  document.getElementById('bookForm').reset();
  document.getElementById('book_id').value = '';
  document.querySelector('.modal-title').textContent = 'Add New Book';
}

function closeBookModal() {
  document.getElementById('bookModal').style.display = 'none';
}

function saveBook() {
  const formData = {
    book_id: document.getElementById('book_id').value,
    title: document.getElementById('title').value,
    author: document.getElementById('author').value,
    isbn: document.getElementById('isbn').value,
    edition: document.getElementById('edition').value,
    year: document.getElementById('year').value,
    price: document.getElementById('price').value,
    quantity: document.getElementById('quantity').value
  };

  console.log("📤 Saving book:", formData);

  fetch('book-api.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  })
    .then(response => response.json())
    .then(data => {
      console.log("📥 Server response:", data);
      alert(data.message);
      location.reload();
    })
    .catch(err => {
      console.error("❌ Save error:", err);
      alert("Error saving book.");
    });
}

function editOrder(id) {
  fetch(`book-api.php?id=${id}`)
    .then(res => res.json())
    .then(book => {
      openBookModal();
      document.getElementById('book_id').value = book.book_id;
      document.getElementById('title').value = book.title;
      document.getElementById('author').value = book.author;
      document.getElementById('isbn').value = book.isbn;
      document.getElementById('edition').value = book.edition;
      document.getElementById('year').value = book.publication_year;
      document.getElementById('price').value = book.price;
      document.getElementById('quantity').value = book.quantity_in_stock;
      document.querySelector('.modal-title').textContent = 'Edit Book';
    });
}

function deleteOrder(id) {
  if (confirm("Are you sure you want to delete this book?")) {
    fetch('book-api.php', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `id=${encodeURIComponent(id)}`
    })
      .then(res => res.json())
      .then(data => {
        alert(data.message);
        location.reload();
      })
      .catch(err => {
        console.error("❌ Delete error:", err);
        alert("Error deleting book.");
      });
  }
}

// Open modal when add button clicked
document.querySelector('.add-button').addEventListener('click', openBookModal);

// Load books when page loads
window.onload = function () {
  fetch('book-api.php')
    .then(response => response.json())
    .then(data => {
      const tbody = document.getElementById('bookTableBody');
      tbody.innerHTML = '';

      data.forEach(book => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${book.title}</td>
          <td>${book.author}</td>
          <td>$${parseFloat(book.price).toFixed(2)}</td>
          <td>${book.isbn}</td>
          <td>
            <button onclick="editOrder('${book.book_id}')">✏️</button>
            <button onclick="deleteOrder('${book.book_id}')">🗑️</button>
          </td>
        `;
        tbody.appendChild(row);
      });
    })
    .catch(error => console.error('❌ Load error:', error));
};
