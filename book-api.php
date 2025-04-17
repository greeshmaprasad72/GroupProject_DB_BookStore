<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
include 'config.php';
$connection = getConnection();
header("Content-Type: application/json");
// $connection = new mysqli("localhost", "root", "", "group4");


// Allow CORS if needed for localhost testing
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");



if ($connection->connect_error) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => $connection->connect_error]);
    exit();
}

// Generate unique book_id
function generateBookID($connection) {
    do {
        $id = 'BOOK' . str_pad(rand(1, 99999), 5, '0', STR_PAD_LEFT);
        $check = $connection->query("SELECT * FROM Book WHERE book_id = '$id'");
    } while ($check && $check->num_rows > 0);
    return $id;
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            $id = $connection->real_escape_string($_GET['id']);
            $result = $connection->query("SELECT * FROM Book WHERE book_id = '$id'");
            echo json_encode($result->fetch_assoc());
        } else {
            $result = $connection->query("SELECT * FROM Book");
            $books = [];

            while ($row = $result->fetch_assoc()) {
                $books[] = $row;
            }
            echo json_encode($books);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);

        if (!$data) {
            echo json_encode(["success" => false, "message" => "No data received"]);
            exit();
        }

        $book_id = $data['book_id'] ?? null;
        $title = $connection->real_escape_string($data['title']);
        $author = $connection->real_escape_string($data['author']);
        $isbn = $connection->real_escape_string($data['isbn']);
        $edition = $connection->real_escape_string($data['edition']);
        $year = (int) $data['year'];
        $price = (float) $data['price'];
        $quantity = (int) $data['quantity'];

        if ($book_id) {
            $sql = "UPDATE Book SET 
                    title='$title', author='$author', isbn='$isbn', edition='$edition',
                    publication_year=$year, price=$price, quantity_in_stock=$quantity
                    WHERE book_id='$book_id'";
            $success = $connection->query($sql);

            echo json_encode([
                "success" => $success,
                "book_id" => $book_id,
                "message" => $success ? "Book updated successfully" : $connection->error
            ]);
        } else {
            $book_id = generateBookID($connection);
            $sql = "INSERT INTO Book (book_id, title, author, isbn, edition, publication_year, price, quantity_in_stock)
                    VALUES ('$book_id', '$title', '$author', '$isbn', '$edition', $year, $price, $quantity)";
            $success = $connection->query($sql);

            echo json_encode([
                "success" => $success,
                "book_id" => $book_id,
                "message" => $success ? "Book added successfully" : $connection->error
            ]);
        }
        break;

    case 'DELETE':
        parse_str(file_get_contents("php://input"), $data);
        $id = $connection->real_escape_string($data['id']);
        $delete = "DELETE FROM Book WHERE book_id='$id'";
        $success = $connection->query($delete);

        echo json_encode([
            "success" => $success,
            "message" => $success ? "Book deleted successfully" : $connection->error
        ]);
        break;
}

$connection->close();
