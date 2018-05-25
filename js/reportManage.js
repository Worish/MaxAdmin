$(document).ready(function() {
    baseClick();
})

function baseClick() {
    $('body').on('click', function() {
        $('.pathUlContianer').hide();
        if (checkEditFold(true)) {}
    })
    $('.closeEditReportContainer').on('click', function() {
        $('.editReportContainer').hide();
    })
    $('.pathShowContainer').on('click', function(e) {
        e.stopPropagation();
        e.preventDefault();
        $('.pathUlContianer').show();
    })
    $('.titleNameContainer').on('click', 'i', function(e) {
        var ca = $(this).attr('class').split(' ');
        var p = $(this).parent();
        var v = p.find('input.reportNameInput').val();
        window.reportname = v;
        if ($.inArray('fa-pencil', ca) > -1) {
            p.find('.fa-pencil').hide();
            p.find('.fa-save').show();
            p.find('.fa-remove').show();
            p.find('input.reportNameInput').removeAttr('disabled');
        } else if ($.inArray('fa-save', ca) > -1) {
            p.find('.fa-pencil').show();
            p.find('.fa-save').hide();
            p.find('.fa-remove').hide();
            p.find('input.reportNameInput').attr('disabled', 'disabled');
            showMessage(p.find('input.reportNameInput').val(), '修改成功');
            window.reportname = null;
        } else if ($.inArray('fa-remove', ca) > -1) {
            p.find('.fa-pencil').show();
            p.find('.fa-save').hide();
            p.find('.fa-remove').hide();
            p.find('input.reportNameInput').attr('disabled', 'disabled');
            window.reportname = null;
        }
    })
    //新增操作tag
    /*$('.addTag').on('click', function(e) {
        e.stopPropagation();
        e.preventDefault();
        var ac = $(this).attr('active');
        var acn = $(this).text().replace(/[/r/n/ ]/g,'');
        var lac = $('li[active="' + ac + '"]');
        if (lac.length ==0) {
            var str = '<li class="activeOper" active="' + ac + '"><span>' + acn + '</span><i class="fa fa-remove"></i></li>';
            if ($('.operationUl li').length == 0) {
                $('.operationUl').html(str);
            } else {
                $('.activeOper').removeClass('activeOper');
                $('.operationUl li').eq(0).before(str);
            }
        } else {
            $('.activeOper').removeClass('activeOper');
            lac.addClass('activeOper');
        }
    })*/
    //树形结构操作框事件
    $('.rootNavUl').on('click', '.rmnlioperate', function(e) {
        e.stopPropagation();
        e.preventDefault();
    })
    //文件夹li click事件
    $('.rootNavUl').on('click', '.subNavUli', function(e) {
        e.stopPropagation();
        e.preventDefault();
        if (checkEditFold()) { //如果没有未编辑完成的folder时候
            var uv = $(this).find('.subNavUl').eq(0);
            var dtv = $(this).find('div.Table-Cell').eq(0);
            if (uv.length > 0) { //如果当前文件夹有子元素的话
                if ($.inArray('subNavHide', uv.attr('class').split(' ')) == -1) {
                    uv.addClass('subNavHide');
                    dtv.removeClass('rmnli-active');
                } else {
                    uv.removeClass('subNavHide');
                    dtv.addClass('rmnli-active');
                }
            } else { //如果当前文件夹没有子元素的话
            }
            $('.subNavUliActive').removeClass('subNavUliActive');
            $(this).addClass('subNavUliActive');
        } else { //如果有未编辑完成的folder时候
            if ($.inArray('editFolderLi', $(this).attr('class').split(' ')) > -1) {} else {
                $('input.editFolder').addClass('editFolderWarn');
            }
        }
    })
    //文件夹新增
    $('.rootNavUl').on('click', '.fa-plus', function(e) {
        e.stopPropagation();
        e.preventDefault();
        if ($('input.editFolder').length == 0 && $('input.updateFolder').length == 0) {
            var p = $(this).parent().parent().parent().parent();
            var level = $(this).attr('level') * 1 + 1;
            var str = returnEditLi(level);
            if (p.find('.subNavUl').length == 0) {
                var str1 = '<ul class="subNavUl" level=' + level + '></ul>';
                p.append(str1);
                p.find('.subNavUl').html(str);
            } else {
                var ul = p.find('.subNavUl').eq(0);
                if (ul.find('li').length == 0) {
                    ul.html(str);
                } else {
                    ul.find('li').eq(0).before(str);
                }
            }
        } else {
            showMessage('Warning!', '请先保存当前正在编辑的内容');
        }
    });
    //文件夹保存
    $('.rootNavUl').on('click', '.fa-save', function(e) {
        e.stopPropagation();
        e.preventDefault();
        var level = $(this).attr('level');
        if ($('input.editFolder').length > 0) {
            var folderName = $('input.editFolder').val();
            var str = returnAfterEditLi(folderName, level);
            var p = $(this).parent().parent().parent().parent().parent();
            if (p.find('li').length == 1) {
                p.html(str);
            } else {
                $('.editFolderLi').remove();
                p.find('li').eq(0).before(str);
            }
        } else if ($('input.updateFolder').length > 0) {
            var p = $(this).parent().parent().parent().parent();
            var foldname = $('input.updateFolder').val();
            var width = $('input.updateFolder').css('width');
            var span = "<span class='foldName' style='width:" + width + "'>" + foldname + "</span>";
            $('input.updateFolder').remove();
            p.find('i.folder').eq(0).after(span);
            p.find('i.fa-save').eq(0).remove();
            var i = "<i class='fa fa-pencil'></i><i class='fa fa-plus' level=" + window.updatelevel + "></i>";
            p.find('i.fa-remove').eq(0).before(i);
            if (foldname == window.updatefoldname) {
                showMessage(foldname, '未发生变化哦');
                window.updatefoldwidth = null;
                window.updatefoldname = null;
                window.updatelevel = null;
            } else {
                window.updatefoldwidth = null;
                window.updatefoldname = null;
                window.updatelevel = null;
                showMessage(foldname, '更新成功');
            }
        }
    });
    //文件夹删除
    $('.rootNavUl').on('click', '.fa-remove', function(e) {
        e.stopPropagation();
        e.preventDefault();
        if ($('input.editFolder').length > 0) { //还在新增状态
            $('.editFolderLi').remove();
        } else if ($('input.updateFolder').length > 0) { //还在编辑状态
            var p = $(this).parent().parent().parent().parent();
            var span = "<span class='foldName' style='width:" + window.updatefoldwidth + "'>" + window.updatefoldname + "</span>";
            $('input.updateFolder').remove();
            p.find('i.folder').eq(0).after(span);
            p.find('i.fa-save').eq(0).remove();
            var i = "<i class='fa fa-pencil'></i><i class='fa fa-plus' level=" + window.updatelevel + "></i>";
            p.find('i.fa-remove').eq(0).before(i);
            window.updatefoldwidth = null;
            window.updatefoldname = null;
            window.updatelevel = null;
        } else { //没有编辑状态下的删除
            var p = $(this).parent().parent().parent().parent();
            p.addClass('readyDelete');
            var foldname = p.find('.foldName').eq(0).text();
            swal({
                title: "确定删除",
                text: p.find('.foldName').text(),
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
                    $('.readyDelete').remove();
                    showMessage('文件夹' + foldname, '删除成功');
                } else {
                    swal.close();
                    $('.readyDelete').removeClass('readyDelete');
                }
            });
        }
    });
    //文件夹重命名
    $('.rootNavUl').on('click', '.fa-pencil', function(e) {
        e.stopPropagation();
        e.preventDefault();
        if ($('input.editFolder').length == 0 && $('input.updateFolder').length == 0) {
            var level = $(this).next().attr('level');
            var p = $(this).parent().parent().parent().parent();
            var folder = p.find('.foldName').eq(0);
            var foldname = folder.text();
            var foldwidth = folder.css('width');
            window.updatefoldname = foldname;
            window.updatefoldwidth = foldwidth;
            window.updatelevel = level;
            var inputstr = "<input class='updateFolder' type='text' style='width:" + foldwidth + "' value='" + foldname + "'/>"
            p.find('i.folder').eq(0).after(inputstr);
            folder.hide();
            p.find('.fa-pencil').eq(0).remove();
            p.find('.fa-plus').eq(0).remove();
            p.find('.fa-remove').eq(0).before('<i class="fa fa-save" level=' + level + '></i>')
        } else {
            showMessage('Warning!', '请先保存当前正在编辑的内容');
        }
    });
    $('.newReport').on('click', function(e) {
        $('.editReportContainer').show();
    })
    $('.datasourcejoinContainer').on('click', '.fa-caret-down', function(e) {
        e.stopPropagation();
        e.preventDefault();
        $('.dataTableOper').show();
    })
    $('.editReportContainer').on('click', '.dataTableOper', function(e) {
        e.stopPropagation();
        e.preventDefault();
    })
    $('.editReportContainer').on('click', function(e) {
        $('.dataTableOper').hide();
    })
    /*$('.addDataTable').on('click', function(e) {
        $('.dataTableOper').hide();
        $('.editJoinContainer').hide();
        $('.editDataSource').show();
        // if ()
    })*/
    /*$('.newDataSource').on('click', function() {
        var str = addDataSourceTr();
        if ($('.DataSourceTable .nodatasource').length > 0) {
            $('.nodatasource').remove();
            $('.DataSourceTable tbody').html(str);
        } else {
            $('.DataSourceTable tbody tr').eq(0).before(str);
        }
    })*/
    /*$('.DataSourceTable').on('click', '.fa-save', function() {
        var tr = $(this).parent().parent();
        var db = tr.find('select.db').val();
        var table = tr.find('input.tablenameinput').val();
        var df = tr.find('select.dfsel').val();
        var str = fullDataTr(db, table, df);
        $('tr.addDataSourceTr').remove();
        if ($('.DataSourceTable tbody tr').length == 0) {
            $('.DataSourceTable tbody').html(str);
        } else {
            $('.DataSourceTable tbody tr').eq(0).before(str);
        }
        var dstr = "<div class='tableshowname'>" + db + "." + table + "</div>";
        $('.showdatatableContainer').append(dstr);
    })*/
    $('.editJoin').on('click', function() {
        $('.dataTableOper').hide();
        $('.editDataSource').hide();
        $('.editJoinContainer').show();
        fullJoinTable();
    })
}

function addDataSourceTr() {
    var str = "";
    str += '<tr class="addDataSourceTr">';
    str += '<td><select class="db"><option>149dw_db</option></select></td>';
    str += '<td><input class="tablenameinput" type="text" placeholder="在此处输入表名"/></td>';
    str += '<td><select class="dfsel"><option>维度表</option><option>事实表</option></select></td>';
    str += '<td class="optable"><i class="fa fa-save"></i><i class="fa fa-remove" ></i></td>';
    str += '</tr>';
    return str;
}

function fullDataTr(db, table, df) {
    var str = "";
    str += '<tr>';
    str += '<td class="db">' + db + '</td>';
    str += '<td class="table">' + table + '</td>';
    str += '<td class="df">' + df + '</td>';
    str += '<td class="optable"><i class="fa fa-edit"></i><i class="fa fa-minus" ></i></td>';
    str += '</tr>';
    return str;
}

function fullJoinTable() {
    var arr = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'];
    var ds = $('.DataSourceTable tbody tr');
    var str = "";
    if ($('tr.nodatasource').length == 1) {
        str += "<tr class='nodatajoin'><td colspan='5'>暂时没有关联哦</td></tr>";
    } else {
        for (var i = 0; i < ds.length; i++) {
            var d = ds.eq(i);
            str += "<tr>";
            str += "<td>" + d.find('.db').text() + '.' + d.find('.table').text() + "</td>";
            str += "<td>" + arr[i] + "</td>";
            str += "<td>" + d.find('.df').text() + "</td>";
            str += "<td><textarea></textarea></td>";
            str += '<td class="optable"><i class="fa fa-save"></i><i class="fa fa-remove" ></i></td>';
            str += "</tr>";
        }
    }
    $('.joinTable tbody').html(str);
}

function returnEditLi(level) {
    var width = 124 - level * 15;
    var str = "";
    str += '<li class="subNavUli editFolderLi">';
    str += '<div class="Center-Container is-Table">';
    str += '<div class="Table-Cell">';
    str += '<i class="folder fa fa-folder">';
    str += '</i>';
    str += '<input class="editFolder" placeholder="请输入文件名" style="width:' + width + 'px"/>';
    str += '<span class="rmnlioperate">';
    str += '<i class="fa fa-save" level="' + level + '">';
    str += '</i>';
    str += '<i class="fa fa-remove">';
    str += '</i>';
    str += '</span>';
    str += '</div>';
    str += '</div>';
    return str;
}

function returnAfterEditLi(name, level) {
    var width = 190 - level * 15 - 44 - 24 - 10;
    var str = "";
    str += '<li class="subNavUli" keyname="' + name + '" level="' + level + '">';
    str += '<div class="Center-Container is-Table">';
    str += '<div class="Table-Cell">';
    str += '<i class="folder fa fa-folder">';
    str += '</i>';
    str += '<span class="foldName" style="width: ' + width + 'px;">';
    str += name;
    str += '</span>';
    str += '<span class="rmnlioperate">';
    str += '<i class="fa fa-pencil">';
    str += '</i>';
    str += '<i class="fa fa-plus" level="' + level * 1 + '">';
    str += '</i>';
    str += '<i class="fa fa-remove">';
    str += '</i>';
    str += '</span>';
    /*
        str += '<span class="rmnliarrow">';
        str += '<span class="arrowleft">';
        str += '</span>';
        str += '<span class="arrowRight">';
        str += '</span>';
        str += '</span>';*/
    str += '</div>';
    str += '</div>';
    return str;
}

function checkEditFold(show) {
    var flag = true;
    if ($('input.editFolder').length > 0) {
        flag = false;
    }
    if (!flag && show) {
        $('input.editFolder').addClass('editFolderWarn');
        $('input.editFolder').focus();
        setTimeout(function() {
            $('input.editFolder').removeClass('editFolderWarn');
        }, 1000)
    }
    return flag;
}