/* ************************************************************************

   Copyright:

   License:

   Authors:

************************************************************************ */

/**
 * This is the main application class of your custom application "ModelSpectrumJson"
 *
 * @asset(modelspectrumjson/*)
 */
qx.Class.define("modelspectrumjson.Application",
{
  extend : qx.application.Standalone,

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */
  members : {
    /**
     * This method contains the initial application code and gets called
     * during startup of the application
     *
     * @lint ignoreDeprecated(alert)
     */
    main : function()
    {
      // Call super class
      this.base(arguments);

      // Enable logging in debug variant
      if (qx.core.Environment.get("qx.debug"))
      {
        // support native logging capabilities, e.g. Firebug for Firefox
        qx.log.appender.Native;

        // support additional cross-browser console. Press F7 to toggle visibility
        qx.log.appender.Console;
      }

      /*
      -------------------------------------------------------------------------
        Below is your actual application code...
      -------------------------------------------------------------------------
      */

      // Create HTML for flot
      var html = new qx.ui.embed.Html();
      html.setHtml('<div id="content"><div class="demo-container"><div id="placeholder" class="demo-placeholder"></div></div></div>');
      html.addListener("appear", function(e) {
        modelspectrumjson.Plot.getInstance();
      });

      // Document is the application root
      var doc = this.getRoot();

      // Add button to document at fixed coordinates
      doc.add(html, {
        edge : 0
      });
      var button = new qx.ui.form.Button("Hello");
      doc.add(button);
      var button2 = new qx.ui.form.Button("Hello");
      doc.add(button2);
    }
  }
});
