class DriveDoc{
    constructor() {
        this.loadingSpin = document.getElementById("loading-spinner")
        this.toggle = document.getElementById("toggle-label")
        this.toggle.style.visibility ="hidden"
        this.toggleCheckbox = document.getElementById("toggle-checkbox")
        this.toggleCheckbox.onchange = function (){
            if (this.checked){
                console.log("TOGGLE CHECKED")
                document.getElementById("svgmy-chart-without-exog").style.visibility = "hidden"
                document.getElementById("svgmy-chart-with-exog").style.visibility = "visible"
            }else {
                console.log("TOGGLE CHECKED")
                document.getElementById("svgmy-chart-without-exog").style.visibility = "visible"
                document.getElementById("svgmy-chart-with-exog").style.visibility = "hidden"
            }
        }
        document.getElementById("chart").innerHTML = ""
        this.loadingSpin.style.visibility = "visible"
        document.cryptoCurrency = document.getElementById("crypto-cur")
        this.cryptoCurrency = document.cryptoCurrency.options[document.cryptoCurrency.selectedIndex].text
        document.days_limit = document.getElementById("days-limit")
        document.daysPredict = document.getElementById("days-predict")
        this.days_limit = document.days_limit.value
        this.days_predict = document.daysPredict.value
        this.prepareData()
    }
    draw(data,id){
        this.toggle.style.visibility ="visible"
        let text = ""
        if (id === "my-chart-without-exog"){
            text = "Графік без використання зовнішніх факторів"
        }
        if (id === "my-chart-with-exog"){
            text = "Графік з використанням зовнішніх факторів"
        }
        this.loadingSpin.style.visibility = "hidden"
        let margin = {top: 10, right: 30, bottom: 30, left: 60},
        width = 700 - margin.left - margin.right,
        height = 400 - margin.top - margin.bottom;
        let dates = data.forEach(function (d){
            return d.date
        })
        console.log(dates)
        // append the svg object to the body of the page
        let svg = d3.select("#chart")
          .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .attr("id","svg"+id)
          .append("g")
            .attr("transform",
                  "translate(" + margin.left + "," + margin.top + ")");
        document.getElementById("svgmy-chart-without-exog").style.visibility = "visible"
        svg.append("text")
        .attr("x", (width / 2))
        .attr("y", 5)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("text-decoration", "underline")
        .text(text);

        let x = d3.scaleTime()
          .domain(d3.extent(data, function(d) { return d.date; }))
          .range([ 0, width ]);
        let xAxis = svg.append("g")
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(x));

        // Add Y axis
        let y = d3.scaleLinear()
          .domain([ d3.min(data, function(d) { return +d.price; }), d3.max(data, function(d) { return +d.price; })])
          .range([ height, 0 ]);
        let yAxis = svg.append("g")
          .call(d3.axisLeft(y));
        var brush = d3.brushX()                   // Add the brush feature using the d3.brush function
        .extent( [ [0,0], [width,height] ] )  // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
        .on("end", updateChart)

        svg.append("g")
            .attr("class","brush")
            .call(brush)

        // Add the line
        svg.append("path")
          .datum(data)
          .attr("fill", "none")
          .attr("class", "line")
          .attr("stroke", "steelblue")
          .attr("stroke-width", 1.5)
          .attr("d", d3.line()
            .x(function(d) { return x(d.date) })
            .y(function(d) { return y(d.price) })
            )
        svg.append('g')
            .selectAll("dot")
            .data(data)
            .enter()
            .append("circle")
              .attr("class","dot")
              .style("fill", "steelblue" )
              .attr("cx", function (d) { return x(d.date); } )
              .attr("cy", function (d) { return y(d.price); } )
              .attr("r", 5)
        var idleTimeout
        function idled() { idleTimeout = null; }
        function updateChart() {
            let extent = d3.event.selection
            console.log(!extent)
            if(!extent){
              if (!idleTimeout) return idleTimeout = setTimeout(idled, 350);
              x.domain(d3.extent(data, function(d) { return d.date; }))
            }else{
                console.log(extent)
              x.domain([ x.invert(extent[0]), x.invert(extent[1]) ])
              svg.select(".brush").call(brush.move, null) // This remove the grey brush area as soon as the selection has been done
            }

            // Update axis and line position
            xAxis.transition().duration(1000).call(d3.axisBottom(x))
            svg
                .select('.line')
                .transition()
                .duration(1000)
                .attr("d", d3.line()
                  .x(function(d) { return x(d.date) })
                  .y(function(d) { return y(d.price) })
                )
            svg
                .selectAll('.dot')
                .transition().duration(1000)
                      .attr("cx", function (d) { return x(d.date); } )
                      .attr("cy", function (d) { return y(d.price); } )
        }
    }
    prepareData(){
        if (this.cryptoCurrency === "Select crypto currency"){
            document.cryptoCurrency.style.borderColor = "red"
        }else{
            if (this.days_limit === ''){
                document.cryptoCurrency.style.borderColor = "#ccc"
                document.days_limit.style.borderColor = "red"
            }
            else{
                if (this.days_predict === ''){
                    document.cryptoCurrency.style.borderColor = "#ccc"
                    document.days_limit.style.borderColor = "#ccc"
                    document.daysPredict.style.borderColor = "red"
                }else{
                document.cryptoCurrency.style.borderColor = "#ccc"
                document.days_limit.style.borderColor = "#ccc"
                document.daysPredict.style.borderColor = "#ccc"
                const data = {
                    Currency: this.cryptoCurrency,
                    days_limit: this.days_limit,
                    days_predict : this.days_predict
                }
                const options = {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify(data)
                };
                fetch("/get_data", options)
                  .then(response => {
                    if (response.ok) {
                      return response.json();
                    }
                    throw new Error("Network response was not ok.");
                  })
                  .then(data => {
                      console.log(data)
                      this.draw(data["values"],"my-chart-without-exog")
                      this.draw(data["values_with_factors"],"my-chart-with-exog")
                    // обробка відповіді від сервера
                  })
                  .catch(error => {
                    console.error("There was a problem with the fetch operation:", error);
                    });
                }
            }
        }

    }
}
