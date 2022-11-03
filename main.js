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

d3.csv("player_average.csv").then((data) => {
		//appending points 
		let scatter = SCATTERFRAME.selectAll("circle")
				.data(data)
				.enter()
				.append("circle")
					.attr("cx", (d) => {return FG3A_SCALE(d.FG3A) + MARGINS.left;})
					.attr("cy", (d) => {return VIS_HEIGHT - FG3M_SCALE(d.FG3M) + MARGINS.top;})
					.attr("r", 2)
					.attr("class", "point");
	});


//plotting user-added points
document.getElementById("graphButton").addEventListener('click', userGenerateGraph);

function statFromAbbrev(abbrev_name) {
	switch(abbrev_name){
		case "FG3A":
			return "3-Pointers Attempted";
		case "FG3M":
			return "3-Pointers Made";
	}
}

function abbrevFromStat(stat_name) {
	switch(stat_name) {
		case "3-Pointers Attempted":
			return "FG3A";
		case "3-Pointers Made":
			return "FG3M";
	}
}

function userGenerateGraph() {
	let x = document.getElementById("x-axis").value;
	let y = document.getElementById("y-axis").value;
	generateGraph(abbrevFromStat(x), abbrevFromStat(y));
}

//using two stat abbreviations, generate a graph
function generateGraph(x, y) {
	d3.csv("player_average.csv").then((data) => {
		//preparing x data and axis:
		let x_data = Array(633);
		for (let n = 0; n < data.length; n++) {
			x_data[n] = parseFloat(data[n][x]);
		}

		let x_axis_scale = d3.scaleLinear()
							 .domain([0, (1.1 * Math.max(...x_data))])
							 .range([0, (VIS_WIDTH)])

		//preparing y data and axis:
		let y_data = Array(633);
		for (let n = 0; n < data.length; n++) {
			y_data[n] = parseFloat(data[n][y]);
		}
		console.log(y_data)
		console.log(Math.max(...y_data));
		let y_axis_scale = d3.scaleLinear()
							 .domain([0, (1.1 * Math.max(...y_data))])
							 .range([0, (VIS_WIDTH)])

		//appending points 
		let scatter = SCATTERFRAME.selectAll("circle")
				.data(data)
				.enter()
				.append("circle")
					.attr("cx", function(d) {
						return x_axis_scale(d[x]) + MARGINS.left;
					})
					.attr("cy", function(d) {
						return VIS_HEIGHT - y_axis_scale(d[y]) + MARGINS.top;})
					.attr("r", 2)
					.attr("class", "point");
	});
	
}



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
      .domain([0, d3.max(data, function(d) { return +d.FGM })])
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