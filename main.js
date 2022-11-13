const FRAME_HEIGHT = 450;
const FRAME_WIDTH = 550;
const MARGINS = {left:70, right:70, top:50, bottom:50}

const VIS_HEIGHT = FRAME_HEIGHT - MARGINS.top - MARGINS.bottom;
const VIS_WIDTH = FRAME_WIDTH - MARGINS.left - MARGINS.right;

const BAR_HEIGHT = VIS_HEIGHT / 2;

const BAR_WIDTH = VIS_WIDTH / 2;


const HISTOGRAM_BIN_COUNT = 20;

const DATASET_SIZE = 488;
//
// SCATTERPLOT
//

//frame being used for scatterplot
const SCATTERFRAME = d3.select("#scattervis")
				.append("svg")
					.attr("height", FRAME_HEIGHT)
					.attr("width", FRAME_WIDTH)
					.attr("class", "frame");

//frame being used for Xhistogram
const XHISTOGRAM = d3.select("#Xhistogram")
        .append("svg")
          .attr("height", FRAME_HEIGHT / 1.5)
          .attr("width", FRAME_WIDTH)
          .attr("class", "frame")
        .append("g")
          .attr("transform",
            "translate(" + MARGINS.left + "," + 0 + ")");

//frame being used for Xhistogram
const YHISTOGRAM = d3.select("#Yhistogram")
        .append("svg")
          .attr("height", FRAME_HEIGHT)
          .attr("width", FRAME_WIDTH / 2)
          .attr("class", "frame")
        .append("g")
          .attr("transform",
            "translate(" + 0 + "," + MARGINS.top + ")");

//plotting user-added points
document.getElementById("graphButton").addEventListener('click', userGenerateGraph);

function statFromAbbrev(abbrev_name) {
	switch(abbrev_name){
		case "FG3A":
			return "3-Pointers Attempted";
		case "FG3M":
			return "3-Pointers Made";
		case "FG3_PCT":
			return "3-Point Percentage";
		case "FGA":
			return "Field Goals Attempted";
		case "FGM":
			return "Field Goals Made";
		case "FG_PCT":
			return "Field Goal Percentage";
		case "GP":
			return "Games Played";
		case "FTM":
			return "Free Throws Made";
		case "FTA":
			return "Free Throws Attempted";
		case "FT_PCT":
			return "Free Throw Percentage";
		case "EFG":
			return "Effective Field Goal Percentage";
		case "OREB":
			return "Offensive Rebounds per Game";
		case "DREB":
			return "Defensive Rebounds per Game";
		case "REB":
			return "Rebounds per Game";
		case "AST":
			return "Assists per Game";
		case "STL":
			return "Steals per Game";
		case "BLK":
			return "Blocks per Game";
		case "TO":
			return "Turnovers per Game";
		case "PF":
			return "Fouls per Game";
		case "PTS":
			return "Points per Game";
		case "PLUS_MINUS":
			return "Total Plus-Minus";

	}
}

//calculating a player's percentile in a given stat compared to all other players
function playerPercentile(player, attribute, data) {
	let playerGreaterThan = 0;
	for (n in data) {
		if (Math.round(player[attribute] * 1000) > Math.round(data[n][attribute] * 1000)) {
			playerGreaterThan++;
		}
	}
	percentBetterThan = (playerGreaterThan / DATASET_SIZE);
	percentileInt = Math.floor(percentBetterThan * 100)
	if (percentileInt == 11 || percentileInt == 12 || percentileInt == 13) {
		return percentileInt + "th";
	} else if (percentileInt % 10 == 1) {
		return percentileInt + "st";
	} else if (percentileInt % 10 == 2) {
		return percentileInt + "nd";
	} else if (percentileInt % 10 == 3) {
		return percentileInt + "th";
	} else {
		return percentileInt + "th";
	}
}

function userGenerateGraph() {
	let x = document.getElementById("x-axis").value;
	let y = document.getElementById("y-axis").value;
	generateGraph(x, y);
}

//using two stat abbreviations, generate a graph
function generateGraph(x, y) {
	d3.csv("player_average.csv").then((data) => {
		console.log(data);

		//preparing x data and axis:
		let x_data = Array(DATASET_SIZE);
		for (let n = 0; n < data.length; n++) {
				if (isNaN(parseFloat(data[n][x]))) {
					x_data[n] = 0.0;
				} else {
					x_data[n] = parseFloat(data[n][x]);
				}
			}

		let x_axis_scale = d3.scaleLinear()
							 .domain([0, (1.05 * Math.max(...x_data))])
							 .range([0, (VIS_WIDTH)]);

		//preparing y data and axis:
		let y_data = Array(488);
		for (let n = 0; n < data.length; n++) {
			if (isNaN(parseFloat(data[n][y]))) {
					y_data[n] = 0.0;
				} else {
					y_data[n] = parseFloat(data[n][y]);
				}
		}
		let y_axis_scale = d3.scaleLinear()
							 .domain([0, (1.05 * Math.max(...y_data))])
							 .range([(VIS_HEIGHT), 0]);


		SCATTERFRAME.selectAll("circle").remove();
		SCATTERFRAME.selectAll("g").remove();
		SCATTERFRAME.selectAll("text").remove();
		SCATTERFRAME.selectAll(".tooltip").remove();


    XHISTOGRAM.selectAll("rect").remove();
    XHISTOGRAM.selectAll("g").remove();
    XHISTOGRAM.selectAll("text").remove();

    YHISTOGRAM.selectAll("rect").remove();
    YHISTOGRAM.selectAll("g").remove();
    YHISTOGRAM.selectAll("text").remove();

		//appending points 
		let scatter = SCATTERFRAME.selectAll("circle")
				.data(data)
				.enter()
				.append("circle")
					.attr("cx", function(d) {
						return x_axis_scale(d[x]) + MARGINS.left;
					})
					.attr("cy", function(d) {
						return y_axis_scale(d[y]) + MARGINS.bottom;})
					.attr("r", 4)
					.attr("class", "point");
						//(d) => {return d.TEAM_ABBREVIATION});

		//adding title to scatterplot
		SCATTERFRAME.append("text")
						.attr("x", FRAME_WIDTH / 2)
						.attr("y", MARGINS.top)
						.attr("text-anchor", "middle")
						.style("font-weight", "bold")
						.text(statFromAbbrev(x) + " vs. " + statFromAbbrev(y));

		//adding x-axis to scatterplot
		let xAxis = SCATTERFRAME.append("g")
		    .attr("transform", 
		          "translate(" + MARGINS.left + "," + (VIS_HEIGHT + MARGINS.top) + ")")
		    .call(d3.axisBottom(x_axis_scale).ticks(7))
		        .attr("font-size", "12px");

		//adding x-axis title to scatterplot
		SCATTERFRAME.append("text")
						.attr("x", FRAME_WIDTH / 2)
						.attr("y", FRAME_HEIGHT - 5)
						.attr("font-size", "15px")
						.attr("text-anchor", "middle")
						.text(statFromAbbrev(x));

		//adding y-axis to scatterplot
		let yAxis = SCATTERFRAME.append("g")
			.attr("transform",
					"translate(" + MARGINS.left + "," + MARGINS.bottom + ")")
			.call(d3.axisLeft(y_axis_scale).ticks(5))
		        .attr("font-size", "10px");

		//adding y-axis title to scatterplot
		SCATTERFRAME.append("g")
						.attr("transform",
							"translate(" + (MARGINS.left / 2) + "," + (FRAME_HEIGHT / 2) + ")")
						.append("text")
							.attr("font-size", "15px")
							.attr("text-anchor", "middle")
							.attr('transform', 'rotate(-90)')
							.text(statFromAbbrev(y));

		//adding tooltip
	 	const TOOLTIP = d3.select("#scattervis")
	 						.append("div")
	 							.attr("class", "tooltip")
	 							.style("opacity", 0);

 		SCATTERFRAME.selectAll("circle")
 			.on("mouseover", mouseover)
 			.on("mousemove", mousemove)
 			.on("mouseleave", mouseleave);

//X-AXIS HISTOGRAM ENCODING

    XHISTOGRAM.append("g")
        .attr("transform", "translate(0," + MARGINS.top + ")")
        .call(d3.axisTop(x_axis_scale));

    // set the parameters for the Xhistogram
    let Xhistogram = d3.histogram()
        .value(function(d) { return d[x]; })   // I need to give the vector of value
        .domain(x_axis_scale.domain())  // then the domain of the graphic
        .thresholds(x_axis_scale.ticks(HISTOGRAM_BIN_COUNT)); // then the numbers of bins

    // And apply this function to data to get the bins
    let bins = Xhistogram(data);

    let maxBinSize = 0;

    for (n = 0; n < bins.length; n++) {
    	binSize = (bins[n].length);
    	if (binSize > maxBinSize) {
    		maxBinSize = binSize;
    	}
    }

    let y_axis_scale_histogram = d3.scaleLinear()
							 .domain([0, (maxBinSize * 1.05)])
							 .range([0, (BAR_HEIGHT)]);

    // Y axis: scale and draw:
    XHISTOGRAM.append("g")
    	.attr("transform", "translate(0," + MARGINS.top + ")")
        .call(d3.axisLeft(y_axis_scale_histogram));

    // append the bar rectangles to the svg element
    XHISTOGRAM.selectAll("rect")
        .data(bins)
        .enter()
        .append("rect")
          .attr("x", 1)
          .attr("y", 1)
          .attr("transform", function(d) { return "translate(" + x_axis_scale(d.x0) + "," + MARGINS.top + ")"; })
          .attr("width", function(d) { return x_axis_scale(d.x1) - x_axis_scale(d.x0) - 1; })
          .attr("height", function(d) { return y_axis_scale_histogram(d.length) ;})
          .attr("x0", (d) => {return parseFloat(d.x0);})
          .attr("x1", (d) => {return parseFloat(d.x1);})
          .attr("items", (d) => {return d.length;})
          .attr("class", "bar");


	 //IN PROGRESS: Y-AXIS HISTOGRAM ENCODING

	YHISTOGRAM.append("g")
        .attr("transform", "translate(" + (VIS_WIDTH / 2) + "," + 0 + ")")
        .call(d3.axisRight(y_axis_scale));

    // set the parameters for the Xhistogram
    let Yhistogram = d3.histogram()
        .value(function(d) { return d[y]; })   // I need to give the vector of value
        .domain(y_axis_scale.domain())  // then the domain of the graphic
        .thresholds(y_axis_scale.ticks(HISTOGRAM_BIN_COUNT)); // then the numbers of bins

    // And apply this function to data to get the bins
    let Ybins = Yhistogram(data);

    let maxYBinSize = 0;

    for (n = 0; n < Ybins.length; n++) {
    	binSize = (Ybins[n].length);
    	if (binSize > maxYBinSize) {
    		maxYBinSize = binSize;
    	}
    }

    let x_axis_scale_histogram = d3.scaleLinear()
							 .domain([0, (maxYBinSize * 1.05)])
							 .range([(BAR_WIDTH), 0]);

	let y_histogram_bar_width = d3.scaleLinear()
							 .domain([0, (maxYBinSize * 1.05)])
							 .range([0, BAR_WIDTH]);

    // X axis: scale and draw:
    YHISTOGRAM.append("g")
    	.attr("transform", "translate(0," + VIS_HEIGHT + ")")
        .call(d3.axisBottom(x_axis_scale_histogram));



   // append the bar rectangles to the svg element
   YHISTOGRAM.selectAll("rect")
       .data(Ybins)
       .enter()
       .append("rect")
         .attr("x", 1)
         .attr("y", 1)
         .attr("transform", function(d) { return "translate(" + x_axis_scale_histogram(d.length) +"," +  y_axis_scale(d.x1) + ")"; })
         .attr("width", function(d) { return y_histogram_bar_width(d.length) - 1;})
         .attr("height", function(d) { return y_axis_scale(d.x0) - y_axis_scale(d.x1) - 1;})
         .attr("x0", (d) => {return parseFloat(d.x0);})
         .attr("x1", (d) => {return parseFloat(d.x1);})
         .attr("items", (d) => {return d.length;})
         .attr("class", "bar");


          //IN PROGRESS COMPLETE


    //behavior when mousing over a point
	 function mouseover(event, d) {
	 	let selectedXBarSize = null;
	 	let selectedYBarSize = null;
	 	TOOLTIP.style("opacity", 1);
	 	xVal = d[x];
	 	yVal = d[y];
	 	XHISTOGRAM.selectAll("rect")
	 				.each((data, i, bars) => {
	 					bar = bars[i];
	 					if (xVal >= parseFloat(bar.getAttribute("x0")) && xVal < parseFloat(bar.getAttribute("x1"))) {
	 						d3.select(bar).attr("class", "highlightedBar");
	 						selectedXBarSize = bar.getAttribute("items");
	 					}
		 		 	})
		YHISTOGRAM.selectAll("rect")
	 				.each((data, i, bars) => {
	 					bar = bars[i];
	 					if (yVal >= parseFloat(bar.getAttribute("x0")) && yVal < parseFloat(bar.getAttribute("x1"))) {
	 						d3.select(bar).attr("class", "highlightedBar");
	 						selectedYBarSize = bar.getAttribute("items");
	 					}
		 		 	})
		TOOLTIP.html("<b>" + d.PLAYER_NAME
						+ "<br>" + d.TEAM_ABBREVIATION + "</b>"
						+ "<br>Position: " + d.START_POSITION
						+ "<br><br>" + statFromAbbrev(x) + ": " + xVal
						+ "<br><ul><li>" + "Similar to: " + (selectedXBarSize - 1) + " other player(s)</li>" 
						+ "<li>" + playerPercentile(d, x, data) + " percentile</li>"
						+ "</ul>" + statFromAbbrev(y) + ": " + yVal 
						+ "<br><ul><li>" + "Similar to: " + (selectedYBarSize - 1) + " other player(s)</li>" 
						+ "<li>" + playerPercentile(d, y, data) + " percentile</li>")
	 }

 	//behavior when moving mouse while on a point
 	function mousemove(event, d) {
 		TOOLTIP.style("left", (event.pageX + 5) + "px")
 			.style("top", (event.pageY - 50) + "px");
 	}


 	//behavior when moving mouse off of bar
 	function mouseleave(event, d) {
 		TOOLTIP.style("opacity", 0)
 				.style("left", 0 + "px")
 				.style("top", 0 + "px");
		d3.selectAll(".highlightedBar").attr("class", "bar");
	}

	// Add a clipPath: everything out of this area won't be drawn.
	  let clip = SCATTERFRAME.append("clipPath")
	      .attr("id", "clip")
	      .append("rect")
	      .attr("width", VIS_WIDTH + 5)
	      .attr("height", VIS_HEIGHT + 5)
	      .attr("transform", "translate(" + (MARGINS.left) + "," + (MARGINS.top) + ")");


	      //add brushing
	      	xbrush = (d3.brushX()                 
	      	      .extent([[0, MARGINS.top / 1.5], [VIS_WIDTH, VIS_HEIGHT / 1.5]])
	      	      .on("end", updateChart)
	      	      );

	      	xBrushFrame = XHISTOGRAM.append("g")
							  	.attr("class", "brushX")
					  			.call(xbrush);


	      	ybrush = (d3.brushY()                 
	      	      .extent([[MARGINS.left / 2, 0], [VIS_WIDTH / 2, VIS_HEIGHT]])
	      	      .on("end", updateChart)
	      	      );

	      	yBrushFrame = YHISTOGRAM.append("g")
							  	.attr("class", "brushY")
					  			.call(ybrush);

	// Function that is triggered when brushing is performed
	function updateChart() {
			//x-brush handling
			x_axis_scale.domain([0, (1.05 * Math.max(...x_data))]);
			x_extent = d3.brushSelection(xBrushFrame.node());
			// If selection exists, update X axis domain
			    if (x_extent) {
			    	zoomMin = (x_extent[0]);
			    	zoomMax = (x_extent[1]);
			    	x_axis_scale.domain([x_axis_scale.invert(zoomMin), x_axis_scale.invert(zoomMax)]);
			    }

			    // Update axis and circle position
			    xAxis.transition().duration(1000).call(d3.axisBottom(x_axis_scale).ticks(6));
			    d3.selectAll("circle")
				    .transition().duration(1000)
				    .attr("cx", function(d) {
				    	return x_axis_scale(d[x]) + MARGINS.left;
				    })
				    .attr("cy", function(d) {
				    	return y_axis_scale(d[y]) + MARGINS.bottom;})
				    .attr("clip-path", "url(#clip)") // clip the points

			//y-brush handling
			y_axis_scale.domain([0, (1.05 * Math.max(...y_data))]);
			y_extent = d3.brushSelection(yBrushFrame.node());
			// If selection exists, update X axis domain
			    if (y_extent) {
			    	zoomMin = (y_extent[1]);
			    	zoomMax = (y_extent[0]);
			    	y_axis_scale.domain([y_axis_scale.invert(zoomMin), y_axis_scale.invert(zoomMax)]);
			    }

			    // Update axis and circle position
			    yAxis.transition().duration(1000).call(d3.axisLeft(y_axis_scale).ticks(6));
			    d3.selectAll("circle")
				    .transition().duration(1000)
				    .attr("cx", function(d) {
				    	return x_axis_scale(d[x]) + MARGINS.left;
				    })
				    .attr("cy", function(d) {
				    	return y_axis_scale(d[y]) + MARGINS.bottom;})
				    .attr("clip-path", "url(#clip)") // clip the points

		}
/*

// Add a clipPath: everything out of this area won't be drawn.
  var clip = Svg.append("defs").append("svg:clipPath")
      .attr("id", "clip")
      .append("svg:rect")
      .attr("width", width )
      .attr("height", height )
      .attr("x", 0)
      .attr("y", 0);


		//add brushing
		SCATTERFRAME.call(d3.brush()                 
		      .extent([[0,0], [FRAME_WIDTH, FRAME_HEIGHT]])
		      .on("start brush", updateChart)
		      );

		// Function that is triggered when brushing is performed
		function updateChart() {
			extent = d3.brushSelection(this);
			scatter.classed("selected", function(d) {
				return isBrushed(extent, x_axis_scale(d[x]) + MARGINS.left, y_axis_scale(d[y]) + MARGINS.top);
			});
		}

		 // A function that return TRUE or FALSE according if a dot is in the selection or not
		function isBrushed(brush_coords, cx, cy) {
		     var x0 = brush_coords[0][0],
		         x1 = brush_coords[1][0],
		         y0 = brush_coords[0][1],
		         y1 = brush_coords[1][1];
		    return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;    // This return TRUE or FALSE depending on if the points is in the selected area
		}
	*/
	});	
}

generateGraph('FG3A', 'FG3M')


//
// XHISTOGRAM
//

// var margin = {top: 10, right: 30, bottom: 30, left: 40},
//     width = 460 - margin.left - margin.right,
//     height = 400 - margin.top - margin.bottom;

// var svg = d3.select("#histogram_x")
//   .append("svg")
//     .attr("width", width + margin.left + margin.right)
//     .attr("height", height + margin.top + margin.bottom)
//   .append("g")
//     .attr("transform",
//           "translate(" + margin.left + "," + margin.top + ")");

// d3.csv("player_average.csv", function(data) {

//   // X axis: scale and draw:
//   var x = d3.scaleLinear()
//       .domain([0, d3.max(data, function(d) { return d.FGM; })])
//       .range([0, width]);
//   svg.append("g")
//       .attr("transform", "translate(0," + height + ")")
//       .call(d3.axisBottom(x));

//   // set the parameters for the Xhistogram
//   var Xhistogram = d3.Xhistogram()
//       .value(function(d) { return d.FGM; })   // I need to give the vector of value
//       .domain(x.domain())  // then the domain of the graphic
//       .thresholds(x.ticks(70)); // then the numbers of bins

//   // And apply this function to data to get the bins
//   var bins = Xhistogram(data);

//   // Y axis: scale and draw:
//   var y = d3.scaleLinear()
//       .range([height, 0]);
//       y.domain([0, d3.max(bins, function(d) { return d.length; })]);   // d3.hist has to be called before the Y axis obviously
//   svg.append("g")
//       .call(d3.axisLeft(y));

//   // append the bar rectangles to the svg element
//   svg.selectAll("rect")
//       .data(bins)
//       .enter()
//       .append("rect")
//         .attr("x", 1)
//         .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
//         .attr("width", function(d) { return x(d.x1) - x(d.x0) -1 ; })
//         .attr("height", function(d) { return height - y(d.length); })
//         .style("fill", "#69b3a2")


// });

