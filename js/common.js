window.db = {};
//指定数据源对应的数据库,目前只有149上的dw_db和maxportal
window.dbmap = {
    '149数据源':{"dw_db":"dw_db"},
    '90数据源':{"maxportal":"maxportal"},
}
function getDBb(oq) {
    var url = 'datasource/getDatasourceList';
    var p = {};
    var q = {};
    q.success = function(r) {
        for (var i = 0; i < r.length; i++) {
            var o = r[i];
            window.db[o.id] = o;
            window.db[o.id].db = window.dbmap[o.name];
        }
        oq.next();
    }
    $.api(url, p, q);
}
function returndbSelect(dbobj,co){
    //dbobj是window.db,所有db列表 格式如{datasourceid:{id:xx,name:xx}}
    //co是当前选中的源+库
    var str = "<select class='tableselect db'>";
    for (var i in dbobj) {
        var n = dbobj[i].name;
        if(!window.dbmap.hasOwnProperty(n)){
            console.log('js中未配置这个库');
            console.log(n);
        }else{
            for(var j in window.dbmap[n]){
                var fl = '';
                if(co !=null && co== (i+j)){
                    fl = ' selected ';
                }
               str += "<option value='" + i + "' " + fl + " db='"+j+"'>"+(dbobj[i].name+j)+'</option>'; 
            }
        }
    }
    str += "</select>";
    return str;
}
function showMessage(title, message) {
    iziToast.show({
        class: 'test',
        titleColor: '#fff',
        color: '#d66061',
        icon: 'icon-contacts',
        title: title,
        message: message,
        position: 'topCenter',
        transitionIn: 'flipInX',
        transitionOut: 'flipOutX',
        progressBarColor: 'rgb(0, 255, 184)',
        image: './img/avatar.jpg',
        timeout: 1000,
        imageWidth: 70,
        layout: 2,
        onClose: function() {
            console.info('onClose');
        },
        iconColor: 'rgb(0, 255, 184)'
    });
}
$.api = function(url, params, q) {
    var basepath = 'http://10.9.15.4:8080/brisk/';
    var o = {};
    $.extend(o, q);
    var ttype ='GET';
    if(q.atype == 'POST'){
        ttype = 'POST';
    }
    o.error = function(a){
        console.log(url+'请求数据失败')
        console.log(a.status);
        var st = "";
        if(a.status == 500){
            st="后台api错误,请按F12具体查看内容"
        }
        console.log(a.responseText); 
        swal({
            title: url+'请求数据失败',
            text: st,
            type: 'error',
            timer: 7000,
            showCloseButton: true,
            showCancelButton: true,
        })
    }
    var ajaxOption = {
        'url': basepath + url,
        'type':ttype,
        'data':JSON.stringify(params),
        'contentType':"application/json",  
        'dataType': 'json', 
        'success': function(response, status, xhr) {
            if (status == 'success') {
                if(xhr.status ==200 && xhr.statusText=='success'){//取数成功的情况下执行
                    if(o.hasOwnProperty('success')){
                        o.success(response,xhr);
                    }
                }
            } else {
                console.log('取数错误');
            }
        },
        'error': function(response, status, xhr) { 
           if(o.hasOwnProperty('errorfu')){
            o.errorfu(response,status);
           }else{
            o.error(response);
           }
        }
    }
    if(ttype=='GET'){
        ajaxOption.data = params;
        delete ajaxOption.contentType;
        delete ajaxOption.dataType;
    }
    $.ajax(ajaxOption);
}
var curpagearray=(location.href.split('?'))[0].split('/');
var curpage = curpagearray[curpagearray.length-1].replace('#','');
$('a[href="./'+curpage+'"]').parent().addClass('active');

class bootstrapdatepick {
    constructor() {}
    /*
     ** p.id //生成区间date的父id
     ** p.datetype //生成的日期是什么类型的. 可以是'range',
     * p.format //显示格式,默认为 'yyyy年mm月dd日'
     * p.startdate //开始日期 ,默认-180d 近180天
     * p.enddate //截止日期 ,默认-1d昨天
     * p.showstart //默认展示起始日期
     * p.showend //默认展示截止日期
     * p.changeDate //typeof == function的时候.继承此日期更换点击事件;
     * */
    initbase(p) {
        var flag = true;
        var q = {};
        if (p.id == null || p.id == '') {
            console.error('日期input的父元素id为空');
            flag = false;
        }
        var cop = new copyObjectProperty();
        if (flag) {
            if (p.datetype == 'range') {
                //console.log('tt');
                var id = $('#' + p.id);
                var idinput = id.find('input');
                if (idinput.size() != 2) {
                    console.error('生成时间区间需要两个input,第一个为start,第二个为end');
                    return false;
                } else {
                    //有两个input,默认第一个input为起始日期,第二个为截止日期;
                    idinput.attr('class','input-sm form-control');
                    idinput.eq(0).attr('name','start');
                    idinput.eq(1).attr('name','end');
                    q.id = p.id;
                    cop.copyCommonP(p, q, 'format', 'yyyy年mm月dd日');
                    cop.copyCommonP(p, q, 'startdate', '-180d');
                    cop.copyCommonP(p, q, 'enddate', '-1d'); 
                    var bsp = new bootstrapdatepick();
                    bsp.createDatePicker(q);//生成日期插件
                    var df = new DateFormat();
                    
                    if(p.changeDate!=null && typeof p.changeDate == 'function'){ //是否有点击事件;
                      $('#'+q.id).datepicker()
                      .on('changeDate', function(e) {
                        console.log(e);
                        p.changeDate(e);
                     });
                    }
                    if(p.startdate != null && p.startdate != null){
                      $('#'+q.id+' input').eq(0).datepicker('setStartDate',p.startdate);//设置第一个日历的起始日期
                      $('#'+q.id+' input').eq(1).datepicker('setStartDate',p.startdate);//设置第2个日历的起始日期
                      
                    }
                    if(p.enddate != null && p.enddate != null){
                      $('#'+q.id+' input').eq(0).datepicker('setEndDate',p.enddate);//设置第一个日历的截止日期
                      $('#'+q.id+' input').eq(1).datepicker('setEndDate',p.enddate);//设置第一个日历的起始日期
                    }
                    if(p.showstart != null && p.showend != null &&
                        p.showstart != undefined && p.showend != undefined &&
                        p.showstart != '' && p.showend != ''){
                      //设置展示起始截至日期
                      $('#'+q.id+' input').eq(0).datepicker('setDate',df.initdate(q.format,p.showstart));
                      $('#'+q.id+' input').eq(1).datepicker('setDate',df.initdate(q.format,p.showend));
                    }else{
                      if(window.curdate !=null && window.curdate != undefined &&window.curdate !='' ){
                        $('#'+q.id+' input').datepicker('setDate',df.initdate(q.format,window.curdate,-1));
                      }else{
                        $('#'+q.id+' input').datepicker('setDate',df.initdate(q.format,(new Date()),-1));
                      }
                    }
                }
            }
        }
    }
    createDatePicker(p) {
        var id = $('#' + p.id);
        id.datepicker({
            format: p.format,
            startDate: p.startdate,
            endDate: p.endDate,
            language: "zh-CN",
            clearBtn: true,
        })
    }
}
//复制属性公共类
class copyObjectProperty {
    constructor() {}
    copyCommonP(p, q, property, defalutvalue) {
        /*
         ** p被复制的对象
         ** q要复制的对象
         ** property属性
         *defalutvalue默认值
         */
        if (p[property] == null || p[property] == undefined) {
                if (defalutvalue == null || defalutvalue == undefined) {
                    q[property] = '';
                    console.log('属性默认值为null,赋空值');
                } else {
                    q[property] = defalutvalue;
                }
            } else {
                q[property] = p[property];
            }
        }
    
    copyAllpP(p){
      //浅复制
      var q = {};
      for(var i in p){
        q[i] = p[i];
      }
      return q;
    }
    
    deepCopy(o,c){
      //深度复制
      var c = c || {}
      for(var i in o){
      if(typeof o[i] === 'object'){
                //要考虑深复制问题了
                      if(o[i].constructor === Array){
                      //这是数组
                      c[i] =[]
                    }else{
                      //这是对象
                      c[i] = {}
                    }
                    deepCopy(o[i],c[i])
             }else{
               c[i] = o[i]
             }
         }
         return c
    } 
    }

class DateFormat{
  constructor() {}
  convertimestamp(d,format){
    if(format == null){
        format='yyyy-mm-dd';
    }
    var df = new DateFormat();
    return df.changeformat(format,new Date(d));
  }
   initdate(type,tempdate,days){
     /*
      ** type 格式 'yyyy/mm/dd'
      ** tempdate 日期 '2018-04-11'
      *  days天数 ,-1,1,2,等
      */
    var curDate = new Date(tempdate);
    var acudate ;
    if(days==null || days=='' || days == undefined){
      acudate = curDate ;
    }else{
      if((days*1)>0){
        acudate = new Date(curDate/1 + days*24*3600*1000);
      }else if((days*1) <0){
        days = days * (-1);
        acudate = new Date(curDate/1 - days*24*3600*1000);
      }
      
    }
    var df = new DateFormat();
    return df.changeformat(type,acudate);
  }
  
   changeformat(type,tdate){
     /*
      ** type 格式 'yyyy/mm/dd'
      ** tdate 日期类型
      */ 
     //console.log('要转换的日期是');
     //console.log(tdate);
     var year = tdate.getFullYear();
     var month = parseInt(tdate.getMonth()) + 1 >= 10 ? parseInt(tdate.getMonth()) + 1 : "0" + (parseInt(tdate.getMonth()) + 1);
     var day = tdate.getDate() >= 10 ? tdate.getDate() : "0" + tdate.getDate();
     var tresult = type.replace('yyyy',year).replace('mm',month).replace('dd',day);
     return tresult;
   }
}
class EchartOption{
  constructor(p) {
    /*
     * p
     * p.charttype = 'linebar' 横向柱形图的时候p.charttype = 'linebar'
     * */
    this.co = {
        color: ['rgb(137,218,81)'],
        title: {
            show: true,
            text: '',
            left: 'center',
            top: 5,
            textStyle: {
                fontSize: 15,
                fontWeight: 'normal'
            }
        },
        tooltip: {
            trigger: 'axis',
        },
        legend: {
            left: '10%',
            textStyle: {},
            data: []
        },
        grid: {
            left: '6%',
            right: '5%',
            bottom: '3%',
            top: 15,
            containLabel: true
        },
        xAxis: [{
            type: 'category',
            // boundaryGap: false,
            data: [],
            axisLabel: {
                show: true,
                interval: 1
            },
            axisLine: {
                show: true
            },
            axisTick: {
                show: false
            },
            splitLine: {
                show: false
            }
        }],
        yAxis: [{
            position: 'left',
            type: 'value',
            axisLabel: {
                show: false
            },
            axisLine: {
                show: false
            },
            axisTick: {
                show: false
            },
            splitLine: {
                show: false
            }
        }],
        series:[],
    }
    if(p != null && p != undefined && p!='' && typeof p =='object'){
      this.co = $.extend(this.co,p);
      if(p.charttype !=null   && p.charttype == 'linebar'){
        this.co.xAxis[0].type = "value" ;
        this.co.yAxis[0].type = "category" ;
      }
    }
    
  }
  getEchartInstance(id){
    /*
     **id为htm元素的id值
     * */
    var echartinstanct = echarts.getInstanceByDom(document.getElementById(id));
    if(echartinstanct == null){
      echartinstanct = echarts.init(document.getElementById(id)); 
    }
    return echartinstanct;
  }
  chartShowLoading(id){
    /*
     **id为htm元素的id值
     * */
    var echartinstanct = echarts.getInstanceByDom(document.getElementById(id));
    if(echartinstanct == null){
      echartinstanct = echarts.init(document.getElementById(id)); 
    }
    echartinstanct.showLoading();
  }
  chartHideLoading(id){
    /*
     **id为htm元素的id值
     * */
    var echartinstanct = echarts.getInstanceByDom(document.getElementById(id));
    if(echartinstanct == null){
      echartinstanct = echarts.init(document.getElementById(id)); 
    }
    echartinstanct.hideLoading();
  } 
  getNanGerPieOption(){
    //获取南丁格尔玫瑰图
    this.co =  {
        color:['rgb(142,199,242)','rgb(174,217,251)','rgb(200,221,251)','rgb(216,237,251)'], 
        // color:['rgb(142,199,242)'], 
     title : {
         text: '用户购买力',
         subtext: '',
         top:20,
         textStyle:{
             color:'#777',
             fontSize:16,
             fontWeight:'normal'
         },
         x:'center'
     },
     tooltip : {
         trigger: 'item',
         formatter: "{b} : ({d}%)"
     },

     grid:{
         left:'center',
         top:'middle' 
     },
     legend: {
         show:false,
         x : 'center',
         y : 'bottom',
         data:[]
     },
     toolbox: {
         show : false,
         feature : {
             mark : {show: true},
             dataView : {show: true, readOnly: false},
             magicType : {
                 show: true,
                 type: ['pie', 'funnel']
             },
             restore : {show: true},
             saveAsImage : {show: true}
         }
     },
     calculable : false,
     series : [
         {
             name:'',
             type:'pie', 
             center : ['50%', '55%'],
             roseType : 'area',
             radius : ['20%', '60%'], 
                 avoidLabelOverlap: false,   
                 label: {
                     normal: {
                         show: true , 
                         position: 'outside',
                         formatter: '{b}\n{d}%',
                         textStyle: {
                             fontSize: 14,
                             fontWeight: 'normal'
                         }
                     },
                     emphasis: {
                         show: true ,
                         position: 'outside',
                         formatter: '{b}\n{d}%',
                         textStyle: {
                             fontSize: '16',
                             fontWeight: 'bold'
                         }
                     }
                 },
                 labelLine: {
                     normal: {
                         show: true,
                         smooth:false,
                         length:5,
                         length2:5
                     },
                     emphasis: {
                         show: true
                     }
                 },
             data:[]
         }
     ]
 };
  }
  refreshLineBarChart(q){
    /*  生成条形图
     * * p.id 生成图形的id
     * * p.data 生成图形的data,一般是传回值r.content.result,一般是按主要的值降序排序
     *   p.title 图形的title
     *   p.ydatatype   ='per' 传过来的Y值是百分比  'normal'传过来的值为普通 'normalbutper',如果为normalbutper,则需要自己计算一下百分比
     * */ 
      var id = q.id;
      var data = q.data;
      var title = q.title;
      var d = data.content.result;
      var p = {};
      p.charttype = 'linebar';
      var co = new EchartOption(p); 
      if(d.length ==0){
        if(title!=null && title !=""){
          co.co.title.text = title;
        }else{
          co.co.title.text = ' --暂无数据';
        } 
        var tempq = {};
        tempq.name = "";
        tempq.type = "bar";
        tempq.barWidth=25;
        tempq.data = td; 
        tempq.label = {};
        tempq.label.normal = {};
        tempq.label.normal = {};
        tempq.label.normal.show = true;
        tempq.label.normal.position = 'right';
        tempq.label.normal.textStyle = {};
        tempq.label.normal.textStyle.color = "#777";
        co.co.yAxis[0].data = [];
        co.co.yAxis[0].axisLabel.show = false;
        co.co.yAxis[0].axisLine.show = false;
        co.co.xAxis[0].axisLabel.show = false;
        co.co.xAxis[0].axisLine.show = false;
        co.co.series.push(tempq);
      }else{
        if(title != null && title !=""){
          co.co.title.text = title;
        }
        co.co.legend.show = false;
        var td = [];
        var yd = [];
        var total = 0;
        for(var i=0;i<d.length;i++){
          yd.push(d[i].keyname);
          td.push(d[i].valuename);
          total += d[i].valuename*1;
        }
        if(q.ydatatype == 'normalbutper' ){
          for(var i=0;i<td.length;i++){
            td[i] = (td[i] / total).toFixed(4);
          }
        }
        td.reverse();
        yd.reverse();
        co.co.xAxis[0].show = false;
        co.co.yAxis[0].data = yd;
        co.co.yAxis[0].axisLabel.show = true;
        co.co.grid.top = 30;
        co.co.tooltip.show = false;
        var tempq = {};
        tempq.name = "";
        tempq.type = "bar";
        tempq.barWidth=25;
        tempq.data = td; 
        tempq.label = {};
        tempq.label.normal = {};
        tempq.label.normal = {};
        tempq.label.normal.show = true;
        tempq.label.normal.position = 'right';
        tempq.label.normal.textStyle = {};
        tempq.label.normal.textStyle.color = "#777";
        tempq.label.normal.formatter = function(v){
          var d = new dataFormat();
          //console.log(v.data);
          return d.percentData(v.data);
        } 
        
        co.co.series.push(tempq);
      }

      var barchart = echarts.init(document.getElementById(id));
      //console.log(co.co)
      barchart.setOption(co.co);
    } 
}
class dataFormat{
  constructor(){}
  percentData(d){
    /*
     **d为数值
     * */
    if (d > 0) {
        var td = (d * 100).toFixed(2);
        if (td.substr(-2) == '00') {
            td = (td * 1).toFixed(0) + '%';
        } else if (td.substr(-1) == '0') {
            td = td.substr(0, td.length - 1) + '%';
        } else {
            td = td + '%';
        }
        return td;
    } else {
        return 0;
    }
  }
} 
class initLoading{
  constructor(){}
  spinLoading(p,id){
    /*
     * p 生成loading的参数
     * id 默认为loading
     * */
    if(p==null || $.inEmptyObject(p)){
      var p ={
          lines: 12, // The number of lines to draw
          length: 24, // The length of each line
          width: 5, // The line thickness
          radius: 67, // The radius of the inner circle
          scale: 0.55, // Scales overall size of the spinner
          corners: 1, // Corner roundness (0..1)
          color: 'rgb(86,188,71)', // CSS color or array of colors
          fadeColor: 'transparent', // CSS color or array of colors
          opacity: 0.55, // Opacity of the lines
          rotate: 0, // The rotation offset
          direction: 1, // 1: clockwise, -1: counterclockwise
          speed: 1, // Rounds per second
          trail: 39, // Afterglow percentage
          fps: 20, // Frames per second when using setTimeout() as a fallback in IE 9
          zIndex: 2e9, // The z-index (defaults to 2000000000)
          className: 'spinner', // The CSS class to assign to the spinner
          top: '38%', // Top position relative to parent
          left: '50%', // Left position relative to parent 
          position: 'absolute' // Element positioning
        } 
    }
    if(id ==null || id == ''){
      id = 'loading';
    }
    var target = document.getElementById(id);
    var spinner = new Spinner(p).spin(target);
  }
}
function swalinfo(title,type){
    console.log('error error');
    if(type ==null || type =='error'){
        var type = 'error';
    }
    swal({
        title:title,
        type:type,
    })
}
function showSwalLoading(text){
    swal({
        title: text,
        type: 'info',
        closeOnConfirm: false,
        showLoaderOnConfirm: true,
    }, function() {})
    setTimeout(function(){
        $('button.confirm').click(); 
    },520)
}