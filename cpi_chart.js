/* Encapsulate logic to draw CPI vs Salary chart */
function cpiChart() {
    margin = {top: 20, bottom: 20, left: 20, right: 20};
    width = 800;
    height = 500;

    var svg = d3.select("#cpichart")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var xAxis = d3.scaleLinear()
        .domain(d3.extent(combinedSalaryCPI, d => d.year))
        .range([0, width - margin.left - margin.right]);

    var t_yAxis = [0, d3.max(combinedSalaryCPI, d => d.relative_salary)];
    var yAxis = d3.scaleLinear()
        .domain(t_yAxis)
        .range([height - margin.top - margin.bottom, 0]);

    var line = d3.line()
        .x( d => xAxis(d.year) )
        .y( d => yAxis(d.relative_cpi));

    /* Missing data for salary is represented as 0, so make sure 
        *  we skip it */
    var line2 = d3.line()
        .defined( d => d.relative_salary > 0 )
        .x( d => xAxis(d.year) )
        .y( d => yAxis(d.relative_salary));

    var line3 = d3.line()
        .x( d => xAxis(d.x) )
        .y( d => yAxis(d.y) );

    svg.append("path")
        .datum(combinedSalaryCPI)        
        .attr("d", line)
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", 3);

    svg.append("path")
        .datum(combinedSalaryCPI)
        .attr("d", line2)
        .attr("fill", "none")
        .attr("stroke", "green")
        .attr("stroke-width", 3);

    /* Draw the dotted grey baseline */
    svg.append("path")
        .datum([{ x: 1985, y: 1.0},{ x: 2016, y: 1.0 }])
        .attr("d", line3)
        .attr("fill", "none")
        .attr("stroke", "grey")
        .attr("stroke-width", 3)
        .attr("stroke-dasharray", "5,5");
        
    /* Highlight a specific year and annotate it */
    function updateSelection(selectedPoint) {    
        var t = combinedSalaryCPI[selectedPoint - 1981];
        var subset = [
            {x: selectedPoint,
            y: 1.0,
            type: "baseline"},
            
            {x: selectedPoint,
            y: t.relative_cpi,
            type: "cpi_rel"},

            {x: selectedPoint,
            y: t.relative_salary,
            type: "salary_rel"}
        ]
        svg.selectAll("circle.selection")
            .data(subset)
            .join(
                enter => enter.append("circle")
                    .attr("class", "selection")
                    .attr("fill", "none")
                    .attr("stroke-width", 3))
            .attr("cx", d => xAxis(d.x))
            .attr("cy", d => yAxis(d.y))
            .attr("r", width / 100)
            .attr("stroke", 
                function(d) {
                    if (d.type == "baseline") return "grey";
                    else if (d.type == "cpi_rel") return "black";
                    else if (d.type == "salary_rel") return "green";
                })
        
        svg.selectAll("path.selection")
            .data([0])
            .join(
                enter => enter.append("path")
            )
            .datum(subset)
            .attr("class", "selection")
            .attr("d", line3)
            .attr("fill", "none")
            .attr("stroke", "grey")
            .attr("stroke-width", 3)
            .attr("stroke-dasharray", "1,5");

        var table = d3.select("#cpiannotate");

        table.selectAll("table.selection")
            .data([0])
            .join(
                enter => enter.append("table")
                    .attr("class", "selection")
                    .attr("align", "center")
            );

        var header = table.selectAll("thead")
            .data([0])
            .join(
                enter => enter.append("thead").append("tr")
            );
        header.selectAll("th")
            .data(["Year", "CPI", "Salary"])
            .join(
                enter => enter.append("th")
                    .text( d=> d )
            );

        var tablebody = table.selectAll("tbody")
            .data([0])
            .join(
                enter => enter.append("tbody")
            );

        var rows = tablebody.selectAll("tr")
                .data([
                    combinedSalaryCPI[1985 - 1981],
                    combinedSalaryCPI[selectedPoint - 1981]
                ])
                .join(
                    enter => enter.append("tr")
                );
        var cells = rows.selectAll("td")
                .data(function(d) {
                    return [d.year, d.cpi.toFixed(1).toString(), numberWithCommas(d.salary)];
                })
                .join(
                    enter => enter.append("td")
                        .attr("align", "right")
                )
                .text(d => d);

        var footer = table.selectAll("tfoot")
            .data([0])
            .join(
                enter => enter.append("tfoot").append("tr")
            );
        footer.selectAll("td")
                .data(["relative growth", t.relative_cpi.toFixed(2), t.relative_salary.toFixed(2)])
                .join(
                    enter => enter.append("td")
                        .attr("align", "right")
                )
                .text( d => d );                
    }

    currentSelection = 2015;
    updateSelection(currentSelection);

    svg.append('rect') // append a rect to catch mouse movements on canvas
        .attr('width', width) // can't catch mouse events on a g element
        .attr('height', height)
        .attr('fill', 'none')
        .attr('pointer-events', 'all')
        .on('mousemove', function() { // mouse moving over canvas
            var mouse = d3.mouse(this);                        
            var xYear = Math.floor(xAxis.invert(mouse[0]));                        
            if (xYear < 1981) xYear = 1981;
            if (xYear > 2016) xYear = 2016;
            if (xYear != currentSelection) {
                updateSelection(xYear);
                currentSelection = xYear;
            }
        });

    svg.append("text")
        .attr("x", xAxis(1996))
        .attr("y", yAxis(1) + 15)
        .text("1985 Baseline")
        .attr("fill", "#888888");

    /* Because both the CPI and baseball curves are increasing
        *  prettty drasitcally and monotonically, I thought it'd be
        *  cool to draw the labels mimicking their rough rate of growth.
        *  All this code does is figure out what angle to draw the text
        *   at and then draws it.
        */
    var s = combinedSalaryCPI[1996 - 1981];
    var t = combinedSalaryCPI[2003 - 1981];
    var cpi_angle = calcAngle([xAxis(s.year), xAxis(t.year),
        yAxis(s.relative_cpi), yAxis(t.relative_cpi)]);
    var baseball_angle = calcAngle([xAxis(s.year), xAxis(t.year),
        yAxis(s.relative_salary), yAxis(t.relative_salary)]);
    svg.append("text")
        .attr("x", xAxis(s.year))
        .attr("y", yAxis(s.relative_cpi) - 10)
        .text("Consumer Price Index")
        .attr("transform", "rotate(" + cpi_angle + " " + xAxis(s.year) + "," + yAxis(s.relative_cpi) + ")");

    svg.append("text")
        .attr("x", xAxis(s.year))
        .attr("y", yAxis(s.relative_salary) - 10)
        .text("Baseball Salaries")
        .attr("fill", "green")
        .attr("transform", "rotate(" + baseball_angle + " " + xAxis(s.year) + "," + yAxis(s.relative_salary) + ")");

    /* Add axis labels */
    svg.append("g")
        .attr("transform", "translate(0,"  + (height - margin.bottom - margin.top) + ")")
        .call(d3.axisBottom().scale(xAxis).tickFormat(d => d.toString()));
    svg.append("g")
        .call(d3.axisLeft().scale(yAxis));

    /* Add an explanation of the yAxis */
    svg.append("text")
        .attr("x", margin.left)
        .attr("y", margin.top)
        .text("Relative Growth from 1985 level")
        .attr("transform", "rotate(90 " + margin.left + "," + margin.right + ")");
        ;

    return svg;
}