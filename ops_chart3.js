/** ops_chart3.js
 *  rdb4 / rdbisch
 *  
 *  Subroutine to setup and update #opsChart3
 */function opsChart3() {
    var margin = {top: 20, bottom: 50, left: 50, right: 50};
    var width = 800;
    var height = 500;

    var team1_color = "#e66100";
    var team2_color = "#5d3a9b";

    var svg = d3.select("#opschart3")
        .selectAll("g.main")
        .data([0])
        .enter()
        .append("g")
        .attr("class", "main")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var xAxis = d3.scaleLinear()
        .domain([1, 10])
        .range([0, width - margin.left - margin.right]);

    var yAxis = d3.scaleLinear()
        .domain([0,15])
        .range([height - margin.top - margin.bottom, 0]);

    var zAxis = d3.scaleLinear()
        .domain([1000, 3000])
        .range([5, 30]);

    var line2 = d3.line()
        .x( d=>xAxis(d.x) )
        .y( d=>yAxis(d.y) );

    /* Decoration ***/
    svg.append("g").attr("class", "xAxis");
    svg.append("g").attr("class", "yAxis");

    /* X-axis label */
    d3.select("#opschart3")
        .append("text")
        .attr("x", width / 2)
        .attr("y", height - 20)
        .attr("text-anchor", "middle")
        .text("Years in the Major Leagues");

    /* Add an explanation of the yAxis */
    d3.select("#opschart3")
        .append("text")
        .attr("x", 0)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .text("OPS_PLUS per $1m, Salary")
        .attr("transform", "rotate(-90 10" + "," + height/2 + ")");
        ;

    /*** Create the Legend ***/
    var line3 = d3.line().x(d => d.x).y(d=>d.y);
    var legend = svg.append("g")
        .attr("transform", "translate(400, 20)");
    legend.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 300)
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
            .text("OPS_PLUS/$ for ")
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

    function updateData(team1, team2) {
        function helper(d) {
            result = []
            for (const [key, value] of Object.entries(d)) {
                var temp = value;                
                temp.yearInLeague = key;
                temp.ratio = 1000000*value.ops_plus_ab / value.salary;
                result.push(temp);
            }
            result.shift();
            return result;
        }
        function extent(d) {
            var result = [d[0].ratio, d[0].ratio];
            for (const el of d) {
                if (el.ratio < result[0]) result[0] = el.ratio;
                if (el.ratio > result[1]) result[1] = el.ratio;
            }
            return result;
        }

        // Shortcut for easier code
        var t1 = helper(agg_baseball.rookie[team1]);
        var t2 = helper(agg_baseball.rookie[team2]);
        var t1_regress = quickRegression(t1, "yearInLeague", "ratio");
        var t2_regress = quickRegression(t2, "yearInLeague", "ratio");
        
        var t = d3.transition()
            .duration(1500);

        yAxis.domain(extent(t1.concat(t2)));

        /* Add axis labels */
        svg.select("g.xAxis")
            .transition(t)
            .attr("transform", "translate(0,"  + (height - margin.top - margin.bottom) + ")")
            .call(d3.axisBottom().scale(xAxis).tickFormat(d => d.toString()));
        svg.select("g.yAxis")
            .transition(t)
            .call(d3.axisLeft().scale(yAxis));


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

        svg.selectAll("circle.left")
            .data(t1)
            .join(
                enter => enter.append("circle")
                    .attr("class", "left")
            )
            .transition(t)
            .attr("cx", d => xAxis(+d.yearInLeague))
            .attr("cy", d => yAxis(d.ratio))
            .attr("r", d => 5)
            .attr("fill", "#e66100");

        svg.selectAll("path.team2")
            .data([0])
            .join(
                enter => enter.append("path")
                    .attr("class", "team2")
            )
            .datum(t2_regress)
            .transition(t)     
            .attr("d", line2)
            .attr("fill", "white")
            .attr("opacity", 0.3)
            .attr("stroke", team2_color)
            .attr("stroke-dasharray", "5,5")
            .attr("stroke-width", 3);            

        svg.selectAll("circle.right")
            .data(t2)
            .join(
                enter => enter.append("circle")
                    .attr("class", "right")
            )
            .transition(t)
            .attr("cx", d => xAxis(+d.yearInLeague))
            .attr("cy", d => yAxis(d.ratio))
            .attr("r", d => 5)
            .attr("fill", "#5d3a9b");

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
            .attr("x", xAxis(10))
            .attr("y", function(d) {
                if (d == 0) return t1_y;
                else return t2_y;
            })
            .attr("width", 40)
            .attr("height", 40);
    }
    d3.select("#team5").on('change', helper2);
    d3.select("#team6").on('change', helper2);
    helper2();
    function helper2() {
        updateData(
            d3.select("#team5").node().value,
            d3.select("#team6").node().value);
    }

    return svg;
}