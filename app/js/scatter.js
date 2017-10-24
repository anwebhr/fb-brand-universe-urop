var margin = { top: 50, right: 300, bottom: 50, left: 50 },
    outerWidth = 1050,
    outerHeight = 500,
    width = outerWidth - margin.left - margin.right,
    height = outerHeight - margin.top - margin.bottom;

var x = d3.scale.linear()
    .range([0, width]).nice();

var y = d3.scale.linear()
    .range([height, 0]).nice();

var xCat = "x",
    yCat = "y",
    //rCat = "Protein (g)",
    colorCat = "brand";

var brandList = [];
var x_coords = [], y_coords = [];

d3.csv("app/src/fb.csv", function(data) {    
    data.forEach(function(d) {
        x_coords.push(parseFloat(d[xCat]));
        y_coords.push(parseFloat(d[yCat]));
        brandList.push(d[colorCat]);
    });

    var xMax = x_coords.sort(function(a,b) {return a-b})[x_coords.length-1],
        xMin = x_coords.sort(function(a,b) {return a-b})[0],
        yMax = y_coords.sort(function(a,b) {return a-b})[y_coords.length-1],
        yMin = y_coords.sort(function(a,b) {return a-b})[0];

    x.domain([xMin, xMax]);
    y.domain([yMin, yMax]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .tickSize(-height);

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickSize(-width);

    var color = d3.scale.category10();

    var tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-10, 0])
        .html(function(d) {
            return d[colorCat] + "<br>" + "(" + d[xCat] + ", " + d[yCat] + ")";
    });

    var zoomBeh = d3.behavior.zoom()
        .x(x)
        .y(y)
        .scaleExtent([0, 500])
        .on("zoom", zoom);

    var svg = d3.select("#scatter")
        .append("svg")
        .attr("width", outerWidth)
        .attr("height", outerHeight)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(zoomBeh);

    svg.call(tip);

    svg.append("rect")
        .attr("width", width)
        .attr("height", height);

    svg.append("g")
        .classed("x axis", true)
        .call(xAxis)
        .append("text")
        .classed("label", true)
        .attr("transform", "translate(0," + height + ")")
        .attr("x", width)
        .attr("y", margin.bottom - 10)

    svg.append("g")
        .classed("y axis", true)
        .call(yAxis)
        .append("text")
        .classed("label", true)
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left)
        .attr("dy", ".71em")

    var objects = svg.append("svg")
        .classed("objects", true)
        .attr("width", width)
        .attr("height", height);

    objects.append("svg:line")
        .classed("axisLine hAxisLine", true)
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", width)
        .attr("y2", 0)
        .attr("transform", "translate(0," + height + ")");

    objects.append("svg:line")
        .classed("axisLine vAxisLine", true)
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", 0)
        .attr("y2", height);

    objects.selectAll(".dot")
        .data(data)
        .enter().append("circle")
        .classed("dot", true)
        .attr("r", 4)
        .attr("transform", transform)
        .style("fill", function(d) { return color(d[colorCat]); })
        .on("mouseover", tip.show)
        .on("mouseout", tip.hide);

    var legend = svg.selectAll(".legend")
        .data(color.domain())
        .enter().append("g")
        .classed("legend", true)
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("circle")
        .attr("cx", width + 20)
        .attr("fill", color);
    
    
    function change() {
        xCat = "x";
        xMax = d3.max(data, function(d) { return d[xCat]; });
        xMin = d3.min(data, function(d) { return d[xCat]; });
        zoomBeh.x(x.domain([xMin, xMax])).y(y.domain([yMin, yMax]));
        var svg = d3.select("#scatter").transition();
        svg.select(".x.axis").duration(750).call(xAxis).select(".label").text(xCat);
        objects.selectAll(".dot").transition().duration(1000).attr("transform", transform);
    }

    function zoom() {
        svg.select(".x.axis").call(xAxis);
        svg.select(".y.axis").call(yAxis);

        svg.selectAll(".dot")
            .attr("transform", transform);
    }

    function transform(d) {
        return "translate(" + x(d[xCat]) + "," + y(d[yCat]) + ")";
    }

    var options_autocomplete = {
        data: brandList.sort(),
        list: {
            match: {
                enabled: true
            }
        },
        theme: "blue-light"
    };
    
    $("#searchOptions").easyAutocomplete(options_autocomplete);
    
    $('#searchOptions').keyup(function (e) {
        if (e.keyCode == 13) {
            console.log('pressed enter');
            searchBrand();
        }
    });

    d3.select("button").on("click", searchBrand);

    function searchBrand() {
    
        var selectedBrand = $('#searchOptions').val();
        var index = -1;
        for (var i=0; i<brandList.length; i++) {
            if(brandList[i] === selectedBrand){
                index = i;
            }
        }
        if(index != -1){
            alert("Brand Name: "+ selectedBrand + "\n" +
            "X Coordinate: "+ x_coords[index] + "\n"+
            "Y Coordinate: "+ y_coords[index] );
        }
        else{
            alert("Brand "+ selectedBrand + " not found");
        }
    }
    
});



