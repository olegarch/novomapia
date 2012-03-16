/* Author:

*/
function updateSourceCheckboxes()
{
    for(var i=0; i<currentPage.length; i++)
    {
        $('input[name="sources"][value="'+currentPage[i]+'"]').prop("checked",true);
        console.log('!!!! '+i);
    //do something by accessing valueArray[i];
    }
}

$(function(){
    $.blockUI.defaults.css = {}; 
    $("div#progress").hide();
    d3.select("body")
    //.transition()
    // .duration(1000)
    .style("background-color", "black");
    
/*    var menu = $('#src-menu > .dropdown-menu').find('*');
    menu.click(function(e) {
        e.stopPropagation();
    });
*/
    //$('.dropdown-toggle').dropdown();
    
    updateSourceCheckboxes();
});



$.fn.hasOverflow = function() 
{
    var $this = $(this),
    $children = $this.find('*'),
    len = $children.length;
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

$.fn.hasOverflow3 = function() 
{
    //$('.newslink').css('display','inline');
    var $this = $(this),
    $children = $this.find('*'),
    len = $children.length,
    result,
    ratio=1.,
    wr,
    hr;
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
        wr = maxWidth/$this.width();
        hr = maxHeight/$this.height();
        //console.log(wr+' '+hr);
        //result =  (maxWidth > $this.width() || maxHeight > $this.height());
    }
    ratio=Math.max(wr,hr);
    if(ratio>1.)
    return Math.sqrt(ratio);
    else
    return 1.;

    //$('.newslink').css('display','inline-block');        
};

var NM = (function($)
{
    var my = {},
    maxVotes = 0,
    minVotes = 10000000.,
    maxComments = 0,
    minComments = 1000000.,
    newsCount = 1,
    savedData,
    startColor = '#FFFFB2', //255,255,178
    endColor = '#E31A1C',   //227,26,28
    gradientColors = [],
    minUserColorValue = 10000000.,
    maxUserColorValue = 0., 
    colormap = d3.scale.linear()
               .domain([0, 1])
               .range([startColor, endColor]),
    treemap,
    div,
    url,
    timeoutId=null,
    colorFunction = function(d)
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
    },
    
    sizeFunction = function(d){
        return d.popularity;
    },
    
    sortFunction = function(a,b)
    {
        return sizeFunction(a)-sizeFunction(b);
    };    
    
    function cell() {
        this
        .style("left", function(d) { return d.x + "px"; })
        .style("top", function(d) { return d.y + "px"; })
        .style("width", function(d) { return d.dx - 1 + "px"; })
        .style("height", function(d) { return d.dy - 1 + "px"; });
    };
    
    function resetColor()
    {
        d3.scale.linear()
        .domain([0, 1])
        .range([startColor, endColor]);
    };
    
    function calculateTargetFontSize(d,i)
    {
        //if(i<1) return;
        //$('.newslink').css('display','inline');

        var elm = $(this),
        resizer = $('#div-resizer'),
        hhh = $('#hhh'),
        ratio = 1.,
        iter=0;
        
        resizer.width( d.dx-1 );
        resizer.height( d.dy-1 );
        resizer.css('font-size','120px');
        $('#a-resizer').html( elm.text() );
        resizer.addClass('temp-show');
        //if(i==38) console.log(i,": ",d.dx,d.dy,d.link);
        //iter_1[i] = 0;
        var ratio=1.;
        d.fontsize=120.;
        while( (ratio=resizer.hasOverflow3())!=1 ){
            //    while( resizer.hasOverflow() ){
            //size = parseFloat(resizer.css('font-size'), 10000);
            d.fontsize /= /*Math.sqrt*/(ratio);
            //d.fontsize -= 1;
            if(i==38)
            {
//                console.log(iter+': '+ratio+', '+d.area);
            }
            resizer.css('font-size', d.fontsize + 'px');
            //iter_1[i]+=1;
            //if(iter>5) break;
        }
        //if(i==38) console.log('1. w:'+ resizer.width() + ' h:'+resizer.height()+' sz:'+resizer.css('font-size')+'('+resizer.text()+')');
        resizer.removeClass('temp-show');
        //$('.newslink').css('display','inline-block');
    }
    
    my.redraw = function()
    {      
        /* $('.cell').popover("hide"); */
        
        var wi = div.style("width"),
            he = div.style("height");
        wi = wi.substring(0,wi.length-2);
        he = he.substring(0,he.length-2);
        
        dd = treemap.size();
//        console.log("old",dd[0],dd[1]);
//        console.log("new",wi-1,he-1);
                
//        console.log("redraw");
        
/*        if( (dd[0] == wi-1) && (dd[1] == he-1) )
        {
            return;
        }
*/
        treemap.size([wi-1,he-1]);
        
        div.selectAll("div")
        .data(treemap.nodes, function(d){ return d.id; })
        .each(calculateTargetFontSize)
        //.transition()
        .style('font-size', function(d){ return d.fontsize+'px'; })
        .style('background-color', function(d) { return d.children ? null : colormap(computeColor(d)); })
        //.duration(1000)
        .call(cell);
        
    };
    
    my.url = function(x) 
    {
        if (!arguments.length) return url;
        url = x;
    };

    function resize()
    {
        /*treemap.value(sizeFunction);
        div.selectAll("div")
        .data(treemap,function(d){ return d.link; })
        .each(calculateTargetFontSize)
        .transition()
        .style('font-size', function(d){ return d.fontsize+'px'; })
        .duration(1000)
        .call(cell);*/
    }

    function recolor()
    {
        var selection = div.selectAll("div");        
        //transition=
        selection
        //.data(treemap.nodes,function(d){ /*console.log(d);*/ return d.link; })
        //.each(calculateTargetFontSize)
        .transition()
        //.ease(d3.ease("elastic-in",5,.1))
        //.ease(d3.ease("cubic-in",3,.1))
        //.style('font-size', function(d){ return d.fontsize+'px'; })
        .style('background-color', colorFunction)
        .duration(3000)
    }

    function resort()
    {
        /*if(transition!=null)
        {
            console.log("resort(): transition is ongoing");
            transition.duration(0);
        }
        transition=
        treemap.sort(sortFunction);
        div.selectAll("div")
        .data(treemap.nodes,function(d){ return d.link; })
        .each(calculateTargetFontSize)
        //.each(calculateTargetFontSize)
        .transition()
        .style('font-size', function(d){ return d.fontsize+'px'; })
        // .style('background-color', colorFunction)
        .duration(1000)
        .each("end",function(){transition=null;})
        .call(cell);*/
    }

    function calcUserColor(d)
    {
        var p;
        if($('#input-color').length>0 && $('#input-color').val().length > 0 )
        {
            p = eval( $('#input-color').val() );
            //console.log( color(p) );
        }
        else
        {
            p = (d.rawvotes+d.rawcomments);
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
        //console.log('min='+_min+' max='+_max);
        color = d3.scale.linear()
        .domain([_min, _max])
        .range(["yellow", "forestgreen"]);

        //console.log(d);
        //console.log('value='+( d.rawcomments + d.rawvotes )+' color='+color( d.rawcomments + d.rawvotes ));
        
        
        return color( d.rawcomments + d.rawvotes );
    }
    
    function computeColor(d)
    {
        //console.log(d.title, Math.log(d.rawvotes+d.rawcomments));
        return d.socialactivity;
    }    
    
    my.update = function(params)
    {   
        params = params || {}

        if(timeoutId!=null)
        {
            clearTimeout(timeoutId);
            console.log("clearid="+timeoutId);
        }

        if(params.progress==undefined) 
            params.progress = true;
        
        if(params.deleteall==undefined) 
            params.deleteall = true;
        
        if(params.progress==true)
        {
            $.blockUI({ 
                message: $('#progress'), 
                css: { 
                    top:  ($(window).height() - 11) /2 + 'px', 
                    left: ($(window).width() - 43) /2 + 'px', 
                    width: '43px', 
                    height: '11px',
                    baseZ: 10000
                } 

            });
        }
        

        //console.log(params.url);
        
        if(params.url==undefined)
        {
            //console.log(1);
            NM.url("news2ru");
        }
        else
        {
            //console.log(2);
            NM.url(params.url);
        }
        
        //console.log(url);
        
        function func_helper(d)
        {
                if(d.children)
                {
                    return d3.extent(d.children.map(func_helper));
                }
                else
                {
                    return computeColor(d);
                }
        }
        
        function findMinMax2(d)
        {
            var result = d.children.map(func_helper);
            result=d3.extent(d3.merge(result));
            return result;
        }
    
        d3.text(url, "application/json", function(text) 
        {
            $.unblockUI();
            
            timeoutId = setTimeout( function() { NM.update({ url:NM.url(), progress:false }) },  120000);
            console.log("timerid="+timeoutId);
            
            //console.log( new Date().getTime()/1000. );
            console.log( new Date().toUTCString() );
            
            if(savedData==text)
            {
                console.log("the same...");
                return;
            }
            else
            {
                console.log("something changed");
//                console.log(savedData,json);
                savedData=text;
            }

            var json = text ? JSON.parse(text) : null;
            
            newsCount = json.children.length;         
            
            var wi = div.style("width");
            wi = wi.substring(0,wi.length-2);
            var he = div.style("height");
            he = he.substring(0,he.length-2);
            treemap.size([wi-1,he-1]);
                         
            extent = findMinMax2(json);
            minUserColorValue = extent[0];
            maxUserColorValue = extent[1];
            
            console.log( "min", minUserColorValue);
            console.log( "max", maxUserColorValue);
            
            colormap = d3.scale.linear()
            .domain([minUserColorValue, maxUserColorValue])
            .range([gradientColors[0][0], gradientColors[0][1]]);
            
            if(params.deleteall)
                div.selectAll("div").remove();
            
            var selection = 
            div
            .data([json])
            .selectAll("div")
            .data(treemap.nodes, function(d){ return +d.id; });
            
            selection
            .each(calculateTargetFontSize)
            .transition()
            .duration(1000)
            .style('font-size', function(d){ return d.fontsize+'px'; })
            .style('background-color', function(d) { return d.children ? null : colormap(computeColor(d)); } )
            .call(cell);

            selection
            .enter()
            .append("div")
            .attr("class", "cell")
            .html(function(d) { return d.children ? null : '<a class="newslink" href="'+d.link+'">'+d.title+'</a>'; })
            .attr("title", function(d) { return d.title; })
            .attr("data-content", function(d) { return d.img+'<span>'+d.description+'</span>'; })
            .call(cell)
            .each(calculateTargetFontSize)
            .style('font-size', function(d){ return d.fontsize+'px'; });

            if(params.colordelay == undefined)
            {
                selection
                .style('background-color', function(d) { return d.children ? null : colormap(computeColor(d)); }  )
            }
            else
            {              
                selection
                .style('background-color', function(d) { return d.children ? null : colormap(colormap.domain()[0]+(colormap.domain()[1]-colormap.domain()[0])/2); }  )
                
                selection
                .transition()
                .duration(+params.colordelay)
                .style('background-color', function(d) { return d.children ? null : colormap(computeColor(d)); }  )
            }
            
            selection
            .exit().remove();
            /*.transition()
            .duration(1000)
            //.style('background-color', 'transparent')
            //.each( function(d) { console.log("removing:"+d.title);  } )
            .each( function(d,i) { d.dx=1; d.dy=1; d.value = 1; d.fontsize = 1; d.size = 1; } )
            //.style('font-size', function(d){ return d.fontsize+'px'; })
            //.call(cell)
            .remove();
            */

            //setTimeout( function() { NM.update("news2ru.json") }, 5000);
        });
    }
    
    function hueShift(hsl,shift)
    {
        hsl.h += shift;
        return hsl;
    }
    
    my.init = function(params)
    {
        //console.log("NM.init");
        $(window).resize(NM.redraw);          

        var hslStart = d3.hsl(startColor);
        var hslEnd   = d3.hsl(endColor);
        
        for(var i=0;i<5;i++)
        {
            gradientColors[i] = [];
            gradientColors[i][0] = hueShift(d3.hsl(startColor),i*50);
            gradientColors[i][1] = hueShift(d3.hsl(endColor),i*50);
        }
        
        div = d3.select("#chart").append("div")
        .style("position", "absolute")
        .style("width", "100%")
        .style("height", "100%")
        .style("margin", "0px")
        .style("padding", "0px")
        .style("border", "2px");    
        
        var wi = div.style("width");
        wi = wi.substring(0,wi.length-2);
        var he = div.style("height");
        he = he.substring(0,he.length-2); 

        treemap =   d3.layout.treemap()
                        .size([wi-1, he-1])
                        .ratio(1.0)
                        .sticky(false)
                        .sort(sortFunction)
                        .value(sizeFunction)
                        .padding(0);

        $('<div />', {'id': 'div-resizer', 'class': 'cell'}).hide().appendTo(document.body);
        $('#div-resizer').append('<a id="a-resizer" class="newslink"></a>');

        this.update( params );        
    };
    
    return my;
}(jQuery));

$(function(){
    
    $(".nav li").removeClass("active");
       
    if(currentPage=="help")
    {
        $("#help-menu").addClass("active");
    }

    console.log(currentPage);
    var currentUrl = 'http://'+window.location.host+'/json/'+currentPage.join('+');
    console.log(currentUrl);
    
    if(fontLoaded===1)
    {
        NM.init({ url: currentUrl, colordelay: 3000});
    }
    else
    {
        onFontLoaded = function() { NM.init({ url: currentUrl, colordelay: 3000}); };
    }

    $('input[name="sources"]').change( function()
    {
        console.log("checkbox");
        //event.preventDefault();
        var sources = [];
        $('#src-menu input[name="sources"]').each( function()
        {
            console.log($(this).attr('id').split('-')[1] + ":" + $(this).is(":checked") );
            if($(this).is(":checked"))
                sources.push($(this).attr('id').split('-')[1]);
        });
        console.log("pushstate:"+currentPage);
        currentPage = sources;
        history.pushState(currentPage,currentPage,'/'+sources.join('+'));
        
        NM.update( { url: "/json/"+sources.join('+'), colordelay: 3000, deleteall: true} );
    });
    
    window.onpopstate = function (event) {
        var menu_id;
        console.log("onpopstate: "+event.state);
        if(event.state)
        {
            currentPage = event.state;
            NM.update( { url: "/json/"+currentPage.join('+'), colordelay: 3000, deleteall: true} );
        }
        /*else
        {
            currentPage = ['news2ru'];
            NM.update( { url: "/json/"+currentPage.join('+'), colordelay: 3000, deleteall: true} );
        }*/
        console.log(event.state);
    }

});
