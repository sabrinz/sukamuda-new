<?php
// Better SQL Import Script

$env_path = __DIR__ . '/.env';
$env_content = file_get_contents($env_path);

// Parse .env properly
preg_match('/DB_HOST=(.+)/', $env_content, $host);
preg_match('/DB_PORT=(.+)/', $env_content, $port);
preg_match('/DB_DATABASE=(.+)/', $env_content, $database);
preg_match('/DB_USERNAME=(.+)/', $env_content, $username);
preg_match('/DB_PASSWORD=(.+)/', $env_content, $password);

$host = trim($host[1] ?? '127.0.0.1');
$port = trim($port[1] ?? '3306');
$database = trim($database[1] ?? 'sukamuda');
$username = trim($username[1] ?? 'root');
$password = trim($password[1] ?? '');

$sql_file = __DIR__ . '/sukamuda.sql';

try {
    // Create connection without selecting database first
    $pdo = new PDO("mysql:host=$host;port=$port;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::MYSQL_ATTR_MULTI_STATEMENTS, true);
    
    // Create database
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$database` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    echo "✓ Database '$database' created\n";
    
    // Now connect to the database
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$database;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::MYSQL_ATTR_MULTI_STATEMENTS, true);
    
    // Read SQL file
    if (!file_exists($sql_file)) {
        throw new Exception("SQL file not found: $sql_file");
    }
    
    $sql = file_get_contents($sql_file);
    
    // Execute SQL (with multi-statement support)
    if ($pdo->exec($sql) !== false) {
        echo "✓ Database imported successfully!\n";
    }
    
} catch (PDOException $e) {
    echo "✗ Database Error: " . $e->getMessage() . "\n";
    exit(1);
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>
