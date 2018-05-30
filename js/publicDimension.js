$(document).ready(function() {
    baseClick();
    window.alldata = {};
    $ec = $('.editDimensionOutContainer'); //editcontainer
    $dl = $('.dimensionList'); //dimensionlist
})

function showMessage(title, message) {
    iziToast.show({
        class: 'test',
        titleColor: '#fff',
        color: '#d66061',
        icon: 'icon-contacts',
        title: title,
        message: message,
        position: 'topCenter',
        transitionIn: 'flipInX',
        transitionOut: 'flipOutX',
        progressBarColor: 'rgb(0, 255, 184)',
        image: './img/avatar.jpg',
        timeout: 1000,
        imageWidth: 70,
        layout: 2,
        onClose: function() {
            console.info('onClose');
        },
        iconColor: 'rgb(0, 255, 184)'
    });
}

function baseClick() {
    //点击显示表列表
    $('.tablename').on('click',function(e){
        e.preventDefault();
         e.stopPropagation();
         $('.allTableUlContainer').addClass('allTableUlContainerShow');
    })
    $('.editDimensionContainer').on('click',function(e){
        e.preventDefault();
        e.stopPropagation();
        $('.allTableUlContainerShow').removeClass('allTableUlContainerShow');
    })
    $('.allTableUlContainer').on('click',function(e){
        e.preventDefault();
        e.stopPropagation(); 
    })

    $('.allTableUl').on('click','li',function(e){
        e.preventDefault();
        e.stopPropagation(); 
        $('.tablename').text($(this).text().replace(/[/r/n/ ]/g,''));
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
    //点击保存数据源的事件
    $('.saveTable').on('click', function() {
        var tbval = $('input[name="tablename"]').val().replace('[/ /r/n]/g', '');
        if (tbval == '') {
            //弹窗此处不能为空
            if (tbval == '') {
                $('input[name="tablename"]').addClass('inputerror');
                setTimeout(function() {
                    $('input[name="tablename"]').removeClass('inputerror');
                }, 1000)
            }
        } else {
            var val = tbval;
            if ($ec.attr('action') == 'new') {
                $('.saveTable').hide();
                $('.editTable').show();
                $('.cancelsaveTable').hide();
                $('.edittitleinput').attr('disabled', '');
                $('.addDimension').removeClass('btn-forbidden');
                var id = (Math.random() * (10000000 - 0)).toFixed(0);
                window.alldata[id] = {};
                window.alldata[id].name = val;
                $ec.attr('action', 'edit');
                appendTable(id, $('.edittitleinput').val().replace('[/ /r/n]/g', ''), '-', '-', '-');
                $ec.attr('actionid', id);
                $ec.attr('actionid', id);
                showMessage('数据源' + val, '新增成功');
            } else if ($ec.attr('action') == 'edit') {
                $('.edittitleinput').attr('disabled', '');
                $('.addDimension').removeClass('btn-forbidden');
                $('.saveTable').hide();
                $('.editTable').show();
                $('.cancelsaveTable').hide();
                if (val == window.tb) {
                    showMessage('数据源' + val, '未变化哦');
                } else { //db和表名未发生变化
                    var id = $ec.attr('actionid');
                    $('tr[actionid="' + id + '"]').find('td').eq(0).text(val);
                    // alert('修改成功');
                    showMessage('数据源' + val, '修改成功');
                }
            }
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
                $('tr[actionid="'+tableid+'"]').remove();
                showMessage('表' + str, '删除成功');
            }else{
                 swal.close();
            }  
        });
    })

    //删除维度
    $('.dimensionListUl').on('click','.removeDimension',function(e){
         e.preventDefault();
         e.stopPropagation();
         var id = $(this).parent().attr('actionid');
         var dimensiontext =$(this).parent().html().replace('<span class="removeDimension">x</span>','');
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
                $('li[actionid="'+id+'"]').remove();
                showMessage('维度' + dimensiontext, '删除成功');
                var editid = $('.editDimension').attr('actionid');
                if(id == editid){
                    $('.editDimension').attr('action','new');
                    $('.editDimension').removeaAttr('actionid');
                    $('.keyname').val('');
                    $('.keykey').val('');
                    $('.keyvalue').val('');
                }
            } else{
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