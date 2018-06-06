$(document).ready(function() {
    baseClick();
    clickFlag = null;
    initDB();
    aod = {};
})

function initDB() {
    var q = {};
    q.next = initFolder;
    getDBb(q);
}

//初始化文件夹
function initFolder() {
    var p = {},
        q = {};
    p.parentId = 0;
    q.success = function(r) {
        if (r.length > 0) {
            var d = [];
            var o = {},
                to = {};
            for (var i = 0; i < r.length; i++) {
                to[r[i].categoryId] = r[i];
                d[i] = r[i];
                if (!o.hasOwnProperty(r[i].parentId)) {
                    o[r[i].parentId] = [];
                }
                o[r[i].parentId].push(r[i].categoryId);
            }
            for(var i in o){
                o[i].sort();
                o[i].reverse();
            }
            aod.treedata = to;
            if (o[0] != null) {
                $('.subNavUl').html(loopTree(o, o[0], 1, "", to));
            }
        }
    }
    $.api('report/getReportCategoryList', p, q);
}

//循环生成数
function loopTree(o, a, level, str, td) {
    for (var i = 0; i < a.length; i++) {
        if (o[a[i]] != null) {
            var width = 190 - (level*1) * 15 - 44 - 24 - 10;
            str += '<li actionid="' + a[i] + '" class="subNavUli" keyname="' + td[a[i]].categoryName + '" level="' + (level*1) + '">';
            str += '<div class="Center-Container is-Table">';
            str += '<div class="Table-Cell">';
            str += '<i class="folder fa fa-folder">';
            str += '</i>';
            str += '<span class="foldName" style="width: ' + width + 'px;">';
            str += td[a[i]].categoryName;
            str += '</span>';
            str += '<span class="rmnlioperate">';
            str += '<i class="fa fa-pencil">';
            str += '</i>';
            str += '<i class="fa fa-plus" level="' + (level * 1) + '" folderId="'+a[i]+'">';
            str += '</i>';
            str += '<i class="fa fa-remove">';
            str += '</i>';
            str += '</span>';
            str += '</div>';
            str += '</div>';
            str += '<ul class="subNavUl" level="'+(level*1+1)+'">';
            str += loopTree(o, o[a[i]], (level*1 + 1),"",td);
            str += '</ul></li>';
        } else {
            var width = 190 - (level*1) * 15 - 44 - 24 - 10;
            str += '<li actionid="' + a[i] + '" class="subNavUli" keyname="' + td[a[i]].categoryName + '" level="' + (level*1) + '">';
            str += '<div class="Center-Container is-Table">';
            str += '<div class="Table-Cell">';
            str += '<i class="folder fa fa-folder">';
            str += '</i>';
            str += '<span class="foldName" style="width: ' + width + 'px;">';
            str += td[a[i]].categoryName;
            str += '</span>';
            str += '<span class="rmnlioperate">';
            str += '<i class="fa fa-pencil">';
            str += '</i>';
            str += '<i class="fa fa-plus" level="'+ (level * 1) + '" folderId="'+a[i]+'">';
            str += '</i>';
            str += '<i class="fa fa-remove">';
            str += '</i>';
            str += '</span>';
            str += '</div>';
            str += '</div>';
            str += '</li>';
        }
    }
    return str;
}

function baseClick() {
    $('body').on('click', function() {
        $('.pathUlContianer').hide();
        $('.allTableUlContainerShow').removeClass('allTableUlContainerShow');
        if (checkEditFold(true)) {}
    })
    //点击关闭新建按钮的操作
    $('.closeEditReportContainer').on('click', function() {
        $('.editReportContainer').hide();
    })
    //点击报表路径框的操作
    $('.pathShowContainer').on('click', function(e) {
        e.stopPropagation();
        e.preventDefault();
        $('.pathUlContianer').show();
    })
    //点击编辑报表标题的操作
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
        if (clickFlag) { //取消上次延时未执行的方法
            clickFlag = clearTimeout(clickFlag);
        }
        $(this).addClass('readychange');
        clickFlag = setTimeout(function() {
            // click 事件的处理 
            if (checkEditFold()) { //如果没有未编辑完成的folder时候
                var uv = $(this).find('.subNavUl').eq(0);
                var dtv = $(this).find('div.Table-Cell').eq(0);
                if (uv.length > 0) { //如果当前文件夹有子元素的话
                    if ($.inArray('subNavHide', uv.attr('class').split(' ')) == -1) {
                        // uv.addClass('subNavHide');
                        dtv.removeClass('rmnli-active');
                    } else {
                        // uv.removeClass('subNavHide');
                        dtv.addClass('rmnli-active');
                    }
                } else { //如果当前文件夹没有子元素的话
                }
                $('.subNavUliActive').removeClass('subNavUliActive');
                $('.readychange').addClass('subNavUliActive').removeClass('readychange');
            } else { //如果有未编辑完成的folder时候
                if ($.inArray('editFolderLi', $('.readychange').attr('class').split(' ')) > -1) {} else {
                    $('input.editFolder').addClass('editFolderWarn');
                }
                $('.readychange').removeClass('readychange');
            }
        }, 300); //延时300毫秒执行
    })
    //文件夹li dblclick双击事件
    $('.rootNavUl').on('dblclick', '.subNavUli', function(e) {
        e.stopPropagation();
        e.preventDefault();
        console.log('dbclick')
        if (clickFlag) { //取消上次延时未执行的方法
            clickFlag = clearTimeout(clickFlag);
        }
        $('.readychange').removeClass('readychange');
        if (checkEditFold()) { //如果没有未编辑完成的folder时候
            var uv = $(this).find('.subNavUl').eq(0);
            var dtv = $(this).find('div.Table-Cell').eq(0);
            if (uv.length > 0) { //如果当前文件夹有子元素的话
                if ($.inArray('subNavHide', uv.attr('class').split(' ')) == -1) {
                    uv.addClass('subNavHide');
                    // dtv.removeClass('rmnli-active');
                } else {
                    uv.removeClass('subNavHide');
                    // dtv.addClass('rmnli-active');
                }
            } else { //如果当前文件夹没有子元素的话
            }
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
            var pfid = $(this).attr('folderId');
            var level = $(this).attr('level') * 1 + 1;
            var str = returnEditLi(level, pfid);
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
            var p = $(this).parent().parent().parent().parent().parent();
            var pfid = $(this).attr('pfid');
            saveNewFolder(folderName, level, p, pfid);
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
            var p = $('.editFolderLi').parent();
            if (p.find('li').length == 1) {
                p.remove();
            } else {
                $('.editFolderLi').remove();
            }
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
    //新建报表按钮的操作
    $('.newReport').on('click', function(e) {
        $('.editReportContainer').show();
    })
    //点击编辑数据源后面的小三角弹出编辑维度等选项
    $('.datasourcejoinContainer').on('click', '.fa-caret-down', function(e) {
        e.stopPropagation();
        e.preventDefault();
        $('.dataTableOper').show();
    })
    //禁用向上冒泡事件
    $('.editReportContainer').on('click', '.dataTableOper', function(e) {
        e.stopPropagation();
        e.preventDefault();
    })
    //隐藏编辑维度等选项的框
    $('.editReportContainer').on('click', function(e) {
        $('.dataTableOper').hide();
    })
    //新增数据表事件
    $('.newDataSource').on('click', function(e) {
        e.stopPropagation();
        e.preventDefault();
        $('.allTableUlContainer').addClass('allTableUlContainerShow');
    })
    //禁用向上冒泡事件
    $('.allTableUlContainer').on('click', function(e) {
        e.stopPropagation();
        e.preventDefault();
    })
    //添加数据表li的操作
    $('.allTableUl').on('click', 'li', function(e) {
        e.stopPropagation();
        e.preventDefault();
        var ca = $(this).attr('class');
        if (ca == null) {
            ca = '';
        }
        ca = ca.split(' ');
        if ($.inArray('hasSelectTable', ca) > -1) {
            //当前表已选中
        } else {
            //当前表未选中
            var tname = $(this).text();
            $(this).addClass('hasSelectTable');
            var str = "<tr tb='" + tname + "'>";
            str += "<td>" + tname + "</td>";
            str += "<td>" + tname + "</td>";
            str += "<td><span>-</span></td>";
            str += "<td><i class='fa fa-pencil edittablejoin'>" + "</i><i class='fa fa-remove removetablejoin'></i> </td>";
            str += "</tr>";
            if ($('.joinTable tbody tr').length == 0) {
                $('.joinTable tbody').html(str);
            } else {
                $('.joinTable tbody tr').eq(0).before(str);
            }
        }
    })
    //编辑关联的事件
    $('.dataTableOper').on('click', '.dataTableOperItem', function() {
        $('.dataTableOper').hide();
        $('.editItemContainer').hide();
        var ac = $(this).attr('active');
        $('.' + ac + 'Container').show();
        if (ac == 'editJoin') { //当点击编辑关联的时候
            fullJoinTable();
        } else if (ac == 'editGroup') { //当点击分组的时候
        }
    })
    //编辑关联
    $('.joinTable').on('click', '.fa-pencil', function() {
        $('.editJoinContainer').attr('active', 'edit');
        var p = $(this).parent().parent();
        var jointext = p.find('td').eq(2).text();
        window.jointext = jointext;
        var str = '<textarea class="tablejoinedit"></textarea>';
        p.find('td').eq(2).html(str);
        $('textarea.tablejoinedit').val(jointext);
        p.find('td').eq(3).html('<i class="fa fa-save"></i><i class="fa fa-remove"></i>');
    })
    //保存关联
    $('.joinTable').on('click', '.fa-save', function() {
        var p = $(this).parent().parent();
        var jointext = $('textarea.tablejoinedit').val();
        var db = p.find('td').eq(0).html();
        p.find('td').eq(2).html(jointext);
        p.find('td').eq(3).html('<i class="fa fa-pencil"></i><i class="fa fa-remove"></i>');
        showMessage(db, '修改成功');
    })
    //取消保存关联或者删除表
    $('.joinTable').on('click', '.fa-remove', function() {
        var p = $(this).parent().parent();
        if ($('textarea.tablejoinedit').length > 0) {
            $('.editJoinContainer').attr('active', '');
            $('textarea.tablejoinedit').remove();
            p.find('td').eq(2).html(window.jointext);
            window.jointext = null;
            p.find('td').eq(3).html('<i class="fa fa-pencil"></i><i class="fa fa-remove"></i>');
        } else {
            var tb = p.find('td').eq(0).html();
            p.addClass('readyremovetable');
            swal({
                title: "确定删除吗?",
                text: tb,
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "确定！",
                cancelButtonText: "再想想！",
                closeOnConfirm: false,
                closeOnCancel: false
            }, function(isConfirm) {
                if (isConfirm) {
                    $('tr.readyremovetable').remove();
                    swal.close();
                } else {
                    $('tr.readyremovetable').removeClass('readyremovetable');
                    swal.close();
                }
            });
        }
    })
    //新建分组
    $('.newGroup').on('click', function(e) {
        $('.GroupTable').attr('action', 'new');
        if ($('.groupNameInput').length == 0) {
            var str = "<tr class='newGroupTr'>";
            str += '<td><input class="tableinput groupNameInput" type="text" placeholder="在此处输入组名" /></td>';
            str += '<td><select><option>单选</option><option>多选</option></select></td>';
            str += '<td>保存后可修改顺序</td>';
            str += '<td><i class="fa fa-save"></i><i class="fa fa-remove"></i></td>'
            str += "</tr>";
            if ($('.GroupTable tbody tr').length == 0) {
                $('.GroupTable tbody').html(str);
            } else {
                $('.GroupTable tbody tr').eq(0).before(str);
            }
        } else {
            showMessage('请先保存', '当前正在编辑的内容');
        }
    })
    //保存分组信息
    $('.GroupTable').on('click', '.fa-save', function(e) {
        var p = $(this).parent().parent();
        var gn = p.find('td').eq(0).find('input').val();
        var gs = p.find('td').eq(1).find('select').val();
        //如果是新增状态下
        if ($('.GroupTable').attr('action') == 'new') {
            var str = "<tr groupid='" + (Math.random() * 10000).toFixed(0) + "'>";
            str += '<td>' + gn + '</td>';
            str += '<td>' + gs + '</td>';
            str += '<td><i class="fa fa-chevron-circle-up"></i><i class="fa fa-chevron-circle-down"></i></td>';
            str += '<td><i class="fa fa-pencil"></i><i class="fa fa-remove"></i></td>'
            str += "</tr>";
            if ($('.GroupTable tbody tr').length == 0) {
                $('.GroupTable tbody').html(str);
            } else {
                $('.GroupTable tbody tr').eq(0).before(str);
            }
            $('tr.newGroupTr').remove();
            showMessage(gn, '新增成功');
        } else if ($('.GroupTable').attr('action') == 'edit') {
            //如果是修改状态下
            p.find('td').eq(0).html(gn);
            p.find('td').eq(1).html(gs);
            p.find('td').eq(2).html('<i class="fa fa-chevron-circle-up"></i><i class="fa fa-chevron-circle-down"></i>');
            p.find('td').eq(3).html('<i class="fa fa-pencil"></i><i class="fa fa-remove"></i>');
            showMessage(gn, '修改成功');
        }
        $('.GroupTable').attr('action', '');
    })
    //编辑分组信息
    $('.GroupTable').on('click', '.fa-pencil', function(e) {
        $('.GroupTable').attr('action', 'edit');
        var p = $(this).parent().parent();
        var gn = p.find('td').eq(0).html().replace(/[/r/n/ ]/g, '');
        var gt = p.find('td').eq(1).html().replace(/[/r/n/ ]/g, '');
        window.gn = gn;
        window.gt = gt;
        var inputgn = '<input class="tableinput groupNameInput" type="text" placeholder="在此处输入组名" value="' + gn + '"/>';
        var fse = '',
            mse = '';
        if (gt == '单选') {
            fse = 'selected'
        } else if (gt == '多选') {
            mse = 'selected'
        }
        var selectgt = '<select><option ' + fse + '>单选</option><option ' + mse + '>多选</option></select>';
        p.find('td').eq(0).html(inputgn);
        p.find('td').eq(1).html(selectgt);
        p.find('td').eq(2).html('保存后可修改顺序');
        p.find('td').eq(3).html('<i class="fa fa-save"></i><i class="fa fa-remove"></i>');
    })
    //取消保存分组信息和删除行
    $('.GroupTable').on('click', '.fa-remove', function(e) {
        if ($('.GroupTable').attr('action') == 'new') {
            $('.newGroupTr').remove();
            $('.GroupTable').attr('action', '')
        } else if ($('.GroupTable').attr('action') == 'edit') {
            var p = $(this).parent().parent();
            var fse = '',
                mse = '';
            if (window.gt == '单选') {
                fse = 'selected'
            } else if (window.gt == '多选') {
                mse = 'selected'
            }
            var gn = p.find('input').eq(0).val();
            var sn = p.find('option:selected').text();
            if (gn == window.gn && sn == window.gt) {
                var selectgt = '<select><option ' + fse + '>单选</option><option ' + mse + '>多选</option></select>';
                p.find('td').eq(0).html(window.gn);
                p.find('td').eq(1).html(window.gt);
                p.find('td').eq(2).html('<i class="fa fa-chevron-circle-up"></i><i class="fa fa-chevron-circle-down"></i>');
                p.find('td').eq(3).html('<i class="fa fa-pencil"></i><i class="fa fa-remove"></i>');
                $('.GroupTable').attr('action', '');
                window.gn = null;
                window.gt = null;
            } else {
                swal({
                    title: "修改未保存哦",
                    text: window.gn + '->' + gn + '     ' + window.gt + '->' + sn,
                    type: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#DD6B55",
                    confirmButtonText: "确定不保存！",
                    cancelButtonText: "再去改改！",
                    closeOnConfirm: false,
                    closeOnCancel: false
                }, function(isConfirm) {
                    if (isConfirm) {
                        p.find('td').eq(0).html(window.gn);
                        p.find('td').eq(1).html(window.gt);
                        p.find('td').eq(2).html('<i class="fa fa-chevron-circle-up"></i><i class="fa fa-chevron-circle-down"></i>');
                        p.find('td').eq(3).html('<i class="fa fa-pencil"></i><i class="fa fa-remove"></i>');
                        $('.GroupTable').attr('action', '');
                        window.gn = null;
                        window.gt = null;
                        swal.close();
                    } else {
                        swal.close();
                    }
                });
            }
        } else if ($('.GroupTable').attr('action') == '') {
            var p = $(this).parent().parent();
            var gn = p.find('td').eq(0).text();
            gid = p.attr('groupid');
            swal({
                title: "确定删除组",
                text: p.find('td').eq(0).html().replace(/[/r/n/ ]/g, ''),
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
                    $('tr[groupid="' + gid + '"]').remove();
                    showMessage('组' + gn, '删除成功');
                } else {
                    swal.close();
                }
            });
        }
    })
    //组顺序上
    $('.GroupTable').on('click', '.fa-chevron-circle-up', function(e) {
        if ($('.groupNameInput').length > 0) {
            showMessage('', '请先完成当前编辑内容');
            $('.groupNameInput').focus();
        } else {
            var p = $(this).parent().parent();
            var gn = p.find('td').eq(0).html();
            var index = p.index();
            var gid = p.attr('groupid');
            if (index == 0) {
                showMessage('组' + gn, '已经在最上面哦');
            } else {
                var htmlstr = '<tr groupid="' + gid + '">' + p.html() + '</tr>';
                $('tr[groupid="' + gid + '"]').remove();
                $('.GroupTable tbody tr').eq(index - 1).before(htmlstr);
            }
        }
    })
    //组顺序下
    $('.GroupTable').on('click', '.fa-chevron-circle-down', function(e) {
        if ($('.groupNameInput').length > 0) {
            showMessage('', '请先完成当前编辑内容');
            $('.groupNameInput').focus();
        } else {
            var p = $(this).parent().parent();
            var gn = p.find('td').eq(0).html();
            var index = p.index();
            var gid = p.attr('groupid');
            if (index == $('.GroupTable tbody tr').length - 1) {
                showMessage('组' + gn, '已经在最下面哦');
            } else {
                var htmlstr = '<tr groupid="' + gid + '">' + p.html() + '</tr>';
                $('tr[groupid="' + gid + '"]').remove();
                $('.GroupTable tbody tr').eq(index).after(htmlstr);
            }
        }
    })
    //添加私有维度
    $('.newPrivateDimen').on('click', function() {
        $('.editDimenContainer').attr('active', 'new');
        var str = "<tr class='newPrivateDimentr'>";
        str += '<td>' + getTableSelect() + '</td>';
        str += '<td>独有</td>';
        str += '<td><input class="tableinput dimensionName" /> </td>';
        str += '<td><input class="tableinput dimensionid" > </td>';
        str += '<td><select class="showop"><option value="是">是</option><option value="否">否</option></select></td>';
        str += '<td><select class="isneed"><option value="是">是</option><option value="否">否</option></select></td>';
        str += '<td><input class="tableinput dimensionShowName" /> </td>';
        str += '<td><select class="isgroupby"><option value="是">是</option><option value="否">否</option></select></td>';
        str += '<td><input class="tableinput dimensionShowColumn" /></td>';
        str += '<td>' + getDataFormat() + '</td>';
        str += '<td>-</td>';
        str += '<td>' + getGroupSelect() + '</td>';
        str += '<td><i class="fa fa-save"></i><i class="fa fa-remove"></i></td>';
        str += '</str>';
        if ($('.editDimenTable tbody tr').length == 0) {
            $('.editDimenTable tbody').html(str);
        } else {
            $('.editDimenTable tbody tr').eq(0).before(str);
        }
    })
    //取消保存或者删除
    $('.editDimenTable').on('click', '.fa-remove', function() {
        if ($('.editDimenContainer').attr('active') == 'new') {
            $('tr.newPrivateDimentr').remove();
            $('.editDimenContainer').attr('active', '');
        } else if ($('.editDimenContainer').attr('active') == 'edit') {} else if ($('.editDimenContainer').attr('active') == '') {
            var p = $(this).parent().parent();
            var did = p.attr('dimensionid');
            var diname = p.find('td').eq(2).html();;
            swal({
                title: "确定删除组",
                text: diname,
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
                    $('tr[dimensionid="' + did + '"]').remove();
                    showMessage('维度' + diname, '删除成功');
                } else {
                    swal.close();
                }
            });
        }
    })
    //保存按钮操作
    $('.editDimenTable').on('click', '.fa-save', function() {
        var p = $(this).parent().parent();
        if ($('.editDimenContainer').attr('active') == 'new') {
            var dt = p.find('select.tableselect option:selected').text();
            var tp = p.find('td').eq(1).html();
            var dn = p.find('input.dimensionName').val();
            var did = p.find('input.dimensionid').val();
            var showop = p.find('select.showop option:selected').text();
            var isneed = p.find('select.isneed option:selected').text();
            var showdn = p.find('.dimensionShowName').val();
            var isgroupby = p.find('select.isgroupby option:selected').text();
            var showcol = p.find('input.dimensionShowName').val();
            var df = p.find('select.dataformatselect option:selected').text();
            var ord = '<i class="fa fa-chevron-circle-up"></i><i class="fa fa-chevron-circle-down"></i>';
            var group = p.find('select.groupselect option:selected').text();;
            var op = '<i class="fa fa-pencil"></i><i class="fa fa-remove"></i>';
            var gid = (Math.random() * 10000).toFixed(0);
            var str = "<tr dimensionid='" + gid + "'>";
            str += "<td>" + dt + "</td>";
            str += "<td>" + tp + "</td>";
            str += "<td>" + dn + "</td>";
            str += "<td>" + did + "</td>";
            str += "<td>" + showop + "</td>";
            str += "<td>" + isneed + "</td>";
            str += "<td>" + showdn + "</td>";
            str += "<td>" + isgroupby + "</td>";
            str += "<td>" + showcol + "</td>";
            str += "<td>" + df + "</td>";
            str += "<td>" + ord + "</td>";
            str += "<td>" + group + "</td>";
            str += "<td>" + op + "</td>";
            str += "</tr>";
            $('tr.newPrivateDimentr').remove();
            if ($('.editDimenTable tbody tr').length == 0) {
                $('.editDimenTable tbody').html(str);
            } else {
                $('.editDimenTable tbody tr').eq(0).before(str);
            }
            showMessage('维度' + dn, '新增成功');
            $('.editDimenContainer').attr('active', '');
        }
    })
    //添加指标操作
    $('.newDuliang').on('click', function() {
        if ($('.editDuliangContainer').attr('active') == '' || $('.editDuliangContainer').attr('active') == null) {
            $('.editDuliangContainer').attr('active', 'new');
            var str = "<tr class='newDuliangtr'>";
            str += "<td><input class='tableinput DuliangName' type='text' /></td>";
            str += "<td><input class='tableinput DuliangGongshi' type='text' /></td>";
            str += "<td><input class='tableinput func' type='text' /></td>";
            str += "<td><textarea class='DuliangInfo'></textarea></td>";
            str += "<td></td>";
            str += "<td>" + getGroupSelect() + "</td>";
            str += "<td>" + getDataFormat() + "</td>";
            str += '<td><i class="fa fa-save"></i><i class="fa fa-remove"></i></td>';
            str += "</tr>";
            if ($('.DuliangTable tbody tr').length == 0) {
                $('.DuliangTable tbody').html(str);
            } else {
                $('.DuliangTable tbody tr').eq(0).before(str);
            }
        } else {
            showMessage('请先完成当前编辑内容', '')
        }
    })
    //指标度量取消保存或者删除
    $('.DuliangTable').on('click', '.fa-remove', function() {
        if ($('.editDuliangContainer').attr('active') == 'new') {
            $('tr.newDuliangtr').remove();
            $('.editDuliangContainer').attr('active', '');
        } else if ($('.editDuliangContainer').attr('active') == 'edit') {} else if ($('.editDuliangContainer').attr('active') == '') {
            var p = $(this).parent().parent();
            var did = p.attr('Duliangid');
            var duname = p.find('td').eq(0).html();;
            swal({
                title: "确定删除度量",
                text: duname,
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
                    $('tr[Duliangid="' + did + '"]').remove();
                    showMessage('维度' + duname, '删除成功');
                } else {
                    swal.close();
                }
            });
        }
    })
    //指标度量保存按钮操作
    $('.DuliangTable').on('click', '.fa-save', function() {
        var p = $(this).parent().parent();
        if ($('.editDuliangContainer').attr('active') == 'new') {
            var duname = p.find('input.DuliangName').val();
            var dugongshi = p.find('input.DuliangGongshi').val();
            var dufunc = p.find('input.func').val();
            var duinfo = p.find('textarea.DuliangInfo').val();
            var ord = '<i class="fa fa-chevron-circle-up"></i><i class="fa fa-chevron-circle-down"></i>';
            var group = p.find('select.groupselect option:selected').text();;
            var df = p.find('select.dataformatselect option:selected').text();
            var did = (Math.random() * 10000).toFixed(0);
            var str = "<tr Duliangid='" + did + "'>";
            str += "<td>" + duname + "</td>";
            str += "<td>" + dugongshi + "</td>";
            str += "<td>" + dufunc + "</td>";
            str += "<td>" + duinfo + "</td>";
            str += "<td>" + ord + "</td>";
            str += "<td>" + group + "</td>";
            str += "<td>" + df + "</td>";
            str += '<td><i class="fa fa-pencil"></i><i class="fa fa-remove"></i></td>';
            str += "</tr>";
            $('tr.newDuliangtr').remove();
            if ($('.DuliangTable tbody tr').length == 0) {
                $('.DuliangTable tbody').html(str);
            } else {
                $('.DuliangTable tbody tr').eq(0).before(str);
            }
            showMessage('维度' + duname, '新增成功');
            $('.editDuliangContainer').attr('active', '');
        }
    })
}
//获取分组
function getGroupSelect() {
    var a = [];
    $('.GroupTable tbody tr').each(function() {
        a.push($(this).find('td').eq(0).html());
    })
    var str = "<select class='groupselect'>";
    a.map(function(i, v) {
        str += '<option>' + i + '</option>'
    })
    str += "</select>";
    return str;
}
//获取数据格式
function getDataFormat() {
    var a = ['百分比', '1位小数', '2位小数', '整数', '4位小数'];
    var str = "<select class='dataformatselect'>";
    a.map(function(i, v) {
        str += '<option value="' + i + '">' + i + '</option>'
    })
    str += "</select>";
    return str;
}
//获取表格select
function getTableSelect() {
    var a = [];
    $('.joinTable tbody tr').each(function() {
        a.push($(this).find('td').eq(0).html());
    })
    var str = "<select class='tableselect'>";
    for (var i = 0; i < a.length; i++) {
        str += '<option value="' + a[i] + '">' + a[i] + '</option>';
    }
    str += "</select>";
    return str;
}
//保存新的文件夹
function saveNewFolder(foldername, level, p, pfid) {
    var tp = {},
        q = {};
    tp.parentId = pfid;
    tp.categoryName = foldername;
    q.atype = 'POST';
    q.success = function(r) {
        if (r.status == 1 && r.msg == 'success') {
            var str = returnAfterEditLi(r.id, foldername, level);
            if (p.find('li').length == 1) {
                p.html(str);
            } else {
                $('.editFolderLi').remove();
                p.find('li').eq(0).before(str);
            }
            showMessage(foldername, '新增成功');
        }
    }
    $.api('report/saveReportCategory', tp, q)
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
    str += '<td class="optable"><i class="fa fa-pencil"></i><i class="fa fa-minus" ></i></td>';
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

function returnEditLi(level, pid) {
    var width = 124 - level * 15;
    var str = "";
    str += '<li class="subNavUli editFolderLi">';
    str += '<div class="Center-Container is-Table">';
    str += '<div class="Table-Cell">';
    str += '<i class="folder fa fa-folder">';
    str += '</i>';
    str += '<input class="editFolder" placeholder="请输入文件名" style="width:' + width + 'px"/>';
    str += '<span class="rmnlioperate">';
    str += '<i class="fa fa-save" level="' + level + '" pfid="' + pid + '">';
    str += '</i>';
    str += '<i class="fa fa-remove">';
    str += '</i>';
    str += '</span>';
    str += '</div>';
    str += '</div></li>';
    return str;
}

function returnAfterEditLi(id, name, level) {
    var width = 190 - level * 15 - 44 - 24 - 10;
    var str = "";
    str += '<li actionid="' + id + '" class="subNavUli" keyname="' + name + '" level="' + level + '">';
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
    str += '</div>';
    str += '</div></li>';
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