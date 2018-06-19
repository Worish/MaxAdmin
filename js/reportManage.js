$(document).ready(function() {
    initAod();
    initEo();
    $ec = $('div.editReportContainer');
    clickFlag = null;
    searcht = setTimeout(function() {}, 3000);
    clearTimeout(searcht);
    getAllTables();
    getAllFilters();
    baseClick();
    initDB();
})

function baseClick() {
    $('body').on('click', function() {
        $('.pathUlContianer').hide();
        $('.allTableUlContainerShow').removeClass('allTableUlContainerShow');
        $('.filterSelectContainer').hide();
        if (checkEditFold(true)) {}
    })
    //修改目录的操作
    $('.pathUl').on('click', 'li', function(e) {
        e.stopPropagation();
        e.preventDefault();
    })
    //删除报表
    $('.reportList').on('click', '.fa-remove', function(e) {
        e.stopPropagation();
        e.preventDefault();
        var id = $(this).attr('actionid');
        var name = aod.reportList[id].name;
        swal({
            title: "确定删除报表",
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
                p.reportId = id;
                q.success = function(r) {
                    if (r.status == 1 && r.msg == 'success') {
                        swal.close();
                        $('.reportList tr[actionid="' + id + '"]').remove();
                        delete aod.reportList[id];
                        showMessage('表' + name, '删除成功');
                    } else {
                        swal({
                            title: '删除' + name + '失败,因为' + r.msg,
                            type: 'error',
                        })
                    }
                }
                $.api('report/delete', p, q);
            } else {
                swal.close();
            }
        });
    })
    //切换是否可选操作
    $('.showIsSelectContainer').on('change', 'input', function() {
        updateReportBasic('isFieldSelect');
    })
    //编辑报表路径的操作
    $('.pathUl').on('click', 'li', function(e) {
        e.stopPropagation();
        e.preventDefault();
        $('.selectpathnamespanSel').removeClass('selectpathnamespanSel');
        $(this).find('.selectpathnamespan').eq(0).addClass('selectpathnamespanSel');
    })
    //保存报表路径的操作
    $('.PathOperContainer').on('click', '.savePath', function(e) {
        e.stopPropagation();
        e.preventDefault();
        var nfid = $('.selectpathnamespanSel').parent().attr('folderid') * 1;
        if (nfid != eo.folderid) {
            eo.nextfolderid = nfid;
            updateReportBasic('path');
        } else {
            swal('路径未发生变更哦', 'warning');
        }
    })
    //点击根目录的操作
    $('.rootli>.Center-Container').on('click', function() {
        $('.subNavUliActive').removeClass('subNavUliActive');
        $(this).parent().addClass('subNavUliActive');
        getReportList($(this).parent().attr('folderid'));
    })
    //点击关闭新建按钮的操作
    $('.closeEditReportContainer').on('click', function() {
        $ec.hide();
        emptyEditAll();
    })
    //点击报表路径框的操作
    $('.pathShowContainer').on('click', function(e) {
        e.stopPropagation();
        e.preventDefault();
        fullFolderPathReport();
        var id = eo.id;
        if (id != null) {
            var fid = aod.reportList[id].categoryId;
            $('.pathUl li[folderid="' + fid + '"]').find('span.selectpathnamespan').eq(0).addClass('selectpathnamespanSel');
        }
        $('.pathUlContianer').show();
    })
    //点击编辑报表标题的操作
    $('.titleNameContainer').on('click', 'i', function(e) {
        var ca = $(this).attr('class').split(' ');
        var p = $(this).parent();
        var v = p.find('input.reportNameInput').val();
        if ($.inArray('fa-pencil', ca) > -1) {
            p.find('.fa-pencil').hide();
            p.find('.fa-save').show();
            p.find('.fa-remove').show();
            p.find('input.reportNameInput').removeAttr('disabled');
            window.updatereportname = p.find('input.reportNameInput').val();
        } else if ($.inArray('fa-save', ca) > -1) {
            if (eo.style == 'new') { //新增报表的时候的操作
                if (v.replace(/\s+/g, '', '') == '') {
                    showMessage('报表名称', '不能为空');
                } else {
                    var pa = {},
                        q = {};
                    q.atype = 'POST';
                    pa.categoryId = eo.folderid;
                    var dbnum = 0;
                    for (var j in window.db) {
                        pa.datasourceId = j;
                        dbnum++;
                        break;
                    }
                    pa.comment = '';
                    if (dbnum == 0) {
                        swal({
                            title: '请先配置系统db',
                            type: 'error',
                        })
                        return false;
                    }
                    pa.name = v;
                    q.success = function(r, xhr) {
                        if (r.status == 1 && r.msg == 'success') {
                            eo.style = 'edit';
                            eo.id = r.id;
                            $('.pathContainer').show();
                            $('.leftContianer').show();
                            $('.showIsSelectContainer').show();
                            p.find('i').attr('actionid', r.id);
                            p.find('i.fa-save').hide();
                            p.find('i.fa-pencil').show();
                            p.find('input.reportNameInput').attr('disabled', 'disabled');
                            aod.reportList[r.id] = {};
                            aod.reportList[r.id].id = r.id * 1;
                            aod.reportList[r.id].name = pa.name;
                            aod.reportList[r.id].categoryId = pa.categoryId * 1;
                            aod.reportList[r.id].datasourceId = pa.datasourceId;
                            aod.reportList[r.id].comment = pa.comment;
                            var d = (new Date()).getTime();
                            aod.reportList[r.id].createTime = d;
                            aod.reportList[r.id].updateTime = d;
                            aod.reportList[r.id].isFieldSelect = 0;
                            getReportList(eo.folderid);
                            showMessage(v, '新增成功,请配置其他内容');
                            aod.rd[eo.id] = {};
                            aod.rf[eo.id] = {};
                            aod.rk[eo.id] = {};
                            aod.rg[eo.id] = {};
                        } else {
                            swal({
                                title: r.msg,
                                type: 'error',
                            })
                        }
                    }
                    $.api('report/save', pa, q);
                }
            } else if (eo.style == 'edit') { //修改报表的操作
                var v = p.find('input.reportNameInput').val();
                if (v == window.updatereportname) {
                    showMessage('', '名称未修改过哦');
                } else {
                    updateReportBasic('name');
                }
            }
        } else if ($.inArray('fa-remove', ca) > -1) {
            p.find('.fa-pencil').show();
            p.find('.fa-save').hide();
            p.find('.fa-remove').hide();
            p.find('input.reportNameInput').attr('disabled', 'disabled');
            p.find('input.reportNameInput').val(window.updatereportname);
            window.updatereportname = null;
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
        /*if (clickFlag) { //取消上次延时未执行的方法
        }*/
        clearTimeout(clickFlag);
        $('.readychange').removeClass('readychange');
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
                getReportList($('.readychange').attr('folderid'));
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
        if ($('input.editFolder').length > 0) { //保存新增文件夹
            var folderName = $('input.editFolder').val();
            var p = $(this).parent().parent().parent().parent().parent();
            var pfid = $(this).attr('pfid');
            saveNewFolder(folderName, level, p, pfid);
        } else if ($('input.updateFolder').length > 0) { //保存修改文件夹
            var p = $(this).parent().parent().parent().parent();
            var foldname = $('input.updateFolder').val();
            var width = $('input.updateFolder').css('width');
            var level = $(this).attr('level');
            var folderid = $(this).attr('folderid');
            if (foldname == window.updatefoldname) {
                showMessage(foldname, '未发生变化哦');
            } else {
                saveUpdateFolder(foldname, width, p, level, folderid);
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
            var fid = $(this).attr('folderid');
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
                    var pa = {},
                        q = {};
                    pa.categoryId = fid;
                    q.success = function(r) {
                        if (r.status == 1 && r.msg == 'success') {
                            swal.close();
                            $('.readyDelete').remove();
                            delete aod.treedata[fid];
                            showMessage('文件夹' + foldname, '删除成功');
                        } else {
                            swal({
                                title: r.msg,
                                type: 'error',
                            })
                        }
                        refreshfoldmap();
                    }
                    $.api('report/deleteReportCategory', pa, q);
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
            var folderid = $(this).attr('folderid');
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
            folder.remove();
            p.find('.fa-pencil').eq(0).remove();
            p.find('.fa-plus').eq(0).remove();
            p.find('.fa-remove').eq(0).before('<i class="fa fa-save" folderid="' + folderid + '" level=' + level + '></i>')
        } else {
            showMessage('Warning!', '请先保存当前正在编辑的内容');
        }
    });
    //新建报表按钮的操作
    $('.newReport').on('click', function(e) {
        $('input.reportNameInput').val('');
        $('input.reportNameInput').removeAttr('disabled');
        $('.titleNameContainer .fa-save').show();
        $('.titleNameContainer .fa-pencil').hide();
        $ec.show();
        $('.pathContainer').hide();
        $('.leftContianer').hide();
        fullFolderPathReport();
        eo.folderid = $('.subNavUliActive').attr('folderid');
        // $('.pathShowContainer').attr('folderid', $('.subNavUliActive').attr('folderid'));
        $('.pathShowContainer').text(getPath(eo.folderid));
        $('input.reportNameInput').focus();
        eo.style = 'new';
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
    //编辑报表事件
    $('.reportList').on('click', '.fa-edit', function(e) {
        e.stopPropagation();
        e.preventDefault();
        editReport($(this).attr('actionid'));
    })
    //新增数据表事件
    $('.newDataSource').on('click', function(e) {
        e.stopPropagation();
        e.preventDefault();
        refreshAllTable(eo.id);
        $('.allTableUlContainer').addClass('allTableUlContainerShow');
    })
    //禁用向上冒泡事件
    $('.allTableUlContainer').on('click', function(e) {
        e.stopPropagation();
        e.preventDefault();
    })
    //保存排序功能
    $('.editItemContainer').on('click', '.saveOrder', function(e) {
        e.stopPropagation();
        var url = '';
        var p = {},
            q = {};
        if (eo.action == 'editG roup') {
            url = 'report/updateReportFieldCategorySeq';
        } else if (eo.action == 'editFilter') {
            url = 'report/updateReportFilterRelationSeq';
        } else if (eo.action == 'editDuliang') {
            url = 'report/updateReportFieldSeq';
        } else if (eo.action == 'editDimen') {
            url = 'report/updateReportFieldSeq';
        }
        p = [];
        q.atype = 'POST';
        var pa = $(this).parent().parent().find('tbody');
        var length = pa.find('tr').length;
        pa.find('tr').each(function(i) {
            var o = {};
            o.itemId = $(this).attr('actionid') * 1;
            o.sequence = length - i;
            p.push(o);
        })
        // console.log(p);
        // p = JSON.stringify(p);
        q.success = function(r) {
            if (r.status == 1 && r.msg == 'success') {
                if (eo.action == 'editGroup') {
                    for (var i = 0; i < p.length; i++) {
                        var o = p[i];
                        aod.rg[eo.id][o.itemId].sequence = o.sequence;
                    }
                    showGroup(eo.id);
                } else if (eo.action == 'editFilter') {
                    /*for(var i=0;i<p.length;i++){
                        var o = p[i];
                        aod.rg[eo.id][o.itemId].sequence = o.sequence;
                   }
                   showGroup();*/
                } else if (eo.action == 'editDuliang') {
                    for (var i = 0; i < p.length; i++) {
                        var o = p[i];
                        aod.rk[eo.id][o.itemId].sequence = o.sequence;
                    }
                    showDuliang(eo.id);
                } else if (eo.action == 'editDimen') {
                    for (var i = 0; i < p.length; i++) {
                        var o = p[i];
                        aod.rd[eo.id][o.itemId].sequence = o.sequence;
                    }
                    showDim(eo.id);
                }
                $('.saveOrder').hide();
                $('.cancelSaveOrder').hide();
                $('.speinfo').hide();
                showMessage('保存顺序成功', '');
            } else {
                swalinfo('修改顺序失败,请联系管理员');
            }
        }
        $.api(url, p, q);
    })
    //取消保存排序功能
    $('.editItemContainer').on('click', '.cancelSaveOrder', function(e) {
        e.stopPropagation();
        if (eo.action == 'editGroup') {
            showGroup();
        } else if (eo.action == 'editFilter') {
            showFilter(eo.id);
        } else if (eo.action == 'editDuliang') {
            showDuliang(eo.id);
        } else if (eo.action == 'editDimen') {
            showDim(eo.id);
        }
        $('.cancelSaveOrder').hide();
        $('.saveOrder').hide();
        $('.speinfo').hide();
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
            var p = {},
                q = {};
            p.reportId = eo.id;
            p.relation = '';
            p.sequence = 9999;
            p.datasetId = $(this).attr('actionid');
            p.datasetName = aod.datatable[p.datasetId].datasetName;
            var url = "report/saveReportDataset";
            q.atype = 'POST';
            var _this = $(this);
            q.success = function(r) {
                if (r.status == 1 && r.msg == 'success') {
                    //当前表未选中 
                    var tname = _this.text();
                    _this.addClass('hasSelectTable');
                    getTablesById(p.reportId, true);
                    if (aod.datatable[p.datasetId].type == 2) {
                        addReportKey(p.reportId, p.datasetId);
                    }
                    showMessage(tname, '添加成功');
                }
            }
            $.api(url, p, q);
        }
    })
    //编辑关联的事件
    $('.dataTableOper').on('click', '.dataTableOperItem', function() {
        $('.dataTableOper').hide();
        $('.editItemContainer').hide();
        $('.saveOrder').hide();
        $('.cancelSaveOrder').hide();
        $('.speinfo').hide();
        $('.' + eo.action + 'Container tbody tr').remove();
        var ac = $(this).attr('active');
        $('.' + ac + 'Container').show();
        eo.action = ac;
        eo.actionid = '';
        eo.actiontype = '';
        if (ac == 'editJoin') { //当点击编辑关联的时候
            //fullJoinTable();
            getTablesById(eo.id);
        } else if (ac == 'editGroup') { //当点击分组的时候
            showGroupById(eo.id);
        } else if (ac == 'editDimen') { //当点击分组的时候
            showDim(eo.id);
        } else if (ac == 'editDuliang') { //当点击分组的时候
            showDuliang(eo.id);
        } else if (ac == 'editFilter') { //当点击分组的时候
            showFilter(eo.id);
        }
    })
    //编辑关联
    $('.joinTable').on('click', '.fa-edit', function() {
        // $('.editJoinContainer').attr('active', 'edit');
        var p = $(this).parent().parent();
        eo.actiontype = 'edit';
        eo.actionid = p.attr('actionid') * 1;
        var jointext = p.find('td').eq(2).text();
        window.jointext = jointext;
        var str = '<textarea class="tablejoinedit"></textarea>';
        p.find('td').eq(2).html(str);
        $('textarea.tablejoinedit').val(jointext);
        p.find('td').eq(3).html('<i class="fa fa-save"></i><i class="fa fa-remove"></i>');
    })
    //保存关联
    $('.joinTable').on('click', '.fa-save', function() {
        var jointext = $('textarea.tablejoinedit').val();
        if (jointext.replace(/\s+/g, '') == '') {
            swalinfo('关联关系为空哦');
        } else {
            var p = $(this).parent().parent();
            var pa = {},
                q = {};
            pa.reportId = eo.id;
            pa.relation = jointext;
            pa.sequence = 9999;
            pa.id = p.attr('actionid');
            pa.datasetId = aod.rt[pa.reportId][pa.id].datasetId;
            pa.datasetName = aod.rt[pa.reportId][pa.id].datasetName;
            q.atype = 'POST';
            /*
            pa.datasetId = p.attr('actionid');
            pa.datasetName = aod.datatable[p.datasetId].datasetName;*/
            q.success = function(r) {
                if (r.status == '1' && r.msg == 'success') {
                    eo.actiontype = '';
                    eo.actionid = '';
                    var db = p.find('td').eq(0).html();
                    p.find('td').eq(2).html(jointext);
                    p.find('td').eq(3).html('<i class="fa fa-edit" actionid="' + pa.id + '"></i><i class="fa fa-remove" actionid="' + pa.id + '"></i>');
                    aod.rt[pa.reportId][pa.id].relation = jointext;
                    showMessage(db, '修改成功');
                } else {
                    swalinfo(r.msg + '修改失败哦,请联系管理员');
                }
            }
            $.api('report/updateReportDataset', pa, q);
        }
    })
    //取消保存关联或者删除表
    $('.joinTable').on('click', '.fa-remove', function() {
        var p = $(this).parent().parent();
        if ($('textarea.tablejoinedit').length > 0) {
            $('.editJoinContainer').attr('active', '');
            $('textarea.tablejoinedit').remove();
            p.find('td').eq(2).html(window.jointext);
            window.jointext = null;
            p.find('td').eq(3).html('<i class="fa fa-edit"></i><i class="fa fa-remove"></i>');
        } else {
            eo.actionid = p.attr('actionid') * 1;
            eo.actiontype = 'delete';
            var tb = p.find('td').eq(0).html();
            p.addClass('readyremovetable');
            var actionid = eo.actionid;
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
                    var p = {},
                        q = {};
                    p.reportDatasetId = eo.actionid;
                    q.success = function(r) {
                        if (r.status == '1' && r.msg == 'success') {
                            eo.actionid = '';
                            eo.actiontype = '';
                            $('tr.readyremovetable').remove();
                            swal.close();
                            $('ul.allTableUl li[actionid="' + aod.rt[eo.id][actionid].datasetId + '"]').removeClass('hasSelectTable');
                            $('div.reportdataset[actionid="' + actionid + '"]').remove();
                            delete aod.rt[eo.id][actionid];
                            showMessage(tb, '删除成功');
                            eo.actionid = '';
                            eo.actiontype = '';
                        } else {
                            swalinfo(r.msg + '删除表报错了.请联系管理员')
                        }
                    }
                    $.api('report/deleteReportDataset', p, q);
                } else {
                    eo.actionid = '';
                    eo.actiontype = '';
                    $('tr.readyremovetable').removeClass('readyremovetable');
                    swal.close();
                }
            });
        }
    })
    //搜索关联里面的表
    $('input[name="searchTable"]').on('keyup keydown paste focus click', function() {
        var v = $('input[name="searchTable"]').val();
        if (v.replace(/\s+/g, '') != '') {
            $('.allTableUl').html('<li class="hasSelectTable">努力加载中...</li>')
            clearTimeout(searcht);
            searcht = setTimeout(function() {
                var tid = eo.id;
                var tempa = [];
                for (var i in aod.rt[tid]) {
                    tempa.push(aod.rt[tid][i].datasetId * 1);
                }
                var tempb = [];
                for (var i in aod.datatable) {
                    if (aod.datatable[i].showname.indexOf(v) > -1) {
                        var str = "";
                        var flag = "";
                        if ($.inArray(aod.datatable[i].id, tempa) > -1) {
                            flag = 'hasSelectTable';
                        }
                        str += "<li class='" + flag + "' actionid='" + aod.datatable[i].id + "'>" + aod.datatable[i].showname + "</li>"
                        tempb.push(str);
                    }
                }
                $('.allTableUl').html(tempb.join(''));
            }, 300)
        }
    })
    //新建分组
    $('.newGroup').on('click', function(e) {
        // $('.GroupTable').attr('action', 'new');
        if (eo.actiontype == '') {
            eo.actiontype = 'new';
            var str = "<tr class='newGroupTr'>";
            str += '<td><input class="tableinput groupNameInput" type="text" placeholder="在此处输入组名" /></td>';
            str += '<td><select class="showop"><option value="selectMul">多选</option><option value="select">单选</option></select></td>';
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
    //编辑分组信息
    $('.GroupTable').on('click', '.fa-pencil', function(e) {
        if (eo.actiontype != '') {
            swalinfo('请先完成当前编辑内容');
        } else {
            var p = $(this).parent().parent();
            eo.actiontype = 'edit';
            eo.actionid = p.attr('actionid') * 1;
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
            var selectgt = '<select><option  value="selectMul" ' + mse + '>多选</option><option value="select" ' + fse + '>单选</option></select>';
            p.find('td').eq(0).html(inputgn);
            p.find('td').eq(1).html(selectgt);
            p.find('td').eq(2).html('保存后可修改顺序');
            p.find('td').eq(3).html('<i class="fa fa-save"></i><i class="fa fa-remove"></i>');
        }
    })
    //保存分组信息
    $('.GroupTable').on('click', '.fa-save', function(e) {
        var p = $(this).parent().parent();
        var gn = p.find('td').eq(0).find('input').val();
        var gs = p.find('td').eq(1).find('select').val();
        var gst = (gs == 'select') ? '单选' : '多选';
        var pa = {},
            q = {};
        q.atype = 'POST';
        pa.categoryName = gn;
        pa.showStyle = gs;
        pa.reportId = eo.id;
        //如果是新增状态下
        if (eo.actiontype == 'new') {
            pa.sequence = 9999;
            q.success = function(r) {
                if (r.status == 1 && r.msg == 'success') {
                    if (!aod.rg.hasOwnProperty(eo.id)) {
                        aod.rg[eo.id] = {};
                    }
                    aod.rg[eo.id][r.id] = {};
                    aod.rg[eo.id][r.id].categoryName = gn;
                    aod.rg[eo.id][r.id].showStyle = gs;
                    aod.rg[eo.id][r.id].sequence = pa.sequence;
                    aod.rg[eo.id][r.id].categoryId = r.id;
                    aod.rg[eo.id][r.id].reportId = eo.id;
                    showGroup();
                    showMessage(gn, '新增成功');
                    eo.actiontype = '';
                } else {
                    swalinfo(r.msg + '新增分组失败,请联系管理员');
                }
            }
            $.api('report/saveReportFieldCategory', pa, q);
        } else if (eo.actiontype == 'edit') {
            //如果是修改状态下
            eo.actiontype = 'edit';
            eo.actionid = p.attr('actionid') * 1;
            pa.categoryId = p.attr('actionid');
            pa.sequence = aod.rg[eo.id][eo.actionid].sequence;
            q.success = function(r) {
                if (r.status == 1 && r.msg == 'success') {
                    eo.actiontype = '';
                    eo.actionid = '';
                    aod.rg[pa.reportId][p.attr('actionid')].categoryName = gn;
                    aod.rg[pa.reportId][p.attr('actionid')].showStyle = gs;
                    showGroup();
                    showMessage(gn, '修改成功');
                } else {
                    swalinfo(r.msg + '修改分组失败,请联系管理员');
                }
            }
            $.api('report/updateReportFieldCategory', pa, q);
        }
        // $('.GroupTable').attr('action', '');
    })
    //取消保存分组信息和删除行
    $('.GroupTable').on('click', '.fa-remove', function(e) {
        if (eo.actiontype == 'new') {
            $('.newGroupTr').remove();
            eo.actiontype = '';
        } else if (eo.actiontype == 'edit') {
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
                var selectgt = '<select><option ' + mse + '>多选</option><option ' + fse + '>单选</option></select>';
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
                        eo.actiontype = '';
                        eo.actionid = '';
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
        } else if (eo.actiontype == '') {
            var p = $(this).parent().parent();
            eo.actiontype = 'delete';
            eo.actionid = p.attr('actionid');
            var gn = p.find('td').eq(0).text();
            gid = p.attr('actionid');
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
                    var pa = {},
                        q = {};
                    pa.categoryId = gid;
                    q.success = function(r) {
                        if (r.status == '1' && r.msg == 'success') {
                            swal.close();
                            $('tr[actionid="' + gid + '"]').remove();
                            delete aod.rg[eo.id][gid];
                            showGroup();
                            showMessage('组' + gn, '删除成功');
                            eo.actiontype = '';
                            eo.actionid = '';
                        } else {
                            swalinfo(r.msg + '删除分组失败.请联系管理员');
                        }
                    }
                    $.api('report/deleteReportFieldCategory', pa, q);
                } else {
                    eo.actiontype = '';
                    eo.actionid = '';
                    swal.close();
                }
            });
        }
    })
    //组顺序上
    $('.table').on('click', '.fa-chevron-circle-up', function(e) {
        if (eo.actiontype != '') {
            showMessage('', '请先完成当前编辑内容');
        } else {
            var p = $(this).parent().parent();
            var gn = p.find('td').eq(0).html();
            var index = p.index();
            var gid = p.attr('actionid');
            if (index == 0) {
                showMessage('不能再往上啦', '啊啊啊啊啊啊啊');
            } else {
                p.parent().parent().find('.saveOrder').show();
                p.parent().parent().find('.cancelSaveOrder').show();
                p.parent().parent().find('.speinfo').show();
                var htmlstr = '<tr actionid="' + gid + '">' + p.html() + '</tr>';
                p.addClass('readyTop');
                p.prev().before(htmlstr);
                $('.readyTop').remove();
                // $('tr[groupid="' + gid + '"]').remove();
                // $('.GroupTable tbody tr').eq(index - 1).before(htmlstr);
            }
        }
    })
    //组顺序下
    $('.table').on('click', '.fa-chevron-circle-down', function(e) {
        if (eo.actiontype != '') {
            showMessage('', '请先完成当前编辑内容');
        } else {
            var p = $(this).parent().parent();
            var gn = p.find('td').eq(0).html();
            var index = p.index();
            var gid = p.attr('actionid');
            if (index == p.parent().find('tr').length - 1) {
                showMessage('不能再往下啦', '啊啊啊啊啊啊啊');
            } else {
                p.parent().parent().find('.saveOrder').show();
                p.parent().parent().find('.cancelSaveOrder').show();
                p.parent().parent().find('.speinfo').show();
                var htmlstr = '<tr actionid="' + gid + '">' + p.html() + '</tr>';
                p.addClass('readyTop');
                p.next().after(htmlstr);
                $('.readyTop').remove();
                // $('tr[groupid="' + gid + '"]').remove();
                // $('.GroupTable tbody tr').eq(index - 1).before(htmlstr);
            }
        }
    })
    //添加指标操作
    $('.newDuliang').on('click', function() {
        if (eo.actiontype == '') {
            eo.actiontype = 'new';
            //$('.editDuliangContainer').attr('active', 'new');
            var str = "<tr class='newDuliangtr'>";
            str += "<td></td>";
            str += "<td><input class='tableinput DuliangName' type='text' /></td>";
            str += "<td><input class='tableinput DuliangGongshi' type='text' /></td>";
            str += "<td><select class='func'><option value='sum'>sum</option><option value='avg'>avg</option><option value='max'>max</option><option value='min'>min</option><option value='智能指标'>智能指标</option></select></td>";
            str += "<td><textarea class='DuliangInfo'></textarea></td>";
            str += "<td></td>";
            str += "<td>" + getGroupSelect() + "</td>";
            str += "<td>" + getFormatSelect() + "</td>";
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
        if (eo.actiontype == 'new') {
            $('tr.newDuliangtr').remove();
            eo.actiontype = '';
        } else if (eo.actiontype == 'edit') {
            var d = aod.rk[eo.id][eo.actionid];
            var str = '';
            str += "<td>" + $(this).parent().parent().find('td').eq(0).html() + "</td>";
            str += "<td>" + d.displayName + "</td>";
            str += "<td>" + d.columnName + "</td>";
            str += "<td>" + d.aggregateFunction + "</td>";
            str += "<td>" + d.comment + "</td>";
            str += '<td><i class="fa fa-chevron-circle-up"></i><i class="fa fa-chevron-circle-down"></i></td>';
            str += "<td>" + aod.rg[eo.id][d.fieldCategoryId].categoryName + "</td>";
            str += "<td>" + getFormatSelect({
                "se": d.format
            }) + "</td>";
            str += '<td><i class="fa fa-pencil"></i><i class="fa fa-remove"></i></td>';
            $('table.DuliangTable tr[actionid="' + eo.actionid + '"]').html(str);
            eo.actiontype = '';
            eo.actionid = '';
        } else if (eo.actiontype == '') {
            var p = $(this).parent().parent();
            var did = p.attr('actionid') * 1;
            var duname = p.find('td').eq(1).html();
            eo.actiontype = 'delete';
            eo.actionid = did;
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
                    var url = 'report/deleteReportField';
                    var pa = {},
                        q = {};
                    pa.reportFieldId = did;
                    q.success = function(r) {
                        if (r.status == 1 && r.msg == 'success') {
                            swal.close();
                            $('table.DuliangTable tr[actionid="' + did + '"]').remove();
                            $('div.showfacttableContainer div.showkey[actionid="' + did + '"]').remove();
                            delete aod.rk[eo.id][did];
                            eo.actionid = '';
                            eo.actiontype = '';
                            showMessage('维度' + duname, '删除成功');
                        } else {
                            swalinfo(r.msg + '删除度量报错,请联系管理员');
                        }
                    }
                    $.api(url, pa, q);
                } else {
                    eo.actiontype = '';
                    eo.actionid = '';
                    swal.close();
                }
            });
        }
    })
    //指标度量编辑按钮操作
    $('.DuliangTable').on('click', '.fa-pencil', function() {
        if (eo.actiontype != '') {
            showMessage('请先完成当前编辑内容', '');
        } else {
            var p = $(this).parent().parent();
            eo.actiontype = 'edit';
            eo.actionid = p.attr('actionid') * 1;
            var d = aod.rk[eo.id][eo.actionid];
            p.find('td').eq(1).html('<input class="tableinput DuliangName" type="text" value="' + d.displayName + '"/>');
            p.find('td').eq(2).html('<input class="tableinput DuliangGongshi" type="text" value="' + d.columnName + '"/>');
            var str2 = "<select class='func'><option value='sum'>sum</option><option value='avg'>avg</option><option value='max'>max</option><option value='min'>min</option><option value='智能指标'>智能指标</option></select>";
            str2 = str2.replace(d.aggregateFunction + '"', d.aggregateFunction + '" selected')
            p.find('td').eq(3).html(str2);
            p.find('td').eq(4).html('<textarea class="DuliangInfo">' + d.comment + '</textarea>');
            p.find('td').eq(5).html('');
            p.find('td').eq(6).html(getGroupSelect(d.fieldCategoryId));
            var sstr = getFormatSelect({
                "se": d.format
            });
            // sstr = sstr.replace(d.format + '"', d.format + '" selected ');
            p.find('td').eq(7).html(sstr);
            p.find('td').eq(8).html('<i class="fa fa-save"></i><i class="fa fa-remove"></i>');
        }
    })
    //指标度量保存按钮操作
    $('.DuliangTable').on('click', '.fa-save', function() {
        var p = $(this).parent().parent();
        var duname = p.find('input.DuliangName').val();
        var dugongshi = p.find('input.DuliangGongshi').val();
        var dufunc = p.find('select.func').val();
        var duinfo = p.find('textarea.DuliangInfo').val();
        var flag = true;
        var group = p.find('select.groupselect option:selected').val();
        var df = p.find('select.dataformatselect option:selected').text();
        var dfp = formatJson();
        df = dfp[df];
        if (duname.replace(/\s+/g, '') == '') {
            flag = false;
            p.find('input.DuliangName').addClass('inputerror');
            setTimeout(function() {
                $('input.DuliangName').removeClass('inputerror');
            }, 2000)
        }
        if (dugongshi.replace(/\s+/g, '') == '') {
            flag = false;
            p.find('input.DuliangGongshi').addClass('inputerror');
            setTimeout(function() {
                $('input.DuliangGongshi').removeClass('inputerror');
            }, 2000)
        }
        if (dufunc.replace(/\s+/g, '') == '') {
            flag = false;
            p.find('input.func').addClass('inputerror');
            setTimeout(function() {
                $('input.func').removeClass('inputerror');
            }, 2000)
        }
        if (duinfo.replace(/\s+/g, '') == '') {
            flag = false;
            p.find('textarea.DuliangInfo').addClass('inputerror');
            setTimeout(function() {
                $('textarea.DuliangInfo').removeClass('inputerror');
            }, 2000)
        }
        if (flag) {
            if (eo.actiontype == 'new') {
                var pa = {},
                    q = {};
                q.atype = 'POST';
                pa.reportId = eo.id;
                pa.displayName = duname;
                pa.columnName = dugongshi;
                pa.aggregateFunction = dufunc;
                pa.comment = duinfo;
                pa.sequence = 9999;
                pa.format = df;
                pa.type = 2;
                pa.fieldCategoryId = group;
                q.success = function(r) {
                    if (r.status == 1 && r.msg == 'success') {
                        var ord = '<i class="fa fa-chevron-circle-up"></i><i class="fa fa-chevron-circle-down"></i>';
                        var str = "<tr actionid='" + r.id + "'>";
                        str += "<td>" + $('.DuliangTable tbody tr').length + "</td>";
                        str += "<td>" + duname + "</td>";
                        str += "<td>" + dugongshi + "</td>";
                        str += "<td>" + dufunc + "</td>";
                        str += "<td>" + duinfo + "</td>";
                        str += "<td>" + ord + "</td>";
                        str += "<td>" + aod.rg[eo.id][group].categoryName + "</td>";
                        str += "<td>" + getFormatName(df) + "</td>";
                        str += '<td><i class="fa fa-pencil"></i><i class="fa fa-remove"></i></td>';
                        str += "</tr>";
                        $('tr.newDuliangtr').remove();
                        if ($('.DuliangTable tbody tr').length == 0) {
                            $('.DuliangTable tbody').html(str);
                        } else {
                            $('.DuliangTable tbody tr').eq(0).before(str);
                        }
                        showMessage('指标' + duname, '新增成功');
                        if (!aod.rk.hasOwnProperty(eo.id)) {
                            aod.rk[eo.id] = {};
                        }
                        aod.rk[eo.id][r.id] = {};
                        aod.rk[eo.id][r.id].reportId = pa.reportId;
                        aod.rk[eo.id][r.id].displayName = pa.displayName;
                        aod.rk[eo.id][r.id].columnName = pa.columnName;
                        aod.rk[eo.id][r.id].aggregateFunction = pa.aggregateFunction;
                        aod.rk[eo.id][r.id].comment = pa.comment;
                        aod.rk[eo.id][r.id].sequence = pa.sequence;
                        aod.rk[eo.id][r.id].format = pa.format;
                        aod.rk[eo.id][r.id].type = pa.type;
                        aod.rk[eo.id][r.id].fieldCategoryId = pa.fieldCategoryId;
                        var str2 = '<div class="showkey " actionid="' + r.id + '">' + pa.displayName + '(' + pa.columnName + ')</div>';
                        if ($('.showfacttableContainer div.showkey').length == 0) {
                            $('.showfacttableContainer').html(str2);
                        } else {
                            $('.showfacttableContainer div.showkey').eq(0).before(str2);
                        }
                        eo.actiontype = '';
                        eo.actionid = '';
                    } else {
                        swalinfo(r.msg + '保存指标失败,请联系管理员')
                    }
                }
                $.api('report/saveReportField', pa, q);
            } else if (eo.actiontype == 'edit') {
                var pa = {},
                    q = {};
                q.atype = 'POST';
                pa.id = p.attr('actionid');
                pa.reportId = eo.id;
                pa.displayName = duname;
                pa.columnName = dugongshi;
                pa.aggregateFunction = dufunc;
                pa.fieldCategoryId = aod.rk[eo.id][eo.actionid].fieldCategoryId;
                pa.comment = duinfo;
                pa.sequence = aod.rk[eo.id][eo.actionid].sequence;
                pa.format = df;
                pa.type = 2;
                q.success = function(r) {
                    if (r.status == 1 && r.msg == 'success') {
                        // aod.rk[eo.id][eo.actionid];
                        aod.rk[eo.id][eo.actionid].displayName = pa.displayName;
                        aod.rk[eo.id][eo.actionid].columnName = pa.columnName;
                        aod.rk[eo.id][eo.actionid].aggregateFunction = pa.aggregateFunction;
                        aod.rk[eo.id][eo.actionid].comment = pa.comment;
                        aod.rk[eo.id][eo.actionid].sequence = pa.sequence;
                        aod.rk[eo.id][eo.actionid].format = pa.format;
                        aod.rk[eo.id][eo.actionid].type = pa.type;
                        var ord = '<i class="fa fa-chevron-circle-up"></i><i class="fa fa-chevron-circle-down"></i>';
                        var str = '';
                        str += "<td>" + p.find('td').eq(0).html() + "</td>";
                        str += "<td>" + duname + "</td>";
                        str += "<td>" + dugongshi + "</td>";
                        str += "<td>" + dufunc + "</td>";
                        str += "<td>" + duinfo + "</td>";
                        str += "<td>" + ord + "</td>";
                        str += "<td>" + aod.rg[eo.id][group].categoryName + "</td>";
                        str += "<td>" + getFormatName(df) + "</td>";
                        str += '<td><i class="fa fa-pencil"></i><i class="fa fa-remove"></i></td>';
                        $('table.DuliangTable tr[actionid="' + eo.actionid + '"]').html(str);
                        showMessage('指标' + duname, '更新成功');
                        eo.actiontype = '';
                        eo.actionid = '';
                    } else {
                        swalinfo(r.msg + '保存指标失败,请联系管理员')
                    }
                }
                $.api('report/updateReportField', pa, q);
            }
        }
    })
    //添加筛选
    $('.newFilter').on('click', function(e) {
        e.stopPropagation();
        if (eo.actiontype == '') {
            var str = "";
            str += '<tr class="newFilterTr">';
            str += '<td class="filterNameTd"><div class="filterNameE"></div>' + '<div class="filterSelectContainer"><input class="seachFilter" type="text" placeholder="在此输入搜索" />' + '<div class="fliterInfo">筛选列表:</div>' + '<ul class="fliterUl">' + getFilterUl() + '</ul>' + '<div class="filternameoper"><span  class="savefiln">确定</span><span  class="cancelfiln">取消</span></div></div></td>';
            str += '<td><input class="tableinput showName" type="text" /></td>';
            str += '<td><select class="isShow"><option value="1">是</option><option value="0">否</option></select></td>';
            str += '<td>' + getReportTable() + '</td>';
            str += '<td><input class="tableinput joinC" type="text" /></td>';
            str += '<td><select class="joinMax"><option value="0">否</option><option value="1">是</option></select></td>';
            str += '<td></td>';
            str += '<td><i class="fa fa-save"></i><i class="fa fa-remove"></i></td>';
            str += '</tr>';
            if ($('.FilterTable tbody tr').length == 0) {
                $('.FilterTable tbody').html(str);
            } else {
                $('.FilterTable tbody tr').eq(0).before(str);
            }
            eo.actiontype = 'new';
            $('.filterSelectContainer').show();
        } else {
            swalinfo('请先完成当前编辑内容')
        }
    })
    $('.FilterTable').on('click', 'li', function(e) {
        e.stopPropagation();
        if ($(this).attr('actionid') != null) {
            $('.filterliselected').removeClass('filterliselected');
            $(this).addClass('filterliselected');
        }
    })
    $('.FilterTable').on('click', '.savefiln', function(e) {
        e.stopPropagation();
        if ($('.filterliselected').length == 1) {
            $('.filterSelectContainer').hide();
            $('.filterNameE').text($('.filterliselected').text());
            $('.filterNameE').attr('filterid', $('.filterliselected').attr('actionid'));
        } else {
            swalinfo('请至少选择一个筛选');
        }
    })
    $('.FilterTable').on('click', '.cancelfiln', function(e) {
        e.stopPropagation();
        $('.filterSelectContainer').hide();
    })
    $('.FilterTable').on('click', '.filterNameE', function(e) {
        e.stopPropagation();
        $('.filterSelectContainer').show();
    })
    $('.FilterTable').on('click', '.filterSelectContainer', function(e) {
        e.stopPropagation();
    })
    $('.FilterTable').on('keyup keydown paste focus click', 'input.seachFilter', function(e) {
        e.stopPropagation();
        clearTimeout(searcht);
        searcht = setTimeout(function() {
            var str = '';
            var v = $('input.seachFilter').val();
            if (v.replace(/\s+/g, '') != '') {
                if (eo.actionid == '') {
                    str = getFilterUl('', v);
                } else {
                    //
                }
            } else {
                if (eo.actionid == '') {
                    var str = getFilterUl();
                }
            }
            if (str == '') {
                str = '<li>暂无搜索结果</li>'
            }
            $('.fliterUl').html(str);
        }, 300)
    })
    //筛选取消保存或者删除
    $('.FilterTable').on('click', '.fa-pencil', function() {
        if (eo.actiontype != '') {
            showMessage('请先完成当前编辑内容', '');
        } else {
            var p = $(this).parent().parent();
            eo.actiontype = 'edit';
            eo.actionid = p.attr('actionid') * 1;
            var d = aod.rf[eo.id][eo.actionid];
            var str = '';
            str += '<td class="filterNameTd"><div class="filterNameE">' + aod.filterList[d.filterId].name + '</div>' + '<div class="filterSelectContainer"><input class="seachFilter" type="text" placeholder="在此输入搜索" />' + '<ul class="fliterUl">' + getFilterUl(d.filterId) + '</ul>' + '<div class="filternameoper"><span  class="savefiln">确定</span><span  class="cancelfiln">取消</span></div></div></td>';
            str += '<td><input class="tableinput showName" type="text" value="' + d.showName + '" /></td>';
            var tempstr = '<select class="isShow"><option value="0">否</option><option value="1">是</option></select>';
            //tempstr = tempstr.replace('','')
            str += '<td>' + tempstr + '</td>';
            str += '<td>' + getReportTable(d.joinDatasetId) + '</td>';
            str += '<td><input class="tableinput joinC" type="text" value="' + d.joinColumn + '"/></td>';
            var tempstr2 = '<select class="joinMax"><option value="0">否</option><option value="1">是</option></select>';
            tempstr2 = tempstr2.replace(d.isAuth + '"', d.isAuth + '" selected');
            str += '<td>' + tempstr2 + '</td>';
            str += '<td></td>';
            str += '<td><i class="fa fa-save"></i><i class="fa fa-remove"></i></td>';
            $('.FilterTable tr[actionid="' + eo.actionid + '"]').html(str);
            /* p.find('td').eq(0).html('<input class="tableinput DuliangName" type="text" value="' + d.displayName + '"/>');
             p.find('td').eq(1).html('<input class="tableinput DuliangGongshi" type="text" value="' + d.columnName + '"/>');
             p.find('td').eq(2).html('<input class="tableinput func" type="text" value="' + d.aggregateFunction + '"/>');
             p.find('td').eq(3).html('<textarea class="DuliangInfo">' + d.comment + '</textarea>');
             p.find('td').eq(4).html('');
             p.find('td').eq(5).html(getGroupSelect(d.fieldCategoryId));
             var sstr = '<select class="dataformatselect"><option value="百分比">百分比</option><option value="1位小数">1位小数</option><option value="2位小数">2位小数</option><option value="整数">整数</option><option value="4位小数">4位小数</option></select>';
             sstr = sstr.replace(d.format + '"', d.format + '" selected ');
             p.find('td').eq(6).html('');
             p.find('td').eq(7).html('<i class="fa fa-save"></i><i class="fa fa-remove"></i>');*/
        }
    })
    //筛选取消保存或者删除
    $('.FilterTable').on('click', '.fa-remove', function() {
        if (eo.actiontype == 'new') {
            $('tr.newFilterTr').remove();
            eo.actiontype = '';
        } else if (eo.actiontype == 'edit') {
            var d = aod.rf[eo.id][eo.actionid];
            var str = '';
            var ord = '<i class="fa fa-chevron-circle-up"></i><i class="fa fa-chevron-circle-down"></i>';
            str += "<td>" + d.filterName + "</td>";
            str += "<td>" + d.showName + "</td>";
            str += "<td>" + ((d.isShow == 0) ? '否' : '是') + "</td>";
            str += "<td>" + '' + "</td>";
            str += "<td>" + d.joinColumn + "</td>";
            str += "<td>" + ((d.isAuth == 0) ? '否' : '是') + "</td>";
            str += "<td>" + ord + "</td>";
            str += '<td><i class="fa fa-pencil"></i><i class="fa fa-remove"></i></td>';
            $('table.FilterTable tr[actionid="' + eo.actionid + '"]').html(str);
            eo.actiontype = '';
            eo.actionid = '';
        } else if (eo.actiontype == '') {
            var p = $(this).parent().parent();
            var did = p.attr('actionid') * 1;
            var duname = p.find('td').eq(0).html();
            eo.actiontype = 'delete';
            eo.actionid = did;
            swal({
                title: "确定删除筛选",
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
                    var url = 'report/deleteReportFilterRelation';
                    var pa = {},
                        q = {};
                    pa.filterRelationId = did;
                    q.success = function(r) {
                        if (r.status == 1 && r.msg == 'success') {
                            swal.close();
                            $('table.FilterTable tr[actionid="' + did + '"]').remove();
                            $('div.showfiltertableContainer div.showkey[actionid="' + did + '"]').remove();
                            delete aod.rf[eo.id][did];
                            eo.actionid = '';
                            eo.actiontype = '';
                            showMessage('筛选' + duname, '删除成功');
                        } else {
                            swalinfo(r.msg + '删除筛选报错,请联系管理员');
                        }
                    }
                    $.api(url, pa, q);
                } else {
                    eo.actiontype = '';
                    eo.actionid = '';
                    swal.close();
                }
            });
        }
    })
    //指标筛选保存按钮操作
    $('.FilterTable').on('click', '.fa-save', function() {
        var p = $(this).parent().parent();
        var filterId = p.find('.filterNameE').attr('filterid');
        var filterName = p.find('.filterNameE').text();
        var showName = p.find('.showName').val();
        var isShow = p.find('.isShow option:selected').val();
        var reportId = eo.id;
        var joinDatasetId = p.find('.filterJoinTable option:selected').val();
        var joinColumn = p.find('.joinC').val();
        var isAuth = p.find('.joinMax option:selected').val();
        var sequence = 9999;
        var flag = true;
        if (filterId.replace(/\s+/g, '') == '') {
            flag = false;
            p.find('.filterNameE').addClass('inputerror');
            setTimeout(function() {
                p.find('.filterNameE').removeClass('inputerror');
            }, 2000)
        }
        if (showName.replace(/\s+/g, '') == '') {
            flag = false;
            p.find('input.showName').addClass('inputerror');
            setTimeout(function() {
                $('input.showName').removeClass('inputerror');
            }, 2000)
        }
        if (joinColumn.replace(/\s+/g, '') == '') {
            flag = false;
            p.find('input.joinC').addClass('inputerror');
            setTimeout(function() {
                $('input.joinC').removeClass('inputerror');
            }, 2000)
        }
        if (flag) {
            if (eo.actiontype == 'new') {
                var pa = {},
                    q = {};
                q.atype = 'POST';
                pa.filterId = filterId;
                pa.filterName = filterName;
                pa.showName = showName;
                pa.isShow = isShow;
                pa.joinDatasetId = joinDatasetId;
                pa.reportId = reportId;
                pa.joinColumn = joinColumn;
                pa.isAuth = isAuth;
                pa.sequence = sequence;
                q.success = function(r) {
                    if (r.status == 1 && r.msg == 'success') {
                        var ord = '<i class="fa fa-chevron-circle-up"></i><i class="fa fa-chevron-circle-down"></i>';
                        var str = "<tr actionid='" + r.id + "'>";
                        str += "<td>" + filterName + "</td>";
                        str += "<td>" + showName + "</td>";
                        str += "<td>" + ((isShow == 0) ? '否' : '是') + "</td>";
                        str += "<td>" + aod.datatable[pa.joinDatasetId].datasetName + "</td>";
                        str += "<td>" + joinColumn + "</td>";
                        str += "<td>" + ((isAuth == 0) ? '否' : '是') + "</td>";
                        str += "<td>" + ord + "</td>";
                        str += '<td><i class="fa fa-pencil"></i><i class="fa fa-remove"></i></td>';
                        str += "</tr>";
                        $('tr.newFilterTr').remove();
                        if ($('.FilterTable tbody tr').length == 0) {
                            $('.FilterTable tbody').html(str);
                        } else {
                            $('.FilterTable tbody tr').eq(0).before(str);
                        }
                        showMessage('筛选' + filterName, '新增成功');
                        if (!aod.rf.hasOwnProperty(eo.id)) {
                            aod.rf[eo.id] = {};
                        }
                        aod.rf[eo.id][r.id] = {};
                        aod.rf[eo.id][r.id].filterId = pa.filterId;
                        aod.rf[eo.id][r.id].filterName = pa.filterName;
                        aod.rf[eo.id][r.id].showName = pa.showName;
                        aod.rf[eo.id][r.id].isShow = pa.isShow;
                        aod.rf[eo.id][r.id].joinColumn = pa.joinColumn;
                        aod.rf[eo.id][r.id].isAuth = pa.isAuth;
                        aod.rf[eo.id][r.id].format = pa.format;
                        aod.rf[eo.id][r.id].sequence = pa.sequence;
                        var str2 = '<div class="showkey " actionid="' + r.id + '">' + pa.showName + '</div>';
                        if ($('.showfiltertableContainer div.showkey').length == 0) {
                            $('.showfiltertableContainer').html(str2);
                        } else {
                            $('.showfiltertableContainer div.showkey').eq(0).before(str2);
                        }
                        eo.actiontype = '';
                        eo.actionid = '';
                    } else {
                        swalinfo(r.msg + '保存指标失败,请联系管理员')
                    }
                }
                $.api('report/saveReportFilterRelation', pa, q);
            } else if (eo.actiontype == 'edit') {
                var pa = {},
                    q = {};
                q.atype = 'POST';
                pa.id = eo.actionid;
                pa.filterId = filterId;
                pa.filterName = filterName;
                pa.showName = showName;
                pa.isShow = isShow;
                pa.joinDatasetId = joinDatasetId;
                pa.reportId = reportId;
                pa.joinColumn = joinColumn;
                pa.isAuth = isAuth;
                pa.sequence = sequence;
                q.success = function(r) {
                    if (r.status == 1 && r.msg == 'success') {
                        var ord = '<i class="fa fa-chevron-circle-up"></i><i class="fa fa-chevron-circle-down"></i>';
                        var str = "";
                        str += "<td>" + filterName + "</td>";
                        str += "<td>" + showName + "</td>";
                        str += "<td>" + ((isShow == 0) ? '否' : '是') + "</td>";
                        str += "<td>" + aod.datatable[pa.joinDatasetId].datasetName + "</td>";
                        str += "<td>" + joinColumn + "</td>";
                        str += "<td>" + ((isAuth == 0) ? '否' : '是') + "</td>";
                        str += "<td>" + ord + "</td>";
                        str += '<td><i class="fa fa-pencil"></i><i class="fa fa-remove"></i></td>';
                        str += "</tr>";
                        $('.FilterTable  tr[actionid="' + eo.actionid + '"]').eq(0).html(str);
                        showMessage('筛选' + filterName, '新增成功');
                        aod.rf[eo.id][eo.actionid].filterId = pa.filterId;
                        aod.rf[eo.id][eo.actionid].filterName = pa.filterName;
                        aod.rf[eo.id][eo.actionid].showName = pa.showName;
                        aod.rf[eo.id][eo.actionid].isShow = pa.isShow;
                        aod.rf[eo.id][eo.actionid].joinColumn = pa.joinColumn;
                        aod.rf[eo.id][eo.actionid].isAuth = pa.isAuth;
                        aod.rf[eo.id][eo.actionid].format = pa.format;
                        aod.rf[eo.id][eo.actionid].sequence = pa.sequence;
                        var str2 = '<div class="showkey " actionid="' + r.id + '">' + pa.showName + '</div>';
                        $('.showfiltertableContainer div.showkey[actionid="' + eo.actionid + '"]').eq(0).html(str2);
                        showMessage('筛选' + filterName, '更新成功');
                        eo.actiontype = '';
                        eo.actionid = '';
                    } else {
                        swalinfo(r.msg + '修改筛选失败,请联系管理员')
                    }
                }
                $.api('report/updateReportFilterRelation', pa, q);
            }
        }
    })
    //添加公有维度
    $('.newPublicDimen').on('click', function(e) {
        e.stopPropagation();
        if (eo.actiontype == '') {
            eo.atctiontype = 'new';
            fullPubSelect();
            getPubDimByTable();
            $('.pubDimOutContainer').show();
        } else {
            swalinfo('请先完成当前编辑内容');
        }
    })
    $('.pubDimSelect').on('change', function() {
        getPubDimByTable();
    })
    $('.pubDimUl').on('click', 'li', function() {
        var c = $(this).attr('class');
        if (c != null && $.inArray('pubSelected', c.split(' ')) == -1) {
            var pid = $(this).attr('actionid');
            var pa = {},
                q = {};
            q.atype = 'POST';
            pa.datasetId = $('.pubDimSelect option:selected').val();
            var d = aod.pubdim[pa.datasetId][pid];
            pa.columnName = d.columnName;
            pa.displayName = d.displayName;
            pa.datasetColumnId = pid;
            pa.expression = d.expression;
            pa.isHidden = 1;
            pa.isRequired = 0;
            pa.isSubqueryGroup = 1;
            var tpa = formatJson()
            pa.format = tpa['文本'];
            pa.sequence = 9999;
            for (var i in aod.rg[eo.id]) {
                pa.fieldCategoryId = i;
                break;
            }
            pa.reportId = eo.id;
            pa.type = 1;
            var _this = $(this);
            q.success = function(r) {
                if (r.status == 1 && r.msg == 'success') {
                    _this.addClass('pubSelected');
                    if (!aod.rd.hasOwnProperty(eo.id)) {
                        aod.rd[eo.id] = {};
                    }
                    aod.rd[eo.id][r.id] = {};
                    aod.rd[eo.id][r.id].datasetId = pa.datasetId;
                    aod.rd[eo.id][r.id].columnName = pa.columnName;
                    aod.rd[eo.id][r.id].displayName = pa.displayName;
                    aod.rd[eo.id][r.id].datasetColumnId = pa.datasetColumnId;
                    aod.rd[eo.id][r.id].expression = pa.expression;
                    aod.rd[eo.id][r.id].isHidden = pa.isHidden;
                    aod.rd[eo.id][r.id].isRequired = pa.isRequired;
                    aod.rd[eo.id][r.id].isSubqueryGroup = pa.isSubqueryGroup;
                    aod.rd[eo.id][r.id].format = pa.format;
                    aod.rd[eo.id][r.id].sequence = pa.sequence;
                    aod.rd[eo.id][r.id].fieldCategoryId = pa.fieldCategoryId;
                    aod.rd[eo.id][r.id].reportId = pa.reportId;
                    aod.rd[eo.id][r.id].type = pa.type;
                    var ord = '<i class="fa fa-chevron-circle-up"></i><i class="fa fa-chevron-circle-down"></i>';
                    var str = "<tr actionid='" + r.id + "'>";
                    str += "<td>" + aod.datatable[pa.datasetId].tableName + "</td>";
                    str += "<td>" + pa.displayName + "</td>";
                    str += "<td>" + pa.columnName + "</td>";
                    str += "<td>" + pa.expression + "</td>";
                    str += "<td>" + ((pa.isHidden == 0) ? '否' : '是') + "</td>";
                    str += "<td>" + ((pa.isRequired == 0) ? '否' : '是') + "</td>";
                    str += "<td>" + ((pa.isSubqueryGroup == 0) ? '否' : '是') + "</td>";
                    str += "<td>" + getFormatName(pa.format) + "</td>";
                    str += "<td>" + '<i class="fa fa-chevron-circle-up"></i><i class="fa fa-chevron-circle-down"></i>' + "</td>";
                    str += "<td>" + aod.rg[eo.id][pa.fieldCategoryId].categoryName + "</td>";
                    str += '<td><i class="fa fa-pencil"></i><i class="fa fa-remove"></i></td>';
                    str += "</tr>";
                    $('tr.newDimTr').remove();
                    if ($('.editDimenTable tbody tr').length == 0) {
                        $('.editDimenTable tbody').html(str);
                    } else {
                        $('.editDimenTable tbody tr').eq(0).before(str);
                    }
                    showMessage('维度' + pa.columnName, '新增成功');
                    var str2 = '<div class="showkey " actionid="' + r.id + '">' + pa.displayName + '</div>';
                    if ($('.showdimensiontableContainer div.showkey').length == 0) {
                        $('.showdimensiontableContainer').html(str2);
                    } else {
                        $('.showdimensiontableContainer div.showkey').eq(0).before(str2);
                    }
                } else {
                    swalinfo(r.msg + '保存指标失败,请联系管理员')
                }
            }
            $.api('report/saveReportField', pa, q);
        }
    })
    //添加公有维度
    $('.pubDimOutContainer').on('click', '.closePubDimContainer', function(e) {
        e.stopPropagation();
        $('.pubDimOutContainer').hide();
        eo.actiontype = '';
    })
    //添加私有维度
    $('.newPrivateDimen').on('click', function(e) {
        e.stopPropagation();
        if (eo.actiontype == '') {
            var str = "";
            str += '<tr class="newDimTr">';
            str += '<td>' + getReportDimTable() + '</td>';
            str += '<td><textarea class="tableinput dimname" type="text" ></textarea></td>';
            str += '<td><textarea class="tableinput dimkey" type="text" ></textarea></td>';
            str += '<td><textarea class="tableinput dimvalue" type="text"></textarea></td>';
            str += '<td><select class="isShow"><option value="1">是</option><option value="0">否</option></select></td>';
            str += '<td><select class="isMust"><option value="0">否</option><option value="1">是</option></select></td>';
            str += '<td><select class="isGroupby"><option value="0">否</option><option value="1">是</option></select></td>';
            str += '<td>' + getFormatSelect() + '</td>';
            str += '<td></td>';
            str += '<td>' + getGroupSelect() + '</td>';
            str += '<td><i class="fa fa-save"></i><i class="fa fa-remove"></i></td>';
            str += '</tr>';
            if ($('.editDimenTable tbody tr').length == 0) {
                $('.editDimenTable tbody').html(str);
            } else {
                $('.editDimenTable tbody tr').eq(0).before(str);
            }
            eo.actiontype = 'new';
            $('.filterSelectContainer').show();
        } else {
            swalinfo('请先完成当前编辑内容');
        }
    })
    //维度保存按钮操作
    $('.editDimenTable').on('click', '.fa-save', function() {
        var p = $(this).parent().parent();
        var datasetId = p.find('select.dimTableSelect option:selected').val();
        var displayName = p.find('textarea.dimname').val();
        var columnName = p.find('textarea.dimkey').val();
        // var datasetColumnId = p.find('textarea.dimkey').val();
        var expression = p.find('textarea.dimvalue').val();
        var isHidden = p.find('select.isShow option:selected').val();
        var isRequired = p.find('select.isMust option:selected').val();
        var isSubqueryGroup = p.find('select.isGroupby option:selected').val();
        var format = p.find('select.dataformatselect option:selected').val();
        var tempr = formatJson();
        format = tempr[format];
        var sequence = 9999;
        var fieldCategoryId = p.find('select.groupselect option:selected').val();
        var reportId = eo.id;
        var type = 1;
        var flag = true;
        if (displayName.replace(/\s+/g, '') == '') {
            flag = false;
            p.find('textarea.dimname').addClass('inputerror');
            setTimeout(function() {
                p.find('textarea.dimname').removeClass('inputerror');
            }, 2000)
        }
        if (columnName.replace(/\s+/g, '') == '') {
            flag = false;
            p.find('textarea.dimkey').addClass('inputerror');
            setTimeout(function() {
                $('textarea.dimkey').removeClass('inputerror');
            }, 2000)
        }
        /*if (expression.replace(/\s+/g, '') == '') {
            flag = false;
            p.find('textarea.dimvalue').addClass('inputerror');
            setTimeout(function() {
                $('textarea.dimvalue').removeClass('inputerror');
            }, 2000)
        }*/
        if (flag) {
            if (eo.actiontype == 'new') {
                var pa = {},
                    q = {};
                q.atype = 'POST';
                pa.datasetId = datasetId;
                pa.columnName = columnName;
                pa.displayName = displayName;
                // pa.datasetColumnId = datasetColumnId ;
                pa.expression = expression;
                pa.isHidden = isHidden;
                pa.isRequired = isRequired;
                pa.isSubqueryGroup = isSubqueryGroup;
                pa.format = format;
                pa.sequence = sequence;
                pa.fieldCategoryId = fieldCategoryId;
                pa.reportId = reportId;
                pa.type = type;
                q.success = function(r) {
                    if (r.status == 1 && r.msg == 'success') {
                        if (!aod.rd.hasOwnProperty(eo.id)) {
                            aod.rd[eo.id] = {};
                        }
                        aod.rd[eo.id][r.id] = {};
                        aod.rd[eo.id][r.id].id = r.id;
                        aod.rd[eo.id][r.id].datasetId = pa.datasetId;
                        aod.rd[eo.id][r.id].columnName = pa.columnName;
                        aod.rd[eo.id][r.id].displayName = pa.displayName;
                        // aod.rd[eo.id][r.id].datasetColumnId = pa.datasetColumnId ;
                        aod.rd[eo.id][r.id].expression = pa.expression;
                        aod.rd[eo.id][r.id].isHidden = pa.isHidden;
                        aod.rd[eo.id][r.id].isRequired = pa.isRequired;
                        aod.rd[eo.id][r.id].isSubqueryGroup = pa.isSubqueryGroup;
                        aod.rd[eo.id][r.id].format = format;
                        aod.rd[eo.id][r.id].sequence = pa.sequence;
                        aod.rd[eo.id][r.id].fieldCategoryId = pa.fieldCategoryId;
                        aod.rd[eo.id][r.id].reportId = pa.reportId;
                        aod.rd[eo.id][r.id].type = pa.type;
                        var ord = '<i class="fa fa-chevron-circle-up"></i><i class="fa fa-chevron-circle-down"></i>';
                        var str = "<tr actionid='" + r.id + "'>";
                        str += "<td>" + aod.datatable[datasetId].tableName + "</td>";
                        str += "<td>" + displayName + "</td>";
                        str += "<td>" + columnName + "</td>";
                        str += "<td>" + expression + "</td>";
                        str += "<td>" + ((isHidden == 0) ? '否' : '是') + "</td>";
                        str += "<td>" + ((isRequired == 0) ? '否' : '是') + "</td>";
                        str += "<td>" + ((isSubqueryGroup == 0) ? '否' : '是') + "</td>";
                        str += "<td>" + getFormatName(format) + "</td>";
                        str += "<td>" + '<i class="fa fa-chevron-circle-up"></i><i class="fa fa-chevron-circle-down"></i>' + "</td>";
                        str += "<td>" + aod.rg[eo.id][pa.fieldCategoryId].categoryName + "</td>";
                        str += '<td><i class="fa fa-pencil"></i><i class="fa fa-remove"></i></td>';
                        str += "</tr>";
                        $('tr.newDimTr').remove();
                        if ($('.editDimenTable tbody tr').length == 0) {
                            $('.editDimenTable tbody').html(str);
                        } else {
                            $('.editDimenTable tbody tr').eq(0).before(str);
                        }
                        showMessage('维度' + columnName, '新增成功');
                        var str2 = '<div class="showkey " actionid="' + r.id + '">' + pa.displayName + '</div>';
                        if ($('.showdimensiontableContainer div.showkey').length == 0) {
                            $('.showdimensiontableContainer').html(str2);
                        } else {
                            $('.showdimensiontableContainer div.showkey').eq(0).before(str2);
                        }
                        eo.actiontype = '';
                        eo.actionid = '';
                    } else {
                        swalinfo(r.msg + '保存指标失败,请联系管理员')
                    }
                }
                $.api('report/saveReportField', pa, q);
            } else if (eo.actiontype == 'edit') {
                var pa = {},
                    q = {};
                q.atype = 'POST';
                pa.id = eo.actionid;
                pa.datasetId = datasetId;
                pa.columnName = columnName;
                pa.displayName = displayName;
                // pa.datasetColumnId = datasetColumnId ;
                pa.expression = expression;
                pa.isHidden = isHidden;
                pa.isRequired = isRequired;
                pa.isSubqueryGroup = isSubqueryGroup;
                pa.format = format;
                pa.sequence = aod.rd[eo.id][eo.actionid].sequence;
                pa.fieldCategoryId = fieldCategoryId;
                pa.reportId = eo.id;
                pa.type = type;
                q.success = function(r) {
                    if (r.status == 1 && r.msg == 'success') {
                        aod.rd[eo.id][eo.actionid].datasetId = pa.datasetId;
                        aod.rd[eo.id][eo.actionid].columnName = pa.columnName;
                        aod.rd[eo.id][eo.actionid].displayName = pa.displayName;
                        aod.rd[eo.id][eo.actionid].expression = pa.expression;
                        aod.rd[eo.id][eo.actionid].isHidden = pa.isHidden;
                        aod.rd[eo.id][eo.actionid].isRequired = pa.isRequired;
                        aod.rd[eo.id][eo.actionid].isSubqueryGroup = pa.isSubqueryGroup;
                        aod.rd[eo.id][eo.actionid].format = pa.format;
                        aod.rd[eo.id][eo.actionid].sequence = pa.sequence;
                        aod.rd[eo.id][eo.actionid].fieldCategoryId = pa.fieldCategoryId;
                        aod.rd[eo.id][eo.actionid].reportId = pa.reportId;
                        aod.rd[eo.id][eo.actionid].type = pa.type;
                        var str = "";
                        str += "<td>" + aod.datatable[pa.datasetId].tableName + "</td>";
                        str += "<td>" + displayName + "</td>";
                        str += "<td>" + columnName + "</td>";
                        str += "<td>" + expression + "</td>";
                        str += "<td>" + ((isHidden == 0) ? '否' : '是') + "</td>";
                        str += "<td>" + ((isRequired == 0) ? '否' : '是') + "</td>";
                        str += "<td>" + ((isSubqueryGroup == 0) ? '否' : '是') + "</td>";
                        str += "<td>" + getFormatName(format) + "</td>";
                        str += "<td>" + '<i class="fa fa-chevron-circle-up"></i><i class="fa fa-chevron-circle-down"></i>' + "</td>";
                        str += "<td>" + aod.rg[eo.id][pa.fieldCategoryId].categoryName + "</td>";
                        str += '<td><i class="fa fa-pencil"></i><i class="fa fa-remove"></i></td>';
                        $('table.editDimenTable tr[actionid="' + eo.actionid + '"]').html(str);
                        $('.showdimensiontableContainer div.showkey[actionid="' + eo.actionid + '"]').eq(0).html(pa.displayName + "(" + pa.columnName + ")");
                        showMessage('维度' + displayName, '更新成功');
                        eo.actiontype = '';
                        eo.actionid = '';
                    } else {
                        swalinfo(r.msg + '修改维度失败,请联系管理员')
                    }
                }
                $.api('report/updateReportField', pa, q);
            }
        }
    })
    //维度取消保存或者删除
    $('.editDimenTable').on('click', '.fa-remove', function() {
        if (eo.actiontype == 'new') {
            $('tr.newDimTr').remove();
            eo.actiontype = '';
        } else if (eo.actiontype == 'edit') {
            var d = aod.rd[eo.id][eo.actionid];
            var str = '';
            str += "<td>" + aod.datatable[d.datasetId].tableName + "</td>";
            str += "<td>" + d.displayName + "</td>";
            str += "<td>" + d.columnName + "</td>";
            str += "<td>" + d.expression + "</td>";
            str += "<td>" + ((d.isHidden == 0) ? '否' : '是') + "</td>";
            str += "<td>" + ((d.isRequired == 0) ? '否' : '是') + "</td>";
            str += "<td>" + ((d.isSubqueryGroup == 0) ? '否' : '是') + "</td>";
            str += "<td>" + d.format + "</td>";
            str += "<td>" + '<i class="fa fa-chevron-circle-up"></i><i class="fa fa-chevron-circle-down"></i>' + "</td>";
            str += "<td>" + aod.rg[eo.id][d.fieldCategoryId].categoryName + "</td>";
            str += '<td><i class="fa fa-pencil"></i><i class="fa fa-remove"></i></td>';
            $('table.editDimenTable tr[actionid="' + eo.actionid + '"]').html(str);
            eo.actiontype = '';
            eo.actionid = '';
        } else if (eo.actiontype == '') {
            var p = $(this).parent().parent();
            var did = p.attr('actionid') * 1;
            var duname = p.find('td').eq(1).html();
            eo.actiontype = 'delete';
            eo.actionid = did;
            swal({
                title: "确定删除维度",
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
                    var url = 'report/deleteReportField';
                    var pa = {},
                        q = {};
                    pa.reportFieldId = did;
                    q.success = function(r) {
                        if (r.status == 1 && r.msg == 'success') {
                            swal.close();
                            $('table.editDimenTable tr[actionid="' + did + '"]').remove();
                            $('div.showeditDimenTableContainer div.showkey[actionid="' + did + '"]').remove();
                            delete aod.rd[eo.id][did];
                            eo.actionid = '';
                            eo.actiontype = '';
                            showMessage('维度' + duname, '删除成功');
                        } else {
                            swalinfo(r.msg + '删除维度报错,请联系管理员');
                        }
                    }
                    $.api(url, pa, q);
                } else {
                    eo.actiontype = '';
                    eo.actionid = '';
                    swal.close();
                }
            });
        }
    })
    //维度编辑
    $('.editDimenTable').on('click', '.fa-pencil', function() {
        if (eo.actiontype != '') {
            showMessage('请先完成当前编辑内容', '');
        } else {
            var p = $(this).parent().parent();
            eo.actiontype = 'edit';
            eo.actionid = p.attr('actionid') * 1;
            var d = aod.rd[eo.id][eo.actionid];
            var str = '';
            str += '<td>' + getReportDimTable(d.datasetId) + '</td>';
            str += '<td><textarea class="tableinput dimname" type="text" >' + d.displayName + '</textarea></td>';
            str += '<td><textarea class="tableinput dimkey" type="text" >' + d.columnName + '</textarea></td>';
            str += '<td><textarea class="tableinput dimvalue" type="text">' + d.expression + '</textarea></td>';
            var str2 = '<select class="isShow"><option value="0">否</option><option value="1">是</option></select>';
            str2 = str2.replace(d.isHidden + '"', d.isHidden + '" selected');
            str += '<td>' + str2 + '</td>';
            str2 = '<select class="isMust"><option value="0">否</option><option value="1">是</option></select>';
            str2 = str2.replace(d.isRequired + '"', d.isRequired + '" selected');
            str += '<td>' + str2 + '</td>';
            str2 = '<select class="isGroupby"><option value="0">否</option><option value="1">是</option></select>';
            str2 = str2.replace(d.isSubqueryGroup + '"', d.isSubqueryGroup + '" selected');
            str += '<td>' + str2 + '</td>';
            str += '<td>' + getFormatSelect({
                se: d.format
            }) + '</td>';
            str += '<td></td>';
            str += '<td>' + getGroupSelect(d.fieldCategoryId) + '</td>';
            str += '<td><i class="fa fa-save"></i><i class="fa fa-remove"></i></td>';
            $('.editDimenTable tr[actionid="' + eo.actionid + '"]').html(str);
        }
    })
}

function getReportTable(id) {
    var str = "<select class='filterJoinTable'>";
    var d = aod.rt[eo.id];
    for (var i in d) {
        var flag = '';
        if (id == d[i].datasetId) {
            flag = ' selected ';
        }
        str += "<option value='" + d[i].datasetId + "' " + flag + ">" + d[i].datasetName + "</option>";
    }
    str += "</select>";
    return str;
}

function getReportDimTable(id) {
    var str = "<select class='dimTableSelect'>";
    var d = aod.rt[eo.id];
    for (var i in d) {
        var flag = '';
        if (id == d[i].datasetId) {
            flag = ' selected ';
        }
        str += "<option value='" + d[i].datasetId + "' " + flag + ">" + d[i].datasetName + "</option>";
    }
    str += "</select>";
    return str;
}

function getFilterUl(id, keyword) {
    var str = "";
    var td = [];
    for (var i in aod.rf[eo.id]) {
        td.push(aod.rf[eo.id][i].filterId * 1);
    }
    for (var i in aod.filterList) {
        var flag = '';
        if ($.inArray(i * 1, td) == -1) {
            if (keyword != null && keyword != '') {
                if (aod.filterList[i].name.indexOf(keyword) > -1) {
                    str += "<li actionid='" + i + "' class='" + flag + "'> " + aod.filterList[i].name + "</li>";
                }
            } else {
                str += "<li actionid='" + i + "' class='" + flag + "'> " + aod.filterList[i].name + "</li>";
            }
        }
    }
    return str;
}
//获取分组
function getGroupSelect(vid) {
    var a = [];
    var id = eo.id;
    for (var i in aod.rg[id]) {
        var o = {};
        o.id = aod.rg[id][i].categoryId;
        o.name = aod.rg[id][i].categoryName;
        a.push(o);
    }
    var str = "<select class='groupselect'>";
    a.map(function(i, v) {
        if (vid != null) {
            var flag = '';
            if (vid == i.categoryId) {
                flag = 'selected';
            }
            str += '<option value="' + i.id + '" ' + flag + '>' + i.name + '</option>'
        } else {
            str += '<option value="' + i.id + '">' + i.name + '</option>'
        }
    })
    str += "</select>";
    return str;
}
//获取数据格式
/*function getDataFormat() {
    var a = ['百分比', '1位小数', '2位小数', '整数', '4位小数'];
    var str = "<select class='dataformatselect'>";
    a.map(function(i, v) {
        str += '<option value="' + i + '">' + i + '</option>'
    })
    str += "</select>";
    return str;
}*/
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
            aod.treedata[r.id] = {};
            aod.treedata[r.id].categoryId = r.id;
            aod.treedata[r.id].categoryName = foldername;
            aod.treedata[r.id].parentId = pfid;
            refreshfoldmap();
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
/*
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
*/
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
    str += '<li folderid="' + id + '" actionid="' + id + '" class="subNavUli" keyname="' + name + '" level="' + level + '">';
    str += '<div class="Center-Container is-Table">';
    str += '<div class="Table-Cell">';
    str += '<i class="folder fa fa-folder">';
    str += '</i>';
    str += '<span class="foldName" style="width: ' + width + 'px;">';
    str += name;
    str += '</span>';
    str += '<span class="rmnlioperate">';
    str += '<i class="fa fa-pencil" level="' + (level * 1) + '" folderId="' + id + '">';
    str += '</i>';
    str += '<i class="fa fa-plus" level="' + (level * 1) + '" folderId="' + id + '">';
    str += '</i>';
    str += '<i class="fa fa-remove" level="' + (level * 1) + '" folderId="' + id + '">';
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

function fullFolderPathReport() {
    var ul = $('.rootNavUl');
    str = refreshFolderList(ul, "");
    $('.pathUl').html(str);
}

function refreshFolderList(ul, str) {
    var str1 = "";
    ul.find('>li').each(function() {
        if ($(this).find('>ul').length > 0) {
            var foldername = $(this).find('span.foldName').eq(0).text().replace(/[\r\n\ ]/g, '');
            var ul1 = $(this).find('>ul').eq(0);
            str += '<li folderId=' + $(this).attr('folderId') + '><span class="selectpathnamespan"><i class="folder fa fa-folder"></i><span class="selectfoldername">' + foldername + '</span></span>';
            str += "<ul class='subpathUl'>";
            str = refreshFolderList(ul1, str);
            str += "</ul></li>";
            // console.log(str);
            return str;
        } else {
            var foldername = $(this).find('span.foldName').eq(0).text().replace(/[\r\n\ ]/g, '');
            str1 += '<li folderId=' + $(this).attr('folderId') + '><span class="selectpathnamespan"><i class="folder fa fa-folder"></i><span class="selectfoldername">' + foldername + '</span></span></li>';
        }
    })
    str += str1;
    return str;
}

function saveUpdateFolder(foldname, width, p, level, folderid) {
    var pa = {},
        q = {};
    pa.categoryId = folderid;
    pa.categoryName = foldname;
    pa.parentId = aod.treedata[folderid].parentId;
    q.atype = 'POST';
    q.success = function(r) {
        if (r.status == 1 && r.msg == 'success') {
            var span = "<span class='foldName' style='width:" + width + "'>" + foldname + "</span>";
            $('input.updateFolder').remove();
            p.find('i.folder').eq(0).after(span);
            p.find('i.fa-save').eq(0).remove();
            var i = "<i class='fa fa-pencil' level='" + level + "' folderid='" + folderid + "'></i><i class='fa fa-plus' level='" + level + "' folderid='" + folderid + "'></i>";
            p.find('i.fa-remove').eq(0).before(i);
            window.updatefoldwidth = null;
            window.updatefoldname = null;
            window.updatelevel = null;
            aod.treedata[folderid].categoryId = pa.categoryId;
            aod.treedata[folderid].categoryName = pa.foldname;
            aod.treedata[folderid].parentId = pa.parentId;
            showMessage(foldname, '更新成功');
        } else {
            swal({
                title: r.msg,
                type: 'error'
            })
        }
    }
    $.api('report/updateReportCategory', pa, q);
}

function getPath(id) {
    if (!aod.treedata.hasOwnProperty(id) && id != 0) {
        return '无此目录'
    } else {
        var a = [];
        if (id == 0) {
            a.push('根目录')
        } else {
            for (var i = 0; i < 100; i++) {
                a.push(aod.treedata[id].categoryName);
                if (aod.treedata[id].parentId == 0) {
                    a.push('根目录');
                    break;
                } else {
                    id = aod.treedata[id].parentId;
                }
            }
        }
        if (a.length == 0) {
            swal({
                title: id + '目录没找到',
                type: 'error',
            })
        } else {
            a.reverse();
            return a.join('>')
        }
    }
}

function initDB() {
    var q = {};
    q.next = initFolder;
    getDBb(q);
}
//初始化文件夹
function initFolder() {
    var p = {},
        q = {};
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
            for (var i in o) {
                o[i].sort();
                o[i].reverse();
            }
            aod.treedata = to;
            if (o[0] != null) {
                $('.subNavUl').html(loopTree(o, o[0], 1, "", to));
            }
            refreshfoldmap();
            getReportList();
        } else {
            refreshfoldmap();
            getReportList();
        }
    }
    $.api('report/getReportCategoryList', p, q);
}
//刷新目录列表
function refreshfoldmap() {
    aod.foldmap = {};
    var qo = {};
    $('.rootNavUl li').each(function() {
        var id = $(this).attr('folderid');
        if (!qo.hasOwnProperty(id)) {
            qo[id] = [];
        }
        qo[id].push(id * 1);
        $(this).find('li').each(function() {
            qo[id].push($(this).attr('folderid') * 1)
        })
    })
    aod.foldmap = qo;
}
//获取报表列表
function getReportList(id) {
    if (id != null && id != '') {
        var idd = aod.foldmap[id];
        var df = new DateFormat();
        var tempa = [];
        for (var i in aod.reportList) {
            if (id == 0) {
                var str = "";
                var d = aod.reportList[i];
                str += '<tr actionid="' + d.id + '">';
                str += '<td>' + d.name + '</td>';
                str += '<td>' + getPath(d.categoryId) + '</td>';
                str += '<td></td>';
                str += '<td>' + d.createUser + '</td>';
                str += '<td>' + df.convertimestamp(d.createTime, 'yyyy-mm-dd') + '</td>';
                str += '<td>' + df.convertimestamp(d.updateTime, 'yyyy-mm-dd') + '</td>';
                str += '<td><i class="fa fa-edit" actionid ="' + d.id + '"></i>';
                str += '<i class="fa fa-remove" actionid ="' + d.id + '"></i></td>';
                str += '</tr>';
                tempa.push(str);
            } else if ($.inArray(aod.reportList[i].categoryId, idd) > -1) {
                var str = "";
                var d = aod.reportList[i];
                str += '<tr actionid="' + d.id + '">';
                str += '<td>' + d.name + '</td>';
                str += '<td>' + getPath(d.categoryId) + '</td>';
                str += '<td></td>';
                str += '<td>' + d.createUser + '</td>';
                str += '<td>' + df.convertimestamp(d.createTime, 'yyyy-mm-dd') + '</td>';
                str += '<td>' + df.convertimestamp(d.updateTime, 'yyyy-mm-dd') + '</td>';
                str += '<td><i class="fa fa-edit" actionid ="' + d.id + '"></i>';
                str += '<i class="fa fa-remove" actionid ="' + d.id + '"></i></td>';
                str += '</tr>';
                tempa.push(str);
            }
        }
        tempa.reverse();
        if (tempa.length == 0) {
            tempa.push('<tr><td class="notddata" colspan="7">暂无报表,请点左上角新增报表</td></tr>');
        }
        $('.reportList tbody').html(tempa.join(''));
    } else {
        var p = {},
            q = {};
        q.success = function(r) {
            aod.reportList = {};
            var df = new DateFormat();
            var tempa = [];
            if (r.length > 0) {
                for (var i = 0; i < r.length; i++) {
                    var str = "";
                    aod.reportList[r[i].id] = r[i];
                    str += '<tr actionid="' + r[i].id + '">';
                    str += '<td>' + r[i].name + '</td>';
                    str += '<td>' + getPath(r[i].categoryId) + '</td>';
                    str += '<td>' + ((r[i].isFieldSelect == 1) ? '是' : '否') + '</td>';
                    str += '<td>' + r[i].createUser + '</td>';
                    str += '<td>' + df.convertimestamp(r[i].createTime, 'yyyy-mm-dd') + '</td>';
                    str += '<td>' + df.convertimestamp(r[i].updateTime, 'yyyy-mm-dd') + '</td>';
                    str += '<td><i class="fa fa-edit" actionid ="' + r[i].id + '"></i>';
                    str += '<i class="fa fa-remove" actionid ="' + r[i].id + '"></i></td>';
                    str += '</tr>';
                    tempa.push(str);
                }
                //tempa.reverse();
                if (tempa.length == 0) {
                    tempa.push('<tr><td class="notddata" colspan="7">暂无报表,请点左上角新增报表</td></tr>');
                }
                $('.reportList tbody').html(tempa.join(''));
            }
        }
        $.api('report/getReportList', p, q);
    }
}
//循环生成数
function loopTree(o, a, level, str, td) {
    for (var i = 0; i < a.length; i++) {
        if (o[a[i]] != null) {
            var width = 190 - (level * 1) * 15 - 44 - 24 - 10;
            str += '<li folderid="' + a[i] + '" actionid="' + a[i] + '" class="subNavUli" keyname="' + td[a[i]].categoryName + '" level="' + (level * 1) + '">';
            str += '<div class="Center-Container is-Table">';
            str += '<div class="Table-Cell">';
            str += '<i class="folder fa fa-folder">';
            str += '</i>';
            str += '<span class="foldName" style="width: ' + width + 'px;">';
            str += td[a[i]].categoryName;
            str += '</span>';
            str += '<span class="rmnlioperate">';
            str += '<i class="fa fa-pencil" level="' + (level * 1) + '" folderId="' + a[i] + '">';
            str += '</i>';
            str += '<i class="fa fa-plus" level="' + (level * 1) + '" folderId="' + a[i] + '">';
            str += '</i>';
            str += '<i class="fa fa-remove" level="' + (level * 1) + '" folderId="' + a[i] + '">';
            str += '</i>';
            str += '</span>';
            str += '</div>';
            str += '</div>';
            str += '<ul class="subNavUl" level="' + (level * 1 + 1) + '">';
            str += loopTree(o, o[a[i]], (level * 1 + 1), "", td);
            str += '</ul></li>';
        } else {
            var width = 190 - (level * 1) * 15 - 44 - 24 - 10;
            str += '<li folderid="' + a[i] + '" actionid="' + a[i] + '" class="subNavUli" keyname="' + td[a[i]].categoryName + '" level="' + (level * 1) + '">';
            str += '<div class="Center-Container is-Table">';
            str += '<div class="Table-Cell">';
            str += '<i class="folder fa fa-folder">';
            str += '</i>';
            str += '<span class="foldName" style="width: ' + width + 'px;">';
            str += td[a[i]].categoryName;
            str += '</span>';
            str += '<span class="rmnlioperate">';
            str += '<i class="fa fa-pencil" level="' + (level * 1) + '" folderId="' + a[i] + '">';
            str += '</i>';
            str += '<i class="fa fa-plus" level="' + (level * 1) + '" folderId="' + a[i] + '">';
            str += '</i>';
            str += '<i class="fa fa-remove" level="' + (level * 1) + '" folderId="' + a[i] + '">';
            str += '</i>';
            str += '</span>';
            str += '</div>';
            str += '</div>';
            str += '</li>';
        }
    }
    return str;
}

function updateReportBasic(co) {
    var p = {},
        q = {};
    p.id = eo.id;
    p.comment = '';
    p.categoryId = eo.folderid;
    if (co == 'path') {
        p.categoryId = eo.nextfolderid;
    }
    p.datasourceId = 1;
    var t = $('input[name="isSelected"]').get(0).checked;
    p.isFieldSelect = (t == true) ? 1 : 0;
    var isFieldSelecttext = (t == true) ? '' : '不';
    var isFieldSelecttext2 = (t == true) ? '是' : '否';
    p.name = $('input.reportNameInput').val();
    q.atype = 'POST';
    q.success = function(r) {
        if (r.status == 1 && r.msg == 'success') {
            aod.reportList[p.id].name = p.name;
            aod.reportList[p.id].categoryId = p.categoryId * 1;
            aod.reportList[p.id].datasourceId = p.datasourceId * 1;
            aod.reportList[p.id].isFieldSelect = p.isFieldSelect * 1;
            // showMessage(p.name,'修改成功');
            if (co == 'name') {
                var vp = $('.titleNameContainer');
                vp.find('.fa-pencil').show();
                vp.find('.fa-save').hide();
                vp.find('.fa-remove').hide();
                vp.find('input.reportNameInput').attr('disabled', 'disabled');
                showMessage(vp.find('input.reportNameInput').val(), '修改成功');
                $('.reportList tr[actionid="' + p.id + '"]').find('td').eq(0).text(p.name);
                window.updatereportname = null;
            } else if (co == 'isFieldSelect') {
                $('.reportList tr[actionid="' + p.id + '"]').find('td').eq(2).text(isFieldSelecttext2);
                aod.reportList[eo.id].isFieldSelect = p.isFieldSelect;
                showMessage(isFieldSelecttext, '展示指标可选');
            } else if (co == 'path') {
                //$('.pathShowContainer').attr('folderid', p.categoryId);
                eo.folderid = eo.nextfolderid;
                delete eo.nextfolderid;
                $('.pathShowContainer').text(getPath(eo.folderid));
                $('.pathUlContianer').hide();
                var selectfolder = $('li.subNavUliActive').attr('folderid');
                if ($.inArray(p.categoryId, aod.foldmap[selectfolder]) > -1) {
                    $('.reportList tr[actionid="' + p.id + '"]').find('td').eq(1).text(getPath(p.categoryId));
                } else {
                    $('.reportList tr[actionid="' + p.id + '"]').remove();
                }
                getReportList($('.subNavUliActive').attr('folderid'));
                aod.reportList[eo.id].categoryId = eo.folderid;
                $('.reportList tr[actionid="' + p.id + '"]').find('td').eq(1).text(getPath(p.categoryId));
                showMessage('路径变更为', getPath(p.categoryId));
            }
        } else {
            swal({
                title: r.msg + '更新报表属性失败啊啊啊啊啊',
                type: 'error',
            })
        }
    }
    $.api('report/update', p, q);
}
//编辑报表
function editReport(id) {
    initEo();
    var d = aod.reportList[id];
    eo.id = id;
    eo.style = 'edit';
    eo.folderid = d.categoryId;
    //获取数据源
    getTablesById(id);
    //获取分组
    showGroupById(id);
    //刷新报表对应的数据集列表
    refreshAllTable(id);
    refreshAllFilter(id);
    $('input.reportNameInput').val(d.name);
    $('.titleNameContainer .fa-pencil').show();
    $('.titleNameContainer .fa-save').hide();
    $('.titleNameContainer .fa-remove').hide();
    $('.pathShowContainer').text(getPath(d.categoryId));
    $('.pathContainer').show();
    $('.leftContianer').show();
    var issel = '';
    if (d.isFieldSelect * 1 == 1) {
        issel = 'checked';
    }
    $('.showIsSelectContainer').html('<span>是否可选</span><input type="checkbox" ' + issel + ' name="isSelected">');
    $('.showIsSelectContainer').show();
    $ec.show();
}
//刷新报表对应的筛选
function refreshAllFilter(id) {
    if (aod.rf[id] == null) {
        var url = 'report/getReportFilterRelationList';
        var p = {};
        var q = {};
        p.reportId = id;
        q.success = function(r) {
            if (r == null || r.length == 0) {
                console.log('还没有添加筛选');
            } else {
                aod.rf[id] = {};
                for (var i = 0; i < r.length; i++) {
                    aod.rf[id][r[i].id] = r[i];
                }
            }
            showFilter(id);
        }
        $.api(url, p, q)
    } else {
        showFilter(id);
    }
}
//刷新报表对应的度量列表
function refreshAllKey(id, mustrefresh) {
    var flag = false;
    if (aod.rk[id] == null) {
        flag = true;
    }
    if (mustrefresh) {
        flag = mustrefresh;
    }
    if (flag) {
        var url = 'report/getReportFieldList';
        var p = {};
        var q = {};
        p.reportId = id;
        q.success = function(r) {
            if (r == null || r.length == 0) {
                console.log('还没有添加指标');
            } else {
                aod.rk[id] = {};
                aod.rd[id] = {};
                for (var i = 0; i < r.length; i++) {
                    if (r[i].type == 1) {
                        aod.rd[id][r[i].id] = r[i];
                    } else if (r[i].type == 2) {
                        aod.rk[id][r[i].id] = r[i];
                    }
                }
            }
            fullkey(id);
        }
        $.api(url, p, q)
    } else {
        fullkey(id);
    }
}
//填充指标列表
function fullkey(id) {
    showDim(id);
    showDuliang(id);
}
//获取所有已添加的表
function getAllTables() {
    var url = 'dataset/getDatasetList';
    var p = {};
    var q = {};
    q.success = function(r) {
        if (r == null || r.length == 0) {
            swalinfo('请先添加数据表');
        } else {
            for (var i = 0; i < r.length; i++) {
                aod.datatable[r[i].id] = r[i];
                aod.datatable[r[i].id].showname = r[i].dbName + '.' + r[i].tableName;
                if (r[i].type == 1) {
                    aod.pubdimtable[r[i].id] = r[i];
                    aod.pubdimtable[r[i].id].showname = r[i].dbName + '.' + r[i].tableName;
                }
            }
        }
    }
    $.api(url, p, q);
}
//获取报表已添加的表
function getTablesById(reportid, needrefresh) {
    var flag = false;
    if (!aod.rt.hasOwnProperty(reportid)) {
        flag = true;
    }
    if (aod.rt.hasOwnProperty(reportid)) {
        flag = false;
    }
    if (needrefresh) {
        flag = true;
    }
    flag = true;
    if (flag) {
        var url = 'report/getReportDatasetList';
        var p = {};
        var q = {};
        p.reportId = reportid;
        q.success = function(r) {
            aod.rt[reportid] = {};
            var tempa = [];
            var tempb = [];
            for (var i = 0; i < r.length; i++) {
                var str = "";
                var str2 = "";
                aod.rt[reportid][r[i].id] = r[i];
                str += "<tr actionid ='" + r[i].id + "'>";
                str += "<td>" + aod.datatable[r[i].datasetId].showname + "</td>";
                str += "<td>" + r[i].alias + "</td>";
                str += "<td>" + r[i].relation + "</td>";
                str += "<td><i class='fa fa-edit' actionid='" + r[i].id + "'>" + "</i><i class='fa fa-remove' actionid='" + r[i].id + "'></i></td>";
                str += "</tr>";
                tempa.push(str);
                str2 += "<div class=' showkey reportdataset' actionid='" + r[i].id + "'>" + aod.datatable[r[i].datasetId].showname + '(<span class="aliasname">' + r[i].alias + '</span>)' + "</div>"
                tempb.push(str2);
            }
            tempa.reverse();
            tempb.reverse();
            $('.joinTable tbody').html(tempa.join(''));
            $('.showdatatableContainer').html(tempb.join(''));
        }
        $.api(url, p, q);
    } else {}
}
//获取报表的数据集
function refreshAllTable(id) {
    $('.allTableUl li').remove();
    var tempa = [];
    for (var i in aod.rt[id]) {
        tempa.push(aod.rt[id][i].datasetId);
    }
    var str = "";
    for (var i in aod.datatable) {
        var flag = "";
        if ($.inArray(aod.datatable[i].id, tempa) > -1) {
            flag = "hasSelectTable";
        }
        str += "<li actionid='" + i + "' class='" + flag + "'>";
        str += aod.datatable[i].showname;
        str += "</li>";
    }
    $('.allTableUl').html(str);
}

function initAod() {
    aod = {};
    aod.treedata = {}; //目录结构
    aod.foldmap = {}; //目录对应子文件夹内容
    aod.reportList = {}; //所有报表 
    aod.filterList = {}; //所有筛选
    aod.datatable = {}; //存放系统配置的所有表
    aod.pubdimtable = {}; //存放系统配置的所有维度表
    aod.pubdim = {}; //存放系统配置的所有维度表的公共维度
    aod.rt = {}; //存放报表对应数据源的内容
    aod.rg = {}; //存放报表维度指标所在组的内容
    aod.rgs = {}; //排序后 --  存放报表维度指标所在组的内容
    aod.rd = {}; //存放报表对应维度的内容
    aod.rds = {}; //排序后 --  存放报表对应维度的内容
    aod.rk = {}; //存放报表对应指标的内容
    aod.rks = {}; //排序后 --  存放报表对应指标的内容
    aod.rf = {}; //存放报表对应筛选的内容
    aod.rfs = {}; //排序后 --  存放报表对应筛选的内容
}

function initEo() {
    eo = {}; // 存放编辑时候的所有状态
    eo.folderid = ""; //存放当前所在目录
    eo.style = ''; // 当前编辑报表的状态  'new / edit'
    eo.id = ''; // 当前编辑报表的id
    eo.action = ''; // 当前对报表的操作 'datatable,group,dimension,key,filter'
    eo.actionid = ''; //当前对报表操作的id
    eo.actiontype = ''; //当前对报表操作的类型 'new / edit / delete'  
}
//根据ID获取报表的分组信息
function showGroupById(id) {
    var p = {},
        q = {};
    p.reportId = id;
    q.success = function(r) {
        aod.rg[id] = {};
        for (var i = 0; i < r.length; i++) {
            aod.rg[id][r[i].categoryId] = r[i];
        }
        showGroup();
        //刷新报表对应的度量列表
        refreshAllKey(id);
        refreshAllFilter(id);
    }
    $.api('report/getReportFieldCategoryList', p, q)
}
//清空所有
function emptyEditAll() {
    initEo();
    $('input.reportNameInput').val('');
    $('input.reportNameInput').attr('disabled', 'disabled');
    $('.leftContianer').hide();
    $('.pathContainer').hide();
    $('.showIsSelectContainer').hide();
    $('input.reportNameInput').val('');
    $('.pathShowContainer').removeAttr('folderid');
    $('.pathShowContainer').html('');
    $('.showIsSelectContainer').html('<span>是否可选</span><input type="checkbox" name="isSelected">');
    $('.showkeycontainer div').remove();
    $('.editItemContainer').hide();
    $('.editItemContainer tbody tr').remove();
}

function getAllFilters() {
    var p = {},
        q = {};
    p.isPrivate = 1;
    q.success = function(r) {
        if (r.length > 0) {
            for (var i = 0; i < r.length; i++) {
                aod.filterList[r[i].id] = r[i];
            }
        }
    }
    $.api('filter/getFilterList', p, q);
}

function getAllPubDim() {
    var p = {},
        q = {};
    p.isPrivate = 1;
    q.success = function(r) {
        if (r.length > 0) {
            for (var i = 0; i < r.length; i++) {
                aod.filterList[r[i].id] = r[i];
            }
        }
    }
    $.api('filter/getFilterList', p, q);
}

function fullPubSelect() {
    var str = "";
    var d = aod.rt[eo.id];
    var t = [];
    for (var i in d) {
        if (aod.pubdimtable.hasOwnProperty(d[i].datasetId)) {
            t.push(aod.pubdimtable[d[i].datasetId]);
        }
    }
    for (var i = 0; i < t.length; i++) {
        str += "<option value='" + t[i].id + "'>" + t[i].datasetName + "</option>"
    }
    $('ul.pubDimUl li').remove();
    $('.pubDimSelect').html(str);
}

function getPubDimByTable() {
    var p = {},
        q = {};
    p.datasetId = $('.pubDimSelect option:selected').val();
    if (p.datasetId == null) {
        swalinfo('暂时没有公共维度哦,请添加公共维表');
    } else {
        q.success = function(r) {
            aod.pubdim[p.datasetId] = {};
            var str = "";
            var ted = [];
            for (var i in aod.rd[eo.id]) {
                if (aod.rd[eo.id][i].datasetColumnId != null) {
                    ted.push(aod.rd[eo.id][i].datasetColumnId * 1);
                }
            }
            if (r.length > 0) {
                for (var i = 0; i < r.length; i++) {
                    var flag = "";
                    if ($.inArray(r[i].id, ted) > -1) {
                        flag = 'pubSelected';
                    }
                    aod.pubdim[p.datasetId][r[i].id] = r[i];
                    str += "<li class='" + flag + "' actionid='" + r[i].id + "'>" + r[i].displayName + '(' + r[i].columnName + ')';
                    str += "</li>";
                }
                $('ul.pubDimUl').html(str);
            } else {
                swalinfo('该维表下没有公共维度');
                $('ul.pubDimUl li').remove();
            }
        }
        $.api('dataset/getDimColumnList', p, q);
    }
}

function compare(property) {
    return function(a, b) {
        var value1 = a[property];
        var value2 = b[property];
        return value1 - value2;
    }
}

function showGroup() {
    aod.rgs[eo.id] = [];
    for (var i in aod.rg[eo.id]) {
        aod.rgs[eo.id].push(aod.rg[eo.id][i]);
    }
    aod.rgs[eo.id].sort(compare('sequence'));
    aod.rgs[eo.id].reverse();
    var d = aod.rgs[eo.id];
    var str = "";
    for (var i = 0; i < d.length; i++) {
        str += "<tr actionid='" + d[i].categoryId + "'>";
        str += '<td>' + d[i].categoryName + '</td>';
        str += '<td type="' + d[i].showStyle + '">' + ((d[i].showStyle == 'select') ? '单选' : '复选') + '</td>';
        str += '<td><i class="fa fa-chevron-circle-up"></i><i class="fa fa-chevron-circle-down"></i></td>';
        str += '<td><i class="fa fa-pencil"></i><i class="fa fa-remove"></i></td></tr>';
    }
    $('.GroupTable tbody').html(str);
}

function showFilter(id) {
    aod.rfs[id] = [];
    for (var i in aod.rf[eo.id]) {
        aod.rfs[eo.id].push(aod.rf[eo.id][i]);
    }
    aod.rfs[eo.id].sort(compare('sequence'));
    aod.rfs[eo.id].reverse();
    var d = aod.rfs[eo.id];
    var str = '',
        str2 = '';
    for (var i = 0; i < d.length; i++) {
        str += "<tr actionid='" + d[i].id + "'>";
        str += "<td>" + d[i].filterName + "</td>";
        str += "<td>" + d[i].showName + "</td>";
        str += "<td>" + ((d[i].isShow == 0) ? '否' : '是') + "</td>";
        str += "<td>" + aod.datatable[d[i].joinDatasetId].datasetName + "</td>";
        str += "<td>" + d[i].joinColumn + "</td>";
        str += "<td>" + ((d[i].isAuth == 0) ? '否' : '是') + "</td>";
        str += '<td><i class="fa fa-chevron-circle-up"></i><i class="fa fa-chevron-circle-down"></i></td>';
        str += '<td><i class="fa fa-pencil"></i><i class="fa fa-remove"></i></td>';
        str += "</tr>";
        str += "</tr>";
        str2 += "<div class='showkey ' actionid='" + d[i].id + "'>" + d[i].showName + '(' + d[i].filterName + ')' + "</div>";
    }
    $('.FilterTable tbody').html(str);
    $('.showfiltertableContainer').html(str2);
}

function showDim(id) {
    aod.rds[id] = [];
    for (var i in aod.rd[eo.id]) {
        aod.rds[eo.id].push(aod.rd[eo.id][i]);
    }
    aod.rds[eo.id].sort(compare('sequence'));
    aod.rds[eo.id].reverse();
    var td = aod.rds[eo.id];
    var str = '',
        str2 = '';
    for (var i = 0; i < td.length; i++) {
        var d = td[i];
        str += "<tr actionid='" + d.id + "'>";
        str += "<td>" + aod.datatable[d.datasetId].tableName + "</td>";
        str += "<td>" + d.displayName + "</td>";
        str += "<td>" + d.columnName + "</td>";
        str += "<td>" + d.expression + "</td>";
        str += "<td>" + ((d.isHidden == 0) ? '否' : '是') + "</td>";
        str += "<td>" + ((d.isRequired == 0) ? '否' : '是') + "</td>";
        str += "<td>" + ((d.isSubqueryGroup == 0) ? '否' : '是') + "</td>";
        str += "<td>" + getFormatName(d.format) + "</td>";
        str += "<td>" + '<i class="fa fa-chevron-circle-up"></i><i class="fa fa-chevron-circle-down"></i>' + "</td>";
        str += "<td>" + aod.rg[id][d.fieldCategoryId].categoryName + "</td>";
        str += '<td><i class="fa fa-pencil"></i><i class="fa fa-remove"></i></td>';
        str += "</tr>";
        str2 += "<div class='showkey ' actionid='" + d.id + "'>" + d.displayName + '(' + d.columnName + ')' + "</div>"
    }
    $('.editDimenTable tbody').html(str);
    $('.showdimensiontableContainer').html(str2);
}

function showDuliang(id) {
    aod.rks[id] = [];
    for (var i in aod.rk[eo.id]) {
        aod.rks[eo.id].push(aod.rk[eo.id][i]);
    }
    aod.rks[eo.id].sort(compare('sequence'));
    aod.rks[eo.id].reverse();
    var td = aod.rks[eo.id];
    var str = '',
        str2 = '';
    for (var i = 0; i < td.length; i++) {
        var d = td[i];
        str += "<tr actionid='" + d.id + "'>";
        str += "<td orderid='" + (td.length - i) + "'>" + (td.length - i) + "</td>";
        str += "<td>" + d.displayName + "</td>";
        str += "<td>" + d.columnName + "</td>";
        str += "<td>" + d.aggregateFunction + "</td>";
        str += "<td>" + d.comment + "</td>";
        str += '<td><i class="fa fa-chevron-circle-up"></i><i class="fa fa-chevron-circle-down"></i></td>';
        str += "<td>" + aod.rg[id][d.fieldCategoryId].categoryName + "</td>";
        str += "<td>" + getFormatName(d.format) + "</td>";
        str += '<td><i class="fa fa-pencil"></i><i class="fa fa-remove"></i></td>';
        str += "</tr>";
        str2 += "<div class='showkey ' actionid='" + d.id + "'>" + d.displayName + '(' + d.columnName + ')' + "</div>"
    }
    $('.DuliangTable tbody').html(str);
    $('.showfacttableContainer').html(str2);
}

function getFormatSelect(p) {
    if (p == null) {
        var p = {};
        p.classname = 'dataformatselect';
    }
    if (p.classname == null) {
        p.classname = 'dataformatselect';
    }
    var str = '<select class="' + p.classname + '">' + '<option value="文本">文本</option>' + '<option value="日期">日期</option>' + '<option value="百分比一位">百分比一位</option>' + '<option value="百分比两位">百分比两位</option>' + '<option value="整数">整数</option>' + '<option value="1位小数">1位小数</option>' + '<option value="2位小数">2位小数</option>' + '</select>';
    if (p.se != null) {
        // if(p.se == '百分比'){
        //     p.se = '百分比一位';
        // }
        var tsr = ""
        var q = formatJson();
        for (var i in q) {
            if (p.se == q[i]) {
                tsr = i;
                break;
            }
        }
        str = str.replace(tsr + '"', tsr + '" selected');
    }
    return str;
}

function formatJson() {
    return {
        "文本": '{"type":"1","franction":"0","thousand":false}',
        "日期": '{"type":"2","franction":"0","thousand":false}',
        "百分比一位": '{"type":"3","franction":"1","thousand":false}',
        "百分比两位": '{"type":"3","franction":"2","thousand":false}',
        "整数": '{"type":"4","franction":"0","thousand":true}',
        "1位小数": '{"type":"4","franction":"1","thousand":true}',
        "2位小数": '{"type":"4","franction":"2","thousand":true}',
    }
}

function getFormatName(v) {
    var p = formatJson();
    for (var i in p) {
        if (p[i] == v) {
            return i;
        }
    }
    console.log('没匹配到');
}

function addReportKey(reportid, datasetId) {
    var p = {},
        q = {};
    var o = aod.datatable[datasetId];
    p.datasourceId = o.datasourceId;
    p.tableName = o.tableName;
    q.success = function(r) {
        var d = r.columns;
        if (d.length == 0) {
            swalinfo('未获取到该表字段!不能自动添加指标');
        } else {
            var hasC = [];
            if (!aod.rk.hasOwnProperty(reportid)) {
                aod.rk[reportid] = {};
            }
            var len = 0;
            for (var i in aod.rk[reportid]) {
                hasC.push(aod.rk[reportid][i].columnName);
                len++;
            }
            var ds = [];
            var alt = "";
            for (var i in aod.rt[reportid]) {
                if (aod.rt[reportid][i].datasetId == datasetId) {
                    alt = aod.rt[reportid][i].alias;
                }
            }
            for (var i = 0; i < d.length; i++) {
                var columnName = alt + '.' + d[i];
                if ($.inArray(columnName, hasC) == -1) {
                    var to = {};
                    to.columnName = columnName;
                    to.sequence = len + i * 1 + 1;
                    to.reportId = reportid;
                    to.datasetId = datasetId;
                    ds.push(to);
                }
            }
            saveReportFieldList(reportid, datasetId, ds);
        }
    }
    $.api('datasource/getTableColumns', p, q);
}

function saveReportFieldList(reportId, datasetId, ds) {
    var q = {};
    q.atype = 'POST';
    q.success = function(r) {
        if (r.length == ds.length) {
            showMessage('新增了',ds.length+'个指标');
            refreshAllKey(reportId, true);
        } else {
            swalinfo(r.msg + '自动保存指标失败')
        }
    }
    if (ds.length > 0) {
        $.api('report/saveReportFieldList', ds, q);
    } else {
        swalinfo('该表没有需要保存的字段');
    }
}