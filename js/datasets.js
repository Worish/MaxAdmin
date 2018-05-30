$(document).ready(function() {
    getDB(); 
    baseClick();
})

function getDB() {
    var url = 'datasource/getDatasourceList';
    var p = {}; 
    var q = {};
    q.success = function(r) {
        window.db = {};
         for(var i=0;i<r.length;i++){
            var o = r[i];
            window.db[o.id] = o;
            if(o.name == '149数据源'){
                window.db[o.id].db = 'dw_db';
            } 
         }
         getAllDataSets();
    }
    $.api(url, p, q);
}
function getAllDataSets() {
    var url = 'dataset/getDatasetList';
    var p = {};
    p.datasetType = 1;
    var q = {};
    q.success = function(r) {
        var str = "";
        if (r.length == 0) {
            str += "<tr class='nodata'><td colspan='4'>还没添加数据源,请按左上角按钮添加</td></tr>";
        } else {
            //填充所有数据表格
            
        }
        $('table.datasettable tbody').html(str);
    }
    $.api(url, p, q);
}

function baseClick() {
    $('.addDataset').on('click', function() {
        if ($('.newdt').length == 0) {
            var str = "<tr class='newdt'>";
            str += "<td>"+getDb()+"</td>";
            str += "<td><input class='tableinput tablename' placeholder='在此处输入表名'/></td>";
            str += "<td><select class='tableselect ttype'><option>事实表</option><option>维度表</option></select></td>";
            str += "<td><input class='tableinput tableinfo'  placeholder='在此处输入备注'/></td>";
            str += '<td><i class="fa fa-save"></i><i class="fa fa-remove"></i></td>';
            str += "</tr>";
            if ($('tr.nodata').length == 1) {
                $('.datasettable tbody').html(str);
            } else {
                $('.datasettable tbody tr').eq(0).before(str);
            }
        } else {
            showMessage('请先完成当前编辑内容', '')
        }
    })
    $('table.datasettable').on('click', '.fa-remove', function() {
        if ($('.newdt').length > 0) {
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
                } else {
                    swal.close();
                }
            });
        } else {
            var p = $(this).parent().parent();
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
                    p.remove();
                    swal.close();
                    showMessage(tn, '删除成功')
                } else {
                    swal.close();
                }
            });
        }
    })
    $('table.datasettable').on('click', '.fa-save', function() {
        var p = $(this).parent().parent();
        var db = p.find('select.db option:selected').text();
        var type = p.find('select.ttype option:selected').text();
        var tn = p.find('input.tablename').val().replace('/[/r/n/ ]/g', '');
        var info = p.find('input.tableinfo').val();
        if (tn != null && tn != '') {
            url = "dataset/save";
            var params = {};
            params.datasourceId = $('.db option:selected').val();
            params.dbName = $('.db option:selected').attr('db');
            params.tablename = tn;
            params.datasetName = tn;
            if(type=='事实表'){
                params.type = 2;
            }else if(type=='维度表'){
                params.type = 1;
            }
            if ($('tr.newdt').length > 0) { //新建维表的时候

            var q = {};
            q.atype='POST';
            q.success = function(r){
                console.log(r);
                debugger;
            }
            $.api(url,params,q);
                /*var id = (Math.random() * 10000).toFixed(0);
                var str = "<tr tid ='" + id + "' > ";
                str += "<td>" + db + "</td>";
                str += "<td>" + tn + "</td>";
                str += "<td>" + type + "</td>";
                str += "<td>" + info + "</td>";
                str += '<td><i class="fa fa-pencil"></i><i class="fa fa-remove"></i></td>';
                str += "</tr>";
                if ($('tr.nodata').length == 1) {
                    $('.datasettable tbody').html(str);
                } else {
                    $('.datasettable tbody tr').eq(0).before(str);
                }
                $('tr.newdt').remove();*/
            } else {
                p.find('td').eq(0).html(db);
                p.find('td').eq(1).html(tn);
                p.find('td').eq(2).html(type);
                p.find('td').eq(3).html(info);
                p.find('td').eq(4).html('<i class="fa fa-pencil"></i><i class="fa fa-remove"></i>');
            }
        } else {
            showMessage('表名', '不能为空');
            p.find('input.tablename').focus();
        }
    })
    $('table.datasettable').on('click', '.fa-pencil', function() {
        var p = $(this).parent().parent();
        var db=p.find('td').eq(0).html();
        var tn=p.find('td').eq(1).html();
        var type=p.find('td').eq(2).html();
        var info=p.find('td').eq(3).html();
        var p = $(this).parent().parent();
        p.find('td').eq(0).html(getDb(db));
        p.find('td').eq(1).html("<input class='tableinput tablename' value='"+tn+"'/>");
        p.find('td').eq(2).html(getDf(type));
        p.find('td').eq(3).html("<input class='tableinput tableinfo' value='"+info+"'/>");
        p.find('td').eq(4).html('<i class="fa fa-save"></i><i class="fa fa-remove"></i>');
    })
}
function getDb(db){

    var dbo = {
        1:'149dw_db',
        2:'69maxportal',
    }
    var str = "<select class='tableselect db'>"; 
    for(var i in window.db){
        var fl = '';
        if(db!=null &&  window.db[i] == db){
            fl=" selected "
        }
        str +="<option value='"+i+"' "+fl+" db='"+window.db[i].db+"'>"+ window.db[i].name+ window.db[i].db;
        str +="</option>";
    }
    str += "</select>"; 
    return str;
}
function getDf(db){
    var dbo = {
        1:'事实表',
        2:'维度表',
    }
    var str = "<select class='tableselect ttype'>"; 
    for(var i in dbo){
        var fl = '';
        if(dbo[i] == db){
            fl=" selected "
        }
        str +="<option value='"+i+"' "+fl+">"+dbo[i];
        str +="</option>";
    }
    str += "</select>"; 
    return str;
}