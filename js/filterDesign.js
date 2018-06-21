/* 如果是父筛选是空的话,parentId设置为0 */
$(document).ready(function() {
    $fe = $('.filterEditOutContainer');
    aod = {};
    aod.data = {};
    aod.tree = {};
    aod.c = setTimeout({}, 2000);
    clearTimeout(aod.c);
    bck();
    initDB();
})

function initDB() {
    var q = {};
    q.next = initallData;
    getDBb(q);
}

function bck() {
    $('body').on('click', function() {
        $('.pathshowContainer').removeClass('pathshowContainerShow');
        $('.parentFilterListContainer').removeClass('parentFilterListContainerShow');
    })
    $('.addFilter').on('click', function() {
        $fe.addClass('filterEditOutContainerShow');
        $fe.attr('action', 'new');
        $fe.removeAttr('actionid');
        fullEditContent();
    })
    $('#pathnamespan').on('click', function(e) {
        e.stopPropagation();
        $('.pathshowContainer').addClass('pathshowContainerShow');
    })
    $('.parentFilterName').on('click', function(e) {
        e.stopPropagation();
        $('.parentFilterListContainer').addClass('parentFilterListContainerShow');
    })
    $('.pathshowContainer').on('click', function(e) {
        e.stopPropagation();
        // $('.pathshowContainer').addClass('pathshowContainerShow');
    })
    $('.parentFilterListContainer').on('click', function(e) {
        e.stopPropagation();
    })
    $('span.closeFilterContainer').on('click', function(e) {
        $fe.removeClass('filterEditOutContainerShow');
    })
    $('div.showtype').on('change', 'input[name="showtype"]', function() {
        var v = $('input[name="showtype"]:checked').val();
        if (v == '复选') {
            $('div.gouxuanc').show();
        } else {
            $('div.gouxuanc').hide();
        }
    })
    //搜索父筛选事件
    $('.parentFilterInput').on('input keyup keydown focus paste', function(r) {
        clearTimeout(aod.c);
        aod.c = setTimeout(function() {
            var val = $('input.parentFilterInput').val().replace(/\s+/g, '');
            var id = $fe.attr('actionid');
            fullParentList(id, val);
        }, 200)
    })
    //点击父筛选列表事件
    $('.parentFilterListUl').on('click', 'li', function() {
        var acid = $(this).attr('actionid')
        if (acid != 'no') {
            $('.parentFilterListUl li.selected').removeClass('selected');
            $(this).addClass('selected');
            if (acid != 'blank') {
                $('.parentFilterName').text($(this).text());
                $('.parentFilterName').attr('pid', acid);
            } else {
                $('.parentFilterName').text('');
                $('.parentFilterName').removeAttr('pid');
            }
        }
    })
    //点击左侧tree导航的操作
    $('.rootNavUl').on('click', 'li', function(e) {
        e.stopPropagation();
        e.preventDefault();
        showData($(this).attr('folderid'));
    })
    //点击筛选列表某一行编辑的操作
    $('.filtertable').on('click', '.fa-edit', function(e) {
        e.stopPropagation();
        e.preventDefault();
        $fe.attr('action', 'edit');
        $fe.attr('actionid', $(this).attr('actionid'));
        fullEditContent($(this).attr('actionid'));
    })
    //删除某一个筛选的操作
    $('.filtertable').on('click', '.fa-remove', function(e) {
        e.stopPropagation();
        e.preventDefault();
        var id = $(this).attr('actionid');
        var name = aod.data[id].name;
        var pna = aod.data[id].pathName.split('-');
        swal({
            title: "确定删除筛选",
            text: name,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "确定删除！",
            cancelButtonText: "取消删除！",
            closeOnConfirm: false,
            closeOnCancel: false
        }, function(isConfirm) {
            if (isConfirm) {
                var p = {},
                    q = {};
                p.filterConfId = id;
                q.success = function(r) {
                    if (r.status == 1 && r.msg == 'success') {
                        $('tr[actionid="' + id + '"]').remove();
                        delete aod.data[id];
                        for (var i = 0; i < pna.length; i++) {
                            delete aod.tree[pna[i]][id];
                        }
                        showMessage('筛选' + name, '删除成功');
                    } else {
                        swal({
                            title: r.msg,
                            text: 'Error',
                            type: 'warning',
                            timer: 3000,
                            showCloseButton: true,
                            showCancelButton: true,
                        })
                    }
                }
                $.api('filter/delete', p, q)
                swal.close();
            } else {
                swal.close();
            }
        });
    })
    //在编辑筛选页面中点击树形目录的操作
    $('.pathshowContainer').on('click', 'li', function(e) {
        e.stopPropagation();
        e.preventDefault();
        $('.selectpathnamespanSelect').removeClass('selectpathnamespanSelect');
        $(this).find('span.selectpathnamespan').eq(0).addClass('selectpathnamespanSelect');
        var a = [],
            b = [];;
        a.push($(this).find('span.selectpathnamespan').eq(0).text());
        b.push($(this).attr('folderid'));
        var t = $(this).parent();
        $('.pathshowContainer').attr('actionid', $(this).attr('folderid'));
        for (var i = 0; i < 100; i++) {
            if (t.attr('class') == 'subpathUl' || t.attr('folderid') != 0) {
                t = t.parent();
                if (t.attr('folderid') == 0) {
                    a.push('根目录');
                    b.push(t.attr('folderid'));
                    break;
                } else {
                    a.push(t.find('span.selectpathnamespan').eq(0).text());
                    if (t.attr('folderid') != null) {
                        b.push(t.attr('folderid'));
                    }
                }
            }
        }
        a.reverse();
        b.reverse();
        var text = a.join(' > ');
        if ($(this).attr('folderid') == 0) {
            text = '根目录';
        }
        $('#pathnamespan').text(text);
        $('#pathnamespan').attr('pathName', b.join('-'));
    })
    //点击确定目录操作
    $('.confirmPath').on('click', function() {
        $('.pathshowContainerShow').removeClass('pathshowContainerShow');
    })
    //点击保存按钮
    $('.saveFilter').on('click', function() {
        $('.pathshowContainerShow').removeClass('pathshowContainerShow');
        $('.parentFilterListContainerShow').removeClass('parentFilterListContainerShow');
        var fn = $('#filternameinput').val();
        var pn = $('#pathnamespan').text();
        var ds = $('select.db option:selected').val().replace(/\s+/g, ' ');
        var st = $('input[name="showtype"]:checked').val();
        var dt = $('textarea.datatable').val();
        var sn = $('input.showNumber').val();
        var dfs = $('input[name="defaultShow"]:checked').val();
        var nr = $('input[name="mustrequire"]:checked').val();
        var pid = $('.parentFilterName').attr('pid');
        if (pid == null) {
            pid = '';
        }
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
        if (pid != null && pid != '' && jc == '') {
            flag = false;
            $('input.relativecolumn').addClass('inputerror');
            alert('父筛选不为空,请确保关联字段不为空');
            setTimeout(function() {
                $('input.relativecolumn').removeClass('inputerror');
            }, 2000)
        }
        if ((pid == null || pid == '') && jc != null && jc != '') {
            flag = false;
            $('span.parentFilterName').addClass('inputerror');
            alert('关联字段不为空,请确保父筛选不为空');
            setTimeout(function() {
                $('span.parentFilterName').removeClass('inputerror');
            }, 2000)
        }
        if (flag) {
            var p = {},
                q = {},
                tp = {};
            q.atype = 'POST';
            p.isPrivate = 1;
            p.name = fn;
            if (st == '复选') {
                p.type = 'selectMul';
            } else if (st == '单选') {
                p.type = 'select';
            }
            if(pid == null || pid ==''){
                pid = 0;
                jc = '';
            }
            p.parentId = pid;
            p.pathName = $('#pathnamespan').attr('pathName');
            tp.joinColumn = jc;
            tp.filterColumn = (dt.substr(dt.indexOf('as value') + 8, dt.indexOf('as text') - dt.indexOf('as value') - 8)).replace(/\s+/g, '').replace(',', '');
            tp.defaultValue = dfs;
            tp.dataSourceId = ds;
            tp.required = nr;
            if (sn == '' || sn == 0) {
                tp.autoComplete = true;
            } else if (sn > 0) {
                tp.autoComplete = false;
            }
            tp.content = dt;
            tp.queryLimit = sn;
            tp.selectMax = $('input.maxselectinput').val().replace(/[\r\n\ ]/g, '');
            tp.selectMin = $('input.minselectinput').val().replace(/[\r\n\ ]/g, '');
            p.conf = JSON.stringify(tp);
            var action = $fe.attr('action');
            q.success = function(r) {
                if (r.status == 1 && r.msg == 'success') {
                    if (action == 'new') {
                        showMessage('筛选' + fn, '新增成功');
                        fullEditContent();
                        $fe.removeClass('filterEditOutContainerShow');
                    } else if (action == 'edit') {
                        showMessage('筛选' + fn, '修改成功');
                    }
                    initallData();
                } else {
                    swal({
                        title: r.msg,
                        text: 'Error',
                        type: 'warning',
                        timer: 3000,
                        showCloseButton: true,
                        showCancelButton: true,
                    })
                }
            }
            if (action == 'new') {
                $.api('filter/save', p, q)
            } else if (action == 'edit') {
                p.id = $fe.attr('actionid')
                $.api('filter/update', p, q)
            }
        }
    })
}
//获取所有筛选并填充表格
function initallData(pathid) {
    pathid = pathid || 0;
    var p = {},
        q = {};
    p.isPrivate = 1;
    q.success = function(r) {
        if (r != null) {
            if (r.length == 0) {
                showMessage('暂时还没有筛选', '请点击左上角添加按钮')
            } else {
                for (var i = 0; i < r.length; i++) {
                    if (r[i].pathName == '') {
                        r[i].pathName = '0';
                    }
                    aod.data[r[i].id] = r[i];
                    var td = r[i].pathName.split('-');
                    for (var j = 0; j < td.length; j++) {
                        if (!aod.tree.hasOwnProperty(td[j])) {
                            aod.tree[td[j]] = {};
                        }
                        aod.tree[td[j]][r[i].id] = r[i];
                    }
                }
                showData(pathid);
            }
        } else {
            swal({
                title: r.msg,
                text: 'Error',
                type: 'warning',
                timer: 3000,
                showCloseButton: true,
                showCancelButton: true,
            })
        }
    }
    $.api('filter/getFilterList', p, q);
}

function showData(pathid) {
    var data = aod.tree[pathid];
    var str = "";
    var to = {
        "selectMul": "复选",
        "select": "单选",
        "textBox": "输入框",
        "dateRangeBox": "时间范围",
    }
    var df = new DateFormat();
    var tda = [];
    for (var i in data) {
        var str1 = "";
        str1 += "<tr actionid ='" + data[i].id + "'>";
        str1 += "<td>" + data[i].name + "</td>";
        str1 += "<td>" + to[data[i].type] + "</td>";
        str1 += "<td>" + data[i].trueName + "</td>";
        str1 += "<td>" + df.convertimestamp(data[i].createTime) + "</td>";
        str1 += "<td>" + df.convertimestamp(data[i].updateTime) + "</td>";
        str1 += "<td><i class='fa fa-edit' actionid='" + data[i].id + "'></i>";
        str1 += "<i class='fa fa-remove' actionid='" + data[i].id + "'></i></td>";
        str1 += "</tr>";
        tda.push(str1);
    }
    tda.reverse();
    str += tda.join('');
    if (str == '') {
        str = "<tr class='nodata'><td colspan='6'>暂无筛选,请点击左上角添加按钮</td></tr>"
    }
    $('.filtertable tbody').html(str);
    $('.treeLiSelect').removeClass('treeLiSelect');
    $('.rootNavUl').find('li[folderid="' + pathid + '"]').find('.Center-Container').eq(0).addClass('treeLiSelect');
}
//填充筛选设计编辑框里的内容
function fullEditContent(p) {
    if (p == null) {
        $('.datasourceEdit').html(returndbSelect(window.db));
        $('textarea.datatable').val('');
        $('input.showNumber').val('');
        $('input.key').val('');
        $('input.kvalue').val('');
        $('input.maxselect').val('');
        $('input.minselect').val('');
        $('input.relativecolumn').val('');
        $('input#filternameinput').val('');
        $('input.parentFilterInput').val('');
        $('span#pathnamespan').text('');
        $('#pathnamespan').removeAttr('pathName');
        $('.parentFilterName').text('');
        $('.parentFilterName').removeAttr('pid');
        var str = '<span class="editFilterInfo">展示方式:</span><input name="showtype" checked type="radio" value="复选"><span class="showtypeInfo">复选</span><input name="showtype" type="radio" value="单选"><span class="showtypeInfo">单选</span>';
        $('div.showtypeContainer').html(str);
        fullParentList();
        var ul = $('.rootNavUl');
        var st = "";
        $('.pathShowUl').html(refreshFolderList(ul, st));
    } else {
        $('input.parentFilterInput').val('');
        var d = aod.data[p];
        $('#filternameinput').val(d.name);
        $('#pathnamespan').attr('pathName', d.pathName);
        var pathname = d.pathName.split('-');
        var pathna = [];
        for (var i = 0; i < pathname.length; i++) {
            pathna.push($('.rootNavUl').find('li[folderid="' + pathname[i] + '"]').find('.foldName').eq(0).text().replace(/\s+/g, ''));
        }
        fullParentList(p);
        if (d.parentId != null && d.parentId != ''&& d.parentId != 0) {
            $('.parentFilterListUl li[actionid="' + d.parentId + '"]').addClass('selected');
            $('.parentFilterName').text(aod.data[d.parentId].name);
            $('.parentFilterName').attr('pid', d.parentId);
        } else {
            $('.parentFilterName').text('');
            $('.parentFilterName').removeAttr('pid');
        }
        var ul = $('.rootNavUl');
        var st = "";
        $('.pathShowUl').html(refreshFolderList(ul, st));
        $('#pathnamespan').text(pathna.join('>'));
        $fe.addClass('filterEditOutContainerShow');
        $('.datasourceEdit').html(returndbSelect(window.db));
        if (d.type == '复选' || d.type == 'selectMul') {
            var str1 = '<span class="editFilterInfo">展示方式:</span><input name="showtype" checked type="radio" value="复选"><span class="showtypeInfo">复选</span><input name="showtype" type="radio" value="单选"><span class="showtypeInfo">单选</span>';
            $('div.gouxuan').show();
        } else {
            var str1 = '<span class="editFilterInfo">展示方式:</span><input name="showtype"  type="radio" value="复选"><span class="showtypeInfo">复选</span><input name="showtype" type="radio" checked value="单选"><span class="showtypeInfo">单选</span>';
            $('div.gouxuan').hide();
        }
        $('div.showtypeContainer').html(str1);
        var tp = JSON.parse(d.conf);
        $('input.maxselectinput').val(tp.selectMax);
        $('input.minselectinput').val(tp.selectMin);
        $('textarea.datatable').val(tp.content);
        if (tp.required == 'yes') {
            $('input[name="mustrequire"][value="yes"]').attr('checked', 'checked');
            $('input[name="mustrequire"][value="no"]').removeAttr('checked');
        } else {
            $('input[name="mustrequire"][value="no"]').attr('checked', 'checked');
            $('input[name="mustrequire"][value="yes"]').removeAttr('checked');
        }
        $('input.showNumber').val(tp.queryLimit);
        $('input.relativecolumn').val(tp.joinColumn);
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
            // console.log(str);
            return str;
        } else {
            var foldername = $(this).find('span.foldName').eq(0).text().replace(/[\r\n\ ]/g, '');
            str1 += '<li folderId=' + $(this).attr('folderId') + '><span class="selectpathnamespan"><i class="folder fa fa-folder"></i>' + foldername + '</span></li>';
        }
    })
    str += str1;
    return str;
}

function fullParentList(id, keyword) {
    var tempa = [];
    if(id == ''){
        id = null;
    }
    if(keyword ==''){
        keyword = null;
    }
    if (id == null && keyword == null) {
        for (var i in aod.data) {
            tempa.push("<li actionid='" + i + "'>" + aod.data[i].name + "</li>");
        }
    } else if (id == null && keyword != null && keyword != '') {
        for (var i in aod.data) {
            if (aod.data[i].name.indexOf(keyword) > -1) {
                tempa.push("<li actionid='" + i + "'>" + aod.data[i].name + "</li>");
            }
        }
    } else if (id != null && keyword == null) {
        for (var i in aod.data) {
            if (i != id) {
                tempa.push("<li actionid='" + i + "'>" + aod.data[i].name + "</li>");
            }
        }
    } else if (id != null && keyword != null) {
        for (var i in aod.data) {
            if (i != id && aod.data[i].name.indexOf(keyword) > -1) {
                tempa.push("<li actionid='" + i + "'>" + aod.data[i].name + "</li>");
            }
        }
    }
    var str = '';
    if (tempa.length == 0) {
        if (keyword != null && keyword != '') {
            str = "<li actionid='no'>暂无搜索结果</li>";
        } else {
            str = "<li actionid='no'>暂无父筛选</li>";
        }
        tempa.push(str);
    } else {
        tempa.push("<li actionid='blank'>空</li>")
    }
    tempa.reverse();
    str = tempa.join('');
    $('.parentFilterListUl').html(str);
    if (id != null) {
        $('.parentFilterListUl li[actionid="' + id + '"]').addClass('selected');
    }
}