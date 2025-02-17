<?php
session_start();

if (!isset($_SESSION['items'])) {
    $_SESSION['items'] = ['Prize 1', 'Prize 2', 'Prize 3', 'Prize 4'];
}

echo json_encode($_SESSION['items']); 