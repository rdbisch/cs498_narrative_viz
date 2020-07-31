opsChart2_setup = false;

/* Encapsulate logic to draw CPI vs Salary chart */
function opsChart2() {
    margin = {top: 20, bottom: 50, left: 50, right: 20};
    width = 800;
    height = 500;

    var svg = d3.select("#opschart2")
        .selectAll("g.main")
        .data([0])
        .enter()
        .append("g")
        .attr("class", "main")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    extent = [null, null];
    function restateData(X) {
        var temp = [];
        for (const [key, value] of Object.entries(X)) {
            var t = value.ops_plus_ab / value.salary;
            if (!extent[0]) { extent = [t, t]; }
            if ( t < extent[0] ) extent[0] = t;
            if ( t > extent[1] ) extent[1] = t;

            new_dict = value;
            new_dict.year = key;
            new_dict.ratio = value.ops_plus_ab / value.salary;
            new_dict.initials = initials(value.name);
            temp.push(new_dict);        
        }
        return temp;
    }

    // helper function to get player initials
    function initials(name) {
        names = name.split(" ");
        return names[0][0] + names[1][0];
    }

    var xAxis = d3.scaleLinear()
        .domain([1985, 2020])
        .range([0, width - margin.left - margin.right]);

    var yAxis = d3.scaleLinear()
        .domain([0, 0.5])
        .range([height - margin.top - margin.bottom, 0]);

    var line = d3.line()
        .x( d => xAxis(d.year) )
        .y( d => yAxis(d.ratio));

    /* Add axis labels */
    svg.append("g")
        .attr("transform", "translate(0,"  + (height - margin.bottom - margin.top) + ")")
        .call(d3.axisBottom().scale(xAxis).tickFormat(d => d.toString()));
    svg.append("g")
        .call(d3.axisLeft().scale(yAxis));

    /* X-axis label  */
    d3.select("#opschart2")
        .append("text")
        .attr("x", width / 2)
        .attr("y", height - 20)
        .attr("text-anchor", "middle")
        .text("Year");

    /* Add an explanation of the yAxis */ 
    d3.select("#opschart2")
        .append("text")
        .attr("x", 0)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .text("OPS_PLUS per $1m Salary")
        .attr("transform", "rotate(-90 10" + "," + height/2 + ")");
        ;


    /*** Add an annotation ***/
    svg.append("ellipse")
        .attr("cx", xAxis(2005))
        .attr("cy", yAxis(.15))
        .attr("rx", 0.5*(xAxis(2020) - xAxis(1995)))
        .attr("ry", -0.5*(yAxis(.25) - yAxis(0.05)))
        .attr("fill", "#CCE9F6");

    svg.append("text")
        .attr("x", xAxis(1990))
        .attr("y", yAxis(0.25))
        .append("tspan")
            .text("Players in this zone are almost always rookies")
        .append("tspan")
            .attr("x", xAxis(1990))
            .attr("dy", 20)
            .text("due to a salary struture change that resulted in")
        .append("tspan")
            .attr("x", xAxis(1990))
            .attr("dy", 20)
            .text("new-player salaries being paid league minimum")
        .append("tspan")
            .attr("x", xAxis(1990))
            .attr("dy", 20)
            .text(" for their first few years.");
        
    function updateData(team1, team2) {
        // Shortcut for easier code
        var t1 = restateData(agg_baseball.best[team1]);
        var t2 = restateData(agg_baseball.best[team2]);        
        var t = d3.transition()
            .duration(1500);


        function addDataToSelection(sel, P, className, iconPath, transX, linecolor) {
            var g = sel.append("g")
                .attr("class", className)
                .attr("transform", "translate(" + transX + ", 0)");

            /* Create the text information... pretty lengthy 
             * code but simple enough, adding line by line to an SVG */
            g.append("text") 
                    .attr("class", "left")
                    .append("tspan")
                        .text(P.name)
                        .attr("class", "playerName")                
                        .attr("x", 0)
                        .attr("dy", 25)
                        .attr("font-size", 20)
                        .attr("font-weight", "bold")
                    .append("tspan")
                        .text(P.year + " " + P.team + ", debuted in " + P.debutYear)
                        .attr("class", "playerYear")
                        .attr("x", 0)
                        .attr("dy", 18)
                        .attr("font-size", 10)
                    .append("tspan")
                        .text( "OPS_PLUS")
                        .attr("x", 0)
                        .attr("dy", 10)
                        .attr("font-weight", "normal")
                    .append("tspan")
                        .text ( (+P.ops_plus).toFixed(0))
                        .attr("x", 200)
                        .attr("text-anchor", "end")
                    .append("tspan")
                        .text( "AB")
                        .attr("x", 0)
                        .attr("dy", 10)
                        .attr("text-anchor", "start")
                    .append("tspan")
                        .text( P.AB )
                        .attr("x", 200)
                        .attr("text-anchor", "end")
                    .append("tspan")
                        .text( "Salary")                        
                        .attr("x", 0)
                        .attr("dy", 10)
                        .attr("text-anchor", "start")
                    .append("tspan")
                        .text( numberWithCommas(P.salary) )
                        .attr("x", 200)
                        .attr("text-anchor", "end");
            /*  Add icon */
            g.append("svg:image")
                    .attr("xlink:href", iconPath)
                    .attr("x", 160)
                    .attr("y", 0)                    
                    .attr("width", 40)
                    .attr("height", 40);            
            /* Add line to the data element. */
            /* Here we need to go outside the <g> element because we need to draw an 
             *  arrow on the chart itself! */
            points = [
            {
                // bottom center of our text box.
                x: transX + 100,
                y: 70
            },
            {
                // x and y-axis translated values of this player
                x: xAxis(P.year),
                y: yAxis(P.ratio)
            }];
            sel.append("line")
                .attr("class", className)
                .style("stroke", linecolor)
                .attr("stroke-width", 3)
                .style("opacity", 0.1)
                .attr("x1", points[0].x)
                .attr("y1", points[0].y)
                .attr("x2", points[1].x)
                .attr("y2", points[1].y);

        }

        function updateLeftHighlight(whichYear) {
            var temp = agg_baseball.team_dict[t1[whichYear - 1985].team].icon;

            d3.select("#opschart2")
                .select("g.main")
                .selectAll(".hi_left")
                .remove();

            addDataToSelection(d3.select("#opschart2").select("g.main"),
                t1[whichYear - 1985],
                "hi_left",
                temp, 
                150, "#e66100");
        }

        function updateRightHighlight(whichYear) {   
            var temp = agg_baseball.team_dict[t2[whichYear - 1985].team].icon;
     
            d3.select("#opschart2")
                .select("g.main")
                .selectAll(".hi_right")
                .remove();

            addDataToSelection(d3.select("#opschart2").select("g.main"),
                t2[whichYear - 1985],
                "hi_right",
                temp, 
                400, "#5d3a9b");                 
        }

        d3.select("#opschart2")
          .select("g.main")
          .selectAll("text.team1")
            .data(t1)
            .join(
                enter => enter.append("text")
                    .attr("class", "team1")
                    .attr("text-anchor", "middle")
            )
            .transition(t)
            .attr("x", d => xAxis(d.year))
            .attr("y", d => yAxis(d.ratio))
            .text(d => d.initials)
            .style("font-size", "12")
            .attr("stroke", "#e66100");

        d3.selectAll("#opschart2")
            .select("g.main")
            .selectAll("text.team2")
            .data(t2)
            .join(
                enter => enter.append("text")
                    .attr("class", "team2")
                    .attr("text-anchor", "middle")

            )
            .transition(t)
            .attr("x", d => xAxis(d.year))
            .attr("y", d => yAxis(d.ratio))
            .text(d => d.initials)
            .style("font-size", "12")
            .attr("stroke", "#5d3a9b");

    svg.append('rect') // append a rect to catch mouse movements on canvas
        .attr('width', width) // can't catch mouse events on a g element
        .attr('height', height)
        .attr('fill', 'none')
        .attr('pointer-events', 'all')
        .on('mousedown', function() { // mouse moving over canvas
            /* Find */
            var mouse = d3.mouse(this);                        
            var xYear = Math.round(xAxis.invert(mouse[0]));                        
            if (xYear < 1981) xYear = 1981;
            if (xYear > 2016) xYear = 2016;
            var yPt = mouse[1];

            var p1 = yAxis(t1[xYear - 1985].ratio); //Math.abs(Math.max(25, t1[xYear - 1985].ratio));
            var p2 = yAxis(t2[xYear - 1985].ratio); // Math.abs(Math.max(25, t2[xYear - 1985].ratio));
            var d1 = Math.max(7.5, Math.abs(yPt - p1));
            var d2 = Math.max(7.5, Math.abs(yPt - p2));

            if (d1 < d2) which = 1;
            else if (d1 == d2) which = 3;
            else which = 2;

            if (which == 1 || which == 3) updateLeftHighlight(xYear);
            if (which == 2 || which == 3) updateRightHighlight(xYear);
        });

        updateLeftHighlight(2016);
        updateRightHighlight(2016);
    }

    d3.select("#team3").on('change', helper);
    d3.select("#team4").on('change', helper);
    helper();
    function helper() {
        updateData(
            d3.select("#team3").node().value,
            d3.select("#team4").node().value);
    }
}
