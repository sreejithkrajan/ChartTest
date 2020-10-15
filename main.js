// Global functions called when select elements changed
function onXScaleChanged() {
    var select = d3.select('#xScaleSelect').node();
    // Get current value of select element, save to global chartScales
    chartScales.x = select.options[select.selectedIndex].value
    // Update chart
    updateChart();
}

function onYScaleChanged() {
    var select = d3.select('#yScaleSelect').node();
    // Get current value of select element, save to global chartScales
    chartScales.y = select.options[select.selectedIndex].value
    // Update chart
    updateChart();
}

// Load data and use this function to process each row
function dataPreprocessor(row) {
    return {
        'name': row['name'],
        'IO Pitch': +row['IO Pitch'],
        'IO_Type': row['IO_Type'],
        'Bandwidth': +row['Bandwidth'],        
        'year': +row['year'],
		'link': row['link']
    };
}


var svg = d3.select('svg');

var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([-12, 0])
    .html(function(d) {
        return "<h5>"+d['name']+"</h5><table><thead><tr><td>IO Pitch</td><td>IO Type</td><td>Bandwidth (Gbps)</td></tr></thead>"
             + "<tbody><tr><td>"+d['IO Pitch']+"</td><td>"+d['IO_Type']+"</td><td>"+d['Bandwidth']+"</td></tr></tbody>"
             + "<thead><tr><td>Year</td><td colspan='2'>Link</td></tr></thead>"
             + "<tbody><tr><td>"+d['year']+"</td><td colspan='2'>"+d['Link']+"</td></tr></tbody></table>"
    });
	
svg.call(toolTip);

// Get layout parameters
var svgWidth = +svg.attr('width');
var svgHeight = +svg.attr('height');

var padding = {t: 40, r: 40, b: 40, l: 40};

// Compute chart dimensions
var chartWidth = svgWidth - padding.l - padding.r;
var chartHeight = svgHeight - padding.t - padding.b;

// Create a group element for appending chart elements
var chartG = svg.append('g')
    .attr('transform', 'translate('+[padding.l, padding.t]+')');

// Create groups for the x- and y-axes
var xAxisG = chartG.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate('+[0, chartHeight]+')');
var yAxisG = chartG.append('g')
    .attr('class', 'y axis');

d3.csv('cars.csv', dataPreprocessor).then(function(dataset) {
    // **** Your JavaScript code goes here ****
	cars = dataset;
	
	xScale = d3.scaleLinear()
    .range([0, chartWidth]);
	
	xoScale = d3.scaleBand()
    .range([0, chartWidth]);

	yScale = d3.scaleLinear()
    .range([chartHeight, 0]);
	
	yoScale = d3.scaleBand()
    .range([chartHeight, 0]);
	
	domainMap = {};

	dataset.columns.forEach(function(column) {
		domainMap[column] = d3.extent(dataset, function(data_element){
			return data_element[column];
		});
	});
	domainMap['year']=d3.map(dataset, function(d){return(d.year)}).keys().reverse();
	domainMap['IO_Type']=d3.map(dataset, function(d){return(d.IO_Type)}).keys().reverse();
	console.log(d3.map(dataset, function(d){return(d.year)}).keys().reverse());

    // Create global object called chartScales to keep state
    chartScales = {x: 'year', y: 'IO Pitch'};
    updateChart();
});


function updateChart() {
    // **** Draw and Update your chart here ****
	//console.log(domainMap);
	

	if(chartScales.x=='IO Pitch' ||chartScales.x=='Bandwidth'){
		xScale.domain(domainMap[chartScales.x]).nice();
		xAxisG.transition()
		.duration(750)
		.call(d3.axisBottom(xScale));
	}
	else{
		xoScale.domain(domainMap[chartScales.x]);
		xAxisG.transition()
		.duration(750)
		.call(d3.axisBottom(xoScale));
	}
	
	if(chartScales.y=='IO Pitch' || chartScales.y=='Bandwidth'){	
		yScale.domain(domainMap[chartScales.y]).nice();	
		yAxisG.transition()
		.duration(750)
		.call(d3.axisLeft(yScale));
	}
	else{
		yoScale.domain(domainMap[chartScales.y]);	
		yAxisG.transition()
		.duration(750)
		.call(d3.axisLeft(yoScale));
	}
	
	
	
	
	var dots = chartG.selectAll('.dot')
    .data(cars);
	
	var dotsEnter = dots.enter()
    .append('g')
    .attr('class', 'dot');
	
	dotsEnter.append('circle')
		.attr('r', 3)
		.on('mouseover', toolTip.show)
		.on('mouseout', toolTip.hide);	
	
    	
	dotsEnter = dots.merge(dotsEnter)
	.transition()
	.duration(750)
    .attr('transform', function(d) {
		if(chartScales.x=='IO Pitch' ||chartScales.x=='Bandwidth'){
			var tx = xScale(d[chartScales.x]);
		}
		else{var tx = xoScale(d[chartScales.x]);}			
        if(chartScales.y=='IO Pitch' ||chartScales.y=='Bandwidth'){
			var ty = yScale(d[chartScales.y]);
		}
		else{var ty = yoScale(d[chartScales.y]);}        
        return 'translate('+[tx, ty]+')';
    });	
    
}
// Remember code outside of the data callback function will run before the data loads