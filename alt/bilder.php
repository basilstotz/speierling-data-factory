<!DOCTYPE html>
<!--

    Simple PHP Gallery 1.1, Template, Raffia.ch

-->
<html><head>

    <meta charset="utf-8">
    <title>PHP Photo Gallery</title>
    <meta name="description" content="Simple PHP photo gallery with jQuery and Lightbox-2.">
    <meta name="robots" content="index, follow">

    <script src="//code.jquery.com/jquery-3.3.1.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/lightbox2/2.11.0/css/lightbox.min.css" />
    <script src="https://cdnjs.cloudflare.com/ajax/libs/lightbox2/2.11.0/js/lightbox.min.js"></script>
    
    <style>
        body { font-family:arial; font-size:20px; color:gray; min-height:300vh; }
        a { text-decoration:none; }
        a:hover { color:black; }
        #gbox { background-color:#333; padding:30px; line-height:0; }
        #gbox a img { height:200px; margin-left:-50px; }
        #gbox a { height:180px; width:180px; display:inline-block; text-align:center;
            overflow:hidden; margin:1px; padding:0; background-color:#dddddd; }
        #gbox a:hover { opacity:0.8; }
        #code { font-size:0.8em; text-align:left; border-left:8px solid silver; padding-left:2%; }
    </style>
    
  </head>
  <body>

    <div id="gbox" align="center">
        <?php
          $nodeid=$_GET["nodeid"];
          passthru("./find.sh ".$nodeid);
        ?>
    </div>

  </body>
</html>
