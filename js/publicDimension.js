$(document).ready(function() {
    baseClick();
    window.aod = {};
    initDB();
    $ec = $('.editDimensionOutContainer'); //editcontainer
    $dl = $('.dimensionList'); //dimensionlist
    $edim = $('.editDimension'); //editdimenstion
})

function initDB() {
    var q = {};
    q.next = getAllDataSets;
    getDBb(q);
}

function getAllDataSets() {
    var url = 'dataset/getDatasetList';
    var p = {};
    p.datasetType = 1;
    var q = {};
    q.success = function(r) {
        var str = "";
        if (r == null || r.length == 0) {
            str += "<tr class='nodata'><td class='nodata' colspan='4'>还没添加数据源,请先添加维表</td></tr>";
        } else {
            var df = new DateFormat();
            var da = [];
            //填充所有数据表格
            for (var i = 0; i < r.length; i++) {
                window.aod[r[i].id] = {};
                window.aod[r[i].id].data = r[i];
                da.push(r[i].id);
            }
            da.sort();
            da.reverse();
            for (var i = 0; i < da.length; i++) { 
                var td = window.aod[da[i]].data;
                str += "<tr actionid='" + td.id + "'>";
                str += "<td class='dbn' datasourceId ='" + td.datasourceId + "' dbName='" + td.dbName + "' tableName='" + r[i].tableName + "' >";
                str += window.db[td.datasourceId].name + td.dbName + "." + td.tableName + "</td>";
                str += "<td>" + td.trueName + "</td>";
                str += "<td>" + df.convertimestamp(td.createTime, 'yyyy-mm-dd') + "</td>";
                if (td.updateTime == 321465600000) {
                    str += "<td>" + df.convertimestamp(td.createTime, 'yyyy-mm-dd') + "</td>";
                } else {
                    str += "<td>" + df.convertimestamp(td.updateTime, 'yyyy-mm-dd') + "</td>";
                }
                str += "<td><i class='fa fa-edit' actionid='" + td.id + "'></i></td>";
                // str += "<i class='fa fa-remove' actionid='" + r[i].id + "'></i>";
                str += "</tr>";
            }
        }
        $('.tableContainer tbody').html(str);
    }
    $.api(url, p, q);
}

function baseClick() {
    //点击显示表列表
    $('.editDimensionContainer').on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        $('.allTableUlContainerShow').removeClass('allTableUlContainerShow');
    })
    $('.allTableUlContainer').on('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
    })
    //点击关闭弹出框的事件
    $('.closeContainer').on('click', function() {
        $ec.removeClass('editDimensionOutContainershow');
    })
    //点击维度列表的事件
    $('.dimensionListUl').on('click', 'li', function() {
        $('.editDimension').attr('action', 'update');
        $('.editDimension').attr('actionid', $(this).attr('actionid'));
        var tableid = $ec.attr('actionid');
        var aid = $(this).attr('actionid')
        var d = window.aod[tableid].dimensionlist[aid];
        $('.keyname').val(d.displayName);
        $('.keykey').val(d.columnName);
        $('.keyvalue').val(d.expression);
        $('li.dimensionListUlliselect').removeClass('dimensionListUlliselect');
        $(this).addClass('dimensionListUlliselect');
    })
    //点击新增维度的事件
    $('.addDimension').on('click', function() {
        $('li.dimensionListUlliselect').removeClass('dimensionListUlliselect');
        $('.keyname').val('');
        $('.keykey').val('');
        $('.keyvalue').val('');
        $dl.show();
        $edim.removeAttr('actionid');
        $('.keyname').focus();
        $('.keyname').addClass('inputerror');
        setTimeout(function() {
            $('.keyname').removeClass('inputerror');
        }, 2000);
        $('.editDimension').attr('action', 'new');
    })
    //保存维度事件
    $('.saveDimension').on('click', function() {
        var flag = false;
        var keyname = $('.keyname').val().replace('[/ /r/n]/g', '');
        var keykey = $('.keykey').val().replace('[/ /r/n]/g', '');
        var keyvalue = $('.keyvalue').val().replace('[/ /r/n]/g', '');
        if (keyname != '' && keykey != '' && keyvalue != '') {
            flag = true;
        } else {
            if (keyname == '') {
                $('.keyname').addClass('inputerror');
                setTimeout(function() {
                    $('.keyname').removeClass('inputerror');
                }, 1000)
            }
            if (keykey == '') {
                $('.keykey').addClass('inputerror');
                setTimeout(function() {
                    $('.keykey').removeClass('inputerror');
                }, 1000)
            }
            if (keyvalue == '') {
                $('.keyvalue').addClass('inputerror');
                setTimeout(function() {
                    $('.keyvalue').removeClass('inputerror');
                }, 1000)
            }
        }
        if (flag) {
            var action = $edim.attr('action');
            var actionid = $ec.attr('actionid');
            if (action == null || action == 'new' || action == '') {
                addnewDimention(actionid, keyname, keykey, keyvalue);
            } else if (action == 'update') {
                var actionid = $ec.attr('actionid');
                var dimensionid = $edim.attr('actionid');
                updateDimention(dimensionid,keyname, keykey, keyvalue); 
               /* $('li[actionid="' + dimensionid + '"]').text(keyname + '(' + keykey + ')');
                showMessage('维度' + keyname, '修改成功');*/
            }
        }
    })
    //点击数据源表行的事件
    $('.tableContainer tbody').on('click', 'tr', function(e) {
        if ($(this).find('.nodata').length == 0) {
            e.stopPropagation();
            e.preventDefault();
            var $container = $ec;
            $container.addClass('editDimensionOutContainershow');
            $container.attr('action', 'edit');
            var id = $(this).attr('actionid');
            $('.dimensionListUl li').remove();
            $container.attr('actionid', id);
            $ec.attr('action', 'new');
            $edim.attr('action', 'new');
            $edim.removeAttr('actionid');
            $('.keyname').val('');
            $('.keykey').val('');
            $('.keyvalue').val('');
            $dl.show();
            refreshDimensionList(id);
        }
    })
    /*
        //点击数据表行删除icon
        $('.tableContainer tbody').on('click', 'i.fa-remove', function(e) {
            e.preventDefault();
            e.stopPropagation();
            var str = $(this).parent().parent().find('.tablename').text();
            var tableid = $(this).attr('actionid');
            swal({
                title: "确定删除表",
                text: str,
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "确定删除！",
                cancelButtonText: "取消删除！",
                closeOnConfirm: false,
                closeOnCancel: false
            }, function(isConfirm) {
                if (isConfirm) {
                    swal.close();
                    $('tr[actionid="' + tableid + '"]').remove();
                    showMessage('表' + str, '删除成功');
                } else {
                    swal.close();
                }
            });
        })*/
    //删除维度
    $('.dimensionListUl').on('click', '.removeDimension', function(e) {
        e.preventDefault();
        e.stopPropagation();
        var id = $(this).parent().attr('actionid');
        var dimensiontext = $(this).parent().html().replace('<span class="removeDimension">x</span>', '');
        swal({
            title: "确定删除维度",
            text: dimensiontext,
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
                p.datasetDetailId = id;
                q.success = function(r) {
                    if (r.status == 1) {
                        swal.close();
                        $('li[actionid="' + id + '"]').remove();
                        var editid = $('.editDimension').attr('actionid');
                        if (id == editid) {
                            $('.editDimension').attr('action', 'new');
                            $('.editDimension').removeAttr('actionid');
                            $('.keyname').val('');
                            $('.keykey').val('');
                            $('.keyvalue').val('');
                        }
                        var tid = $ec.attr('actionid');
                        delete window.aod[tid].dimensionlist[id];
                        showMessage('维度' + dimensiontext, '删除成功');
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
                $.api('dataset/deleteDimColumn', p, q)
                swal.close();
            } else {
                swal.close();
            }
        });
    })
}

function  updateDimention(a,b,c,d){
    var p = {},
        q = {};
    q.atype = 'POST';
    p.id = a;
    p.displayName = b;
    p.columnName = c;
    p.expression = d;
    q.success = function(r) {
        if (r.status == 1) {
            var tid = $ec.attr('actionid');
            window.aod[tid].dimensionlist[a] = {};
            window.aod[tid].dimensionlist[a].displayName = b;
            window.aod[tid].dimensionlist[a].columnName = c;
            window.aod[tid].dimensionlist[a].expression = d;
            $('li[actionid="' +a + '"]').html(b + '(' + c + ')<span class="removeDimension">x</span>');
            showMessage(b + '(' + c + ')', '修改成功');
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
        // console.log(r);
    }
    $.api('dataset/updateDimColumn', p, q);
}
function addnewDimention(a, b, c, d) {
    var p = {},
        q = {};
    q.atype = 'POST';
    p.datasetId = a;
    p.displayName = b;
    p.columnName = c;
    p.expression = d;
    q.success = function(r) {
        if (r.status == 1) {
            window.aod[a].dimensionlist[r.id] = {};
            window.aod[a].dimensionlist[r.id].displayName = b;
            window.aod[a].dimensionlist[r.id].columnName = c;
            window.aod[a].dimensionlist[r.id].expression = d;
            var o = {};
            o[r.id] = {};
            o[r.id].displayName = b;
            o[r.id].columnName = c;
            o[r.id].expression = d;
            returnLi(o);
            $('.editDimension').attr('action','update');
            $('.editDimension').attr('actionid',r.id);
            showMessage(b + '(' + c + ')', '新增成功');
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
        // console.log(r);
    }
    $.api('dataset/saveDimColumn', p, q);
}

function refreshDimensionList(id) {
    if (window.aod[id].hasOwnProperty('dimensionlist')) {
        returnLi(window.aod[id].dimensionlist);
    } else {
        var p = {},
            q = {};
        p.datasetId = id;
        q.success = function(r) {
            window.aod[id].dimensionlist = {};
            if (r.length > 0) {
                for (var i = 0; i < r.length; i++) {
                    window.aod[id].dimensionlist[r[i].id] = r[i];
                }
                returnLi(window.aod[id].dimensionlist);
            }
        }
        $.api('dataset/getDimColumnList', p, q);
    }
}

function returnLi(d) {
    var str = "";
    var a = [];
    for (var i in d) { 
        a.push(i);
    }
    a = a.sort();
    a.reverse();
    for(var j=0;j<a.length;j++){
            str += "<li actionid = '" + a[j] + "'>";
            str += d[a[j]].displayName + '(' + d[a[j]].columnName + ')';
            str += "<span class='removeDimension'>x</span>";
            str += "</li>";
    }
    if ($('.dimensionListUl li').length == 0) {
        $('.dimensionListUl').html(str);
    } else {
        $('.dimensionListUl li').eq(0).before(str);
    }
}