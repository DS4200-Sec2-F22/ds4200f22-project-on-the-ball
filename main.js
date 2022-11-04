const FRAME_HEIGHT = 500;
const FRAME_WIDTH = 600;
const MARGINS = {left:50, right:50, top:25, bottom:25}

const VIS_HEIGHT = FRAME_HEIGHT - MARGINS.top - MARGINS.bottom;
const VIS_WIDTH = FRAME_WIDTH - MARGINS.left - MARGINS.right;

//
// SCATTERPLOT
//

//x-scale for bar chart
const FG3A_SCALE = d3.scaleLinear()
  .domain([0, 800])
  .range([0, (VIS_WIDTH)])

//y-scale for bar chart
const FG3M_SCALE = d3.scaleLinear()
		.domain([0, 300])
	    .range([0, VIS_HEIGHT]);


//frame being used for sepal length vs. petal length scatterplot
const SCATTERFRAME = d3.select("#scattervis")
				.append("svg")
					.attr("height", FRAME_HEIGHT)
					.attr("width", FRAME_WIDTH)
					.attr("class", "frame");


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
			return "Offensive Rebounds";
		case "DREB":
			return "Defensive Rebounds";
		case "REB":
			return "Rebounds";
		case "AST":
			return "Assists";
		case "STL":
			return "Steals";
		case "BLK":
			return "Blocks";
		case "TO":
			return "Turnovers";
		case "PF":
			return "Fouls";
		case "PTS":
			return "Points";
		case "PLUS_MINUS":
			return "Plus-Minus";

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

		//preparing x data and axis:
		let x_data = Array(488);
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
							 .range([(VIS_HEIGHT), 0])

		SCATTERFRAME.selectAll("circle").remove();
		SCATTERFRAME.selectAll("g").remove();
		SCATTERFRAME.selectAll("text").remove();
		SCATTERFRAME.selectAll(".tooltip").remove();

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
						.text(statFromAbbrev(x) + " vs. " + statFromAbbrev(y));

		//adding x-axis to scatterplot
		SCATTERFRAME.append("g")
		    .attr("transform", 
		          "translate(" + MARGINS.left + "," + (VIS_HEIGHT + MARGINS.top) + ")")
		    .call(d3.axisBottom(x_axis_scale).ticks(7))
		        .attr("font-size", "12px");

		//adding x-axis title to scatterplot
		SCATTERFRAME.append("text")
						.attr("x", FRAME_WIDTH / 2)
						.attr("y", FRAME_HEIGHT)
						.attr("font-size", "10px")
						.attr("text-anchor", "middle")
						.text(statFromAbbrev(x));


		//adding y-axis to scatterplot
		SCATTERFRAME.append("g")
			.attr("transform",
					"translate(" + MARGINS.left + "," + MARGINS.bottom + ")")
			.call(d3.axisLeft(y_axis_scale).ticks(5))
		        .attr("font-size", "10px");

		//adding y-axis title to scatterplot
		SCATTERFRAME.append("text")
						.attr("x", MARGINS.left)
						.attr("y", FRAME_HEIGHT / 2)
						.attr("font-size", "10px")
						.attr("text-anchor", "middle")
						.attr('transform', 'rotate(-90)')
						.text(statFromAbbrev(y));

		//adding tooltip
	 	const TOOLTIP = d3.select("#scattervis")
	 						.append("div")
	 							.attr("class", "tooltip")
	 							.style("opacity", 0);

		//tooltip behavior when mousing over a point
	 	function mouseover(event, d) {
	 		TOOLTIP.style("opacity", 1);
	 	}

	 	//tooltip behavior when moving mouse while on a point
	 	function mousemove(event, d) {
	 		TOOLTIP.html("Player Name: " + d.PLAYER_NAME 
							+ "<br>Team: " + d.TEAM_ABBREVIATION
							+ "<br>Position: " + d.START_POSITION
							+ "<br>" + statFromAbbrev(x) + ": " + d[x]
							+ "<br>" + statFromAbbrev(y) + ": " + d[y])
	 			.style("left", (event.pageX + 5) + "px")
	 			.style("top", (event.pageY - 50) + "px");
	 	}

	 	//tooltip behavior when moving mouse off of bar
	 	function mouseleave(event, d) {
	 		TOOLTIP.style("opacity", 0)
	 				.style("left", 0 + "px")
	 				.style("top", 0 + "px");
 		}

 		SCATTERFRAME.selectAll("circle")
 			.on("mouseover", mouseover)
 			.on("mousemove", mousemove)
 			.on("mouseleave", mouseleave);

/*


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
// HISTOGRAM
//

var margin = {top: 10, right: 30, bottom: 30, left: 40},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

var svg = d3.select("#histogram_x")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

d3.csv("player_average.csv", function(data) {

  // X axis: scale and draw:
  var x = d3.scaleLinear()
      .domain([0, d3.max(data, function(d) { return d.FGM; })])
      .range([0, width]);
  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

  // set the parameters for the histogram
  var histogram = d3.histogram()
      .value(function(d) { return d.FGM; })   // I need to give the vector of value
      .domain(x.domain())  // then the domain of the graphic
      .thresholds(x.ticks(70)); // then the numbers of bins

  // And apply this function to data to get the bins
  var bins = histogram(data);

  // Y axis: scale and draw:
  var y = d3.scaleLinear()
      .range([height, 0]);
      y.domain([0, d3.max(bins, function(d) { return d.length; })]);   // d3.hist has to be called before the Y axis obviously
  svg.append("g")
      .call(d3.axisLeft(y));

  // append the bar rectangles to the svg element
  svg.selectAll("rect")
      .data(bins)
      .enter()
      .append("rect")
        .attr("x", 1)
        .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
        .attr("width", function(d) { return x(d.x1) - x(d.x0) -1 ; })
        .attr("height", function(d) { return height - y(d.length); })
        .style("fill", "#69b3a2")
});