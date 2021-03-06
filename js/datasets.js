$(document).ready(function() {
    $table = $('table.datasettable'); 
    aod = {};
    initDB();
})

function initDB() {
    var q = {};
    q.next = getAllDataSets;
    getDBb(q);
}

function getAllDataSets(refreshtable) {
    var url = 'dataset/getDatasetList';
    var p = {};
    var q = {};
    q.success = function(r) {
        var str = "";
        if (r == null || r.length == 0) {
            str += "<tr class='nodata'><td colspan='4'>还没添加数据源,请按左上角按钮添加</td></tr>";
        } else {
            var td = [];
            for (var i = 0; i < r.length; i++) {
                aod[r[i].id] = r[i];
                td.push(r[i].id);
            }
            td.sort();
            td.reverse();
            //填充所有数据表格
            var d = [];
            for (var i = 0; i < td.length; i++) {
                var o = {};
                var tempd = aod[td[i]];
                o.id = tempd.id;
                o.datasourceId = tempd.datasourceId;
                o.db = window.db[tempd.datasourceId].name + tempd.dbName;
                o.tn = tempd.tableName;
                o.type = (tempd.type == 2 ? '事实表' : '维度表');
                o.oper = '<i class="fa fa-pencil"></i><i class="fa fa-remove">';
                /*
                                str += "<tr tid='" + tempd.id + "'>";
                                str += "<td>" + window.db[tempd.datasourceId].name + tempd.dbName + "</td>";
                                str += "<td>" + tempd.tableName + "</td>";
                                str += "<td>" + (tempd.type == 2 ? '事实表' : '维度表') + "</td>";
                                str += '<td><i class="fa fa-pencil"></i><i class="fa fa-remove"></td>';
                                str += "</tr>";*/
                d.push(o);
            }
        }
        if(refreshtable){
             $table.DataTable().destroy();
        }
        $table.DataTable({
            rowId: 'id',
            "lengthChange": false,
            "language": {
                "emptyTable": "暂时没有数据,请点击左上角添加按钮",
                "info": " 共_TOTAL_(当前_START_ - _END_)  ",
                "infoEmpty": "",
                "thousands": ",",
                "lengthMenu": "显示 _MENU_ 条",
                "loadingRecords": "拼命加载中...",
                "search": "搜索",
                "zeroRecords": "未搜索到相关结果",
                "paginate": {
                    "first": "第一页",
                    "last": "最后一页",
                    "next": "下一页",
                    "previous": "上一页"
                },
            }, 
            "columns": [{
                "data": "db"
            }, {
                "data": "tn"
            }, {
                "data": "type"
            }, {
                "data": "oper"
            }],
            data: d,
        });
        // $('table.datasettable tbody').html(str);
    }
    $.api(url, p, q);

    baseClick();
}

function baseClick() {
    $('.addDataset').on('click', function() {
        if ($('.datasetsContainer').attr('active') == null || $('.datasetsContainer').attr('active') == '') {
            $('.datasetsContainer').attr('active', 'new');
            var str = "<tr class='newdt'>";
            str += "<td>" + getDb() + "</td>";
            str += "<td><input class='tableinput tablename' placeholder='在此处输入表名'/></td>";
            str += "<td><select class='tableselect ttype'><option>事实表</option><option>维度表</option></select></td>";
            // str += "<td><input class='tableinput tableinfo'  placeholder='在此处输入备注'/></td>";
            str += '<td><i class="fa fa-save"></i><i class="fa fa-remove"></i></td>';
            str += "</tr>";
            if ($('.dataTables_empty').length == 1 || $('.datasettable tbody tr').length == 0) {
                $('.datasettable tbody').html(str);
            } else {
                $('.datasettable tbody tr').eq(0).before(str);
            }
        } else {
            showMessage('请先完成当前编辑内容', '')
        }
    })
    //点击fa-remove的操作
    $('table.datasettable').on('click', '.fa-remove', function() {
        if ($('.datasetsContainer').attr('active') == 'new') {
            swal({
                title: "新增未保存哦",
                text: "确定不保存吗?",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "确定不保存！",
                cancelButtonText: "再去改改！",
                closeOnConfirm: false,
                closeOnCancel: false
            }, function(isConfirm) {
                if (isConfirm) {
                    $('.newdt').remove();
                    swal.close();
                    $('.datasetsContainer').attr('active', '');
                } else {
                    swal.close();
                }
            });
        } else if ($('.datasetsContainer').attr('active') == 'edit') {
            var p = $(this).parent().parent();
            swal({
                title: "修改未保存哦",
                text: "确定不保存吗?",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "确定不保存！",
                cancelButtonText: "再去改改！",
                closeOnConfirm: false,
                closeOnCancel: false
            }, function(isConfirm) {
                if (isConfirm) {
                    p.find('td').eq(0).html(window.dbn);
                    p.find('td').eq(1).html(window.tn);
                    p.find('td').eq(2).html(window.type);
                    p.find('td').eq(3).html('<i class="fa fa-pencil"></i><i class="fa fa-remove"></i>');
                    window.dbn = null;;
                    window.tn = null;
                    window.type = null;
                    $('.datasetsContainer').attr('active', '');
                    swal.close();
                } else {
                    swal.close();
                }
            });
        } else {
            $('.datasetsContainer').attr('active', 'delete');
            var p = $(this).parent().parent();
            var data = $table.DataTable().row(p);
            var tn = p.find('td').eq(0).text() + '.' + p.find('td').eq(1).text();
            swal({
                title: "确定删除表吗?",
                text: tn,
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "确定删除！",
                cancelButtonText: "再想想！",
                closeOnConfirm: false,
                closeOnCancel: false
            }, function(isConfirm) {
                if (isConfirm) {
                    var pa = {},
                        q = {};
                     pa.datasetId = data.id;
                    q.success = function(r) {
                        if (r.msg == 'success') {
                            p.remove();
                            swal.close();
                            showMessage(tn, '删除成功');
                            $('.datasetsContainer').attr('active', '');
                            $table.DataTable().row(p).remove().draw();
                        }
                    }
                    $.api('dataset/delete', pa, q)
                } else {
                    $('.datasetsContainer').attr('active', '');
                    swal.close();
                }
            });
        }
    })
    //点击fa-save的操作
    $('table.datasettable').on('click', '.fa-save', function() {

        var p = $(this).parent().parent();
         var data = $('table.datasettable').DataTable().row(p).data();
        var db = p.find('select.db option:selected').text();
        var type = p.find('select.ttype option:selected').text();
        var tn = p.find('input.tablename').val().replace('/[/r/n/ ]/g', '');
        // var info = p.find('input.tableinfo').val();
        if (tn != null && tn != '') {
            var params = {};
            params.dbName = $('.db option:selected').attr('db');
            params.tableName = tn;
            params.datasetName = tn;
            if (type == '事实表') {
                params.type = 2;
            } else if (type == '维度表') {
                params.type = 1;
            }
            if ($('.datasetsContainer').attr('active') == 'new') { //新建维表的时候
                params.datasourceId = $('.db option:selected').val();
                var url = "dataset/save";
                var q = {};
                q.atype = 'POST';
                q.success = function(r) {
                    if (r.msg == 'success') {
                        aod[r.id] = {};
                        aod[r.id].datasourceId = params.datasourceId;
                        aod[r.id].id = r.id;
                        aod[r.id].type = params.type;
                        aod[r.id].tableName = params.tableName;
                        aod[r.id].dbName = params.dbName;
                        /*var str = "<tr tid ='" + r.id + "' > ";
                        str += "<td>" + db + "</td>";
                        str += "<td>" + tn + "</td>";
                        str += "<td>" + type + "</td>";
                        str += '<td><i class="fa fa-pencil"></i><i class="fa fa-remove"></i></td>';
                        str += "</tr>";
                        if ($('tr.nodata').length == 1) {
                            $('.datasettable tbody').html(str);
                        } else {
                            $('.datasettable tbody tr').eq(0).before(str);
                        }*/
                        //var o = {};
                        //o.id = r.id;
                        //o.datasourceId = params.datasourceId;
                        //o.type = type;
                        //o.tn = params.tableName;
                        //o.db = db;
                        //o.oper = '<i class="fa fa-pencil"></i><i class="fa fa-remove">';
                        //$('.dataTable').DataTable().row.add(o).draw();
                        //$('tr.newdt').remove();
                        getAllDataSets(true);
                        $('.datasetsContainer').attr('active', '');
                        showMessage('维度表' + db + '.' + tn, '新增成功');
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
                $.api(url, params, q);
            } else if ($('.datasetsContainer').attr('active') == 'edit') { //编辑维表的时候
                var url = "dataset/update";
                var params = {};
                params.datasourceId = $('.db option:selected').val();
                params.dbName = $('.db option:selected').attr('db');
                params.tableName = tn;
                params.datasetName = tn;
                params.id = data.id;
                if (type == '事实表') {
                    params.type = 2;
                } else if (type == '维度表') {
                    params.type = 1;
                }
                var q = {};
                q.atype = 'POST';
                q.success = function(r) {
                    if (r.msg == 'success') {
                        data.db = db;
                        data.tn = tn;
                        data.type = type;
                        data.datasourceId = params.datasourceId;
                        p.find('td').eq(0).html(db);
                        p.find('td').eq(1).html(tn);
                        p.find('td').eq(2).html(type);
                        // p.find('td').eq(3).html(info);
                        p.find('td').eq(3).html('<i class="fa fa-pencil"></i><i class="fa fa-remove"></i>');
                        $('.datasetsContainer').attr('active', '');
                        showMessage('更新维表', db + '.' + tn + '成功')
                    } else {
                        showMessage('更新维表失败', '请联系管理员')
                    }
                }
                $.api(url, params, q);
            }
        } else {
            showMessage('表名', '不能为空');
            p.find('input.tablename').focus();
        }
    })
    //点击fa-pencil的操作
    $('table.datasettable').on('click', '.fa-pencil', function() {

        var p = $(this).parent().parent();
         var data = $('table.datasettable').DataTable().row(p).data();
        $('.datasetsContainer').attr('active', 'edit');
        var tid = data.id;
        var did = data.datasourceId;
        var db = data.db;
        var tn = data.tn;
        var type =data.type;
        // var info = p.find('td').eq(3).html();
        window.dbn = db;
        window.tn = tn;
        window.type = type;
        var p = $(this).parent().parent();
        p.find('td').eq(0).html(getDb(did));
        p.find('td').eq(1).html("<input class='tableinput tablename' value='" + tn + "'/>");
        p.find('td').eq(2).html(getDf(type));
        // p.find('td').eq(3).html("<input class='tableinput tableinfo' value='"+info+"'/>");
        p.find('td').eq(3).html('<i class="fa fa-save"></i><i class="fa fa-remove"></i>');
    })
}

function getDb(db) {
    var str = returndbSelect(window.db, db);
    return str;
}

function getDf(db) {
    var dbo = {
        1: '事实表',
        2: '维度表',
    }
    var str = "<select class='tableselect ttype'>";
    for (var i in dbo) {
        var fl = '';
        if (dbo[i] == db) {
            fl = " selected "
        }
        str += "<option value='" + i + "' " + fl + ">" + dbo[i];
        str += "</option>";
    }
    str += "</select>";
    return str;
}