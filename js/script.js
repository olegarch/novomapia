/* Author:

*/

Novomap = function()
{
}

$(function() {

    $('.dropdown-toggle').dropdown();


    var w = 1000,
    h = 500,
    maxVotes = 0,
    minVotes = 10000000.,
    maxComments = 0,
    minComments = 1000000.,
    votes_range = [];


    //color = d3.scale.category20();
    //color = d3.interpolateRgb("#fff", "#c09");

    var startColor = '#FFFFB2';
    var endColor = '#E31A1C';

    var color = d3.scale.linear()
    .domain([0, 1])
    .range([startColor, endColor]);
    var colormap=color;

    function resetColor()
    {
        d3.scale.linear()
        .domain([0, 1])
        .range([startColor, endColor]);
    }
    
    d3.select("body").transition()
    .duration(1000)
    .style("background-color", "black");

    var div = d3.select("#chart").append("div")
    .style("position", "absolute")
    .style("width", "100%")
    .style("height", "100%")
    .style("margin", "0px")
    .style("padding", "0px")
    .style("border", "2px");
    //.style

    var wi = div.style("width");
    wi = wi.substring(0,wi.length-2);
    var he = div.style("height");
    he = he.substring(0,he.length-2);

    var colorFunction = function(d)
    {
        if(d.children!=null)
        {
            maxVotes = d.maxVotes;
            maxComments = d.maxComments;
        }
        if(minComments > (d.rawcomments) )
        {
            minComments = (d.rawcomments);
        }
        if(minVotes > (d.rawvotes))
        {
            minVotes = (d.rawvotes);
        }
        return d.children ? null : colormap(0.5);
    };
    var sizeFunction = function(d){
        return (d.rawvotes+d.rawcomments)/(26-d.rawindex);
        //return d.votes;
    };
    var sortFunction = function(a,b)
    {
        return sizeFunction(a)-sizeFunction(b);
    };

    var treemap = d3.layout.treemap()
    .size([wi, he])
    .ratio(1.0)
    .sticky(false)
    //    .padding([5, 5, 5, 5])
    .sort(sortFunction)
    .value(sizeFunction/*function(d){ return d.index;}*/);
    //.value(function(d) { return d.rawindex; });

    $('<div />', {'id': 'div-resizer', 'class': 'cell'}).hide().appendTo(document.body);
    $('#div-resizer').append('<a id="a-resizer" class="newslink"></a>');

    $.fn.hasOverflow = function() {
        var $this = $(this);
        var $children = $this.find('*');
        var len = $children.length;

        if (len) {
            var maxWidth = 0;
            var maxHeight = 0
            $children.map(function(){
                maxWidth = Math.max(maxWidth, $(this).outerWidth(true));
                maxHeight = Math.max(maxHeight, $(this).outerHeight(true));
            });

            return maxWidth > $this.width() || maxHeight > $this.height();
        }

        return false;
    };

    $.fn.hasOverflow3 = function() {
        //$('.newslink').css('display','inline');
        var $this = $(this);
        var $children = $this.find('*');
        var len = $children.length;
        var result;
        var ratio=1.;
        if (len) {
            var maxWidth = 0;
            var maxHeight = 0
            $children.map(function(){
                maxWidth = Math.max(maxWidth, $(this).outerWidth(true));
                maxHeight = Math.max(maxHeight, $(this).outerHeight(true));
            });
            //console.log('width = ' +$this.width());
            //console.log('maxWidth = ' +maxWidth);
            //$("#myDiv").css({'position':'static','visibility':'visible','display':'none'});
            var wr = maxWidth/$this.width();
            var hr = maxHeight/$this.height();
            //console.log(wr+' '+hr);
            //result =  (maxWidth > $this.width() || maxHeight > $this.height());
        }
        ratio=Math.max(wr,hr);
        if(ratio>1.)
        return ratio;
        else
        return 1.;

        //$('.newslink').css('display','inline-block');        
    };

    var iter_1=[];
    var iter_2=[];

    function autofit(d,i)
    {
        //    if(i!=1) return;
        iter_2[i]=0;    
        //$('.newslink').css('display','inline');
        var elm = $(this);
        elm.css("font-size","100px");
        while(elm.hasOverflow()){
            var size = parseFloat(elm.css('font-size'), 10);
            size -= 1;
            elm.css('font-size', size + 'px');
            iter_2[i]+=1;
        }    
        //console.log('2. w:'+ elm.width() + ' h:'+elm.height()+' sz:'+elm.css('font-size')+'('+elm.text()+')');
        //$('.newslink').css('display','inline-block');
        //if(iter_1[i]!=iter_2[i]) console.log('1: (' +i+')'+iter_1[i]+' 2: '+iter_2[i]);
    }


    function calculateTargetFontSize(d,i)
    {
        //if(i<1) return;
        //$('.newslink').css('display','inline');

        var elm = $(this);    
        var resizer = $('#div-resizer');
        var hhh = $('#hhh');
        
        resizer.width( d.dx-1 );
        resizer.height( d.dy-1 );
        resizer.css('font-size','100px');
        $('#a-resizer').html( elm.text() );
        resizer.addClass('temp-show');
        iter_1[i] = 0;
        var ratio=1.;
        d.fontsize=100.;
        while( (ratio=resizer.hasOverflow3())!=1 ){
            //    while( resizer.hasOverflow() ){
            //size = parseFloat(resizer.css('font-size'), 10000);
            d.fontsize /= Math.sqrt(ratio);
            //d.fontsize -= 1;
            resizer.css('font-size', d.fontsize + 'px');
            iter_1[i]+=1;
            //if(iter>40) break;
        }
        //console.log('1. w:'+ resizer.width() + ' h:'+resizer.height()+' sz:'+resizer.css('font-size')+'('+resizer.text()+')');
        resizer.removeClass('temp-show');
        //$('.newslink').css('display','inline-block');
    }

    $(window).resize(redraw);

    function redraw()
    {      
        $('.cell').popover("hide");
        var wi = div.style("width");
        wi = wi.substring(0,wi.length-2);
        var he = div.style("height");
        he = he.substring(0,he.length-2);
        treemap.size([wi-1,he-1]);

        div.selectAll("div")
        .data( treemap, function(d){ return d.link; } )
        .each(calculateTargetFontSize)
        .transition()
        .style('font-size', function(d){ return d.fontsize+'px'; })
        .duration(100)
        //      .each("end",autofit)
        //.each("end",function(){console.log("==================")})
        .call(cell);
        
    };

    function resize()
    {
        treemap.value(sizeFunction);
        div.selectAll("div")
        .data(treemap,function(d){ return d.link; })
        .each(calculateTargetFontSize)
        .transition()
        .style('font-size', function(d){ return d.fontsize+'px'; })
        .duration(1500)
        .call(cell);
    }

    function recolor()
    {
        color = d3.scale.linear()
        .domain([0, 1])
        .range(["yellowgreen", "forestgreen"]);
        
        div.selectAll("div")
        .data(treemap.nodes,function(d){ return d.link; })
        //.each(calculateTargetFontSize)
        .transition()
        //.style('font-size', function(d){ return d.fontsize+'px'; })
        .style('background-color', colorFunction)
        .duration(1500)
        .call(cell);
    }

    function resort()
    {
        treemap.sort(sortFunction);
        div.selectAll("div")
        .data(treemap.nodes,function(d){ return d.link; })
        .each(calculateTargetFontSize)
        //.each(calculateTargetFontSize)
        .transition()
        .style('font-size', function(d){ return d.fontsize+'px'; })
        // .style('background-color', colorFunction)
        .duration(1500)
        .call(cell);
    }

    function popularityFunction(d)
    {
        var p = 0;
        //console.log( $('#input-popularity').val() );
        if($('#input-popularity').val().length > 0 )
        {
            //console.log( d );
            p = eval( $('#input-popularity').val() );
        }
        else
        p = (d.votes + d.comments)/2.;
        //console.log( p + ' ('+d.votes+','+d.comments+') :'+d.title);
        return p;
    }

    var minUserColorValue = 10000000.;
    var maxUserColorValue = 0.;
    function calcUserColor(d)
    {
        if($('#input-color').length>0 && $('#input-color').val().length > 0 )
        {
            p = eval( $('#input-color').val() );
            //console.log( color(p) );
        }
        else
        {
            p = Math.log(d.rawvotes+d.rawcomments);
        }
        d.userColorValue = p;
        if(p>maxUserColorValue)
        maxUserColorValue=p;
        if(p<minUserColorValue)
        minUserColorValue=p;
    }
    function calcUserColorMap()
    {
        if($('#input-color-start').length>0 &&  $('#input-color-start').val().length > 0 )
        startColor = $('#input-color-start').val();
        if($('#input-color-end').length>0 && $('#input-color-end').val().length > 0 )
        endColor = $('#input-color-end').val();
        
        colormap = d3.scale.linear()
        .domain([minUserColorValue, maxUserColorValue])
        .range([startColor, endColor]);
    }

    function colorUserFunction(d)
    {
        //console.log(d.userColorValue);
        return colormap(d.userColorValue);
    }

    function colorVotesCommentsFunction(d)
    {
        
        var _min = minComments + minVotes;
        var _max = maxComments + maxVotes; 
        console.log('min='+_min+' max='+_max);
        color = d3.scale.linear()
        .domain([_min, _max])
        .range(["yellow", "forestgreen"]);

        console.log(d);
        console.log('value='+( d.rawcomments + d.rawvotes )+' color='+color( d.rawcomments + d.rawvotes ));
        
        
        return color( d.rawcomments + d.rawvotes );
    }

    d3.json("http://novomapia.com/news2ru/json/", function(json) {
        //d3.json("file:///C:/aptana2ws/news2map/news2ru.json", function(json) {
        
        var wi = div.style("width");
        wi = wi.substring(0,wi.length-2);
        var he = div.style("height");
        he = he.substring(0,he.length-2);
        treemap.size([wi-1,he-1]);
        
        div.data([json]).selectAll("div")
        .data(treemap.nodes,function(d){ return d.link; })
        .enter().append("div")
        .attr("class", "cell")
        //.style('background-color',"yellow")
        //.style('background-color', function(d,i) { console.log(i+': '+d.rawindex+' : '+color(d.rawindex)); return d.children ? null : color(d.rawindex); })
        .style('background-color', colorFunction )
        .html(function(d) { return d.children ? null : '<a class="newslink" href="'+d.link+'">'+d.title+'</a>'; })
        .attr("title", function(d) { return d.title; })
        .attr("data-content", function(d) { return d.img+'<span>'+d.description+'</span>'; })
        .call(cell)
        .each(autofit);

        
        minUserColorValue = 10000000.;
        maxUserColorValue = 0.;
        div.selectAll("div")
        .each(calcUserColor);
        calcUserColorMap();
        colorFunction = function(d) { return d.children ? null : colorUserFunction(d); }; 
        recolor();

        //.each(function(d) {
        //	$(this).popover({
        
        
        $('.cell').popover({
title: 'tooltip',
content: '<h1>content</h1>',
delay: { show: 500, hide: 100 },
placement: function(e,f,g) {
                var 
                wh = $(window).height(),
                ww = $(window).width(),
                o = $(f).offset(),
                oh = $(f).height(),
                ow = $(f).width(),
                r1 = 2.*o.left/ww,
                r2 = 2.*o.top/wh,
                fp = $(f).position();
                //console.log('t:'+fp.top+'l:'+fp.left+' ww/2: '+ww/2.+' wh/2: '+wh/2.+' o.left:'+o.left + ' o.top:'+o.top);
                if(fp.left==0) return 'right';
                if(fp.top==0) return 'bottom';
                if(o.top>wh/2.) return 'top';
                if(o.left>ww/2.) return 'left'; 
                //if(b==0) return 'top'; 
                return 'right';
            },
        }
        );
        

        /*d3.select("#relevance-link").on("click", function() {

        d3.select("#relevance-link").classed("active", true);
        d3.select("#comments-link").classed("active", false);
        
        div.selectAll("div")
        .data(treemap,function(d){ return d.id; })
        .each(calculateTargetFontSize)
        .transition()
        .style('font-size', function(d){ return d.fontsize+'px'; })
        .style('background-color', function(d) { return d.children ? null : color(d.ncom); })
        .duration(1500)
        .call(cell);
    });*/

        d3.select("#menu-size-popularity").on("click", function() {
            sizeFunction = popularityFunction; 
            resize();
        });

        d3.select("#menu-size-index").on("click", function() {
            sizeFunction = function(d) { return d.index; }; 
            resize();
        });

        d3.select("#menu-size-votes").on("click", function() {
            sizeFunction = function(d) { return d.votes; }; 
            resize();
        });
        d3.select("#menu-size-comments").on("click", function() {
            sizeFunction = function(d) { return d.comments; }; 
            resize();
        });

        d3.select("#menu-color-popularity").on("click", function() {
            resetColor();
            colorFunction = function(d) { return d.children ? null : color(popularityFunction(d)); }; 
            recolor();
        });
        
        d3.select("#menu-color-index").on("click", function() {
            resetColor();
            colorFunction = function(d) { return d.children ? null : color(d.index); }; 
            recolor();
        });
        d3.select("#menu-color-votes").on("click", function() {
            resetColor();
            colorFunction = function(d) { return d.children ? null : color(d.votes); }; 
            recolor();
        });
        d3.select("#menu-color-comments").on("click", function() {
            resetColor();
            colorFunction = function(d) { return d.children ? null : color(d.comments); }; 
            recolor();
        });
        d3.select("#menu-color-user").on("click", function() {
            //resetColor();
            minUserColorValue = 10000000.;
            maxUserColorValue = 0.;
            div.selectAll("div")
            .each(calcUserColor);
            calcUserColorMap();
            colorFunction = function(d) { return d.children ? null : colorUserFunction(d); }; 
            recolor();
        });

        d3.select("#menu-color-votescomments").on("click", function() {
            resetColor();
            colorFunction = function(d) { return d.children ? null : colorVotesCommentsFunction(d); }; 
            recolor();
        });

        d3.select("#menu-sort-popularity").on("click", function() {
            sortFunction = function(a,b) { return popularityFunction(a)-popularityFunction(b); }; 
            resort();
        });

        d3.select("#menu-sort-index").on("click", function() {
            sortFunction = function(a,b) { return a.index-b.index; }; 
            resort();
        });
        d3.select("#menu-sort-votes").on("click", function() {
            sortFunction = function(a,b) { return a.votes-b.votes; }; 
            resort();
        });
        d3.select("#menu-sort-comments").on("click", function() {
            sortFunction = function(a,b) { return a.comments - b.comments; }; 
            resort();
        });  

        /*d3.select("#comments-link").on("click", function() {

        d3.select("#relevance-link").classed("active", false);
        d3.select("#comments-link").classed("active", true);

        div.selectAll("div")
        .data(treemap,function(d){ return d.link; })
        .each(calculateTargetFontSize)
        .style('background-color', function(d) { return d.children ? null : color(d.ncom); })
        .transition()
        .style('font-size', function(d){ return d.fontsize+'px'; })
        .style('background-color', function(d) { return d.children ? null : color(d.size); })
        .duration(1500)
        .call(cell);
    });*/

        var nodes = treemap.nodes(json);
    });

    function cell() {
        this
        .style("left", function(d) { return d.x + "px"; })
        .style("top", function(d) { return d.y + "px"; })
        .style("width", function(d) { return d.dx - 1 + "px"; })
        .style("height", function(d) { return d.dy - 1 + "px"; });
    }

});