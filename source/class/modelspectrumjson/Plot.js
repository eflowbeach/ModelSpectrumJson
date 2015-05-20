/**
   Program Name: Plot.js
   Author: jwolfe
   Date: 5/16/15
*/
qx.Class.define("modelspectrumjson.Plot",
{
  extend : qx.core.Object,
  type : "singleton",
  properties :
  {
    dataClone : {
      init : {

      }
    },
    wfo :
    {
      init : "rlx",
      apply : "requestData"
    },
    site :
    {
      init : "KCRW",
      apply : "requestData"
    },
    field :
    {
      init : "MaxT",
      apply : "requestData"
    },
    showLines :
    {
      init : false,
      apply : "onDataReceived"
    },
    showClimate :
    {
      init : true,
      apply : "onDataReceived"
    },
    plotType :
    {
      init : "Box and Whisker",
      apply : "onDataReceived"
    }
  },
  construct : function()
  {
    this.base(arguments);
    var me = this;

    // On first load - do not make calls to request data for property changes
    me.firstLoad = true;

    // Set fields from url
    if (typeof wfo !=="undefined") {
      me.setWfo(wfo);
    }
    if (typeof site!=="undefined") {
      me.setSite(site);
    }
    if (typeof field!=="undefined") {
      me.setField(field);
    }
    me.firstLoad = false;

    //  Request Data
    me.requestData();

    // Add tooltip and bindings
    me.addHooks();
  },
  members :
  {
    /**
    Request the data
    */
    requestData : function()
    {
      var me = this;
      if (me.firstLoad) {
        return;
      }
      var req = new qx.io.request.Xhr("resource/modelspectrumjson/getData.php?wfo=" + me.getWfo() + '&site=' + me.getSite() + '&field=' + me.getField());
      req.setCache(false);
      req.setParser("json");
      req.addListenerOnce("success", function(e)
      {
        var response = e.getTarget().getResponse();
        me.onDataReceived(response);
      }, this);

      // Send request
      req.send();
    },

    /**
    Tooltip to DOM and listeners
    */
    addHooks : function()
    {
      var me = this;

      /**
       Add tooltip to DOM
       */
      $("<div id='tooltip'></div>").css(
      {
        position : "absolute",
        display : "none",
        padding : "10px",
        background : "rgb(255, 254, 210)",
        border : "3px solid rgb(136, 99, 0)",
        "border-radius" : "10px",
        opacity : 0.98,
        "z-index" : 9999999
      }).appendTo("body");

      /**
      Hook tooltip into mouseover
      */
      $("#placeholder").bind("plothover", function(event, pos, item) {
        if (item)
        {
          var x = item.datapoint[0], y = item.datapoint[1].toFixed(2);
          var result = me.getDataClone();

          // Used for bars since they are offset a tad
          var match = x / 1000;
          var addMinutes = 0;
          if (typeof result.data[x / 1000] === "undefined")
          {
            //match = (x - (1000 * 3600 * result.gridLengthHours) / 2) / 1000;
            match = (x / 1000) - ((3600 * result.gridLengthHours) / 2);
            addMinutes = 30;
          }

          // Construct Tooltip html
          var html = '';
          html += "<table><tr><td><b>From:</b> </td><td>" + new moment(match * 1000).add(addMinutes, 'minutes').format("h A ddd, MMM D, YYYY ") + new moment.utc(x).add(addMinutes, 'minutes').format("(HH") + " UTC) </td></tr>";
          html += "<tr><td><b>To:</b></td><td> " + new moment(match * 1000).add(result.gridLengthHours * 60 + addMinutes, 'minutes').format("h A ddd, MMM D, YYYY ") + new moment.utc(x).add(result.gridLengthHours * 60 + addMinutes, 'minutes').format("(HH") + " UTC) </td></tr>";
          html += "</table><hr>";

          // Forecasts
          var precision = 0;
          if (me.getField() == "QPF") {
            precision = 2;
          }
          html += "<table>";
          html += "<tr><td style='padding-top:10px;color: purple;'><b><u>Forecasts</u></b></td></tr>";
          html += "<tr><td><b><u>Model</u></b></td><td><b><u>Value</u></b></td><td style='padding-left:20px;'><b><u>Run Time</u></b></td></tr>";

          // Start at -1 to exclude NWS Forecast
          var numModels = -1;
          result.data[match].forEach(function(obj, index) {
            if (obj !== null)
            {
              if (result.models[index] == item.series.label) {
                html += "<tr><td><b><font style='color:" + item.series.color + ";'>" + result.models[index].replace("Official", "NWS Forecast") + "</font>:</b></td><td>" + obj.toFixed(precision) + ' ' + result.units +"</td><td style='padding-left:20px;'> "+result.modelRunTimes[index]+ "</td></tr>";
              } else {
                html += "<tr><td><b>" + result.models[index].replace("Official", "NWS Forecast") + ":</b></td><td>" + obj.toFixed(precision) + ' ' + result.units +"</td><td style='padding-left:20px;'> "+result.modelRunTimes[index]+ "</td></tr>";
              }
              numModels++;
            }
          });

          html += '</table><hr><table>';
          var models = result.data[match].slice(1).sort(d3.ascending);

          // Remove undefined
          models = models.filter(function(n) {
            return n != undefined
          });
          html += "<tr><td style='padding-top:10px;color: darkgreen'><b><u>Statistics</b></u></td></tr>";
          html += "<tr><td><b>Max:</b></td><td>" + d3.max(models).toFixed(precision) + ' ' + result.units + "</td><td style='padding-left:5px;'><b>95th Perc. :</b></td><td>" + d3.quantile(models, 0.95).toFixed(precision) + ' ' + result.units + "</td></tr>";
          html += "<tr><td><b>Min:</b></td><td>" + d3.min(models).toFixed(precision) + ' ' + result.units + "</td><td style='padding-left:5px;'><b>75th Perc. :</b></td><td>" + d3.quantile(models, 0.75).toFixed(precision) + ' ' + result.units + "</td></tr>";
          html += "<tr><td><b>Model Mean:</b></td><td>" + d3.mean(models).toFixed(precision) + ' ' + result.units + "</td><td style='padding-left:5px;'><b>50th Perc. :</b></td><td>" + d3.quantile(models, 0.50).toFixed(precision) + ' ' + result.units + "</td></tr>";
          html += "<tr><td><b>Model Median :</b></td><td>" + d3.median(models).toFixed(precision) + ' ' + result.units + "</td><td style='padding-left:5px;'><b>25th Perc. :</b></td><td>" + d3.quantile(models, 0.25).toFixed(precision) + ' ' + result.units + "</td></tr>";
          html += "<tr><td><b>Model Std. Dev. :</b></td><td>" + d3.deviation(models).toFixed(precision) + ' ' + result.units + "</td><td style='padding-left:5px;'><b>5th Perc. :</b></td><td>" + d3.quantile(models, 0.05).toFixed(precision) + ' ' + result.units + "</td></tr>";
          html += "<tr><td><b>Number of Models :</b></td><td>" + numModels + "</td>";
          html += "</table>";

          /**
          Climate Section
          */
          if (me.getShowClimate() && (me.getField() == "T" || me.getField() == "MaxT" ||me.getField() == "MinT" ))
          {
            html += "<hr><table>";
            html += "<tr><td style='padding-top:10px;color: rgb(142, 60, 18);'><b><u>Climate</b></u></td></tr>";

            // Climate starts at midnight
            var climateTime = new moment.utc(x).startOf('day').toDate().getTime() / 1000;

            // Increment a day if late in the day due to flots odd UTC plotting scheme
            if (parseInt(new moment.utc(x).format("H")) < parseInt(moment().zone() / 60)) {
              climateTime = climateTime - 86400;
            }
            var climateInfo = result.climate[climateTime];
            html += "<tr><td><b>Record High:</b></td><td>" + climateInfo[3] + " (" + climateInfo[5] + ")</td></tr>";
            html += "<tr><td><b>Normal High:</b></td><td>" + climateInfo[2] + "</td></tr>";
            html += "<tr><td><b>Normal Low:</b></td><td>" + climateInfo[1] + "</td></tr>";
            html += "<tr><td><b>Record Low:</b></td><td>" + climateInfo[0] + " (" + climateInfo[4] + ")</td></tr>";
            html += "</table>";
          }

          // Show the tooltip
          $("#tooltip").html(html).css(
          {
            top : item.pageY + 15,
            left : item.pageX + 15
          }).fadeIn(200);
        } else
        {
          $("#tooltip").hide();
        }
      });
    },

    /**
    Process and Plot the data
    */
    onDataReceived : function(results)
    {
      var me = this;
      if (results == true || results == false || results == "Box and Whisker" || results == "Plume") {
        results = me.getDataClone();
      }
      if (results.units == "F") {
        results.units = "\xBAF";
      };
      if (me.getField() == "Wind")
      {
        results.units = "mph";

        // Convert from kt to mph
        Object.keys(results.data).forEach(function(obj) {
          for (var i = 0; i < results.data[obj].length; i++) {
            if (results.data[obj][i] !== null) {
              results.data[obj][i] *= 1.15077945;
            }
          }
        })
      }

      // Deep copy
      var resultsClone = jQuery.extend(true, {

      }, results);
      me.setDataClone(resultsClone);

      /**
      Make Bars
      */
      var keys = Object.keys(results.data);
      keys.sort();
      var max = -9999;
      var min = 9999;

      // Remove NWS and undefined values
      keys.forEach(function(obj, index)
      {
        // Remove NWS
        results.data[obj] = results.data[obj].slice(1);

        // Remove undefined
        results.data[obj] = results.data[obj].filter(function(n) {
          return n != undefined
        });

        // Sort for percentiles
        results.data[obj] = results.data[obj].sort(d3.ascending);
        if (d3.max(results.data[obj]) > max) {
          max = d3.max(results.data[obj]);
        }
        if (d3.min(results.data[obj]) < min) {
          min = d3.min(results.data[obj]);
        }
      })
      var boxes = [];

      // Now Line
      boxes.push(
      {
        data : [[new Date().getTime(), -1000], [new Date().getTime(), 1000]],
        color : "black",
        lines :
        {
          show : true,
          lineWidth : 3
        },
        shadowSize : 1
      });

      /**
      Check for Climate Data
      */

      // Climate [record low, avg min, avg max, record max, day of year,
      if (me.getShowClimate() && (typeof (results.climate) !== "undefined" && (me.getField() == "T" || me.getField() == "MaxT"||me.getField() == "MinT" )))
      {
        var minMax = me.addClimateData(results, boxes, min, max);
        min = minMax[0];
        max = minMax[1];
      }

      /**
      Plot the box and whiskers  - since flot doesn't allow coloring by value adding separate objects for each component.
      */
      if (me.getPlotType() == "Box and Whisker") {
        me.plotBoxAndWhiskers(keys, results, resultsClone, boxes);
      } else {
        me.plotPlume(keys, results, resultsClone, boxes);
      }

      // Add lines
      if (me.getShowLines()) {
        me.plotLines(resultsClone, boxes);
      }

      /**
       Make the flot plot call
      */
      $.plot("#placeholder", boxes,
      {
        axisLabels : {
          show : true
        },
        xaxis :
        {
          mode : "time",
          timezone : "browser",
          tickFormatter : function(val, axis) {
            return new moment(val).format("h A ddd<br>M/D/YY");
          },
          axisLabel : "Date/Time (Local)",
          min : new moment().startOf('day'),//.subtract(1, 'days'),
          max : new moment().startOf('day').add(8, 'days')
        },
        yaxis :
        {
          min : (me.getField() == "RH" || me.getField() == "PoP"|| me.getField() == "WaveHeight") ? 0 : min - (min * 0.2),  //null,
          max : (me.getField() == "RH" || me.getField() == "PoP") ? 100 : max + (max * 0.2),  //null,
          axisLabel : me.getField() + ', ' + results.units
        },
        zoom : {
          interactive : true
        },
        pan : {
          interactive : true
        },
        grid : {
          hoverable : true
        }
      });
    },

    /**
    Add Climate Data
    */
    addClimateData : function(results, boxes, min, max)
    {
      var me = this;
      Object.keys(results.climate).forEach(function(obj)
      {
        if (results.climate[obj][0] < min) {
          min = results.climate[obj][0];
        }

        // Record Lows
        boxes.push(
        {
          data : [[obj * 1000 + 1000 * 60 * moment().zone(), results.climate[obj][0], results.climate[obj][1]]],
          color : "blue",
          hoverable : false,
          bars :
          {
            show : true,
            barWidth : 1000 * 3600 * 24,
            lineWidth : 0.01,
            fill : 0.18
          }
        });

        // Normal
        boxes.push(
        {
          data : [[obj * 1000 + 1000 * 60 * moment().zone(), results.climate[obj][1], results.climate[obj][2]]],
          color : "green",
          hoverable : false,
          bars :
          {
            show : true,
            barWidth : 1000 * 3600 * 24,
            lineWidth : 0.01,
            fill : 0.18
          }
        });

        // Record Highs
        if (results.climate[obj][2] > max) {
          max = results.climate[obj][2];
        }
        boxes.push(
        {
          data : [[obj * 1000 + 1000 * 60 * moment().zone(), results.climate[obj][2], results.climate[obj][3]]],
          color : "red",
          hoverable : false,
          bars :
          {
            show : true,
            barWidth : 1000 * 3600 * 24,
            lineWidth : 0.01,
            fill : 0.18
          }
        });
      })
      return [min, max];
    },

    /**
    Plot the box and whiskers
    */
    plotBoxAndWhiskers : function(keys, results, resultsClone, boxes)
    {
      var me = this;
      var barWidth = 1000 * 3600 * results.gridLengthHours;
      keys.forEach(function(obj)
      {
        if (me.getField() == "Sky" || me.getField() == "PoP" || me.getField() == "RH")
        {
          var high = 20;
          var medium = 10;
          var low = 5;
        } else if (me.getField() == "QPF")
        {
          var high = 0.5;
          var medium = 0.25;
          var low = 0.1;
        } else
        {
          high = 4;
          medium = 2;
        }

        // Color by standard deviation
        if (d3.deviation(results.data[obj]) > high) {
          boxColor = "#FF0000";
        } else if (d3.deviation(results.data[obj]) > medium) {
          boxColor = "#FFAF00";
        } else {
          boxColor = "#9ADC00";
        }

        // Main Box
        boxes.push(
        {
          data : [[obj * 1000, d3.quantile(results.data[obj], 0.25), d3.quantile(results.data[obj], 0.75)]],
          color : boxColor,
          bars :
          {
            show : true,
            barWidth : barWidth
          }
        });

        // Fill in top of box
        boxes.push(
        {
          data : [[obj * 1000, d3.quantile(results.data[obj], 0.75), d3.quantile(results.data[obj], 0.75)]],
          color : boxColor,
          bars :
          {
            show : true,
            barWidth : barWidth
          }
        });

        // Top Whisker
        boxes.push(
        {
          data : [[obj * 1000, d3.quantile(results.data[obj], 0.95), d3.quantile(results.data[obj], 0.95)]],
          color : boxColor,
          bars :
          {
            show : true,
            barWidth : barWidth
          }
        });

        // Bottom Whisker
        boxes.push(
        {
          data : [[obj * 1000, d3.quantile(results.data[obj], 0.05), d3.quantile(results.data[obj], 0.05)]],
          color : boxColor,
          bars :
          {
            show : true,
            barWidth : barWidth
          }
        });

        // Bottom Line
        boxes.push(
        {
          data : [[obj * 1000 + barWidth / 2, d3.quantile(results.data[obj], 0.05)], [obj * 1000 + barWidth / 2, d3.quantile(results.data[obj], 0.25)]],
          color : boxColor,
          lines : {
            show : true
          }
        });

        // Top Line
        boxes.push(
        {
          data : [[obj * 1000 + barWidth / 2, d3.quantile(results.data[obj], 0.95)], [obj * 1000 + barWidth / 2, d3.quantile(results.data[obj], 0.75)]],
          color : boxColor,
          lines : {
            show : true
          }
        });

        // Freezing Line
        if (me.getField() == "T" || me.getField() == "MaxT" || me.getField() == "MinT") {
          boxes.push(
          {
            data : [[new moment().subtract(100, 'days'), 32], [new moment().add(100, 'days'), 32]],
            color : "#1da9cc",
            dashes :
            {
              show : true,
              lineWidth : 1
            },
            shadowSize : 1
          });
        }

        // NWS Forecast
        boxes.push(
        {
          data : [[obj * 1000, resultsClone.data[obj][0]]],
          color : "blue",
          points : {
            show : true
          }
        });
      })
    },

    /**
      Plot the box and whiskers
      */
    plotPlume : function(keys, results, resultsClone, boxes)
    {
      var me = this;
      var pctlObject = {

      };
      pctlObject["mean"] = [];
      pctlObject["5%"] = [];
      pctlObject["25%"] = [];
      pctlObject["50%"] = [];
      pctlObject["75%"] = [];
      pctlObject["95%"] = [];
      keys.forEach(function(obj)
      {
        pctlObject["mean"].push([obj * 1000, d3.mean(results.data[obj])]);
        pctlObject["5%"].push([obj * 1000, d3.quantile(results.data[obj], 0.05)]);
        pctlObject["25%"].push([obj * 1000, d3.quantile(results.data[obj], 0.25)]);
        pctlObject["50%"].push([obj * 1000, d3.quantile(results.data[obj], 0.5)]);
        pctlObject["75%"].push([obj * 1000, d3.quantile(results.data[obj], 0.75)]);
        pctlObject["95%"].push([obj * 1000, d3.quantile(results.data[obj], 0.95)]);
      });

//"MaxT", "MinT", "T", "PoP", "Wind", "WindGust", "QPF", "RH"
      var color =   "rgb(255,50,50)";
      if(me.getField()=="PoP"|me.getField()=="QPF"){
color =   "#4c9645";
      }else if (me.getField()=="Wind"||me.getField()=="WindGust"){
            color =   "#a62fc4 ";
      }else if (me.getField()=="RH"){
                   color =   "#a16f23 ";
             }else if (me.getField()=="WaveHeight"){
                          color =   "#7bb3d4 ";
                    }

      boxes.push(
      {
        id : "f5%",
        data : pctlObject["5%"],
        lines :
        {
          show : true,
          lineWidth : 0,
          fill : false
        },
        color : color
      },
      {
        id : "f25%",
        data : pctlObject["25%"],
        lines :
        {
          show : true,
          lineWidth : 0,
          fill : 0.2
        },
        color : color,
        fillBetween : "f5%"
      },
      {
        id : "f50%",
        data : pctlObject["50%"],
        lines :
        {
          show : true,
          lineWidth : 0.5,
          fill : 0.4,
          shadowSize : 0
        },
        color : color,
        fillBetween : "f25%"
      },
      {
        id : "f75%",
        data : pctlObject["75%"],
        lines :
        {
          show : true,
          lineWidth : 0,
          fill : 0.4
        },
        color : color,
        fillBetween : "f50%"
      },
      {
        id : "f95%",
        data : pctlObject["95%"],
        lines :
        {
          show : true,
          lineWidth : 0,
          fill : 0.2
        },
        color : color,
        fillBetween : "f75%"
      },
      {
        label : "Mean",
        data : pctlObject["mean"],
        lines : {
          show : true
        },
        color : color
      })

      // Freezing Line
      if (me.getField() == "T" || me.getField() == "MaxT" || me.getField() == "MinT") {
        boxes.push(
        {
          data : [[new moment().subtract(100, 'days'), 32], [new moment().add(100, 'days'), 32]],
          color : "#1da9cc",
          dashes :
          {
            show : true,
            lineWidth : 1
          },
          shadowSize : 1
        });
      }
      keys.forEach(function(obj) {
        // NWS Forecast
        boxes.push(
        {
          data : [[obj * 1000, resultsClone.data[obj][0]]],
          color : "blue",
          points : {
            show : true
          }
        });
      })
    },

    /**
    Plot Individual Models
    */
    plotLines : function(resultsClone, boxes)
    {
      var me = this;
      resultsClone.models.forEach(function(obj, modelIndex)
      {
        var timeseries = [];
        Object.keys(resultsClone.data).forEach(function(obj, index) {
          timeseries.push([obj * 1000, resultsClone.data[obj][modelIndex]]);
        })
        boxes.push(
        {
          label : obj,
          data : timeseries,
          color : (obj == "Official") ? "blue" : null,
          points : {
            show : true
          },
          lines : {
            show : true
          }
        });
      })
    }
  }
});
