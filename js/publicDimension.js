$(document).ready(function() {
    baseClick();
    window.alldata = {};
    initDB();
    $ec = $('.editDimensionOutContainer'); //editcontainer
    $dl = $('.dimensionList'); //dimensionlist
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
            str += "<tr class='nodata'><td colspan='4'>还没添加数据源,请按左上角按钮添加</td></tr>";
        } else {
            var df = new DateFormat();
            //填充所有数据表格
            for (var i = 0; i < r.length; i++) {
                str += "<tr actionid='"+r[i].id+"'>";
                str += "<td class='dbn' datasourceId ='"+r[i].datasourceId+"' dbName='"+r[i].dbName
                +"' tableName='"+r[i].tableName+"' >" ;
                str += window.db[r[i].datasourceId].name + r[i].dbName + "." + r[i].tableName + "</td>";
                str += "<td>" + r[i].trueName + "</td>";
                str += "<td>" + df.convertimestamp(r[i].createTime, 'yyyy-mm-dd') + "</td>";
                if (r[i].updateTime == 321465600000) {
                    str += "<td>" + df.convertimestamp(r[i].createTime, 'yyyy-mm-dd') + "</td>";
                } else {
                    str += "<td>" + df.convertimestamp(r[i].updateTime, 'yyyy-mm-dd') + "</td>";
                }
                str += "<td><i class='fa fa-edit' actionid='" + r[i].id + "'></i>";
                str += "<i class='fa fa-remove' actionid='" + r[i].id + "'></i></td>";
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

    //点击新建维表的事件
    $('.addDimensionTable').on('click', function() {
        $ec.addClass('editDimensionOutContainershow');
        $ec.attr('action', 'new');
        $ec.removeAttr('actionid');
        $dl.hide();
        $('.edittitleinput').val('');
        $('.edittitleinput').eq(0).focus();
        $('.editTable').hide();
        $('.saveTable').show();
        $('.cancelsaveTable').hide();
        $('.edittitleinput').removeAttr('disabled');
        $('.addDimension').addClass('btn-forbidden');
        $('.dimensionListUl li').remove();
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
        var d = window.alldata[tableid][aid];
        $('.keyname').val(d.keyname);
        $('.keykey').val(d.keykey);
        $('.keyvalue').val(d.keyvalue);
    })
    //点击新增维度的事件
    $('.addDimension').on('click', function() {
        if ($.inArray('btn-forbidden', $(this).attr('class').split(' ')) > -1) {
            //  alert('请确保有数据源表');
            sweetAlert({
                title: "error!",
                text: "请确保有数据源表!",
                type: "error",
                timer: 1000,
            });
            $('.edittitleinput').focus();
            $('.edittitleinput').addClass('inputerror');
            setTimeout(function() {
                $('.edittitleinput').removeClass('inputerror');
            }, 2000);
        } else {
            $('.keyname').val('');
            $('.keykey').val('');
            $('.keyvalue').val('');
            $dl.show();
            $('.keyname').focus();
            $('.editDimension').attr('action', 'new');
        }
    })
    //点击编辑数据源的事件
    $('.editTable').on('click', function() {
        $('.editTable').hide();
        $('.saveTable').show();
        $('.cancelsaveTable').show();
        $('.edittitleinput').removeAttr('disabled');
        $('.edittitleinput').focus;
        window.tb = $('input[name="tablename"]').val().replace('[/ /r/n]/g', '');
    })
    //点击取消保存数据源的事件
    $('.cancelsaveTable').on('click', function() {
        $('.editTable').show();
        $('.saveTable').hide();
        $('.cancelsaveTable').hide();
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
            var action = $(this).parent().parent().attr('action');
            if (action == 'new') {
                var id = (Math.random() * (10000000 - 0)).toFixed(0);
                var actionid = $ec.attr('actionid');
                window.alldata[actionid][id] = {};
                window.alldata[actionid][id].id = id;
                window.alldata[actionid][id].keyname = keyname;
                window.alldata[actionid][id].keykey = keykey;
                window.alldata[actionid][id].keyvalue = keyvalue;
                var d = {},
                    t = {};
                d.id = id;
                d.keyname = keyname;
                d.keykey = keykey;
                d.keyvalue = keyvalue;
                t[actionid] = d;
                returnLi(t);
                $('.keyname').val('');
                $('.keykey').val('');
                $('.keyvalue').val('');
                showMessage('维度' + keyname, '新增成功');
            } else if (action == 'update') {
                var actionid = $ec.attr('actionid');
                var dimensionid = $('.editDimension').attr('actionid');
                window.alldata[actionid][dimensionid].keyname = keyname;
                window.alldata[actionid][dimensionid].keykey = keykey;
                window.alldata[actionid][dimensionid].keyvalue = keyvalue;
                $('li[actionid="' + dimensionid + '"]').text(keyname + '(' + keykey + ')');
                showMessage('维度' + keyname, '修改成功');
            }
        }
    })
    //点击数据源表行的事件
    $('.tableContainer tbody').on('click', 'tr', function(e) {
        if ($(this).find('.notddata').length == 0) {
            e.stopPropagation();
            e.preventDefault();
            var $container = $ec;
            $container.addClass('editDimensionOutContainershow');
            $container.attr('action', 'edit');
            var id = $(this).attr('actionid');
            $container.attr('actionid', id);
            $ec.attr('actionid', id);
            var d = window.alldata[id];
            $('.edittitleinput').attr('disabled', '').val(d.name);
            $('.addDimension').removeClass('btn-forbidden');
            $('.dimensionListUl li').remove();
            returnLi(d);
            $('.keyname').val('');
            $('.keykey').val('');
            $('.keyvalue').val('');
            $dl.show();
        }
    })
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
    })
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
                swal.close();
                $('li[actionid="' + id + '"]').remove();
                showMessage('维度' + dimensiontext, '删除成功');
                var editid = $('.editDimension').attr('actionid');
                if (id == editid) {
                    $('.editDimension').attr('action', 'new');
                    $('.editDimension').removeaAttr('actionid');
                    $('.keyname').val('');
                    $('.keykey').val('');
                    $('.keyvalue').val('');
                }
            } else {
                swal.close();
            }
        });
    })
}

function appendTable(id, tablename, tableCreator, createtime, updatetime) {
    $('.notddata').remove();
    var str = "<tr actionid='" + id + "'>";
    str += "<td class='tablename'>" + tablename + "</td>";
    str += "<td>" + tableCreator + "</td>";
    str += "<td>" + createtime + "</td>";
    str += "<td>" + updatetime + "</td>";
    str += "<td class='optable'><i class='fa fa-edit'  actionid='" + id + "'></i>" + "<i class='fa fa-remove'  actionid='" + id + "'></i></td>";
    str += "</tr>";
    if ($('.tableContainer tbody tr').length == 0) {
        $('.tableContainer tbody').html(str);
    } else {
        $('.tableContainer tbody tr').eq(0).before(str);
    }
}

function returnLi(d) {
    var str = "";
    for (var i in d) {
        if (i != 'name') {
            str += "<li actionid = '" + d[i].id + "'>";
            str += d[i].keyname + '(' + d[i].keykey + ')';
            str += "<span class='removeDimension'>x</span>";
            str += "</li>";
        }
    }
    if ($('.dimensionListUl li').length == 0) {
        $('.dimensionListUl').html(str);
    } else {
        $('.dimensionListUl li').eq(0).before(str);
    }
}