<?php
require_once __DIR__ . '/config/env.php';
$dbConfig = require __DIR__ . '/config/database.php';

try {
    $dsn = "mysql:host={$dbConfig['host']};port={$dbConfig['port']};dbname={$dbConfig['name']};charset={$dbConfig['charset']}";
    $db = new PDO($dsn, $dbConfig['user'], $dbConfig['pass'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    // 1. Modify products table
    $stmt = $db->query("SHOW COLUMNS FROM products LIKE 'category'");
    if ($stmt->rowCount() == 0) {
        $db->exec("
            ALTER TABLE products
            ADD COLUMN category VARCHAR(50) NOT NULL DEFAULT 'Umum' AFTER name,
            ADD COLUMN cost_price DECIMAL(10,2) NOT NULL DEFAULT 0 AFTER category;
        ");
    }

    // 2. Create stock_adjustments table
    $db->exec("
        CREATE TABLE IF NOT EXISTS stock_adjustments (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            product_id INT UNSIGNED NOT NULL,
            type ENUM('in', 'out', 'adjustment') NOT NULL,
            qty INT NOT NULL,
            note VARCHAR(255) NULL,
            created_by INT UNSIGNED NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_stock_product FOREIGN KEY (product_id) REFERENCES products(id),
            CONSTRAINT fk_stock_user FOREIGN KEY (created_by) REFERENCES users(id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");
    
    // 3. transaction_items might need session_id instead of transaction_id if attached to session?
    // Wait, currently transaction_items references transaction_id. But a session doesn't create a transaction until it completes.
    // If a cashier adds a product to a running session, we can't save it in `transaction_items` linked to `transaction_id` yet, 
    // unless we create the transaction immediately or store it in a `session_items` table.
    // Let's create session_orders table to store items ordered during a session!
    $db->exec("
        CREATE TABLE IF NOT EXISTS session_orders (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            session_id INT UNSIGNED NOT NULL,
            product_id INT UNSIGNED NULL,
            item_name VARCHAR(100) NOT NULL,
            qty INT UNSIGNED NOT NULL DEFAULT 1,
            unit_price DECIMAL(10,2) NOT NULL,
            subtotal DECIMAL(12,2) NOT NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT fk_order_session FOREIGN KEY (session_id) REFERENCES rental_sessions(id) ON DELETE CASCADE,
            CONSTRAINT fk_order_product FOREIGN KEY (product_id) REFERENCES products(id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ");

    echo "Migration success!\n";
} catch (PDOException $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
}
