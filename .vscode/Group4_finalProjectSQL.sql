
################ Group 4 ###############################################
################ Greeshma Prasad - 9042892 ############################
################ Arya Reghu - 8960917 #################################
############### Sitong Liu 8990939 ##################################
############### Dharanya Selvaraj- 8998287 #############################

CREATE DATABASE bookStore;
USE bookStore;


CREATE TABLE Customer (
    customer_id VARCHAR(10) PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address VARCHAR(255),
    city VARCHAR(50),
    postal_code VARCHAR(20)
);


CREATE TABLE Book (
    book_id VARCHAR(10) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(100) NOT NULL,
    isbn VARCHAR(20) UNIQUE NOT NULL,
    edition VARCHAR(20),
    publication_year INT,
    price DECIMAL(10, 2) NOT NULL,
    quantity_in_stock INT NOT NULL DEFAULT 0
);


CREATE TABLE Orders (
    order_id VARCHAR(10) PRIMARY KEY,
    customer_id VARCHAR(10) NOT NULL,
    order_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES Customer(customer_id) ON DELETE CASCADE
);

CREATE TABLE OrderDetails (
    order_detail_id VARCHAR(10) PRIMARY KEY,
    order_id VARCHAR(10) NOT NULL,
    book_id VARCHAR(10) NOT NULL,
    quantity INT NOT NULL,
    price_at_time_of_order DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES Orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES Book(book_id) ON DELETE RESTRICT
);

CREATE TABLE Invoice (
    invoice_id VARCHAR(10) PRIMARY KEY,
    order_id VARCHAR(10) NOT NULL UNIQUE,
    invoice_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'Unpaid',
    payment_method VARCHAR(50),
    total_amount DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES Orders(order_id) ON DELETE CASCADE
);


INSERT INTO Customer (customer_id, first_name, last_name, email, phone, address, city, postal_code)
VALUES 
('C001', 'Alice', 'Johnson', 'alice.j@example.com', '123-456-7890', '123 Maple St', 'Springfield', '12345'),
('C002', 'Bob', 'Smith', 'bob.smith@example.com', '987-654-3210', '456 Oak Ave', 'Rivertown', '67890');
INSERT INTO Book (book_id, title, author, isbn, edition, publication_year, price, quantity_in_stock)
VALUES 
('B001', 'The Great Gatsby', 'F. Scott Fitzgerald', '9780743273565', '1st', 1925, 15.99, 10),
('B002', '1984', 'George Orwell', '9780451524935', '1st', 1949, 12.99, 8),
('B003', 'To Kill a Mockingbird', 'Harper Lee', '9780061120084', '2nd', 1960, 14.99, 5);
INSERT INTO Orders (order_id, customer_id)
VALUES 
('O001', 'C001'),
('O002', 'C002');
INSERT INTO OrderDetails (order_detail_id, order_id, book_id, quantity, price_at_time_of_order)
VALUES 
('OD001', 'O001', 'B001', 1, 15.99),
('OD002', 'O001', 'B002', 2, 12.99),
('OD003', 'O002', 'B003', 1, 14.99);
INSERT INTO Invoice (invoice_id, order_id, payment_status, payment_method, total_amount)
VALUES 
('I001', 'O001', 'Paid', 'Credit Card', 41.97), -- 15.99 + 2*12.99
('I002', 'O002', 'Unpaid', 'PayPal', 14.99);

