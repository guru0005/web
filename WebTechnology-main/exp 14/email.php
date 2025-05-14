<!DOCTYPE html>
<html lang="en">
<head>
<title>Email Validation using RegEx</title>
</head>
<body>
<h2>Email Validation in PHP</h2>
<form method="POST">
Enter Email: <input type="text" name="email" required>
<input type="submit" name="submit" value="Validate">
</form>
<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
$email = $_POST["email"];
$pattern = "/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/";
if (preg_match($pattern, $email)) {
echo "<h3 style='color:green;'>Valid Email</h3>";
} else {
echo "<h3 style='color:red;'>Invalid Email</h3>";
}
}
?>
</body>
</html>