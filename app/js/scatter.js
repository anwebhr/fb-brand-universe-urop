/******************variable declarations for d3 scatter plot***************/

var margin = { top: 50, right: 300, bottom: 50, left: 50 },
    outerWidth = 1100,
    outerHeight = 500,
    width = outerWidth - margin.left - margin.right,
    height = outerHeight - margin.top - margin.bottom;

var x = d3.scale.linear()
    .range([0, width]).nice();

var y = d3.scale.linear()
    .range([height, 0]).nice();

var xCat = "x",
    yCat = "y",
    brandCat = "brand";

var brandList = [];
var x_coords = [], y_coords = [];
var dataset_coords_info = [];
var searchedBrand = "None";
var zoomAndPanEnabled = true;
//var norm_network_data = null;

d3.csv("app/src/merged_fb_data_coords.csv", function(data){ 
    data.forEach(function(d) {
        x_coords.push(parseFloat(d[xCat]));
        y_coords.push(parseFloat(d[yCat]));
        brandList.push(d[brandCat]);
        dataset_coords_info.push([d[brandCat],parseFloat(d[xCat]),parseFloat(d[yCat]), d["id"], d["category"]]);
    });
    
    var xMax = x_coords.sort(function(a,b) {return a-b})[x_coords.length-1],
        xMin = x_coords.sort(function(a,b) {return a-b})[0],
        yMax = y_coords.sort(function(a,b) {return a-b})[y_coords.length-1],
        yMin = y_coords.sort(function(a,b) {return a-b})[0];

    // console.log("xMax: ", xMax);
    // console.log("xMin: ", xMin);
    // console.log("yMax: ", yMax);
    // console.log("yMin: ", yMin);
    
    x.domain([xMin-1, xMax+1]);
    y.domain([yMin-1, yMax+1]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .tickSize(-height);
    
    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .tickSize(-width);
    
    var color = d3.scale.category20();
    
    var tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-10, 0])
        .html(function(d) {
            return d[brandCat]; //+ "<br>" + "(" + d[xCat] + ", " + d[yCat] + ")";
    });
    
    var zoomBeh = d3.behavior.zoom().x(x).y(y)
                    .scaleExtent([0, 500])
                    .on("zoom", zoom);
    
    
    var svg = d3.select("#scatter")
        .append("svg")
        .attr("id", "main_svg")
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
        //.attr("r", 4)
        .attr("r", function(d) {
            if(d["likes"] <= 30000)
                return 3;
            else if(d["likes"] > 30000 && d["likes"] <= 477000)
                return 5;
            else    
                return 7;
        })
        .attr("transform", transform)
        .style("fill", function(d) {
            return color(d["category"]); 
        })
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

    var zoomIntoBrand = function(selectedBrand, x_measure, y_measure){
            
        /****figure out window dimensions so as to zoom enough to show n links if needed****/
        xCat = "x";
        yCat = "y";
        var window_x_lower_bound = x_measure - 5;
        var window_x_upper_bound = x_measure + 5;
        var window_y_lower_bound = y_measure - 3;
        var window_y_upper_bound = y_measure + 3;
        
        /*var links_coords_info = []; var links_x_list = []; var links_y_list = [];
        for(var i=0; i<top_50_links_sorted.length; i++){
            for(var j=0; j<dataset_coords_info.length; j++){
                if(dataset_coords_info[j][3] == top_50_links_sorted[i].to){
                    links_coords_info.push(top_50_links_sorted[i].to);
                    links_x_list.push(dataset_coords_info[j][1]);
                    links_y_list.push(dataset_coords_info[j][2]);
                } 
            }
        }
        links_x_list.push(x_measure);
        links_y_list.push(y_measure);
        //console.log(links_x_list);
        //console.log(links_y_list);
        window_x_lower_bound = links_x_list.sort(function(a,b) {return a-b})[0];
        window_x_upper_bound = links_x_list.sort(function(a,b) {return a-b})[links_x_list.length-1];
        window_y_lower_bound = links_y_list.sort(function(a,b) {return a-b})[0];
        window_y_upper_bound = links_y_list.sort(function(a,b) {return a-b})[links_y_list.length-1]; 
        console.log(selectedBrand, "'s lower x: ",window_x_lower_bound);
        console.log(selectedBrand, "'s upper x: ",window_x_upper_bound);
        console.log(selectedBrand, "'s lower y: ",window_y_lower_bound);
        console.log(selectedBrand, "'s upper y: ",window_y_upper_bound); */
        zoomBeh.x(x.domain([window_x_lower_bound, window_x_upper_bound])).y(y.domain([window_y_lower_bound, window_y_upper_bound]));
                
        var svg = d3.select("#scatter").transition();
        svg.select(".x.axis").duration(1000).call(xAxis).select(".label").text(xCat);
        svg.select(".y.axis").duration(1000).call(yAxis).select(".label").text(yCat);
        
        objects.selectAll(".dot")
            .transition().duration(1000).attr("transform", transform)
            .style("fill", function(d) {
                if(searchedBrand != "None"){  //extra checking
                    if(d[brandCat] == searchedBrand){
                        return "red";
                    }
                    else
                        return color(d["category"]); 
                } 
            })
            .attr("r", function(d) {
                if(searchedBrand != "None"){  //extra checking
                    if(d[brandCat] == searchedBrand){
                        return 9;
                    }
                    else{
                        if(d["likes"] <= 30000)
                            return 3;
                        else if(d["likes"] > 30000 && d["likes"] <= 477000)
                            return 5;
                        else    
                            return 7;
                    }
                } 
            })
            .style("fill-opacity", 0.75);

            var brands_in_window = searchForBrandsInWindow(selectedBrand, x_measure, y_measure);
            for(var i=0; i< brands_in_window.length; i++){
                objects.append("text")
                .transition().duration(1000)
                .attr("x",x(brands_in_window[i][1]))
                .attr("y",y(brands_in_window[i][2]))
                .text(brands_in_window[i][0])
                .style("font-size", "7.5px");
            }

            /*.attr("fill-opacity", function(d) {
                if(searchedBrand != "None"){  //extra checking
                    if(brands_most_related_to.includes(d[brandCat])){
                        return 0.6;
                    }
                    else {
                        return 0.2;
                    }
                } 
            })*/
            //.filter(function(d) { return d["brand"] == selectedBrand; })
            //   .transition().duration(1000).call(tip.show);//attr('class', 'd3-tip animate').call(tip.show);
            //.transition().duration(10000).style("pointer-events", "all");
            //resolve();
        //});    
            
    }

    var showLinksToRelatedBrands = function(top_n_links, selectedBrand, x_measure, y_measure){

        var linkedBrandsWeights= [], linkedBrandsList = [];
        for (var key in top_n_links) {
            if (top_n_links.hasOwnProperty(key)) {
                linkedBrandsWeights.push(top_n_links[key].weight);
                linkedBrandsList.push(top_n_links[key].target);
            }
        }

        var min_weight = linkedBrandsWeights.sort(function(a,b) {return a-b})[0];
        var max_weight = linkedBrandsWeights.sort(function(a,b) {return a-b})[linkedBrandsWeights.length-1];
        
        /**enrich topn links objects to capture more information*/
        
        //array with relevant coords info and name of brands
        var filtered_linked_brands_info = [], listIndexList = [];
        for (var i=0; i<dataset_coords_info.length; i++){
            var listIndex = linkedBrandsList.indexOf(dataset_coords_info[i][3]);
            if(listIndex > -1 && listIndexList.indexOf(listIndex) == -1){
                filtered_linked_brands_info.push(
                    {
                        "id": dataset_coords_info[i][3],
                        "brand": dataset_coords_info[i][0],
                        "x": parseFloat(dataset_coords_info[i][1]),
                        "y": parseFloat(dataset_coords_info[i][2]),
                        "fixed": true
                    }
                );  
                
                for (var key in top_n_links) {
                    if (top_n_links.hasOwnProperty(key) && top_n_links[key].target == dataset_coords_info[i][3]) {
                        top_n_links[key].target_x = parseFloat(dataset_coords_info[i][1]);
                        top_n_links[key].target_y = parseFloat(dataset_coords_info[i][2]);
                        top_n_links[key].target_brand = dataset_coords_info[i][0];
                    }
                } 
            } 
            listIndexList.push(listIndex);    
        }

        /***reduce opacity of other irrelevant brands***/
        objects.selectAll(".dot")
        .transition().duration(500).attr("transform", transform)
        .style("fill", function(d) {
            if(searchedBrand != "None"){  //extra checking
                if(d[brandCat] == searchedBrand){
                    return "red";
                }
                else
                    return color(d["category"]); 
            } 
        })
        .attr("r", function(d) {
            if(searchedBrand != "None"){  //extra checking
                if(d[brandCat] == searchedBrand){
                    return 9;
                }
                else{
                    if(d["likes"] <= 30000)
                        return 3;
                    else if(d["likes"] > 30000 && d["likes"] <= 477000)
                        return 5;
                    else    
                        return 7;
                }
            } 
        })
       
        .style("fill-opacity", function(d) {
            if(searchedBrand != "None"){  //extra checking
                if(linkedBrandsList.indexOf(d["id"]) > -1 || d["id"] == getIDOfBrand(searchedBrand)){
                    return 0.75;
                }
                else {
                    return 0.05;
                }
            } 
        });
        
        /*var svg = d3.select("#scatter")
        .append("svg")
        .attr("id", "main_svg")
        .attr("width", outerWidth)
        .attr("height", outerHeight)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(zoomBeh);*/

        //.interpolate("linear");  
        
        /*d3.select('svg')
        .append('line')
        .data(top_50_links)
        .attr("stroke", "#999")
        //.attr("stroke-opacity", 0.6)
        .attr("x1", 9)
        .attr("y1", 0)
        .attr("x2", function(d){
            return 200
        })
        .attr("y2", function(d){
            return 300
        });*/

        //svg.append("line")
        //.data(top_50_links[i])
        //.attr("d", function(d) { return line(d)})

        //clear previous network lines if any
    
        objects.selectAll("line").remove();
        svg.selectAll("text").remove();
        //draw lines for each brand in the top n list
        for(var i=0; i<top_n_links.length; i++){
            if(top_n_links[i].target_y != undefined){
                objects.append("line")
                .transition().duration(1000)
                .attr("class", "line")
                .attr("x2", x(top_n_links[i].target_x))
                .attr("y2", y(top_n_links[i].target_y))
                .attr("x1", x(x_measure))
                .attr("y1", y(y_measure))
                .style("stroke-width", 2)
                //.style("stroke-width", function() { 
                    //min-max normalization
                    //return Math.sqrt(d.value); 
                    //var norm_val = (top_n_links[i].weight - min_weight) / (max_weight - min_weight);
                    //return norm_val * 5;
                    //return top_n_links[i].weight;
                    //return 2;
                //})
                .style("stroke", "#999")
                .style("stroke-opacity", function(){
                    var norm_val = (top_n_links[i].weight - min_weight) / (max_weight - min_weight);
                    return norm_val * 5;
                });
                svg.append("text")
                    .attr("x", x(top_n_links[i].target_x))
                    .attr("y", y(top_n_links[i].target_y))
                    .text(top_n_links[i].target_brand)
                    .style("font-size", "8px");
            }
        }
        //label for searched brand  
        svg.append("text")
        .attr("x",x(x_measure))
        .attr("y",y(y_measure))
        .text(searchedBrand)
        .style("font-size", "12px");
        
        /*for(var i=0; i<top_50_links.length; i++){
            console.log(x(top_50_links[i].target_x));
            svg.append("line")
            //.data(top_50_links[i])
            //.attr("d", function(d) { return line(d)})
            .attr("class", "line")
            .attr("x2", x(top_50_links[i].target_x))
            .attr("y2", y(top_50_links[i].target_y))
            .attr("x1",x(x_measure))
            .attr("y1",y(y_measure))
            //.attr("transform", "translate(0,0)")
            .style("stroke-width", 2)
                    .style("stroke", "steelblue");
                    //.style("fill", "none");
        }*/
        
        /*var force = d3.layout.force()
        //.charge(-120)
        .linkDistance(30)
        .size([width, height]);*/


        /*var link = d3.select("svg")
        //objects.append("g")
        //.attr("class", "links")
        //.selectAll("line")
        .data(top_50_links)
        .enter().append("line")
        .attr("stroke-width", function(d) { 
            //min-max normalization
            //return Math.sqrt(d.value); 
            //var norm_val = (d.weight - min_weight) / (max_weight - min_weight);
            //return norm_val * 5;
            return d.weight;
        });*/

        /*var svg = d3.select("svg"),
        width = +svg.attr("width"),
        height = +svg.attr("height");

        var force = d3.layout.force()
        .nodes(top_50_links)
        .links(top_50_links)
        .linkDistance(function(d) {
            var eucl_distance = Math.sqrt((x_measure - d.target_x)*(x_measure - d.target_x) + (y_measure - d.target_y)*(y_measure - d.target_y)); 
            return eucl_distance;
        })
        .size([width, height]);

        var link = svg.selectAll("line")
        .data(force.links)
        .enter()
        .append("line")
        .attr("class", "line")
        .attr("stroke", "red")
        .attr("stroke-width", "2")
        .attr("x1", function(d) { return x_measure; })
        .attr("y1", function(d) { return y_measure; })
        .attr("x2", function(d) { return d.target_x; })
        .attr("y2", function(d) { return d.target_y; });

        var node = svg.selectAll(".dot")
            .data(force.nodes);*/

            //.data(force.nodes)
            //.attr("class", "node")
            //.enter()
            //.append("dot");
            //.attr("r", 4.5) 
            //.attr('fill', function(d, i) {
            //    return (i == 0) ? '#a40000' : '#0000a4';
            //})
        //.attr('cx', function(d) { return d.x; })
        //.attr('cy', function(d) { return d.y; });

        /*force.on("tick", function() {
            link.attr("x1", function(d) { return x_measure; })
                .attr("y1", function(d) { return y_measure; })
                .attr("x2", function(d) { return d.target_x; })
                .attr("y2", function(d) { return d.target_y; });

            //node.attr("cx", function(d) { return d.x; })
            //    .attr("cy", function(d) { return d.y; });
        });

        force.start()
        for (var i=0; i<filtered_linked_brands_info.length; i++) {
            force.tick();
        }
        force.stop(); 

        /*d3.select('svg')
        .append('line')
        .data(top_50_links)
        .attr("stroke", "#999")
        //.attr("stroke-opacity", 0.6)
        .attr("x1", 9)
        .attr("y1", 0)
        .attr("x2", function(d){
            return 200
        })
        .attr("y2", function(d){
            return 300
        });*/
        /*.attr({
          x1: 0,
          y1: 0,
          x2: 200,
          y2: 200,
          stroke: '#000'
        })*/

        /*var node = objects.selectAll("dot")
        .data(filtered_linked_brands_info);
        //.enter().append("circle")
        //.attr("r", 5);
            
        /*objects.selectAll(".dot")
        .data(top_50_links)
        .append("title")
        .text(function(d) { return d.to; });*/
        
        /*force
        .nodes(filtered_linked_brands_info)
        .links(top_50_links)
        .on("end", ticked);
        
        function ticked() {
            link
                .attr("x1", function(d) { return x_measure; })
                .attr("y1", function(d) { return y_measure; })
                .attr("x2", function(d) { return d.target_x; })
                .attr("y2", function(d) { return d.target_y; });
        
            node
                .attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; });
        }
        force.start();
        /*for (var i = 0; i < filtered_linked_brands_info.length; i++)
            force.tick();
        force.stop();*/
        
    }

    function getIDOfBrand(selectedBrand){
        //find ID of selected brand
        var selectedBrandID = "";
        for (var i=0; i<dataset_coords_info.length; i++){
            if(dataset_coords_info[i][0] == selectedBrand){
                selectedBrandID = dataset_coords_info[i][3];
            }
        }
        return selectedBrandID;
    }

    function loadAndFilterNetworkData(selectedBrandID,x_measure, y_measure, num_brands){
        //read large dataset with correlation information about brands
        /*alasql('SELECT * FROM CSV("/app/src/new_directed_normalized_brand_network.csv",{headers:true}) '
              + ' WHERE [source]     LIKE '+selectedBrandID+ ' ORDER BY weight DESC LIMIT 50', function(data){
                console.log(data);
              });
        .then(function(res){
             console.log(res);
        }).catch(function(err){
             console.log('Does the file exist? There was an error:', err);
        });*/

        var norm_network_data_arr = [];
        //read only the relevant csv file according to the brand searched. the data is distributed among 201 csv files.
        //find the relevant file's name
        var lower_bound = parseInt(selectedBrandID / 10) * 10 ;//if selectedBrandID = 3 then lower_bound = 0, upper_bound = 9
        var upper_bound = parseInt(selectedBrandID / 10) * 10 + 9;
        var path = 'app/src/network_info/'+ String(lower_bound) + '-' + String(upper_bound) +'.csv' 
        d3.csv(path, function(obj_list){ 
            var stop_condn = false;
            var reading_values = false;
            var j = 0;
            while(stop_condn == false && j<obj_list.length){
                //read elements till you get the first item with same ID as selected brand
                record = [];
                //this is done to isolate the garbage values inserted when processing the data, 
                //and due to unknown keys (the value is read as the key as well)
                for(var key in obj_list[j]) {
                    var value = obj_list[j][key];
                    record.push(value);
                }
            
                //0th index is garbage, 1st is from, 2nd is to, 3rd is weight
                //each value was unfortunately stored as float in string format, converting it here
                if( String(parseInt(record[1])) == selectedBrandID){
                    reading_values = true;
                    var obj = new Object();
                    obj.source = String(parseInt(record[1]));
                    obj.target = String(parseInt(record[2]));
                    obj.weight = parseFloat(record[3]);
                    norm_network_data_arr.push(obj);
                }
                //if it has started reading the relevant values and pointer has reached beginning of selectedBrandID + 1 id then stop 
                if(reading_values == true && record[1] == String(parseInt(selectedBrandID) + 1)){
                    stop_condn = true;
                }
                j += 1;
            }

            //get top n links by weight
            var top_n_links = norm_network_data_arr.sort(function(a, b) {
                return parseFloat(b.weight) - parseFloat(a.weight);
            }).slice(0,num_brands);
            callShowLinksFunction(top_n_links, searchedBrand, x_measure, y_measure);
        });
        function callShowLinksFunction(links, brand, x, y){
            showLinksToRelatedBrands(links, brand, x, y);
        }
        
    }
    
     var findMostRelatedBrands = function(selectedBrand,x_measure, y_measure, num_brands){
        //return new Promise(function(resolve, reject){
        var selectedBrandID = getIDOfBrand(selectedBrand);
        loadAndFilterNetworkData(selectedBrandID,x_measure, y_measure, num_brands);
            //return Promise.resolve(loadAndFilterNetworkData(getIDOfBrand(selectedBrand)));
            //resolve(top_50_links);
            /*promise = getIDOfBrand()
                .then(selectedBrandID => loadNetworkData(selectedBrandID))
                .then(norm_network_data => filterTop50RelatedBrands(norm_network_data))
                .then(weights_arr => {
                    console.log(`Got the final result: ${weights_arr}`);
                });*/
                //.catch(failureCallback);
        //});
    }

    function searchForBrandsInWindow(selectedBrand, x_measure, y_measure){
        brands_in_vicinity = [];
        x_lower_bound = x_measure - 5;
        x_higher_bound = x_measure + 5;
        y_lower_bound = y_measure - 3;
        y_higher_bound = y_measure + 3;
        for(var i=0; i<dataset_coords_info.length; i++){
            if((dataset_coords_info[i][1] >= x_lower_bound && dataset_coords_info[i][1] <= x_higher_bound)
                && (dataset_coords_info[i][2] >= y_lower_bound && dataset_coords_info[i][2] <= y_higher_bound)){
                brands_in_vicinity.push([dataset_coords_info[i][0],dataset_coords_info[i][1],dataset_coords_info[i][2]]); 
            }
        }
        return brands_in_vicinity;
    }
    /*
    function change() {
        xCat = "x";
        yCat = "y";
        xMax = d3.max(data, function(d) { return d[xCat]; });
        xMin = d3.min(data, function(d) { return d[xCat]; });
        yMax = d3.max(data, function(d) { return d[yCat]; });
        yMin = d3.min(data, function(d) { return d[yCat]; });
        zoomBeh.y(y.domain([yMin, yMax])).x(x.domain([xMin, xMax]));
                
        var svg = d3.select("#scatter").transition();
        svg.select(".x.axis").duration(750).call(xAxis).select(".label").text(xCat);
        svg.select(".y.axis").duration(750).call(yAxis).select(".label").text(yCat);
        objects.selectAll(".dot").transition().duration(1000).attr("transform", transform);
    }*/

    function zoom() {
        if(zoomAndPanEnabled){
            svg.select(".x.axis").call(xAxis);
            svg.select(".y.axis").call(yAxis);
    
            svg.selectAll(".dot")
                .attr("transform", transform);
        }
    }

    function transform(d) {
        return "translate(" + x(d[xCat]) + "," + y(d[yCat]) + ")";
    }

/********render of search feature and call of function*************/

    var options_autocomplete = {
        data: brandList,
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

    //d3.select("button").on("click", searchBrand);
    var secondSearchButton = d3.selectAll("#searchButton2");
    var firstSearchButton = d3.selectAll("#searchButton1");
    var refreshButton = d3.selectAll("#refreshButton");
    firstSearchButton.on("click", searchBrandVicinity);
    secondSearchButton.on("click", searchBrandCross);
    refreshButton.on("click", function(){
        if(svg != null)
            svg.selectAll("text").remove();
        if(objects != null){
            objects.selectAll("line").remove();
            objects.selectAll(".dot").style("fill-opacity", 0.5);
        }
        zoomBeh.x(x.domain([xMin, xMax])).y(y.domain([yMin, yMax]));
    });

    /*********search and modify scatter plot accordingly***************/

    function searchBrandVicinity() {
        brands_in_window = [];
        zoomAndPanEnabled = true;
        var selectedBrand = $('#searchOptions').val();
        var index = -1;
        for (var i=0; i<dataset_coords_info.length; i++) {
            if(dataset_coords_info[i][0] == selectedBrand){
                index = i;
            }
        }
        if(index != -1) {
            searchedBrand = selectedBrand;
            
            //findMostRelatedBrands(selectedBrand,dataset_coords_info[index][1], dataset_coords_info[index][2]);//.then(function(top_50_links){
            //    
            //});
            //brands_in_window = searchForBrandsInWindow(selectedBrand, dataset_coords_info[index][1], dataset_coords_info[index][2]);
            if(svg!=null){
                objects.selectAll("line").remove();
                svg.selectAll("text").remove();
            }
            zoomIntoBrand(selectedBrand, dataset_coords_info[index][1], dataset_coords_info[index][2]);
        }
        else {
            alert("Sorry! Brand "+ selectedBrand + " not found.");
        }
    }

    function searchBrandCross() {
        brands_in_window = [];
        zoomAndPanEnabled = false;
        var selectedBrand = $('#searchOptions').val();
        var num_similar = $('#numSimilarBrands').val();
        if(Number.isInteger(parseInt(num_similar)) && num_similar >= 1 && num_similar <= 100){
            var index = -1;
            for (var i=0; i<dataset_coords_info.length; i++) {
                if(dataset_coords_info[i][0] == selectedBrand){
                    index = i;
                }
            }
            if(index != -1) {
                searchedBrand = selectedBrand;
                if(svg != null )
                    svg.selectAll("text").remove();
                if(objects != null)
                    objects.selectAll("line").remove();
                zoomBeh.x(x.domain([xMin-2, xMax+2])).y(y.domain([yMin-2, yMax+2]));
                findMostRelatedBrands(selectedBrand,dataset_coords_info[index][1], dataset_coords_info[index][2], num_similar);
            }
            else {
                alert("Sorry! Brand "+ selectedBrand + " not found.");
            }
        }
        else{
            alert("Sorry! Enter a valid integer between 1 and 100.");
        }
    }
});



