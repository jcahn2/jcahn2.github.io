function chart(container, data){
    ticker = data
                
    // Declare the chart dimensions and margins.
    const width = 1000;
    const height = 600;
    const marginTop = 20;
    const marginRight = 30;
    const marginBottom = 60;
    const marginLeft = 40;

    // Declare the positional encodings.
    // const x = d3.scaleBand()
    //         .domain(d3.utcDay
    //             .range(ticker.at(0).Date, +ticker.at(-1).Date + 1)
    //             .filter(d => d.getUTCDay() !== 0 && d.getUTCDay() !== 6))
    //         .range([marginLeft, width - marginRight])
    //         .padding(0.2);
    const x = d3.scaleUtc()
            .domain(d3.extent(ticker, d => d3.utcDay(d.Date)))
            .range([marginLeft, width - marginRight]);

    const y = d3.scaleLog()
        .domain([d3.min(ticker, d => d.Low), d3.max(ticker, d => d.High)])
        .rangeRound([height - marginBottom, marginTop]);

    // Create the SVG container.
    const svg = d3.select(container).append("svg")
        .attr("viewBox", [0, 0, width, height]);

    // Append the axes.
    svg.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(d3.axisBottom(x)
        .tickValues(d3.utcMonday
            .every(width > 720 ? 1 : 2)
            .range(+ticker.at(0).Date - 1, ticker.at(-1).Date))
        .tickFormat(d3.utcFormat("%-m/%-d/%-Y")))
        .call(g => g.select(".domain").remove())
        .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(-65)");

    svg.append("g")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(d3.axisLeft(y)
            .tickFormat(d3.format("$~f"))
            .tickValues(d3.scaleLinear().domain(y.domain()).ticks()))
        .call(g => g.selectAll(".tick line").clone()
            .attr("stroke-opacity", 0.2)
            .attr("x2", (width - marginLeft - marginRight)))
        .call(g => g.select(".domain").remove());

    
    // Create a group for each day of data
    const g = svg.append("g")
            .attr("stroke-linecap", "round")
            .attr("stroke", "black")
        .selectAll("g")
        .data(ticker)
        .join("g")
            .attr("transform", d => `translate(${x(d3.utcDay(d.Date))},0)`);

    // Append a title (tooltip).
    const formatDate = d3.utcFormat("%B %-d, %Y");
    const formatValue = d3.format(".2f");
    const formatChange = ((f) => (y0, y1) => f((y1 - y0) / y0))(d3.format("+.2%"));

    // tooltip definition
    var Tooltip = d3.select("#tooltip")
                        .style("opacity", 0)
                        .style("position", "absolute")
                        .style("border", "solid")
                        .style("border-width", "2px")
                        .style("border-radius", "3px")
                        .style("padding", "5px");

    // append lines to chart
    g.append("line")
        .attr("y1", d => y(d.Low))
        .attr("y2", d => y(d.High));

    g.append("line")
        .data(ticker)
        .attr("y1", d => y(d.Open))
        .attr("y2", d => y(d.Close))
        .attr("stroke-width", 5)
        .attr("stroke", d => d.Open > d.Close ? d3.schemeSet1[0]
            : d.Close > d.Open ? d3.schemeSet1[2]
            : d3.schemeSet1[8])
        .on("mouseover", function(d){
            Tooltip.style("opacity",1)
        })
        .on("mousemove", function(d){
            Tooltip.html(`${formatDate(d.Date)}
            Open: ${formatValue(d.Open)}
            Close: ${formatValue(d.Close)} (${formatChange(d.Open, d.Close)})
            Low: ${formatValue(d.Low)}
            High: ${formatValue(d.High)}`);
            
            Tooltip
            .style("position", "absolute")
            .style("left", (d3.event.pageX + 50) + "px")
            .style("top", (d3.event.pageY) + "px")
        })
        .on("mouseleave", function(d){
            Tooltip.style("opacity",0)
        });
    
    // annotations
    const annotations = [
        {
            // 2008 recession event
            note: {
                label: "Here is the annotation label",
                title: "2008 Recession"
            },
            type: d3.annotationCalloutCircle,
            subject: {
                radius: 20,         // circle radius
                radiusPadding: 20   // white space around circle befor connector
            },
            color: ["red"],
            data: {Date: "09/29/2008", Close: 15.75},
            dy: -70,
            dx: 70
        },

            // 2015 stock market selloff
        {
            note: {
                label: "Here is the annotation label",
                title: "2015 Stock Market Selloff"
            },
            type: d3.annotationCalloutCircle,
            subject: {
                radius: 20,         // circle radius
                radiusPadding: 20   // white space around circle befor connector
            },
            color: ["red"],
            data: {Date: "08/24/2015", Close: 84.52},
            dy: 70,
            dx: 70
        },
        
            // 2018 cryptocurrency crash
        {
            note: {
                label: "Here is the annotation label",
                title: "2018 Cryptocurrency Crash"
            },
            type: d3.annotationCalloutCircle,
            subject: {
                radius: 20,         // circle radius
                radiusPadding: 20   // white space around circle befor connector
            },
            color: ["red"],
            data: {Date: "01/22/2018", Close: 165.00},
            dy: -100,
            dx: 40
        },

        // 2020 Coronavirus
        {
            note: {
                label: "Here is the annotation label",
                title: "2020 Coronavirus"
            },
            type: d3.annotationCalloutCircle,
            subject: {
                radius: 20,         // circle radius
                radiusPadding: 20   // white space around circle befor connector
            },
            color: ["red"],
            data: {Date: "02/20/2020", Close: 341.39},
            dy: 20,
            dx: 70
        },

            
    ]
    
    // Add annotation to the chart
    const makeAnnotations = d3.annotation()
        .type(d3.annotationLabel)
        .accessors({
            x: d => x(d3.timeParse("%m/%d/%Y")(d.Date)),
            y: d => y(d.Close)
        })
        .accessorsInverse({
            date: d => d3.timeFormat("%m/%d/%Y")(x.invert(d.x)),
            close: d => y.invert(d.y)
        })
        .annotations(annotations)
    d3.select("svg")
        .append("g")
        .call(makeAnnotations)
}



