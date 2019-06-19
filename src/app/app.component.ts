import { Component, AfterContentInit } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  g = 0;
  data = this.generateRandomNumber([], 30);
  margin = {
    top: 20,
    right: 20,
    bottom: 30,
    left: 50
  };
  width = 800 - this.margin.left - this.margin.right;
  height = 400 - this.margin.top - this.margin.bottom;

  xScale = d3.scaleLinear()
  .range([0, this.width])
  .domain(d3.extent(this.data, (d) => {
    return d.x;
  })).nice();

  yScale = d3.scaleLinear()
  .range([this.height, 0])
  .domain(d3.extent(this.data, (d) => {
    return d.y;
  })).nice();

  xAxis = d3.axisBottom(this.xScale);
  yAxis = d3.axisLeft(this.yScale);

  plotLine = d3.line()
  .curve(d3.curveMonotoneX)
  .x((d) => {
    return this.xScale(d.x);
  })
  .y((d) => {
    return this.yScale(d.y);
  });

  dataNest = d3.nest()
  .key( (d) => {
      return d.name;
  })
  .entries(this.data);

// 1. Add the SVG to the page and employ #2
svg = d3.select('body').append('svg')
.attr('width', this.width + this.margin.left + this.margin.right)
.attr('height', this.height + this.margin.top + this.margin.bottom);

v = this.svg.append('g')
.attr('class', 'x axis ')
.attr('id', 'axis--x')
.attr('transform', 'translate(' + this.margin.left + ',' + (this.height + this.margin.top) + ')')
.call(this.xAxis);

b = this.svg.append('g')
.attr('class', 'y axis')
.attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')')
.attr('id', 'axis--y')
.call(this.yAxis);

line = this.svg.append('g').attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

dot = this.svg.append('g')
    .attr('id', 'scatter')
    .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');


n = this.dataNest.forEach( (d, i) => {
  // Add line plot
   this.addLinePlot(d, i);
}); // End data nest loop

updateInterval = setInterval(() => {
        this.update();
      }, 1000);

/****************** Update Below **************************/


    update() {

      this.generateRandomNumber(this.data, 1);
      // Nest the entries by name
      this.dataNest = d3.nest()
      .key( (d) => {
          return d.name;
      })
      .entries(this.data);

      this.xScale.domain(d3.extent(this.data, (d) => {
        return d.x;
      })).nice();

      this.yScale.domain(d3.extent(this.data, (d) => {
        return d.y;
      })).nice();

      this.yAxis.scale(this.yScale);
      this.xAxis.scale(this.xScale);

      this.svg.transition().duration(1000).select('.y.axis').call(this.yAxis);
      this.svg.transition().duration(1000).select('.x.axis').call(this.xAxis);

      this.dataNest.forEach( (d, i) => {
    if ( d3.select('#line-' + i).empty()) {
            // Add line plot
            this.addLinePlot(d, i);
      } else {
          this.line.select('#line-' + i).select('path').data([d.values])
            .transition().duration(750)
            .attr('d', this.plotLine);

          // Update all circles
          this.dot.select('#scatter-' + i).selectAll('circle')
            .data(d.values)
            .transition()
            .duration(750)
            .attr('cx', (d) => {
              return this.xScale(d.x);
            })
            .attr('cy', (d) => {
              return this.yScale(d.y);
            })
            .attr('stroke', 'white')
            .attr('stroke-width', '2px')
            .style('fill',  '#ffab00');
          // Enter new circles
          this.dot.select('#scatter-' + i).selectAll('circle')
            .data(d.values)
            .enter()
            .append('circle')
              .attr('cx', (d) => {
                return this.xScale(d.x);
              })
              .attr('cy', (d) => {
                return this.yScale(d.y);
              })
              .attr('r', 5)
              .attr('stroke', 'white')
              .attr('stroke-width', '2px')
              .style('fill',  '#ffab00');

          // Remove old
          this.dot.select('#scatter-' + i).selectAll('circle')
            .data(d.values)
            .exit()
            .remove();
        }
    });

    }

    generateRandomNumber(data, samples) {
      for (let i = 0; i < samples; i++) {
        data.push({
          x: this.g,
          y: Math.sin(Math.random()),
          name: 'group-1'
        });
        this.g++;
      }
      data.sort((a, b) => {
        return a.x - b.x;
      });
      return data;
    }

    addLinePlot(d, i) {
      this.line.append('g')
      .attr('id', 'line-' + i)
      .attr('clip-path', 'url(#clip)')
      .append('path')
      .datum(d.values)
      .attr('class', 'pointlines')
      .attr('d', this.plotLine)
      .style('fill', 'none')
      .style('stroke',  '#ffab00');

      this.dot.append('g')
      .attr('id', 'scatter-' + i)
      .attr('clip-path', 'url(#clip)')
      .selectAll('.dot')
      .data(d.values)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('r', 5)
      .attr('cx', (d) => {
        return this.xScale(d.x);
      })
      .attr('cy', (d) => {
        return this.yScale(d.y);
      })
      .attr('stroke', 'white')
      .attr('stroke-width', '2px')
      .style('fill',  '#ffab00');
    }
}

