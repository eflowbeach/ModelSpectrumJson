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
      var container = new qx.ui.container.Composite(new qx.ui.layout.VBox(5).set( {
        alignX : "center"
      }));

      // Create HTML for flot
      var html = new qx.ui.embed.Html();
      html.setHtml('<div id="content"><div class="demo-container"><div id="placeholder" class="demo-placeholder"></div></div></div>');

      //      html.setMinWidth(600);
      html.setMinHeight(500);
      html.addListener("appear", function(e) {
        modelspectrumjson.Plot.getInstance();
      });
      container.add(html);

      /**
      Group Box
      */
      var groupBox = new qx.ui.groupbox.GroupBox("Controls").set( {
        maxWidth : 800
      });
      groupBox.setLayout(new qx.ui.layout.HBox(10).set( {
        alignY : "middle"
      }));
      container.add(groupBox);

      /**
                * Fields SelectBox
                */
      var fields = ["MaxT", "MinT", "T", "PoP"];
      var fieldSelectBox = new qx.ui.form.SelectBox();
      new qx.data.controller.List(new qx.data.Array(fields), fieldSelectBox);
      fieldSelectBox.addListener("changeSelection", function(e) {
        modelspectrumjson.Plot.getInstance().setField(e.getData()[0].getLabel());
      })
      groupBox.add(new qx.ui.basic.Label("<b>Field: </b>").set( {
        rich : true
      }));
      groupBox.add(fieldSelectBox);

      // Show Individual Models
      var showLines = new qx.ui.form.ToggleButton("Show Lines");
      showLines.addListener("changeValue", function(e) {
        modelspectrumjson.Plot.getInstance().setShowLines(e.getData());
      });
      groupBox.add(showLines);

      // Show Climate
      var showClimate = new qx.ui.form.ToggleButton("Show Climate");
      showClimate.setValue(true);
      showClimate.addListener("changeValue", function(e) {
        modelspectrumjson.Plot.getInstance().setShowClimate(e.getData());
      });
      groupBox.add(showClimate);

      // Plot type
      groupBox.add(new qx.ui.basic.Label("<b>Plot Type: </b>").set( {
        rich : true
      }));
      var rbBW = new qx.ui.form.RadioButton("Box and Whisker");
      var rbPlume = new qx.ui.form.RadioButton("Plume");

      // Add them to the container
      groupBox.add(rbBW);
      groupBox.add(rbPlume);

      // Add all radio buttons to the manager
      var manager = new qx.ui.form.RadioGroup(rbBW, rbPlume);

      // Add a listener to the "changeSelected" event
      manager.addListener("changeSelection", function(e) {
        modelspectrumjson.Plot.getInstance().setPlotType(e.getData()[0].getLabel());
      }, this);

      // Add button to document at fixed coordinates
      this.getRoot().add(container, {
        edge : 0
      });
    }
  }
});
