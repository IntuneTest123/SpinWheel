<?php
session_start();

if (isset($_POST['item'])) {
    if (!isset($_SESSION['items'])) {
        $_SESSION['items'] = [];
    }
    
    $_SESSION['items'][] = $_POST['item'];
    echo json_encode($_SESSION['items']);
} 