<html>

<head>
  
</head>

<body>

<h1>dfdsfasdfasdfad</h1>

<?php
    $nodeid=$_GET["nodeid"];
echo $nodeid;
    passthru("./find.sh ".$nodeid);
?>

</body>

