/* Author:

*/

$(function(){
    $.blockUI.defaults.css = {}; 
    $("div#progress").hide();
    d3.select("body").transition()
    .duration(1000)
    .style("background-color", "black");
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
    startColor = '#FFFFB2',
    endColor = '#E31A1C',
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
 /*   
    function autofit(d,i)
    {
        var elm = $(this),
        iter=0,
        ratio = 1.;
//        console.log(i+': '+ d.area +'(' +d.dx+' '+d.dy+') , '+elm.css("font-size"));
        elm.css("font-size","100px");
        d.fontsize=100.;
//        while(elm.hasOverflow()){
        while( (ratio=elm.hasOverflow3())!=1 )
        {
            iter+=1;
            //var size = parseFloat(elm.css('font-size'));
            //console.log(elm.css('font-size'),d.fontsize);
            //size -= 1;
            d.fontsize /= ratio;
            elm.css('font-size', d.fontsize + 'px');
            //console.log(elm.css('font-size'),d.fontsize);
            //iter_2[i]+=1;
            if(iter>5) break;
        }    
//        console.log(i+': '+ d.area +'(' +d.dx+' '+d.dy+') , '+elm.css("font-size"));
        //console.log('2. w:'+ elm.width() + ' h:'+elm.height()+' sz:'+elm.css('font-size')+'('+elm.text()+')');
        //$('.newslink').css('display','inline-block');
        //if(iter_1[i]!=iter_2[i]) console.log('1: (' +i+')'+iter_1[i]+' 2: '+iter_2[i]);
    }
    */
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
        .data( treemap.nodes, function(d){ return d.id; } )
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
    
    function testAddOneMoreNews(json)
    {
        var elem;
        for (var i = 0; i < tempCounter; i++)
        {
            elem = json.children.pop();
            json.children.push(elem);
            elem.id = elem.id+1000000;
            elem.rawcomments *= 1.5;
            json.children.push( $.extend(true,{},elem));
            newsCount+=1;
        }
        return json;
    }
    
    var tempCounter = 1;
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
            NM.url("news2ru.json");
        }
        else
        {
            //console.log(2);
            NM.url(params.url);
        }
        
        //console.log(url);
    
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
            
            //json = testAddOneMoreNews(json);
         
            minUserColorValue = d3.min(json.children, computeColor);
            maxUserColorValue = d3.max(json.children, computeColor);
            
            //console.log( "min", minUserColorValue);
            //console.log( "max", maxUserColorValue);
            
            colormap = d3.scale.linear()
            .domain([minUserColorValue, maxUserColorValue])
            .range([startColor, endColor]);
            
            //json.children = json.children.reverse();
            //newsCount = json.children.length;
            //console.log("after",tempCounter,newsCount);
            tempCounter+=1;
            //console.log(json);
        
            var selection = 
            div.data([json])
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
    
    my.init = function(params)
    {
        //console.log("NM.init");
        $(window).resize(NM.redraw);          

        
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
                        .value(sizeFunction);

        $('<div />', {'id': 'div-resizer', 'class': 'cell'}).hide().appendTo(document.body);
        $('#div-resizer').append('<a id="a-resizer" class="newslink"></a>');

        this.update( params );
        
        //d3.json("http://novomapia.com/news2ru/json/", function(json) 
        // d3.json("news2ru.json", function(json) 
        // {
            // newsCount = json.children.length;
            // //json.children = json.children.reverse();

            // var wi = div.style("width");
            // wi = wi.substring(0,wi.length-2);
            // var he = div.style("height");
            // he = he.substring(0,he.length-2);
            // treemap.size([wi-1,he-1]);
            
            // div
            // .data([json])
            // .selectAll("div")
            // .data(treemap.nodes,function(d){ return d.id; })
            // .enter()
            // .append("div")
            // .attr("class", "cell")
            // .style('background-color', colorFunction )
            // .html(function(d) { return d.children ? null : '<a class="newslink" href="'+d.link+'">'+d.title+'</a>'; })
            // .attr("title", function(d) { return d.title; })
            // .attr("data-content", function(d) { return d.img+'<span>'+d.description+'</span>'; })
            // .call(cell);
            
            // //.each(autofit);
           
            
            // minUserColorValue = 10000000.;
            // maxUserColorValue = 0.;
            // div.selectAll("div")
            // .each(calcUserColor);
            // calcUserColorMap();
            // colorFunction = function(d) { return d.children ? null : colorUserFunction(d); }; 
            // recolor();
            
            
            // div.selectAll("div")
            // .each(calculateTargetFontSize)
            // .style('font-size', function(d){ return d.fontsize+'px'; });
            
            // /*
            // $('.cell').popover({
                    // title: 'tooltip',
                    // content: '<h1>content</h1>',
                    // delay: { show: 500, hide: 100 },
                    // placement: function(e,f,g) {
                                                    // var 
                                                    // wh = $(window).height(),
                                                    // ww = $(window).width(),
                                                    // o = $(f).offset(),
                                                    // oh = $(f).height(),
                                                    // ow = $(f).width(),
                                                    // r1 = 2.*o.left/ww,
                                                    // r2 = 2.*o.top/wh,
                                                    // fp = $(f).position();
                                                    // //console.log('t:'+fp.top+'l:'+fp.left+' ww/2: '+ww/2.+' wh/2: '+wh/2.+' o.left:'+o.left + ' o.top:'+o.top);
                                                    // if(fp.left==0) return 'right';
                                                    // if(fp.top==0) return 'bottom';
                                                    // if(o.top>wh/2.) return 'top';
                                                    // if(o.left>ww/2.) return 'left'; 
                                                    // //if(b==0) return 'top'; 
                                                    // return 'right';
                                                // },
            // }
            // );
            // */

            // //var nodes = treemap.nodes(json);
        // });
        
        
    };
    
    return my;
}(jQuery));

$(function(){
    
    $(".nav li").removeClass("active");
    if(currentPage=="help")
    {
        $("#help-menu").addClass("active");
    }
    else if(currentPage=="news2ru")
    {
        $("#src-menu").addClass("active");
        $("#src-menu-text span").text("News2.ru");
        $("#src-menu li").removeClass("active");
        $("#src-menu-news2ru").addClass("active");
    }
    else if(currentPage=="membrana")
    {
        $("#src-menu").addClass("active");
        $("#src-menu-text span").text("Membrana.ru");
        $("#src-menu li").removeClass("active");
        $("#src-menu-membrana").addClass("active");
    }

    if(fontLoaded===1)
    {
        //console.log("font is already loaded");
        NM.init({ url: 'http://'+window.location.host+'/json/'+currentPage, colordelay: 3000});
    }
    else
    {
        //console.log("font is not loaded yet");
        onFontLoaded = function() { /*console.log("initializing map");*/ NM.init({ url: 'http://'+window.location.host+'/json/'+currentPage, colordelay: 3000}); };
    }

    $('.dropdown-toggle').dropdown();

    $("#help-menu").click(function(event) 
    {
        console.log("#help-menu");
        event.preventDefault();
        history.pushState(currentPage,currentPage,'/help');
        currentPage = 'help';
        $(".nav li").removeClass("active");
        $("#help-menu").addClass("active");
        NM.update( { url: "json/help", colordelay: 3000} );
    });

    $("#src-menu-news2ru").click(function(event) 
    {
        console.log("#src-menu-news2ru");
        event.preventDefault();
        history.pushState(currentPage,currentPage,'/news2ru');
        currentPage = 'news2ru';
        $(".nav li").removeClass("active");
        $("#src-menu").addClass("active");
        $("#src-menu-text span").text("News2.ru");
        $("#src-menu li").removeClass("active");
        $("#src-menu-news2ru").addClass("active");
        NM.update( { url: "/json/news2ru", colordelay: 3000} );
    });

    $("#src-menu-membrana").click(function(event) 
    {
        console.log("#src-menu-membrana");
        event.preventDefault();
        history.pushState(currentPage,currentPage,'/membrana');
        currentPage = 'membrana';
        $(".nav li").removeClass("active");
        $("#src-menu").addClass("active");
        $("#src-menu-text span").text("Membrana.ru");
        $("#src-menu li").removeClass("active");
        $("#src-menu-membrana").addClass("active");
        NM.update( { url: "/json/membrana", colordelay: 3000} );
    });
    
    window.onpopstate = function (event) {
        var menu_id;
        switch(event.state)
        {
            case 'news2ru':
                $("#src-menu-news2ru").click();
                break;
            case 'membrana':
                $("#src-menu-membrana").click();
                break;
            case 'help':
                $("#help-menu").click();
                break;
        }
        // see what is available in the event object
        console.log(event.state);
    }

});
