<!-- Group 4 
Greeshma Prasad - 9042892 
Arya Reghu - 8960917 
Sitong Liu 8990939  
Dharanya Selvaraj - 8998287 -->

<?php
header('Content-Type: application/json');
include 'config.php';

$conn = getConnection();

function sendResponse($data) {
    echo json_encode($data);
    exit;
}

function getOrders($conn) {
    $sql = "
        SELECT 
            o.order_id,
            c.customer_id,
            CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
            b.title AS book_title,
            od.quantity,
            od.price_at_time_of_order,
            o.order_date
        FROM Orders o
        JOIN Customer c ON o.customer_id = c.customer_id
        JOIN OrderDetails od ON o.order_id = od.order_id
        JOIN Book b ON od.book_id = b.book_id
        ORDER BY o.order_date DESC
    ";
    $result = $conn->query($sql);
    $orders = [];
    while ($row = $result->fetch_assoc()) {
        $orders[] = $row;
    }
    sendResponse($orders);
}


function getCustomers($conn) {
    $sql = "SELECT customer_id, CONCAT(first_name, ' ', last_name) AS full_name FROM Customer ORDER BY first_name";
    $result = $conn->query($sql);
    $customers = [];
    while ($row = $result->fetch_assoc()) {
        $customers[] = $row;
    }
    sendResponse($customers);
}

function getBooks($conn) {
    $sql = "SELECT book_id, title, price FROM Book ORDER BY title";
    $result = $conn->query($sql);
    $books = [];
    while ($row = $result->fetch_assoc()) {
        $books[] = $row;
    }
    sendResponse($books);
}

function generateInvoiceID($conn) {
    do {
        $id = 'INV' . str_pad(rand(0, 99999), 5, '0', STR_PAD_LEFT);
        $check = $conn->query("SELECT * FROM Invoice WHERE invoice_id = '$id'");
    } while ($check && $check->num_rows > 0);
    
    return $id;
}

function saveOrder($conn) {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['customer']) || !isset($data['book']) || !isset($data['quantity']) || !isset($data['price'])) {
        sendResponse(["success" => false, "error" => "Missing required fields"]);
    }

    $order_id = $conn->real_escape_string($data['order_id'] ?? generateOrderIDInternally($conn));
    $customer_id = $conn->real_escape_string($data['customer']);
    $book_id = $conn->real_escape_string($data['book']);
    $quantity = (int)$data['quantity'];
    $price = (float)$data['price'];
    $total_amount = $quantity * $price;

    
    $conn->begin_transaction();

    try {
       
        $sql = "INSERT INTO Orders (order_id, customer_id) VALUES ('$order_id', '$customer_id')";
        if (!$conn->query($sql)) {
            throw new Exception("Failed to insert into Orders: " . $conn->error);
        }

        $orderDetailId = 'OD' . str_pad(rand(0, 99999), 5, '0', STR_PAD_LEFT);
        $sql = "INSERT INTO OrderDetails (order_detail_id, order_id, book_id, quantity, price_at_time_of_order) 
                VALUES ('$orderDetailId', '$order_id', '$book_id', '$quantity', '$price')";
        if (!$conn->query($sql)) {
            throw new Exception("Failed to insert into OrderDetails: " . $conn->error);
        }

        // Insert into Invoice
        $sql = "INSERT INTO Invoice (invoice_id, order_id, total_amount, payment_status) 
                VALUES ('$invoice_id', '$order_id', '$total_amount', 'Paid')";
        if (!$conn->query($sql)) {
            throw new Exception("Failed to insert into Invoice: " . $conn->error);
        }

        $conn->commit();
        sendResponse(["success" => true, "order_id" => $order_id, "invoice_id" => $invoice_id]);
    } catch (Exception $e) {
        $conn->rollback();
        sendResponse(["success" => false, "error" => $e->getMessage()]);
    }
}

function generateOrderIDInternally($conn) {
    do {
        $id = 'OD' . str_pad(rand(0, 99999), 5, '0', STR_PAD_LEFT);
        $check = $conn->query("SELECT * FROM Orders WHERE order_id = '$id'");
    } while ($check && $check->num_rows > 0);

    return $id;
}

function generateOrderID($conn) {
    $orderId = generateOrderIDInternally($conn);
    sendResponse(["order_id" => $orderId]);
}

function getOrderDetails($conn) {
    $orderId = $conn->real_escape_string($_GET['id']);
    
    $sql = "
        SELECT 
            o.order_id,
            o.customer_id,
            od.book_id,
            od.quantity,
            od.price_at_time_of_order,
            o.order_date,
            i.invoice_id,
            i.payment_status
        FROM Orders o
        JOIN OrderDetails od ON o.order_id = od.order_id
        LEFT JOIN Invoice i ON o.order_id = i.order_id
        WHERE o.order_id = '$orderId'
    ";
    
    $result = $conn->query($sql);
    
    if ($result && $row = $result->fetch_assoc()) {
        sendResponse($row);
    } else {
        sendResponse(["error" => "Order not found"]);
    }
}

function getCustomerById($conn) {
    $customerId = $conn->real_escape_string($_GET['id']);
    
    $sql = "SELECT customer_id, first_name, last_name, email, phone FROM Customer WHERE customer_id = '$customerId'";
    $result = $conn->query($sql);
    
    if ($result && $row = $result->fetch_assoc()) {
        sendResponse($row);
    } else {
        sendResponse(["error" => "Customer not found"]);
    }
}

function getBookById($conn) {
    $bookId = $conn->real_escape_string($_GET['id']);
    
    $sql = "SELECT book_id, title, author, price FROM Book WHERE book_id = '$bookId'";
    $result = $conn->query($sql);
    
    if ($result && $row = $result->fetch_assoc()) {
        sendResponse($row);
    } else {
        sendResponse(["error" => "Book not found"]);
    }
}

function getInvoiceByOrderId($conn) {
    $orderId = $conn->real_escape_string($_GET['order_id']);
    
    $sql = "SELECT * FROM Invoice WHERE order_id = '$orderId'";
    $result = $conn->query($sql);
    
    if ($result && $row = $result->fetch_assoc()) {
        sendResponse($row);
    } else {
        sendResponse(["error" => "Invoice not found"]);
    }
}


$action = $_GET['action'] ?? '';

switch ($action) {
    case 'getOrders':
        getOrders($conn);
        break;
    case 'getCustomers':
        getCustomers($conn);
        break;
    case 'getBooks':
        getBooks($conn);
        break;
    case 'saveOrder':
        saveOrder($conn);
        break;
    case 'getOrderDetails':
        getOrderDetails($conn);
        break;
    case 'generateOrderID':
        generateOrderID($conn);
        break;
    case 'getCustomerById':
        getCustomerById($conn);
        break;
    case 'getBookById':
        getBookById($conn);
        break;
    case 'getInvoiceByOrderId':
        getInvoiceByOrderId($conn);
        break;
    default:
        sendResponse(["error" => "Invalid action"]);
}

$conn->close();
?>