<?php
session_start();

if (isset($_POST['index']) && isset($_SESSION['items'])) {
    $index = $_POST['index'];
    
    if (isset($_SESSION['items'][$index])) {
        array_splice($_SESSION['items'], $index, 1);
    }
    
    echo json_encode($_SESSION['items']);
} 