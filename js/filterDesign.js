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
    $('div.showtype').on('change', 'input[name="showtype"]', function() {
        var v = $('input[name="showtype"]:checked').val();
        if (v == '复选') {
            $('div.editFilterDiv.gouxuan').show();
        } else {
            $('div.editFilterDiv.gouxuan').hide();
        }
    })
    //在编辑筛选页面中点击树形目录的操作
    $('.pathshowContainer').on('click', 'li', function(e) {
        e.stopPropagation();
        e.preventDefault();
        $('.selectpathnamespanSelect').removeClass('selectpathnamespanSelect');
        $(this).find('span.selectpathnamespan').eq(0).addClass('selectpathnamespanSelect');
        var a = [];
        a.push($(this).find('span.selectpathnamespan').eq(0).text());
        var t = $(this).parent();
        $('.pathshowContainer').attr('actionid',$(this).attr('folderid'));
        for (var i = 0; i < 100; i++) {
            if (t.attr('class') == 'subpathUl' || t.attr('folderid') != 0) {
                t = t.parent();
                if (t.attr('folderid') == 0) {
                    a.push('根目录');
                    break;
                } else {
                    a.push(t.find('span.selectpathnamespan').eq(0).text());
                }
            }
        }
        a.reverse();
        var text = a.join(' > ');
        if ($(this).attr('folderid') == 0) {
            text = '根目录';
        }
        $('#pathnamespan').text(text);
    })
    //点击确定目录操作
    $('.confirmPath').on('click',function(){
        $('.pathshowContainerShow').removeClass('pathshowContainerShow');
    })
    //点击保存按钮
    $('.saveFilter').on('click', function() {
        var fn = $('#filternameinput').val();
        var pn = $('#pathnamespan').text();
        var ds = $('select.db option:selected').val();
        var st = $('input[name="showtype"]:checked').val();
        var dt = $('textarea.datatable').val();
        var sn = $('input.showNumber').val();
        var dfs = $('input[name="defaultShow"]:checked').val();
        var nr = $('input[name="mustrequire"]:checked').val();
        var pid = '';
        var jc = $('input.relativecolumn').val();
        var flag = true;
        var a = [];
        if (fn == null || fn == '') {
            flag = false;
            $('#filternameinput').addClass('inputerror');
            setTimeout(function() {
                $('#filternameinput').removeClass('inputerror');
            }, 2000)
        }
        if (dt == null || dt == '' || dt == '格式:select x as value,x as text from') {
            flag = false;
            $('textarea.datatable').addClass('inputerror');
            setTimeout(function() {
                $('textarea.datatable').removeClass('inputerror');
            }, 2000)
        }
        if (pn == null || pn == '') {
            flag = false;
            $('#pathnamespan').addClass('inputerror');
            setTimeout(function() {
                $('#pathnamespan').removeClass('inputerror');
            }, 2000)
        }
        if(flag){
            
        }
    })
}
//填充筛选设计编辑框里的内容
function fullEditContent(p) {
    if (p == null) {
        $('.datasourceEdit').html(returndbSelect(window.db));
        $('textarea.datatable').val('格式:select x as value,x as text from');
        $('input.showNumber').val('');
        $('input.key').val('');
        $('input.kvalue').val('');
        $('input.maxselect').val('');
        $('input.minselect').val('');
        $('input.relativecolumn').val('');
        $('span#pathnamespan').text('');
        var str = '<span class="editFilterInfo">展示方式:</span><input name="showtype" checked type="radio" value="复选"><span class="showtypeInfo">复选</span><input name="showtype" type="radio" value="单选"><span class="showtypeInfo">单选</span>';
        $('div.showtype').html(str);
        var ul = $('.rootNavUl');
        var st = "";
        $('.pathShowUl').html(refreshFolderList(ul, st));
    }
}

function refreshFolderList(ul, str) {
    var str1 = "";
    ul.find('>li').each(function() {
        if ($(this).find('>ul').length > 0) {
            var foldername = $(this).find('span.foldName').eq(0).text().replace(/[\r\n\ ]/g, '');
            var ul1 = $(this).find('>ul').eq(0);
            str += '<li folderId=' + $(this).attr('folderId') + '><span class="selectpathnamespan"><i class="folder fa fa-folder"></i>' + foldername + '</span>';
            str += "<ul class='subpathUl'>";
            str = refreshFolderList(ul1, str);
            str += "</ul></li>";
            console.log(str);
            return str;
        } else {
            var foldername = $(this).find('span.foldName').eq(0).text().replace(/[\r\n\ ]/g, '');
            str1 += '<li folderId=' + $(this).attr('folderId') + '><span class="selectpathnamespan"><i class="folder fa fa-folder"></i>' + foldername + '</span></li>';
        }
    })
    str += str1;
    return str;
}