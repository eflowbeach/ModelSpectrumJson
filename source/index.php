<!DOCTYPE html>
<html>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
  <title>ModelSpectrumJson</title>
    <link href="resource/modelspectrumjson/css/style.css" rel="stylesheet" type="text/css">
      <!--[if lte IE 8]><script language="javascript" type="text/javascript" src="resource/modelspectrumjson/js/flot/excanvas.min.js"></script><![endif]-->
      <script language="javascript" type="text/javascript" src="resource/modelspectrumjson/js/flot/jquery.js"></script>
      <script language="javascript" type="text/javascript" src="resource/modelspectrumjson/js/flot/jquery.flot.js"></script>
      <script language="javascript" type="text/javascript" src="resource/modelspectrumjson/js/flot/jquery.flot.time.js"></script>
      <script language="javascript" type="text/javascript" src="resource/modelspectrumjson/js/flot/jquery.flot.navigate.js"></script>
      <script language="javascript" type="text/javascript" src="resource/modelspectrumjson/js/flot/jquery.flot.axislabels.js"></script>
      <script language="javascript" type="text/javascript" src="resource/modelspectrumjson/js/d3.v3.min.js"></script>
      <script language="javascript" type="text/javascript" src="resource/modelspectrumjson/js/moment.js"></script>


      <script type="text/javascript">
      <?php
      include_once("resource/modelspectrumjson/util/sanitize.php");
      $wfo = isset($_REQUEST['wfo'])?sanitize(trim($_REQUEST['wfo']),STRICT):"";
      $site = isset($_REQUEST['site'])?sanitize(trim($_REQUEST['site']),STRICT):"";
      $field = isset($_REQUEST['field'])?sanitize(trim($_REQUEST['field']),STRICT):"";
      echo 'var wfo="'.$wfo."\";";
      echo 'var site="'.$site."\";";
      echo 'var field="'.$field."\";";

      ?>
      </script>
  <script type="text/javascript" src="script/modelspectrumjson.js"></script>
</head>
<body></body>
</html>
