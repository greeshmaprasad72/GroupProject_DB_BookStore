<!-- Group 4 
Greeshma Prasad - 9042892 
Arya Reghu - 8960917 
Sitong Liu 8990939  
Dharanya Selvaraj - 8998287 -->
<?php
define('DB_HOST', 'localhost:3307');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'Group4');

function getConnection() {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }
    
    return $conn;
}
?>