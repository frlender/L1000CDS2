Sigine.directive('sigineAngle',[function(){
  return {
    restrict:'AE',
    scope:{
      cosineDist:'='
    },
    link:function(scope,element,attrs){
      var width = 35,
          height = 36,
          radius = height*2.1/5,
          angle = Math.acos(1-scope.cosineDist);

      var upLine = d3.svg.line.radial()
              .radius(function(d,i){return i*radius})
              .angle(function(d){return Math.PI/2+d*angle/2});
      var dnLine =  d3.svg.line.radial()
              .radius(function(d,i){return i*radius})
              .angle(function(d){return Math.PI/2-d*angle/2});


              var svg = d3.select(element[0]).append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + width *0.2 + "," + height / 2 + ")");

  svg.append("svg:defs").selectAll("marker")
    .data(["end"])      // Different link/path types can be defined here
  .enter().append("svg:marker")    // This section adds in the arrows
    .attr("id", String)
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", radius/4)
    .attr("refY", 0)
    .attr("markerWidth", 3)
    .attr("markerHeight", 3)
    .attr("orient", "auto")
  .append("svg:path")
    .attr("d", "M0,-5L10,0L0,5");

      
      svg.append('path')
         .datum([0,1])
         .attr('class','sa-line')
         .attr("d",upLine)
         .attr("marker-end","url(#end)");
    svg.append('path')
         .datum([0,1])
         .attr('class','sa-line')
         .attr("d",dnLine)
         .attr("marker-end","url(#end)");
    }
  }
}])
.directive('sigineVenn',[function(){
  return {
    restrict:'AE',
    scope:{
      data:'='
    },
    link:function(scope,element,attrs){
      var chart = venn.VennDiagram()
      d3.select(element[0]).datum(scope.data).call(chart);
    }
  }
}]);