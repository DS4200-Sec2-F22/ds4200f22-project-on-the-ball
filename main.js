const FRAME_HEIGHT = 400;
const FRAME_WIDTH = 500;
const MARGINS = {left:70, right:80, top:50, bottom:50}

const VIS_HEIGHT = FRAME_HEIGHT - MARGINS.top - MARGINS.bottom;
const VIS_WIDTH = FRAME_WIDTH - MARGINS.left - MARGINS.right;

const BAR_HEIGHT = VIS_HEIGHT / 2;

const BAR_WIDTH = VIS_WIDTH / 2;

const COLORSCHEME = ["rgb(65,187,197)", "rgb(39,76,86)", "rgb(96,223,130)"]


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

//frame being used for scatterplot
const PLAYERFRAME = d3.select("#playerframe");

//plotting user-added points
document.getElementById("graphButton").addEventListener('click', userGenerateGraph);

//dictionary for stat abbreviations and their elongated versions
let statAbbrevs = {
	"FG3A": "3-Pointers Attempted",
	"FG3M": "3-Pointers Made",
	"FG3_PCT": "3-Point Percentage",
	"FGA": "Field Goals Attempted",
	"FGM": "Field Goals Made",
	"FG_PCT": "Field Goal Percentage",
	"GP": "Games Played",
	"FTM": "Free Throws Made",
	"FTA": "Free Throws Attempted",
	"FT_PCT": "Free Throw Percentage",
	"EFG": "Effective Field Goal Percentage",
	"OREB": "Offensive Rebounds per Game",
	"DREB": "Defensive Rebounds per Game",
	"REB": "Rebounds per Game",
	"AST": "Assists per Game",
	"STL": "Steals per Game",
	"BLK": "Blocks per Game",
	"TO": "Turnovers per Game",
	"PF": "Fouls per Game",
	"PTS": "Points per Game",
	"PLUS_MINUS": "Total Plus-Minus"
}

//dictionary for position names
let positionNames = {
	"C": "Center",
	"F": "Forward",
	"G": "Guard",
	"": "position not found"
}

//dictionary for team abbreviations and names
let teamAbbrevs = {
	"ATL": 	"Atlanta Hawks",
	'BKN': 	"Brooklyn Nets",
	'BOS': 	'Boston Celtics',
	'CHA': 	"Charlotte Hornets",
	'CHI': 	"Chicago Bulls",
	'CLE': 	"Cleveland Cavaliers",
	'DAL': 	"Dallas Mavericks",
	'DEN': 	"Denver Nuggets",
	'DET': 	"Detroit Pistons",
	'GSW': 	"Golden State Warriors",
	'HOU': 	"Houston Rockets",
	'IND': 	"Indiana Pacers",
	'LAC': 	"Los Angeles Clippers",
	'LAL': 	"Los Angeles Lakers",
	'MEM':	"Memphis Grizzlies",
	'MIA': 	"Miami Heat",
	'MIL': 	"Milwaukee Bucks",
	'MIN': 	"Minnesota Timberwolves",
	'NOP': 	"New Orleans Pelicans",
	'NYK': 	"New York Knicks",
	'OKC': 	"Oklahoma City Thunder",
	'ORL': 	"Orlando Magic",
	'PHI': 	"Philadelphia 76ers",
	'PHX': 	"Phoenix Suns",
	'POR': 	"Portland Trail Blazers",
	'SAC': 	"Sacramento Kings",
	'SAS': 	"San Antonio Spurs",
	'TOR': 	"Toronto Raptors",
	'UTA': 	"Utah Jazz",
	'WAS': 	"Washington Wizards",
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

		let positionColors = d3.select("#showColors").property("checked");

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
		SCATTERFRAME.selectAll("#legendBox").remove();
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
					.attr("class", "point")
					.style("fill", function(d) {
						if (positionColors) {
											return positionColor(d.START_POSITION);
										} else {
											return "darkgreen";		
										}
									});
						//(d) => {return d.TEAM_ABBREVIATION});

		function positionColor(position) {
			switch (position) {
			case "C":
				return COLORSCHEME[0];
			case "F":
				return COLORSCHEME[1];
			case "G":
				return COLORSCHEME[2];
			default:
				return "rgb(175, 200, 200)";	
			}
		}

		//adding title to scatterplot
		SCATTERFRAME.append("text")
						.attr("x", FRAME_WIDTH / 2)
						.attr("y", MARGINS.top)
						.attr("text-anchor", "middle")
						.style("font-weight", "bold")
						.text(statAbbrevs[x] + " vs. " + statAbbrevs[y]);

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
						.text(statAbbrevs[x]);

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
							.text(statAbbrevs[y]);

		//appending a legend that shows what each point's color means
		if (positionColors) {
			let colorScale = d3.scaleOrdinal()
			    .domain(["Center", "Forward", "Guard", "N/A"])
			    .range([COLORSCHEME[0], COLORSCHEME[1], COLORSCHEME[2], "rgb(175, 200, 200)"]);

			let legend = d3.legendColor()
			    .scale(colorScale);


			let legendTest = SCATTERFRAME.append("g").attr("class", "legend").attr("id", "legendTest").attr("transform", "translate(100000, 1000000)").call(legend);



			let colorBox = document.getElementById("legendTest").getBoundingClientRect(); // get the bounding rectangle

			let legendBase = SCATTERFRAME.append("g")
											.attr("transform", "translate(" + ( (VIS_WIDTH + MARGINS.right / 2) - 2) + "," + (MARGINS.top * 1.5 - 2) + ")")
											.attr("id", "legendBase")

			legendBase.append("rect")
							.attr("id", "legendBox")
							.attr("width", colorBox.width + 4)
							.attr("height", colorBox.height + 4)
							.style("fill", "white")
							.style("stroke", "black")
							.style("stroke-width", "1px")
							.style("border-radius", "2px")
			
			SCATTERFRAME.select("#legendTest").remove();

			legendBase.append("g")
						.attr("transform", "translate(2, 2)")
						.attr("class", "legend")
						.attr("id", "colorLegend")
				        .call(legend)

		} 

		//adding tooltip
	 	const TOOLTIP = d3.select("#scattervis")
	 						.append("div")
	 							.attr("class", "tooltip")
	 							.style("opacity", 0);


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


	 //Y-AXIS HISTOGRAM ENCODING

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

    // Y axis: scale and draw:
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

    // MOUSE EVENT HANDLING
    scatterMouseHandler();

    //HANDLER FOR BRUSHING
    brushHandler();


//contains handling for mousing over and clicking points on the scatterframe, as well as moving the legend
function scatterMouseHandler() {
	   SCATTERFRAME.selectAll("circle")
    	.on("mouseover", mouseover)
    	.on("click", click)
    	.on("mousemove", mousemove)
    	.on("mouseleave", mouseleave);

    	let numRegex =  /\d+/g;

    	let offsetX, offsetY;

    	let dragHandler = d3.drag()
    	.on("start", function() {
    				//current position of box
    				translation = this.getAttribute("transform").match(numRegex);
    				translationX = parseFloat(translation[0]);
    				translationY = parseFloat(translation[1]);
    				//current position of pointer in relation to whole page
    				xAbsolute = event.pageX
    				yAbsolute = event.pageY
    				offsetX = Math.round(xAbsolute - translationX);
		    		offsetY = Math.round(yAbsolute - translationY);
		    		console.log(offsetX);
		    		console.log(offsetY);
    		    	})
    	.on("drag", function () {
		    		mouse = d3.pointer(event);
				    SCATTERFRAME.select("#legendBase")
				        .attr("transform", ("translate(" + (mouse[0] - offsetX) + "," + (mouse[1] - offsetY) + ")"));
					})
				    	
		dragHandler(SCATTERFRAME.select("#legendBase"));


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
						+ "<br><br>" + statAbbrevs[x] + ": " + xVal
						+ "<br><ul><li>" + "Similar to: " + (selectedXBarSize - 1) + " other player(s)</li>" 
						+ "<li>" + playerPercentile(d, x, data) + " percentile</li>"
						+ "</ul>" + statAbbrevs[y] + ": " + yVal 
						+ "<br><ul><li>" + "Similar to: " + (selectedYBarSize - 1) + " other player(s)</li>" 
						+ "<li>" + playerPercentile(d, y, data) + " percentile</li>")
	 }

 	//behavior when moving mouse while on a point
 	function mousemove(event, d) {
 		TOOLTIP.style("left", (event.pageX + 5) + "px")
 			.style("top", (event.pageY - 50) + "px");
 	}

 	function click(event, d) {
 		PLAYERFRAME.selectAll("*").remove;
 		PLAYERFRAME.html("<h3 id=\"playertitle\">Player Profile: " + d.PLAYER_NAME 
 						+ "</h3> <b>" +  getTeam(d.TEAM_ABBREVIATION) + "</b>"
						+ "<br>" + positionNames[d.START_POSITION]
						+ "<br><br>Points per Game: " + d.PTS
						+ "<br>Assists per Game: " + d.AST
						+ "<br>Rebounds per Game: " + d.REB
						+ "<br>Steals per Game: " + d.STL
						+ "<br>Blocks per Game: " + d.BLK
						+ "<br>Turnovers per Game: " + d.TO
						+ "<br>Fouls per Game: " + d.PF
						+ "<br><br>Field Goal Percentage: " + toPct(d.FG_PCT)
						+ "<br>3-Point Percentage: " + toPct(d.FG3_PCT)
						+ "<br>Free Throw Percentage: " + toPct(d.FT_PCT)
						+ "<br>Effective Field Goal Percentage: " + toPct(d.EFG)

		);
 	}

 	function getTeam(teamAbbrev) {
 		if (teamAbbrev.includes('/')) {
 			return teamAbbrevs[teamAbbrev.substring(0, 3)] + "/" + getTeam(teamAbbrev.substring(4))
 		} else {
 			return teamAbbrevs[teamAbbrev]
 		}
 	}

 	function toPct(dbl) {
 		return Math.round(dbl * 10000) / 100 + "%"
 	}


 	//behavior when moving mouse off of bar
 	function mouseleave(event, d) {
 		TOOLTIP.style("opacity", 0)
 				.style("left", 0 + "px")
 				.style("top", 0 + "px");
		d3.selectAll(".highlightedBar").attr("class", "bar");
	}
}

function brushHandler() {
	// Add a clipPath: everything out of this area won't be drawn.
	  let clip = SCATTERFRAME.append("clipPath")
	      .attr("id", "clip")
	      .append("rect")
	      .attr("width", VIS_WIDTH + 5)
	      .attr("height", VIS_HEIGHT + 2)
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


}

});	
}

generateGraph('FG3A', 'FG3M')

