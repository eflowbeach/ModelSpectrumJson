/**
   Program Name: Plot.js
   Author: jwolfe
   Date: 5/16/15
*/
qx.Class.define("modelspectrumjson.Plot",
{
  extend : qx.core.Object,
  type : "singleton",
  construct : function()
  {
    this.base(arguments);
    $(function()
    {
      var d = [[-373597200000, 315.71, 300], [-370918800000, 317.45], [-368326800000, 317.50], [-363056400000, 315.86], [-360378000000, 314.93], [-357699600000, 313.19]];
      function onDataReceived(results)
      {
        // Deep copy
        var resultsClone = jQuery.extend(true, {

        }, results);

        /**
        Make Bars
        */
        var keys = Object.keys(results.data);
        keys.sort();

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
        })
        var boxes = [];

        /**
        Check for Climate Data
        */

        // Climate [record low, avg min, avg max, record max, day of year,
        if (typeof (results.climate) !== "undefined") {
          Object.keys(results.climate).forEach(function(obj)
          {
            // Record Lows
            boxes.push(
            {
              data : [[obj * 1000 - 1000 * 3600 * 0, results.climate[obj][0], results.climate[obj][1]]],
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
              data : [[obj * 1000 - 1000 * 3600 * 0, results.climate[obj][1], results.climate[obj][2]]],
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
            boxes.push(
            {
              data : [[obj * 1000 - 1000 * 3600 * 0, results.climate[obj][2], results.climate[obj][3]]],
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
        }

        /**
        Plot the box and whiskers  - since flot doesn't allow coloring by value adding separate objects for each component.
        */
        var barWidth = 1000 * 3600 * results.gridLengthHours;
        keys.forEach(function(obj)
        {
          if (field == "Sky" || field == "PoP" || field == "RH")
          {
            var high = 20;
            var medium = 10;
            var low = 5;
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
            data : [[obj * 1000 - barWidth / 2, d3.quantile(results.data[obj], 0.25), d3.quantile(results.data[obj], 0.75)]],
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
            data : [[obj * 1000 - barWidth / 2, d3.quantile(results.data[obj], 0.75), d3.quantile(results.data[obj], 0.75)]],
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
            data : [[obj * 1000 - barWidth / 2, d3.quantile(results.data[obj], 0.95), d3.quantile(results.data[obj], 0.95)]],
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
            data : [[obj * 1000 - barWidth / 2, d3.quantile(results.data[obj], 0.05), d3.quantile(results.data[obj], 0.05)]],
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
            data : [[obj * 1000, d3.quantile(results.data[obj], 0.05)], [obj * 1000, d3.quantile(results.data[obj], 0.25)]],
            color : boxColor,
            lines : {
              show : true
            }
          });

          // Top Line
          boxes.push(
          {
            data : [[obj * 1000, d3.quantile(results.data[obj], 0.95)], [obj * 1000, d3.quantile(results.data[obj], 0.75)]],
            color : boxColor,
            lines : {
              show : true
            }
          });

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
        $.plot("#placeholder", boxes,
        {
          xaxis : {
            mode : "time"
          },
          zoom : {
            interactive : true
          },
          pan : {
            interactive : true
          },
          grid : {
            hoverable : true
          },

        });
      }
      $.ajax(
      {
        url : "resource/modelspectrumjson/getData.php?wfo=" + wfo + '&site=' + site + '&field=' + field + '&rand=' + Math.random(),
        type : "GET",
        dataType : "json",
        success : onDataReceived
      });
      $("<div id='tooltip'></div>").css(
      {
        position : "absolute",
        display : "none",
        //border : "1px solid #fdd",
        padding : "10px",
        //"background-color" : "#fee",
        background: "rgb(255, 254, 210)",
          border: "3px solid rgb(136, 99, 0)",
          "border-radius": "10px",
        opacity : 0.92,
        "z-index" : 9999999
      }).appendTo("body");
      $("#placeholder").bind("plothover", function(event, pos, item)
      {

        if (item)
        {
          var x = item.datapoint[0], y = item.datapoint[1].toFixed(2);
          $("#tooltip").html("Date: " +new moment(x).format("h:mm A, MMMM D, YYYY") + " <br> "+field+": " + y).css(
          {
            top : item.pageY + 15,
            left : item.pageX + 15
          }).fadeIn(200);
        } else
        {
          $("#tooltip").hide();
        }
      });
    });
  },
  members : {

  }
});
