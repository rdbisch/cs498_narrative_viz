/* Encapsulate logic to draw CPI vs Salary chart */
function opsChart() {
    margin = {top: 20, bottom: 50, left: 50, right: 20};
    width = 800;
    height = 500;

    var team1_color = "#e66100";
    var team2_color = "#5d3a9b";

    var svg = d3.select("#opschart")
        .selectAll("g.main")
        .data([0])
        .enter()
        .append("g")
        .attr("class", "main")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

   
    var xAxis = d3.scaleLinear()
        .domain([1985, 2020])
        .range([0, width - margin.left - margin.right]);

    var yAxis = d3.scaleLinear()
        .domain(agg_baseball.OPS_PLUS_extent)
        .range([height - margin.top - margin.bottom, 0]);

    var line = d3.line()
        .x( d => xAxis(d.year) )
        .y( d => yAxis(d.value));

    var line2 = d3.line()
        .x( d => xAxis(+d.x))
        .y( d => yAxis(d.y));

    var line3 = d3.line().x ( d=>d.x ).y( d => d.y);

    /* Add axis labels */
    svg.append("g")
        .attr("transform", "translate(0,"  + (height - margin.top - margin.bottom) + ")")
        .call(d3.axisBottom().scale(xAxis).tickFormat(d => d.toString()));
    svg.append("g")        
        .call(d3.axisLeft().scale(yAxis));

    /* X-axis label */
    d3.select("#opschart")
        .append("text")
        .attr("x", width / 2)
        .attr("y", height - 20)
        .attr("text-anchor", "middle")
        .text("Year");

    /* Add an explanation of the yAxis */
    d3.select("#opschart")
        .append("text")
        .attr("x", 0)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .text("Weighted Average of OPS_PLUS by AB")
        .attr("transform", "rotate(-90 10" + "," + height/2 + ")");
        ;        
    
    /*** Create the Legend ***/
        var legend = svg.append("g")
            .attr("transform", "translate(400, 20)");
        legend.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 275)
            .attr("height", 70)
            .attr("stroke", "black")
            .attr("fill", "none")

        legend.append("circle")
            .attr("cx", 15)
            .attr("cy", 15)
            .attr("r", 5)
            .attr("fill", team1_color);

        legend.append("circle")
            .attr("cx", 30)
            .attr("cy", 15)
            .attr("r", 5)
            .attr("fill", team2_color);
        legend.append("text")
            .attr("x", 45)
            .attr("y", 20)
            .append("tspan")
                .text("OPS_PLUS for ")
            .append("tspan")
                .text("Team 1 ")
                .attr("stroke", team1_color)
            .append("tspan")
                .text("Team 2 ")
                .attr("stroke", team2_color);
        
        legend.append("path")
            .datum([{x: 10, y: 35}, {x: 35, y: 35}])
            .attr("d", line3)
            .attr("fill", "none")
            .attr("stroke", team1_color)
            .attr("stroke-dasharray", "5,5")
            .attr("stroke-width", 3);    

        legend.append("path")
            .datum([{x: 10, y: 55}, {x: 35, y: 55}])
            .attr("d", line3)
            .attr("fill", "none")
            .attr("stroke", team2_color)
            .attr("stroke-dasharray", "5,5")
            .attr("stroke-width", 3);            

        legend.append("text")
            .attr("x", 45)
            .attr("y", 40)
            .text("Trend for Team 1");

        legend.append("text")
            .attr("x", 45)
            .attr("y", 60)
            .text("Trend for Team 2");
    /*** --end create legend *****/


    /* Add an annotation */
    svg.append("text")
        .attr("x", xAxis(2005))
        .attr("y", yAxis(90))
        .append("tspan")
            .text("Despite dramatically increasing")
        .append("tspan")
            .attr("x", xAxis(2005))
            .attr("dy", 15)
            .text("salaries, player performance has")            
        .append("tspan")
            .attr("x", xAxis(2005))
            .attr("dy", 15)
            .text("generally remained flat as")
        .append("tspan")
            .attr("x", xAxis(2005))
            .attr("dy", 15)
            .text("indicated by the flat trend lines.")


    function updateData(team1, team2) {
        // Shortcut for easier code
        var t1 = agg_baseball.OPS_PLUS[team1];
        var t1_regress = quickRegression(t1, "year", "value");
        var t2 = agg_baseball.OPS_PLUS[team2];
        var t2_regress = quickRegression(t2, "year", "value");

        var t = d3.transition()
            .duration(1500);

        svg.selectAll("path.team1")
            .data([0])
            .join(
                enter => enter.append("path")
                    .attr("class", "team1")
            )
            .datum(t1_regress)
            .transition(t)     
            .attr("d", line2)
            .attr("fill", "white")
            .attr("opacity", 0.3)
            .attr("stroke", team1_color)
            .attr("stroke-dasharray", "5,5")
            .attr("stroke-width", 3);

        svg.selectAll("circle.team1")
            .data(t1)
            .join(
                enter => enter.append("circle")
                    .attr("class", "team1")
            )
            .transition(t)
            .attr("cx", d => xAxis(d.year))
            .attr("cy", d => yAxis(d.value))
            .attr("r", 5)
            .attr("fill", team1_color);

        svg.selectAll("path.team2")
            .data([0])        
            .join(
                enter => enter.append("path")
                    .attr("class", "team2")
            )
            .datum(t2_regress) 
            .transition(t)      
            .attr("d", line2)
            .attr("fill", "none")
            .attr("stroke", team2_color)
            .attr("stroke-dasharray", "5,5")
            .attr("stroke-width", 3);

        svg.selectAll("circle.team2")
            .data(t2)
            .join(
                enter => enter.append("circle")
                    .attr("class", "team2")
            )
            .transition(t)
            .attr("cx", d => xAxis(d.year))
            .attr("cy", d => yAxis(d.value))
            .attr("r", 5)
            .attr("fill", team2_color);

        // Check for logo collision
        var t1_y = yAxis(t1_regress[1].y);
        var t2_y = yAxis(t2_regress[1].y);
        if (Math.abs(t1_y - t2_y) < 40) {
            if (t2_y < t1_y) { t2_y -= 20; t1_y += 20; }
            else { t2_y += 20; t1_y -= 20; }
        }

        /* Add team logos at the end of the chart */
        svg.selectAll("image")
            .data([0, 1])
            .join(
                enter => enter.append("svg:image")
            )
            .transition(t)      
            .attr("xlink:href", d => {
                if (d == 0) return agg_baseball.team_dict[team1].icon;
                else return agg_baseball.team_dict[team2].icon;
            })
            .attr("x", xAxis(2017))
            .attr("y", function(d) {
                if (d == 0) return t1_y;
                else return t2_y;
            })
            .attr("width", 40)
            .attr("height", 40);
    }
    d3.select("#team1").on('change', helper);
    d3.select("#team2").on('change', helper);
    helper();
    function helper() {
        updateData(
            d3.select("#team1").node().value,
            d3.select("#team2").node().value);
    }

    return svg;
}