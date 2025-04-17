
<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
// $connection = new mysqli("localhost", "root", "", "group4");
include 'config.php';
$connection = getConnection();
header("Content-Type: application/json");

if ($connection->connect_error) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $connection->connect_error]);
    exit();
}
// Generate CustomerID
function generateCustomerID($connection) {
    do {
        $id = 'CUS' . str_pad(rand(0, 99999), 5, '0', STR_PAD_LEFT);
        $check = $connection->query("SELECT * FROM Customer WHERE customer_id = '$id'");
    } while ($check && $check->num_rows > 0);
    return $id;
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $result = $connection->query("SELECT * FROM Customer");
        $customers = [];

        if ($result && $result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $customers[] = $row;
            }
        }
        echo json_encode($customers);
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        $id = $data['customer_id'] ?? null;
        $first = $data['first_name'];
        $last = $data['last_name'];
        $email = $data['email'];
        $phone = $data['phone'];
        $address = $data['address'];
        $city = $data['city'];
        $postal = $data['postal_code'];
    
        if ($id) {
            // Update
            $sql = "UPDATE Customer SET 
                    first_name='$first', last_name='$last', email='$email',
                    phone='$phone', address='$address', city='$city', postal_code='$postal'
                    WHERE customer_id='$id'";
            
            if ($connection->query($sql)) {
                echo json_encode(["success" => true, "customer_id" => $id]);
            } else {
                echo json_encode(["success" => false, "error" => $connection->error]);
            }
    
        } else {
            // Insert
            $id = generateCustomerID($connection);
            $sql = "INSERT INTO Customer (customer_id, first_name, last_name, email, phone, address, city, postal_code)
            VALUES ('$id', '$first', '$last', '$email', '$phone', '$address', '$city', '$postal')";
            if ($connection->query($sql)) {
                $new_id = $connection->insert_id; // ✅ 获取新插入的 ID
                echo json_encode(["success" => true, "customer_id" => $new_id]);
            } else {
                echo json_encode(["success" => false, "error" => $connection->error]);
            }
        }
        break;
        
    case 'DELETE':
        parse_str(file_get_contents("php://input"), $data);
        $id = $data['customer_id'];
        $delete = "DELETE FROM Customer WHERE customer_id='$id'";
        if ($connection->query($delete)) {
            echo json_encode(["success" => true]);
        } else {
            echo json_encode(["success" => false, "error" => $connection->error, "customer_id" => $id]);
        }
        break;
}

$connection->close();
