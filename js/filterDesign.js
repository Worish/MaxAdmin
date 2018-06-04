$(document).ready(function() {
    $fe = $('.filterEditOutContainer');
    aod = {};
    bck();
    initDB();
})

function initDB() {
    var q = {};
    q.next = getAllFilters;
    getDBb(q);
}

function getAllFilters() {}

function bck() {
    $('body').on('click', function() {
        $('.pathshowContainer').removeClass('pathshowContainerShow');
    })
    $('.addFilter').on('click', function() {
        $fe.addClass('filterEditOutContainerShow');
        $fe.attr('action', 'new');
        fullEditContent();
    })
    $('#pathnamespan').on('click', function(e) {
        e.stopPropagation();
        $('.pathshowContainer').addClass('pathshowContainerShow');
    })
    $('.pathshowContainer').on('click', function(e) {
        e.stopPropagation();
        // $('.pathshowContainer').addClass('pathshowContainerShow');
    })
    $('span.closeFilterContainer').on('click', function(e) {
         $fe.removeClass('filterEditOutContainerShow');
    })
}
//填充筛选设计编辑框里的内容
function fullEditContent(p) {
    if(p==null){
      $('.datasourceEdit').html(returndbSelect(window.db));
    $('textarea.datatable').val('');
    $('input.showNumber').val('');
    $('input.key').val('');
    $('input.kvalue').val('');
    $('input.maxselect').val('');
    $('input.minselect').val('');
    $('input.relativecolumn').val('');
    var str='<span class="editFilterInfo">展示方式:</span><input name="showtype" type="radio" value="复选"><span class="showtypeInfo">复选</span><input name="showtype" type="radio" value="单选"><span class="showtypeInfo">单选</span>';  
    $('div.showtype').html(str);
    var ul = $('.rootNavUl');
    var st = "";
    $('.pathShowUl').html(refreshFolderList(ul,st));
    }
}

function refreshFolderList(ul,str){ 
    var str1 = "";
        ul.find('>li').each(function(){
            if($(this).find('>ul').length>0){
                var foldername = $(this).find('span.foldName').eq(0).text().replace(/[\r\n\ ]/g,'');
                var ul1 = $(this).find('>ul').eq(0);
                str += '<li><span class="selectpathnamespan"><i class="folder fa fa-folder"></i>'+foldername+'</span>';
                str +="<ul class='subpathUl'>";
                str = refreshFolderList(ul1,str);
                str +="</ul></li>";
                console.log(str);
                return str;
            }else{
                var foldername = $(this).find('span.foldName').eq(0).text().replace(/[\r\n\ ]/g,'');
                str1 += '<li><span class="selectpathnamespan"><i class="folder fa fa-folder"></i>'+foldername+'</span></li>';
            }
        }) 
        str +=str1;
        return str;
}