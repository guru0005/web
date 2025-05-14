<!DOCTYPE html>
<html lang="en">
<head>
<title>Factorial Calculator</title>
</head>
<body>
<h2>Factorial Calculator</h2>
<form method="POST">
Enter a number: <input type="number" name="num" required>
<input type="submit" name="submit" value="Calculate">
</form>
<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
$num = intval($_POST["num"]);
function factorial($n) {
return ($n <= 1) ? 1 : $n * factorial($n - 1);
}
echo "<p>Factorial of $num is: " . factorial($num) . "</p>";
}
?>
</body>
</html>
