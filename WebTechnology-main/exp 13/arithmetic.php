<!DOCTYPE html>
<html lang="en">
<head>
<title>Arithmetic Operations</title>
</head>
<body>
<h2>Arithmetic Operations in PHP</h2>
<form method="POST">
Enter Number 1: <input type="number" name="num1" required><br><br>
Enter Number 2: <input type="number" name="num2" required><br><br>
Select Operation:
<select name="operation">
<option value="add">Addition (+)</option>
<option value="sub">Subtraction (-)</option>
<option value="mul">Multiplication (*)</option>
<option value="div">Division (/)</option>
</select>
<br><br>
<input type="submit" name="submit" value="Calculate">
</form>
<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
$num1 = $_POST["num1"];
$num2 = $_POST["num2"];
$operation = $_POST["operation"];
$result = 0;
switch ($operation) {
case "add": $result = $num1 + $num2; break;
case "sub": $result = $num1 - $num2; break;
case "mul": $result = $num1 * $num2; break;
case "div":
$result = ($num2 != 0) ? $num1 / $num2 : "Undefined (division by zero)";
break;
}
echo "<h3>Result: $result</h3>";
}
?>
</body>
</html>