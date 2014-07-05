/* 
    Created on : Dec 25, 2013, 10:03:02 AM
    Filename   : action.js
    Author     : Zhu Hanfeng <zhuhanfeng@gmail.com>
*/

// 用户自定义事件
var Event = {
    ERROR: 'error',

    JOIN: 'join',
    LEAVE: 'leave',
    ACTION: 'action',
    ACTIONS: 'actions',
    CLIENTS: 'clients',

    WEBRTC: 'webrtc',
    CHAT: 'chat',
    CLOCK: 'clock'
};

var IS_TOUCH = 'ontouchstart' in window || 'msmaxtouchpoints' in window.navigator;

// 绘图工具
var ToolAction = {
    type: null, // 工具类型
    tool: null, // 工具元素
    shapeType: null,
    shapeTool: null,
    config: {
        tools: '.board-tools .tool', // 工具组
        shapes: '.tool-shapes-list .tool-shape', // 形状按钮组
        shapeContainer: '.tool-shapes-container', // 形状容器
        upload: {
            drawer: '.upload-drawer',
            closer: '.upload-drawer-close',
            fields: '.upload-fields',
            progress: '.upload-progress',
            error: '.upload-error',
            dropZone: 'body'
        }
    },
    _inited: null,
    init: function() {
        if (this._inited) return false;
        this._inited = true;

        this.tools = $(this.config.tools);
        this.shapes = $(this.config.shapes);
        this.shapeContainer = $(this.config.shapeContainer);

        // 初始化上传工具
        this.initUpload();
        // 初始化摄像拍照
        this.initCameraCapture();
        // 初始化事件
        this.initEvent();
    },
    initEvent: function() {
        var self = this;
        var doc = $(document);

        // 点击画笔工具
        doc.on('click', this.config.tools, function() {
            // 操作的画笔类型
            var toolType = $(this).data('type');
            // 设置工具类型
            self.setToolType(toolType == self.type ? null : toolType);
        });
        // 形状
        doc.on('click', this.config.shapes, function() {
            // 操作的画笔类型
            var shapeType = $(this).data('shape');
            // 当前的画笔类型
            var curShapeType = self.shapeType;
            // 设置工具类型
            self.setShapeType(shapeType == curShapeType ? null : shapeType);
            return false;
        });
    },
    initDefault: function() {
        if (this.toolType != 'pen') {
            this.tools.filter('[data-type=pen]').trigger(IS_TOUCH ? 'touchend' : 'click');
        }
    },
    // 设置工具类型
    setToolType: function(toolType) {
        var curToolType = this.type;

        // 确保选中的形状取消掉
        this.setShapeType(null);
        if (!toolType) {
            this.type = null;
            this.tool.blur();
            this.tool = null;

            // 隐藏上传工具
            if (curToolType == 'file') {
                this.hideUploadDrawer();
            } else if (curToolType == 'shape') {
                // 形状按钮失去焦点，取消形状选择
                this.setShapeType(null);
                this.shapeContainer.hide();
            }
        } else {
            this.type = toolType;
            this.tool = this.tools.filter('[data-type="' + toolType + '"]')

            this.hideUploadDrawer();
            this.shapeContainer.hide();
            this.hideCameraCapture();
            // 显示上传工具
            if (toolType == 'file') {
                this.showUploadDrawer();
            } else if (toolType == 'shape') {
                this.shapeContainer.show();
            } else if (toolType == 'camera') {
                this.showCameraCapture();
            }
        }

        // 高亮当前工具
        this.tools.removeClass('active');
        if (this.tool) {
            this.tool.addClass('active');
        }
        // 触发工具改变事件
        $(document).trigger('tool_change', [this.type, this]);
    },
    // 设置形状
    setShapeType: function(shapeType) {
        if (!shapeType) {
            this.shapeType = null;
            this.shapeTool = null;
        } else {
            this.shapeType = shapeType;
            this.shapeTool = this.shapes.filter('[data-shape="' + shapeType + '"]')
        }

        // 高亮当前工具
        this.shapes.removeClass('active');
        if (this.shapeTool) {
            this.shapeTool.addClass('active');
        }
        // 触发工具改变事件
        $(document).trigger('shapetool_change', [this.shapeType, this]);
        $(document).trigger('tool_change', [this.shapeType ? 'shape_' + this.shapeType : '', this]);
    },
    initUpload: function() {
        var self = this;
        var config = this.config.upload;
        var drawer = this.uploadDrawer = $(config.drawer);
        var fields = this.uploadFields = $(config.fields);
        var progress = this.uploadProgress = $(config.progress);
        var progressBar = progress.find('.progress-bar');
        var errorWrapper = this.uploadErrorWrapper = $(config.error);

        // 关闭上传工具
        drawer.on('click', config.closer, function() {
            self.setToolType(null);
        });

        this.uploadConfig = {
            dataType: 'json',
            dropZone: $(this.config.upload.dropZone),
            add: function(e, data) {
                var goUpload = true;
                var uploadFile = data.files[0];

                // 拖拽上传需要此处调用显示出上传控件
                self.showUploadDrawer();

                if (!(/\.(gif|jpe?g|png|pdf)$/i).test(uploadFile.name) && !/image\/(gif|jpe?g|png)/i.test(uploadFile.type)) {
                    errorWrapper.text('很抱歉，画板仅支持PDF, JPG, PNG及GIF文件，请重新选择文件上传~').show();
                    goUpload = false;
                }
                if (uploadFile.size > 10000000) { // 10mb
                    errorWrapper.text('很抱歉，文件大小不能超过10MB，请重新选择文件上传~').show();
                    goUpload = false;
                }
                if (goUpload == true) {
                    data.context = progressBar;
                    // 显示进度条
                    fields.hide();
                    progress.show();
                    data.submit();
                }
            },
            progressall: function(e, data) {
                var progress = parseInt(data.loaded / data.total * 100, 10) + '%';
                progressBar.css('width', progress).attr('aria-valuenow', progress).text(progress);
            },
            done: function(e, data) {
                var file = data.result.files[0];

                data.context = progressBar.text('文件上传成功，正在渲染...');
                // 上传完成后自动关闭上传
                drawer.fadeOut(function() {
                    self.setToolType(null);
                });
                // 触发上传事件
                $(document).trigger('tool_upload', [file, self]);
            }
        };

        // 初始化上传工具
        this.uploader = drawer.find('input:file').fileupload(this.uploadConfig);
    },
    // 上传外部图片或base64
    uploadRemoteFile: function(src) {
        if (~src.indexOf('base64')) {
            if (window.dataURLtoBlob) {
                this.uploader.fileupload(this.uploadConfig).fileupload('add', {
                    files: [window.dataURLtoBlob(src)]
                });
            } else {
                console.log('不支持dataURLtoBlob..');
            }
        } else {
            console.log('外部url上传暂未实现～')
        }
        this.hideCameraCapture();
    },
    // 显示上传工具
    showUploadDrawer: function() {
        this.uploadErrorWrapper.hide(); // 隐藏错误提示
        this.uploadProgress.hide(); // 隐藏进度条
        this.uploadFields.show(); // 显示上传表单
        this.uploadDrawer.show(); // 显示上传工具
    },
    // 隐藏上传工具
    hideUploadDrawer: function() {
        this.uploadDrawer.hide();
    },
    initCameraCapture: function() {
        var self = this;
        var cameraModal = this.cameraModal = $('#modal-camera');
        var modalContent = cameraModal.find('.modal-content');
        var iframeHTML = '<iframe src="/snap/snap.html" scrolling="no" frameborder="0" style="display:block" width="820" height="630"></iframe>';
        iframeHTML += '<button type="button" class="close" style="position:absolute;top: 15px;right:20px;font-size:26px" data-dismiss="modal" aria-hidden="true">&times;</button>';
        cameraModal.on({
            'hidden.bs.modal': function(e) {
                modalContent.find('iframe').remove();
                modalContent.empty();
            },
            'show.bs.modal': function() {
                modalContent.html(iframeHTML);
            }
        });
    },
    // 摄像头拍照
    showCameraCapture: function() {
        this.cameraModal.modal('show');
    },
    hideCameraCapture: function() {
        this.cameraModal.modal('hide');
    }
};

var StyleAction = {
    config: {
        strokeWidth: '.style-stroke-width', // 线条宽度
        strokeColor: '.style-stroke-color' // 线条颜色
    },
    width: null,
    color: null,
    _inited: false,
    init: function() {
        if (this._inited) return false;
        this._inited = true;

        this.strokeWidth = $(this.config.strokeWidth);
        this.strokeColor = $(this.config.strokeColor);

        this.initEvent();
    },
    initEvent: function() {
        var self = this;
        var doc = $(document);

        // 点击画笔大小
        doc.on('click', this.config.strokeWidth, function() {
            var strokeWidth = $(this).data('strokeWidth');

            if (self.width == strokeWidth) {
                return false;
            }

            self.strokeWidth.removeClass('active');
            $(this).addClass('active');

            self.width = strokeWidth;

            doc.trigger('style_widthchange', [strokeWidth, self]);
            doc.trigger('style_change', ['width', strokeWidth, self]);
        });

        // 点击画笔颜色
        doc.on('click', this.config.strokeColor, function() {
            var strokeColor = $(this).data('strokeColor');

            if (self.color == strokeColor) {
                return false;
            }

            self.strokeColor.removeClass('active');
            $(this).addClass('active');

            self.color = strokeColor;

            doc.trigger('style_colorchange', [strokeColor, self]);
            doc.trigger('style_change', ['color', strokeColor, self]);
        });
    },
    initDefault: function() {
        this.strokeWidth.eq(0).trigger(IS_TOUCH ? 'touchend' : 'click');
        this.strokeColor.eq(0).trigger(IS_TOUCH ? 'touchend' : 'click');
    }
};

var ActionAction = {
    config: {
        actions: '.board-actions .action'
    },
    action: null,

    _inited: null,
    init: function() {
        if (this._inited) return false;
        this._inited = true;

        this.actions = $(this.config.actions);

        this.initEvent();
    },
    initEvent: function() {
        var self = this;
        var doc = $(document);

        doc.on('click', this.config.actions, function() {
            var action = self.action = $(this).data('action');
            doc.trigger('action_change', [action, self]);
        });
    },
    initDefault: function() {
        this.actions.filter('[data-action=newpage]').trigger(IS_TOUCH ? 'touchend' : 'click');
    },
    getActionEl: function(action) {
        var el;

        action = action || this.action;
        if (action) {
            el = this.actions.filter('[data-action="' + action + '"]');
        }
        return el && el.length ? el : null;
    }
};

var PagerAction = {
    config: {
        container: '#js-page-container',
        items: 'li a',
        tpl: '<li id="js-page-<%=num%>"><a href="#" data-num="<%=num%>"><%=num%></a></li>'
    },

    pages: {},
    curPage: 0,
    maxPage: 0,

    init: function() {

        this.container = $(this.config.container);
        this.renderer = template.compile(this.config.tpl);
        this.curPage = this.maxPage = 0;

        this.initEvent();

    },
    initEvent: function() {
        var self = this;

        this.container.on('click', this.config.items, function() {
            var num = $(this).data('num');

            if (!num) {
                var action = $(this).data('action');
                if (action != 'removepage' || confirm('确认要删除该页吗？')) {
                    // 新增，删除页
                    self.pageAction(action, true);
                }
            } else {
                self.changePage(num, true);
            }
            return false;
        });
    },
    createPage: function() {
        // 创建分页条
        var newPager = $((this.renderer)({
            num: ++this.maxPage
        })).insertBefore(this.container.find('li:last-child'));

        this.pages[this.maxPage] = true;

        $(document).trigger('page_create', [this.maxPage, newPager]);

        this.changePage(this.maxPage);
    },
    changePage: function(num, click) {
        this.curPage = num;

        this.container.children().removeClass('active');
        this.container.find('#js-page-' + num).addClass('active');

        this.container.css('margin-left', -this.container.width() / 2);
        $(document).trigger('page_change', [num, click]);
    },
    removePage: function(num) {
        this.container.find('li:has([data-num=' + num + '])').remove();
        this.pages[num] = false;
        $(document).trigger('page_remove', [num]);

        // 先向前找可显示的页面
        for (var i = num; i > 0; i--) {
            if (this.pages[i]) {
                return this.changePage(i);
            }
        }
        // 再向后找可显示的页面
        for (i = num; i <= this.maxPage; i++) {
            if (this.pages[i]) {
                return this.changePage(i);
            }
        }
        // 都找不到则创建新页面
        this.createPage();
    },
    pageAction: function(action, click) {
        $(document).trigger('page_action', [action, click]);
    }
};

var BoardAction = {
    config: {
        etherpadContainer: '#js-etherpad-container',
        boardContainer: '#js-board-container',
        imgContainer: '#js-image-container',
        editorContainer: '#js-editor-container',
        pageContainer: '#js-page-container'
    },
    data: null,
    socket: null,
    isMouseDown: false,
    isMouseMove: false,
    fontRatio: 4, // 字体大小相对画笔宽度的比例

    operates: {}, // 执行的操作
    trashs: {}, // 删除的操作
    trashNodes: {},

    tool: null,
    strokeColor: null,
    strokeWidth: null,

    // line: null,
    // eraser: null,
    // textHolder: null,
    // textArea: null,
    // circle: null,
    // rect: null,
    drawer: null,

    zoomTable: [0.5, 0.75, 1, 1.25, 1.5], // 缩放表
    zoomLevel: 2, // 缩放级别
    zoomValue: 1, // 当前缩放值

    stageSize: null,
    boardSize: null,

    group: null,

    // 分页，每页一个layer
    layers: {},
    pagesSize: {},
    pageNum: 1,
    files: {}, // 每页的文件

    idSeed: +new Date,

    // 已渲染的操作
    _actionRendered: {},
    _inited: null,
    init: function(socket, data) {
        this.socket = socket;
        this.data = $.extend(true, {}, data);

        // 断开重连，需要重置以下内容
        if (this._inited) {
            this.stage.clear();
            this.imgContainer.empty();
            this.pageContainer.find('li:not(.btn-op)').remove();

            this.operates = {};
            this.trashs = {};
            this.trashNodes = {};

            this.layer = this.group = null;
            this.textArea = null; // 页面可能在编写文字过程中
            this.layers = {};
            this.files = {};
            this.pageNum = 1;

            this.zoomLevel = 2;

            this.isMouseDown = this.isMouseMove = null;

            this._actionRendered = {};
        } else {
            this.etherpadContainer = $(this.config.etherpadContainer);
            this.boardContainer = $(this.config.boardContainer);
            this.imgContainer = $(this.config.imgContainer);
            this.editorContainer = $(this.config.editorContainer);
            this.pageContainer = $(this.config.pageContainer);

            this.editorContainerCls = this.editorContainer.attr('class');

            // 画板尺寸 与 画板对象
            this.boardSize = {
                height: this.boardContainer.height(),
                width: this.boardContainer.width()
            };
            this.stage = new Kinetic.Stage($.extend({
                container: this.editorContainer.get(0)
            }, this.boardSize));

            // 初始化工具
            // 在画布上拖放图片自动上传
            ToolAction.config.upload.dropZone = this.boardContainer;
            ToolAction.init();
            // 初始化样式
            StyleAction.init();
            // 初始化画布操作
            ActionAction.init();
            // 初始化分页操作
            PagerAction.init();

            // 监听事件
            this.initDomEvent();

            // 初始化默认行为
            ToolAction.initDefault();
            StyleAction.initDefault();
            //ActionAction.initDefault();
        }

        PagerAction.createPage();
        this.showUp(this.editorContainer);
        this.zoomValue = this.zoomTable[this.zoomLevel];

        // socket事件接收处理
        this.initSocketEvent();

        this._inited = true;
    },
    initEvent: function() {
        this.initDomEvent();
        this.initSocketEvent();
    },
    initSocketEvent: function() {
        var self = this;

        // 刚登陆后的 批量渲染
        this.socket.on(Event.ACTIONS, function(actions) {
            $.each(actions, function(index, action) {
                // 只执行绘图操作不渲染到页面
                self.renderAction(action, false);
            });
            // 一次性渲染（实际渲染最后停留的页面）
            self.layer.draw.draw();
            self.layer.component.draw();
            self.checkActionState();
        });
        // 单个操作的渲染
        this.socket.on(Event.ACTION, function(action) {
            self.renderAction(action);
        });
    },
    initDomEvent: function() {
        var self = this;
        var doc = $(document);

        // 阻止touch设备上画图时滚动画布
        $(document.body).on('touchmove', function(event) {
            if (self.isMouseDown) {
                event.preventDefault();
            }
        });

        // 画布滚动同步滚动pdf
        self.boardContainer.on('scroll', function() {
            var scrollTop = this.scrollTop / self.zoomValue;
            var file = self.files[self.pageNum];
            if (file.type == 'pdf') {
                file.el.css('margin-top', scrollTop).contents().find('#viewerContainer').scrollTop(scrollTop);
            }
        });
        // [tools]
        // 根据操作的工具类型切换 绘图板 与 文件板 的位置
        doc.on('tool_change', function(e, toolType) {
            // 设置光标形状的class
            var toolCls = toolType || '';

            // 形状都用 shape 做class
            if (toolType && toolType.indexOf('shape_') == 0) {
                toolCls = 'shape';
            }

            // 设置光标形状的class
            self.editorContainer.attr('class', self.editorContainerCls + ' ' + toolCls);

            self.tool = toolType;
            self.syncToolStyles();
        });
        // 文件上传完成，渲染到画板
        doc.on('tool_upload', function(e, file) {
            var type = ~file.type.indexOf('pdf') ? 'pdf' : 'img';
            self.renderFile(type, file.url);
            self.sendAction('file', type, file.url);
        });

        // [actions]
        doc.on('action_change', function(e, action) {
            var renderer = self.actionRenderer[action];
            if (renderer) {
                renderer.call(self);
                // 缩放不同步
                if (action == 'zoomin' || action == 'zoomout') return false;
                self.sendAction('action', action);
            } else {
                console.log('unknown action type: ' + action);
            }
        });

        // [styles]
        doc.on('style_change', function(e, type, value) {
            if (type == 'color') {
                self.strokeColor = value;
                if (self.textArea) {
                    self.textArea.css('color', value).focus();
                }
            } else if (type == 'width') {
                self.strokeWidth = value;
                if (self.textArea) {
                    self.textArea.css('fontSize', value * self.fontRatio).focus();
                }
            }

            // 设置当前编辑的形状
            if (self.curEditShape) {
                var shape = self.curEditShape;
                if (shape.getAttr('className').toLowerCase() == 'text') {
                    shape.setAttrs({
                        fontSize: self.strokeWidth * self.fontRatio,
                        fill: self.strokeColor
                    });
                } else {
                    shape.setAttrs({
                        strokeWidth: self.strokeWidth,
                        stroke: self.strokeColor
                    });
                }
                doc.trigger('anchor_complete', shape);
                self.layer.component.draw();
            }
        });

        // [pages]
        // 分页创建
        doc.on('page_create', function(e, num) {
            // 已经创建过该页，不再创建
            if (self.layers[num]) return false;

            // 创建绘画层 及 组件层
            var drawLayer = new Kinetic.Layer();
            var componentLayer = new Kinetic.Layer();
            // 组件层在上，画笔层在下
            self.stage.add(drawLayer, componentLayer);
            self.layers[num] = {
                draw: drawLayer,
                component: componentLayer
            };
            // 绑定到componentLayer上
            componentLayer.anchorAdapter = createAnchor(componentLayer, function() {
                return !self.tool || self.tool === 'shape';
            }, function(e) {
                return $(e.target).closest('.board-styles, [data-action=redo], [data-action=undo]').length;
            });

            self.operates[num] = [];
            self.trashs[num] = [];
            self.trashNodes[num] = [];
        });
        // 删除一页
        doc.on('page_remove', function(e, num) {
            var layers = self.layers[num];
            var file = self.files[num];
            if (layers) {
                $.each(layers, function(name, layer) {
                    layer.destroy();
                });
            }
            if (file) {
                file.el.remove();
            }
            self.layers[num] = null;
            self.files[num] = null;

            self.operates[num] = null;
            self.trashs[num] = null;
            self.trashNodes[num] = null;
        });
        // 分页切换
        doc.on('page_change', function(e, num, click) {
            var layers = self.layers[num];
            if (!layers) return false;

            // 隐藏当前页图层，显示并渲染指定页的图层
            if (self.layer) {
                $.each(self.layer, function(name, layer) {
                    layer.hide();
                });
            }
            $.each(layers, function(name, layer) {
                layer.show().draw();
            });
            self.layer = layers;

            self.anchorAdapter = self.layer.component.anchorAdapter;

            self.operate = self.operates[num];
            self.trash = self.trashs[num];
            self.trashNode = self.trashNodes[num];

            // 隐藏非当前页的文件
            $.each(self.files, function(index, item) {
                if (item) {
                    if (index == num) {
                        item.el.show();
                    } else {
                        item.el.hide();
                    }
                }
            });

            self.pageNum = num; // 当前页码

            self.resizeStage();

            // 用户点击触发，记录到后端
            if (click) {
                self.sendAction('action', 'changePage', num);
            }
        });
        doc.on('page_action', function(e, action, click) {
            var renderer = self.actionRenderer[action];
            if (renderer) {
                renderer.call(self);
                if (click) {
                    self.sendAction('action', action);
                }
            } else {
                console.log('unknown action type: ' + action);
            }
        });

        function getToolType(shape) {
            var anchorType, className;
            if (shape) {
                className = shape.getAttr('className').toLowerCase();
                if (className == 'text') {
                    anchorType = className;
                } else {
                    anchorType = shape.nodeType.toLowerCase() + '_' + className;
                }
            }
            return anchorType;
        }
        doc.on('anchor_set', function(e, shape) {
            self.curEditShape = shape;
            self.syncToolStyles(getToolType(shape));
        });
        doc.on('anchor_change', function(e, shape) {
            self.sendAction('progress_anchor', shape.id(), shape.attrs);
        });
        doc.on('anchor_complete', function(e, shape) {
            var current = $.extend({}, shape.attrs);
            var previous = $.extend({}, shape.getAttr('_attrs'));
            $.each(['id', 'sceneFunc', '_attrs'], function(idx, name) {
                delete current[name];
                delete previous[name];
            });
            self.sendAction('component_change', shape.id(), {
                previous: previous,
                current: current
            });
            shape.setAttr('_attrs', current);
        });
        // delete component
        doc.on('keydown', function(e) {
            if (e.keyCode == 46 || e.keyCode == 8 && self.curEditShape) {
                self.sendAction('component_delete', self.curEditShape.id());
                self.curEditShape.remove();
                self.layer.component.draw();
                self.anchorAdapter.setCurShape(null);
            }
        });

        // 渲染画布文字
        $(window).on('mousedown', function(e) {
            if (!$(e.target).closest(self.editorContainer).length && self.textArea) {
                self.renderText();
            }
        });

        // [stage]
        // 画板事件监听
        this.stage.on('contentMousedown contentTouchstart', function(e) {

            // 只处理左键
            // 未选择任何工具
            if ((e.evt.type != 'touchstart' && e.evt.which != 1) || !self.tool) {
                return false;
            }

            self.isMouseDown = true;

            // 当前操作的节点
            var curNode;
            var mousePos = self.startPos = this.getPointerPosition();

            if (self.tool == 'pen') { // 铅笔
                if (!self.strokeColor || !self.strokeWidth) {
                    return false;
                }
                curNode = new Kinetic.Line({
                    points: [mousePos.x, mousePos.y, mousePos.x + 1, mousePos.y + 1],
                    stroke: self.strokeColor,
                    strokeWidth: self.strokeWidth,
                    lineJoin: 'round',
                    lineCap: 'round',
                    id: 'item_' + self.idSeed++
                });
                self.layer.draw.add(curNode);
            } else if (self.tool == 'eraser') { // 橡皮
                if (!self.strokeWidth) {
                    return false;
                }
                curNode = new Kinetic.Eraser({
                    points: [mousePos.x, mousePos.y, mousePos.x + 1, mousePos.y + 1],
                    strokeWidth: self.strokeWidth,
                    lineJoin: 'round',
                    lineCap: 'round',
                    id: 'item_' + self.idSeed++
                });
                self.layer.draw.add(curNode);
            } else if (self.tool == 'text') { // 文字
                // 文字渲染
                if (self.textArea) {
                    self.renderText();
                } else {
                    // 创建文字选框
                    curNode = new Kinetic.Rect({
                        x: mousePos.x,
                        y: mousePos.y,
                        width: 0,
                        height: 0,
                        strokeWidth: 1,
                        stroke: '#000'
                    });
                    self.layer.component.add(curNode);
                }
            } else if (~self.tool.indexOf('shape_')) {
                if (!self.strokeColor || !self.strokeWidth) {
                    return false;
                }
                var shape = self.tool.substr(6);
                var baseAttr = {
                    x: mousePos.x,
                    y: mousePos.y,
                    width: 0,
                    height: 0,
                    // lineJoin: 'round',
                    // lineCap: 'round',
                    strokeWidth: self.strokeWidth,
                    stroke: self.strokeColor,
                    id: 'item_' + self.idSeed++
                };
                if (shape == 'rect') {
                    curNode = new Kinetic.Rect(baseAttr);
                } else if (shape == 'ellipse') {
                    curNode = new Kinetic.Ellipse($.extend(baseAttr, {
                        radius: {
                            x: 0,
                            y: 0
                        }
                    }));
                } else if (shape == 'triangle') {
                    curNode = new Kinetic.Triangle(baseAttr);
                } else if (shape == 'right-triangle') {
                    curNode = new Kinetic.RightTriangle(baseAttr);
                } else if (shape == 'line') {
                    curNode = new Kinetic.ShapeLine(baseAttr);
                } else if (shape == 'arrow') {
                    curNode = new Kinetic.Arrow(baseAttr);
                } else if (shape == 'double-arrow') {
                    curNode = new Kinetic.DoubleArrow(baseAttr);
                }
                self.anchorAdapter.bindShape(curNode);
                self.layer.component.add(curNode);
            }

            if (curNode) {
                curNode.draw();
                self.curNode = curNode;
                self.sendAction('progress_begin', self.tool, curNode);
            }
        });

        this.stage.on('contentMousemove contentTouchmove', function() {

            if (!self.isMouseDown) {
                return false;
            }
            self.isMouseMove = true;

            var mousePos = self.stage.getPointerPosition();

            if (self.tool == 'pen') {
                self.curNode.points(self.curNode.points().concat([mousePos.x, mousePos.y]));
            } else if (self.tool == 'eraser') {
                self.curNode.points(self.curNode.points().concat([mousePos.x, mousePos.y]));
            } else if (self.tool == 'text' && self.curNode) {
                var w = mousePos.x - self.startPos.x;
                var h = mousePos.y - self.startPos.y;
                if (w < 0) {
                    self.curNode.setX(mousePos.x);
                    self.curNode.setWidth(-w);
                } else {
                    self.curNode.setWidth(w);
                }

                if (h < 0) {
                    self.curNode.setY(mousePos.y);
                    self.curNode.setHeight(-h);
                } else {
                    self.curNode.setHeight(h);
                }
            } else if (~self.tool.indexOf('shape_')) {
                var shape = self.tool.substr(6);
                var w = mousePos.x - self.startPos.x;
                var h = mousePos.y - self.startPos.y;
                if (shape == 'ellipse') {
                    self.curNode.setX(self.startPos.x + w / 2);
                    self.curNode.radiusX(Math.abs(w / 2));

                    self.curNode.setY(self.startPos.y + h / 2);
                    self.curNode.radiusY(Math.abs(h / 2));
                } else if (~['rect', 'triangle', 'right-triangle', 'line', 'arrow', 'double-arrow'].indexOf(shape)) {
                    self.curNode.setWidth(w);
                    self.curNode.setHeight(h);
                }
            }

            // 因为绘制图形的原因，必须渲染画布，否则之前的画笔痕迹不能清除
            $.each(self.layer, function(name, layer) {
                layer.draw();
            });

            if (self.curNode) {
                self.sendAction('progress_doing', self.tool, self.curNode);
            }
        });

        // 改为监听整个页面的mouseup，否则会出现外面放开鼠标后，进入画布仍然画图
        // this.stage.on('contentMouseup', function() {
        $(window).on('mouseup touchend', function() {
            if (!self.isMouseDown) {
                return false;
            }
            self.isMouseDown = false;
            self.startPos = null;

            var curTool = self.tool;
            if (curTool == 'pen') {
                self.sendAction('draw', curTool, self.curNode);
            } else if (curTool == 'eraser') {
                self.sendAction('draw', curTool, self.curNode);
            } else if (curTool == 'text' && self.curNode) {
                // 根据选取创建textArea
                var pos = self.curNode.getAbsolutePosition();
                var size = self.curNode.size();
                self.curNode.destroy();
                self.curNode = null;
                self.layer.component.draw();

                // 单击但未创建选取
                if (!self.isMouseMove) {
                    return false;
                }
                self.isMouseMove = false;

                var textAttrs = self.textAttrs = $.extend({}, pos, size, {
                    fontSize: self.strokeWidth * self.fontRatio,
                    lineHeight: 1.2,
                    fontFamily: 'Arial'
                });
                self.textArea = $('<textarea></textarea>').css(textAttrs).css({
                    position: 'absolute',
                    left: pos.x + 'px',
                    top: pos.y + 'px',
                    color: self.strokeColor,
                    padding: 0,
                    border: 0
                });
                self.editorContainer.append(self.textArea);
                self.textArea.focus();
            } else if (~curTool.indexOf('shape_')) {
                self.onComponentDrawEnd(self.curNode);
                self.sendAction('component', curTool, self.curNode);
            }

            if (self.curNode) {
                self.sendAction('progress_end', curTool, self.curNode);
            }

            self.curNode = null;
        });
    },
    // 根据工具类型设置颜色及尺寸是否可见
    syncToolStyles: function(toolType) {
        var colorList = $('#js-stroke-color-list button');
        var widthList = $('#js-stroke-width-list button');

        toolType = toolType || this.tool;
        if (!toolType) {
            colorList.attr('disabled', true);
            widthList.attr('disabled', true);
        } else if (toolType == 'pen' || toolType == 'text' || toolType.indexOf('shape_') == 0) {
            colorList.removeAttr('disabled');
            widthList.removeAttr('disabled');
        } else if (toolType == 'eraser') {
            colorList.attr('disabled', true);
            widthList.removeAttr('disabled');
        }
    },
    // 将指定图层显示到上面
    showUp: function(container) {
        if (container.is(this.imgContainer)) {
            this.imgContainer.css('zIndex', 1);
            this.editorContainer.css('zIndex', 0);
        } else {
            this.imgContainer.css('zIndex', 0);
            this.editorContainer.css('zIndex', 1);
        }
    },
    // 渲染编辑的文字
    renderText: function() {
        if (!this.textArea) return false;
        var content = $.trim(this.textArea.val());
        this.textArea.remove();
        this.textArea = null;

        if (content) {
            $.extend(this.textAttrs, {
                id: 'item_' + this.idSeed++,
                text: content,
                fill: this.strokeColor,
                fontSize: this.strokeWidth * this.fontRatio
            });

            var text = new Kinetic.Text(this.textAttrs);
            this.textAttrs = null;
            this.anchorAdapter.bindShape(text);
            this.layer.component.add(text);
            text.draw();
            this.sendAction('component', this.tool, text);
            this.onComponentDrawEnd(text);
        }
    },
    onComponentDrawEnd: function(comp) {
        if (this.tool != 'shape') {
            ToolAction.setToolType(null);
        }
        ToolAction.setShapeType(null);
        // 记录原始属性
        comp.setAttr('_attrs', $.extend({}, comp.attrs));
        this.anchorAdapter.setCurShape(comp);
    },
    // 根据附件大小计算舞台大小
    resizeStage: function() {
        var boardSize = this.boardSize;
        var size = this.pagesSize[this.pageNum];

        if (!size) {
            return this.stage.size(boardSize);
        }
        // 调整画布大小与图片一致
        if (size.height && size.height > boardSize.height) {
            this.stage.setHeight(size.height);
        } else {
            this.stage.setHeight(boardSize.height);
        }
        if (size.width && size.width > boardSize.width) {
            this.stage.setWidth(size.width);
        } else {
            this.stage.setWidth(boardSize.width);
        }
    },
    // 渲染上传文件
    renderFile: function(type, url) {
        var self = this;
        var pageNum = this.pageNum;

        // 每页只能有一个附件
        if (this.files[pageNum]) {
            PagerAction.createPage();
            return this.renderFile(type, url);
        }
        // 缓存当前的文件
        this.files[pageNum] = {
            type: type,
            url: url
        };

        var loading = $('#js-loadingbar').show();
        // 超过2秒认为超时先关闭图层。。
        setTimeout(function() {
            loading.hide();
        }, 2000);
        if (type == 'img') {
            var img = $('<img src="' + url + '" />').appendTo(this.imgContainer);
            // 根据图片高度校正容器宽度
            img.load(function() {
                self.pagesSize[pageNum] = {
                    height: this.height,
                    width: this.width
                };
                self.resizeStage();
                loading.hide();
            });

            this.files[pageNum]['el'] = img;
            //self.showUp(self.imgContainer);
        } else if (type == 'pdf') {
            var path = parseURL(url).path;
            // FIXME：此处容器的className必须为viewerContainer，原因不明
            var pdf = $('<iframe src="/pdfjs/web/viewer.html?file=' + path + '#page=1" frameborder="0" class="pdf-container"></iframe>').appendTo(this.imgContainer);
            pdf.ready(function() {
                pdf[0].contentWindow.window.onPdfLoad = function(pages) {
                    var stageHeight = self.stage.height();
                    var height = pages * 820; //pdf.contents().find('#viewer').height();
                    if (height > stageHeight) {
                        height = Math.min(height, 32000);
                        self.pagesSize[pageNum] = {
                            height: height
                        };
                        self.resizeStage();
                        loading.hide();
                    }
                };
            });

            this.files[pageNum]['el'] = pdf; // 此处应该是文件的容器
        }
    },
    // 发送消息
    sendAction: function(cate, type, data) {
        this.socket.emit(Event.ACTION, {
            cate: cate,
            type: type,
            data: data || null // 自动将node转换为字符串
        });

        // 绘图过程只发送消息
        if (~cate.indexOf('progress_')) {
            return false;
        }

        // 记录所有tools的操作
        if (cate != 'action' || type == 'trash') {
            this.operate.push({
                cate: cate,
                type: type,
                data: data
            });
        }
        this.checkActionState();
    },
    // 渲染服务端action数据
    renderAction: function(action, autoRender) {
        var cate = action.cate;
        var type = action.type;

        // 绘图过程还原
        if (~cate.indexOf('progress_')) {
            var renderType = type == 'pen' || type == 'eraser' ? 'draw' : 'component';
            this.renderLayer = this.layer[renderType];

            if (cate == 'progress_begin') {
                this.renderNode = Kinetic.Node.create(action.data);
                this.renderLayer.add(this.renderNode);
            } else if (cate == 'progress_doing') {
                this.renderNode.remove();
                this.renderNode = Kinetic.Node.create(action.data);
                this.renderLayer.add(this.renderNode);
            } else if (cate == 'progress_end') {
                //this.renderNode = null;
                //this.renderLayer = null;
            } else if (cate == 'progress_anchor') {
                this.renderLayer.find('#' + type).setAttrs(action.data);
                this.anchorAdapter.syncAnchorWithShape();
            }

            //if (this.renderLayer) {
            this.renderLayer.draw();
            //}
            return false;
        }
        // 删除之前的绘图笔迹，后面会绘制
        if (this.renderNode) {
            this.renderNode.remove();
            this.renderNode = null;
            this.renderLayer = null;
        }

        // 避免重复渲染一个action
        if (this._actionRendered[action.id]) {
            return false;
        }
        this._actionRendered[action.id] = true;

        if (cate == 'draw') { // 绘图
            var node = action.data = Kinetic.Node.create(action.data);
            this.layer.draw.add(node);
        } else if (cate == 'component') {
            var node = action.data = Kinetic.Node.create(action.data);
            this.layer.component.add(node);
            this.anchorAdapter.bindShape(node);
        } else if (cate == 'file') {
            this.renderFile(type, action.data);
        } else if (cate == 'action') { // 操作行为
            var renderer = this.actionRenderer[type];
            if (renderer) {
                renderer.call(this);
            } else if (type == 'changePage') { // 切换页面的操作
                PagerAction.changePage(action.data);
            } else if (type == 'delete') { // 删除
                var node = action.data = this.layer.component.find('#' + action.data);
                node.remove();
            }
            autoRender = false;
        } else if (cate == 'component_change') { // 修改组件属性
            var node = this.layer.component.find('#' + type);
            node.setAttrs(action.data.current);
        } else if (cate == 'component_delete') {
            var node = action.data = this.layer.component.find('#' + type);
            node.remove();
        }

        // 自动渲染图层
        if (autoRender !== false) {
            this.layer.draw.draw();
            this.layer.component.draw();
        }

        // 记录操作，撤消时使用
        if (cate != 'action' || type == 'trash') {
            this.operate.push(action);
        }

        this.checkActionState();
    },
    // 设置action部分按钮的状态
    checkActionState: function() {
        var self = this;
        // 避免过于频繁的设置
        clearTimeout(this._checkActionStateTimer);
        this._checkActionStateTimer = setTimeout(function() {
            ActionAction.getActionEl('undo').attr('disabled', !self.operate.length);
            ActionAction.getActionEl('redo').attr('disabled', !self.trash.length);
            ActionAction.getActionEl('trash').attr('disabled', !self.operate.length);
            ActionAction.getActionEl('zoomin').attr('disabled', self.zoomLevel >= self.zoomTable.length - 1);
            ActionAction.getActionEl('zoomout').attr('disabled', self.zoomLevel <= 0);
        }, 100);
    },
    // 画板缩放
    zoomBoard: function(zoom) {
        var boardSize = $.extend({}, this.boardSize);

        // 默认使用当前scaleLevel的值缩放
        if (typeof zoom == 'undefined') {
            if (this.zoomLevel < 0) {
                this.zoomLevel = 0;
            } else if (this.zoomLevel > this.zoomTable.length - 1) {
                this.zoomLevel = this.zoomTable.length - 1;
            }
            zoom = this.zoomTable[this.zoomLevel];
        }

        // 无效的zoom值
        if (typeof zoom !== 'number') {
            console.log('invalid zoom call!', zoom);
            return false;
        } else if (zoom == this.zoomValue) { // 缩放值未变，不渲染
            return false;
        }

        this.zoomValue = zoom; // 设置当前缩放值
        console.log('Page Zoom Value:', zoom);

        // 代理容器确保scale时容器尺寸不便
        if (!this.boardInnerContainer) {
            this.boardInnerContainer = $("<div />").css({
                'width': boardSize.width,
                'height': boardSize.height,
                'transform-origin': '0% 0%',
                '-webkit-transform-origin': '0% 0%'
            }).append(this.boardContainer.children()).appendTo(this.boardContainer);
        }
        this.boardInnerContainer.css({
            'transform': 'scale(' + zoom + ')',
            '-webkit-transform': 'scale(' + zoom + ')',
        });

        this.boardContainer.height(boardSize.height * zoom).width(boardSize.width * zoom);
        this.etherpadContainer.css('min-width', boardSize.width * zoom);

        // resize 画布后要重新计算页面布局
        RoomManager.initPageLayout();
    },
    // 操作行为处理程序
    actionRenderer: {
        newpage: function() {
            PagerAction.createPage();
        },
        removepage: function() {
            PagerAction.removePage(this.pageNum);
        },
        trash: function() {
            var nodes = [],
                node;

            while (node = this.layer.draw.getChildren().shift()) {
                nodes.push(node);
            }
            this.trashNode.draw = nodes;
            this.layer.draw.draw();

            while (node = this.layer.component.getChildren().shift()) {
                nodes.push(node);
            }
            this.trashNode.component = nodes;
            this.layer.component.draw();
        },
        undo: function() {
            var operate = this.operate.pop();
            var layer = this.layer;
            if (operate) {
                if (operate.cate == 'draw') { // 撤消绘图
                    operate.data.remove();
                    layer.draw.draw();
                } else if (operate.cate == 'component') {
                    operate.data.remove();
                    layer.component.draw();
                    if (this.curEditShape == operate.data) {
                        this.anchorAdapter.setCurShape(null);
                    }
                } else if (operate.cate == 'action' && operate.type == 'trash') { // 撤消 清理画布
                    $.each(this.trashNode.draw, function(index, node) {
                        layer.draw.add(node);
                    });
                    layer.draw.draw();

                    $.each(this.trashNode.component, function(index, node) {
                        layer.component.add(node);
                    });
                    layer.component.draw();
                } else if (operate.cate == 'component_change') {
                    var shape = layer.component.find('#' + operate.type)[0];
                    shape.setAttrs(operate.data.previous);
                    layer.component.draw();
                    if (this.curEditShape == shape) {
                        this.anchorAdapter.syncAnchorWithShape();
                    }
                } else if (operate.cate == 'component_delete') {
                    layer.component.add(operate.data);
                    layer.component.draw();
                }

                this.trash.push(operate);
            }

            this.checkActionState();
        },
        redo: function() {
            var operate = this.trash.pop();
            var layer = this.layer;

            if (operate) {
                if (operate.cate == 'draw') { // 重新绘制
                    layer.draw.add(operate.data);
                    layer.draw.draw();
                } else if (operate.cate == 'component') {
                    layer.component.add(operate.data);
                    layer.component.draw();
                } else if (operate.cate == 'action' && operate.type == 'trash') {
                    // 重新清理画布
                    this.actionRenderer['trash'].call(this);
                } else if (operate.cate == 'component_change') {
                    var shape = layer.component.find('#' + operate.type)[0];
                    shape.setAttrs(operate.data.current);
                    layer.component.draw();
                    if (this.curEditShape == shape) {
                        this.anchorAdapter.syncAnchorWithShape();
                    }
                } else if (operate.cate == 'component_delete') {
                    operate.data = operate.data || layer.component.find('#' + operate.type)[0];
                    operate.data.remove();
                    layer.component.draw();
                    if (this.curEditShape == operate.data) {
                        this.anchorAdapter.setCurShape(null);
                    }
                }

                this.operate.push(operate);
            }

            this.checkActionState();
        },
        zoomin: function() {
            this.zoomLevel += 1;
            this.zoomBoard();
            this.checkActionState();
        },
        zoomout: function() {
            this.zoomLevel -= 1;
            this.zoomBoard();
            this.checkActionState();
        }
    }
};

/**
 * 聊天管理
 * @type {Object}
 */
var ChatAction = {
    config: {
        wrapper: '#js-chat-content',
        chatTpl: '#js-chat-tpl',
        chatBtn: '#js-chat-button',
        chatMsg: '#js-chat-msg'
    },
    data: null,
    socket: null,

    _inited: null,
    init: function(socket, data) {
        this.socket = socket;
        this.data = $.extend(true, {}, data);

        if (this._inited) return false;
        this._inited = true;

        // 聊天室容器
        this.wrapper = $(this.config.wrapper);
        // 聊天条目模版渲染器
        this.chatRender = template.compile($(this.config.chatTpl).html());
        // 聊天发送按钮
        this.chatBtn = $(this.config.chatBtn);
        // 聊天消息
        this.chatMsg = $(this.config.chatMsg);

        this.initEvent();
    },
    initEvent: function() {
        var self = this;
        var socket = this.socket;

        // 用户加入
        socket.on(Event.JOIN, function(data) {
            self.userJoin(data);
        });

        // 用户离开
        socket.on(Event.LEAVE, function(data) {
            self.userLeave(data);
        });

        // 收到消息
        socket.on(Event.CHAT, function(data) {
            self._renderData(data);
        });

        // 发消息
        this.chatBtn.click($.proxy(this.sendMsg, this));
        this.chatMsg.keypress(function(event) {
            if (event.keyCode === 13 && !event.shiftKey) {
                self.sendMsg();
                return false;
            }
        });
    },
    _renderData: function(data) {
        var html = this.chatRender(data);
        this.wrapper.append(html).scrollTop(this.wrapper[0].scrollHeight);
        return this;
    },
    // 用户加入聊天室
    userJoin: function(data) {
        var tplData = {
            _system: true,
            msg: data.uname + ' 进入了房间',
            time: data.jointime
        };
        return this._renderData(tplData);
    },
    // 用户离开房间
    userLeave: function(data) {
        var tplData = {
            _system: true,
            msg: data.uname + ' 离开了房间',
            time: data.leavetime
        };
        return this._renderData(tplData);
    },
    // 发送聊天消息
    sendMsg: function() {
        var chatData = {
            uname: this.data.uname,
            msg: $.trim(this.chatMsg.val()),
            time: moment().format('YYYY-MM-DD HH:mm:ss')
        };

        // 空消息不发送
        if (chatData.msg == '') {
            return false;
        }

        this.chatMsg.val('');
        this._renderData(chatData);

        // 发消息
        this.socket.emit(Event.CHAT, chatData);
    }
};

/**
 * 视频管理
 * @type {Object}
 */
var MediaAction = {
    config: {
        mediaSetup: '#btn-media-setup',
        mediaWrapper: '.video-wrapper',
        mediaMe: '.video-wrapper-me'
    },
    data: null,
    socket: null,

    _inited: null,
    init: function(socket, data) {
        this.socket = socket;
        this.data = $.extend(true, {}, data);

        if (this._inited) return false;
        this._inited = true;

        // 初始化视频对象
        this.media = new Media($.proxy(this.send, this));
        // 开始视频按钮
        this.mediaSetup = $(this.config.mediaSetup);

        this.initEvent();
    },
    initEvent: function() {
        var self = this;
        var media = this.media;
        var socket = this.socket;

        // 用户加入
        socket.on(Event.JOIN, function(data) {
            media.userJoin(data.id);
        });
        // 用户离开
        socket.on(Event.LEAVE, function(data) {
            media.userLeave(data.id);
        });
        // 视频共享
        socket.on(Event.WEBRTC, function(msg) {
            media.processSignaling(msg);
        });

        /*开启视频*/
        this.mediaSetup.click(function() {
            if (media.getUserMedia) {
			   if(!media.isOpened){
                media.start({
                    audio: true,
                    video: {
                        mandatory: {},
                        optional: [{
                            maxFrameRate: 1
                        }]
                    }
                });
				}
            } else {
                alert("当前浏览器不支持相关协议，您将无法使用音视频通信功能。建议使用最新版的Chrome或者火狐浏览器");
            }
            // $('#share-myscreen').removeAttr("disabled");
        });

        // 视频控制
        $(this.config.mediaWrapper).hover(function() {
            var wrapper;
            if ($(this).find('video, audio').length) {
                if (!this.mediaCtrl) {
                    wrapper = $(this).closest(self.config.mediaWrapper)
                    self.initMediaControl(wrapper, wrapper.is(self.config.mediaMe));
                }
                this.mediaCtrl.show();
            }
        }, function() {
            if ($(this).find('video, audio').length) {
                this.mediaCtrl.hide();
            }
        });
    },
    initMediaControl: function(videoWrapper, me) {
        var media = this.media,
            wrapper = $('<div class="ctrl-wrapper"></div>'),
            ctrlFullScreen = $('<button class="btn btn-default btn-fullscreen"><span class="glyphicon glyphicon-fullscreen"></span></button>'),
            ctrlToggleVideo = $('<button class="btn btn-sm btn-default btn-video-toggler"></button>'),
            ctrlToggleAudio = $('<button class="btn btn-sm btn-default btn-audio-toggler"></button>'),
            videoText = {},
            audioText = {},
            videoCtrlInited = false,
            mediaEl = videoWrapper.find('video, audio'),
            isVideo = mediaEl.is('video');

        if (videoWrapper[0].mediaCtrl) {
            return false;
        }

        // 视频全屏
        if (isVideo) {
            wrapper.append(ctrlFullScreen);
            ctrlFullScreen.click(function() {
                media.fullScreen(mediaEl[0]);
            });
        }

        if (me) {
            if (isVideo) {
                videoText = {
                    closeText: '关闭视频',
                    openText: '打开视频'
                };
                ctrlToggleVideo.data(videoText).text(videoText.closeText).appendTo(wrapper);
                ctrlToggleVideo.click(function() {
                    var actionOpen = ctrlToggleVideo.text() === videoText.openText;
                    media.VideoMute(actionOpen);
                    ctrlToggleVideo.text(actionOpen ? videoText.closeText : videoText.openText);
                });
                // 两个按钮则要加上media-btn-all的className
                wrapper.addClass('media-btn-all');
            }
            audioText = {
                closeText: '关闭音频',
                openText: '打开音频'
            };
            ctrlToggleAudio.data(audioText).text(audioText.closeText).appendTo(wrapper);
            ctrlToggleAudio.click(function() {
                var actionOpen = ctrlToggleAudio.text() === audioText.openText;
                media.AudioMute(actionOpen);
                ctrlToggleAudio.text(actionOpen ? audioText.closeText : audioText.openText);

            });
        } else {
            audioText = {
                closeText: '关闭对方声音',
                openText: '打开对方声音'
            };
            ctrlToggleAudio.data(audioText).text(audioText.closeText).appendTo(wrapper);
            ctrlToggleAudio.click(function() {
                var actionOpen = ctrlToggleAudio.text() === audioText.openText;
                media.audioControl(mediaEl[0], actionOpen ? 1 : 0);
                ctrlToggleAudio.text(actionOpen ? audioText.closeText : audioText.openText);
            });
        }

        wrapper.hide().appendTo(videoWrapper);
        videoWrapper[0].mediaCtrl = wrapper;
    },

    // 发送消息
    send: function(data) {
        this.socket.emit(Event.WEBRTC, data);
    }
};

/**
 * 上课记时管理
 * @type {Object}
 */
var ClockAction = {
    config: {
        timeShow: '#js-class-time', // 时间显示面板
        // 操作按钮
        btnBeginClass: '#js-btn-beginclass', // 开始上课
        btnPauseClass: '#js-btn-pauseclass', // 暂停上课
        btnResumeClass: '#js-btn-resumeclass', // 继续上课
        btnEndClass: '#js-btn-endclass', // 停止上课
        btnEndInfo: '#js-btn-endinfo'
    },
    actionMap: {
        BEGIN: 'begin',
        PAUSE: 'pause',
        RESUME: 'resume',
        END: 'end'
    },
    data: null,
    socket: null,
    timer: null,
    duration: 0,

    _inited: null,
    init: function(socket, data) {
        this.socket = socket;
        this.data = $.extend(true, {}, data);

        if (this._inited) return false;
        this._inited = true;

        this.timeShow = $(this.config.timeShow);
        this.btnBeginClass = $(this.config.btnBeginClass);
        this.btnPauseClass = $(this.config.btnPauseClass);
        this.btnResumeClass = $(this.config.btnResumeClass);
        this.btnEndClass = $(this.config.btnEndClass);
        this.btnEndInfo = $(this.config.btnEndInfo);

        this.initEvent();
    },
    initEvent: function() {
        var self = this;
        var socket = this.socket;
        var actionMap = this.actionMap;

        // 记时按钮操作
        this.btnBeginClass.click(function() {
            socket.emit(Event.CLOCK, actionMap.BEGIN);
        });
        this.btnPauseClass.click(function() {
            socket.emit(Event.CLOCK, actionMap.PAUSE);
        });
        this.btnResumeClass.click(function() {
            socket.emit(Event.CLOCK, actionMap.RESUME);
        });
        this.btnEndClass.click(function() {
            if (confirm('您确认要结束本次课程吗？')) {
                socket.emit(Event.CLOCK, actionMap.END);
            }
        });

        var methodMap = {};
        methodMap[actionMap.BEGIN] = 'beginClass';
        methodMap[actionMap.PAUSE] = 'pauseClass';
        methodMap[actionMap.RESUME] = 'resumeClass';
        methodMap[actionMap.END] = 'endClass';

        socket.on(Event.CLOCK, function(data) {
            var method = methodMap[data.type];
            if (method) {
                self[method](data);
            } else if (data.type == 'init') {
                self.initState(data);
            } else {
                console.error('Error: unknown clock type [' + data.type + ']');
            }
        });
    },
    initState: function(data) {
        var clockState = data.clock_state;
        var actionMap = this.actionMap;

        if (!clockState) {
            return false;
        }
        if (clockState == actionMap.BEGIN) {
            this.duration = data.offset;
            this.beginClass();
        } else if (clockState == actionMap.PAUSE) {
            this.duration = data.duration;
            this.pauseClass();
        } else if (clockState == actionMap.RESUME) {
            this.duration = data.duration + data.offset;
            this.resumeClass();
        } else if (clockState == actionMap.END) {
            this.duration = data.duration;
            this.endClass();
        }

    },
    _formatNum: function(num) {
        return num > 9 ? num : '0' + num;
    },
    _renderDuration: function() {
        var duration = moment.duration(this.duration);
        var formatNum = this._formatNum;

        duration = formatNum(duration.hours()) + ':' + formatNum(duration.minutes()) + ':' + formatNum(duration.seconds());
        this.timeShow.text(duration);
    },
    _startClock: function() {
        var self = this;
        clearInterval(this.timer);
        this.timer = setInterval(function() {
            self.duration += 1000;
            self._renderDuration();
        }, 1000);
    },
    _stopClock: function() {
        clearInterval(this.timer);
        this._renderDuration();
    },
    // 开始上课
    beginClass: function(data) {
        data = data || {};

        this.btnBeginClass.hide();
        this.btnResumeClass.hide();
        this.btnPauseClass.show().prependTo(this.btnPauseClass.parent());
        this.btnEndClass.show();

        this._startClock();
    },
    pauseClass: function(data) {
        data = data || {};

        this.btnBeginClass.hide();
        this.btnPauseClass.hide();
        this.btnResumeClass.show().prependTo(this.btnPauseClass.parent());
        this.btnEndClass.show();

        this.duration = data.duration || this.duration;
        this._stopClock();
    },
    resumeClass: function(data) {
        data = data || {};

        this.btnBeginClass.hide();
        this.btnResumeClass.hide();
        this.btnPauseClass.show().prependTo(this.btnPauseClass.parent());
        this.btnEndClass.show();

        this._startClock();
    },
    endClass: function(data) {
        data = data || {};
        this.btnBeginClass.attr('disabled', true).hide();
        this.btnPauseClass.attr('disabled', true).hide();
        this.btnResumeClass.attr('disabled', true).hide();
        this.btnEndClass.attr('disabled', true).hide();
        this.btnEndInfo.show();

        this.duration = data.duration || this.duration;
        this._stopClock();
    }
};