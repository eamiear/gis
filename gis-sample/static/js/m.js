/**
 * Created by K on 2017/6/2.
 */
var M = {
    Create: function (options) {
        var _this = this;

        if(!options.elem){
            _this.log('container should not be empty!');
            return;
        }
        _this.elem = $(options.elem);

        if(options.data){
            _this.generate(options.data);
            _this.log('generate menu with data!');
        }else if(options.url){
            $.get(options.url, function (data) {
                if(!data instanceof Array){
                    _this.log('It\'s not an array')
                }else{
                    _this.generate(data);
                    _this.log('generate menu with url!');
                }
            })
        }else{
            _this.log('can not run without a url or data!');
        }
    }
};
M.Create.prototype = {
    elem: null,
    dataSet: null,
    generate: function (data) {
        var $list = $('<ul class="list">').appendTo(this.elem),
            _this = this;

        _this.dataSet = data;

        $.each(data, function (index, item) {
            var $list_item = $('<li class="list-item">'),
                $list_item_header = $('<a class="header"><i class="t_close"></i><span></span></a>'),
                $list_item_menu = $('<div class="submenu">'),
                $list_item_data_list = $('<dl>');

            $list.append($list_item);
            $list_item_header.attr('listid',index+1).find('span').text(item.header);
            $list_item.append($list_item_header);

            if(item.children){
                $.each(item.children, function (i, submenu) {
                    var $list_item_data_item = $('<dd>'),
                        $list_item_data_item_target = $('<a>');

                    $list_item_data_item_target.attr({
                        'href': submenu.href,
                        'onClick': "setIntro('" + submenu.href + "');"
                    }).text(submenu.title);
                    $list_item_data_item.append($list_item_data_item_target);
                    $list_item_data_list.append($list_item_data_item);
                    $list_item_menu.append($list_item_data_list);
                    $list_item.append($list_item_menu);
                    _this.log(i + ': '+'submenu created.', 'times: ' + new Date().getSeconds());
                })
            }else if(item.href){
                $list_item.attr({
                    'href': item.href,
                    'onClick': "setIntro('" + item.href + "');"
                }).find('.t_close').remove();
                _this.log(index + ': '+'menu created.', 'times: ' + new Date().getSeconds());
            }
        });
        _this.log('menu created completely.');
    },
    getDataSet: function () {
        if(this.dataSet) return this.dataSet;
    },
    log: function () {
        window.console && window.console.info("Info: \n\t",[].slice.call(arguments,0).join('\n\t'));
    }

};