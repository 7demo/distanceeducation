var Shape = {};
(function(Kinetic) {

    Shape.Triangle = function(config) {
        this._initTriangle(config);
    }

    Shape.Triangle.prototype = {
        _initTriangle: function(config) {
            config.drawFunc = this.drawTriangle;
            Kinetic.Shape.call(this, config);
            this.classType = "Triangle";
            console.log(this);
        },
        drawTriangle: function(context) {
            context.beginPath();
            context.moveTo(200, 50);
            context.lineTo(420, 80);
            context.quadraticCurveTo(300, 100, 260, 170);
            context.closePath();
            context.fillStrokeShape(this);
        }
    };

    Kinetic.Util.extend(Shape.Triangle, Kinetic.Shape);


    Kinetic.Eraser = function(config) {
        if (!config.id) config.id = guid();
        if (!config.id) return;
        this.____init(config);
    };
    Kinetic.Eraser.prototype = {
        ____init: function(config) {
            config.stroke = '#000';

            Kinetic.Line.call(this, config);
            this.className = 'Eraser';
        },
        _sceneFunc: function(context) {
            var ctx = context._context;
            ctx.save();
            ctx.globalCompositeOperation = 'destination-out';
            Kinetic.Line.prototype._sceneFunc.call(this, context);
            ctx.restore();
        }
    };
    Kinetic.Util.extend(Kinetic.Eraser, Kinetic.Line);

    // Kinetic.SelectableText = function(config) {
    // 	if (!config.id) config.id = guid();
    // 	this.____init(config);
    // };
    // var _controlPoints, lastReservedTextOverlay;
    // Kinetic.SelectableText.prototype = {
    // 	____init: function(config) {
    // 		config.draggable = true;
    // 		Kinetic.Text.call(this, config);
    // 		this.className = 'SelectableText';
    // 		var wider = 11,
    // 			borderWidth = 1,
    // 			cpWidth = 10,
    // 			self = this;
    // 		this._isUpdating = false;
    // 		this._isNew = false;
    // 		this.hitFunc(function(context) {
    // 			// set the hit-test area wider than the text area;
    // 			var width = this.getWidth() + wider * 2,
    // 				height = this.getHeight() + wider * 2;
    // 			context.beginPath();
    // 			context.rect(-wider, -wider, width, height);
    // 			context.closePath();
    // 			context.fillStrokeShape(this);
    // 		});
    // 		var outlineColor = '#6B63C7',
    // 			_textarea;
    // 		var _setDragPosition = this._setDragPosition;
    // 		this._setDragPosition = function() {
    // 			if (Room.Boards[Room.curPage].tool != Toolkit.Hand) return;
    // 			_setDragPosition.apply(self, arguments);
    // 		};
    // 		this.on('mouseenter', function() {
    // 			if (Room.Boards[Room.curPage].tool != Toolkit.Hand) return;
    // 			if (this == lastReservedTextOverlay) return;
    // 			if (lastReservedTextOverlay == null && _controlPoints) {
    // 				return;
    // 			}
    // 			lastReservedTextOverlay = null;
    // 			if (_controlPoints) {
    // 				_controlPoints.destroyChildren();
    // 				_controlPoints.destroy();
    // 				_controlPoints.remove();
    // 				_controlPoints = null;
    // 			}
    // 			var pos = self.getPosition(),
    // 				width = self.getWidth() + 2 * wider,
    // 				height = self.getHeight() + 2 * wider;
    // 			_controlPoints = new Kinetic.Group({
    // 				x: pos.x - wider,
    // 				y: pos.y - wider,
    // 				width: width,
    // 				height: height,
    // 				listening: false
    // 			});
    // 			_controlPoints.add(new Kinetic.Rect({
    // 				x: wider - borderWidth,
    // 				y: wider - borderWidth,
    // 				width: self.getWidth() + 2 * borderWidth,
    // 				height: self.getHeight() + 2 * borderWidth,
    // 				strokewidth: borderWidth,
    // 				stroke: outlineColor,
    // 				listening: false
    // 			}), /*1*/ new Kinetic.Rect({
    // 				x: wider - borderWidth - cpWidth / 2,
    // 				y: wider - borderWidth - cpWidth / 2,
    // 				width: cpWidth,
    // 				height: cpWidth,
    // 				fill: outlineColor,
    // 				listening: true
    // 			}), new Kinetic.Rect({
    // 				x: wider - borderWidth + (-cpWidth + self.getWidth()) / 2,
    // 				y: wider - borderWidth - cpWidth / 2,
    // 				width: cpWidth,
    // 				height: cpWidth,
    // 				fill: outlineColor,
    // 				listening: true
    // 			}), new Kinetic.Rect({
    // 				x: wider - borderWidth - cpWidth / 2 + self.getWidth(),
    // 				y: wider - borderWidth - cpWidth / 2,
    // 				width: cpWidth,
    // 				height: cpWidth,
    // 				fill: outlineColor,
    // 				listening: true
    // 			}), /*2*/ new Kinetic.Rect({
    // 				x: wider - borderWidth - cpWidth / 2,
    // 				y: wider - borderWidth + (self.getHeight() - cpWidth) / 2,
    // 				width: cpWidth,
    // 				height: cpWidth,
    // 				fill: outlineColor,
    // 				listening: true
    // 			}), new Kinetic.Rect({
    // 				x: wider - borderWidth + (-cpWidth) / 2 + self.getWidth(),
    // 				y: wider - borderWidth + (self.getHeight() - cpWidth) / 2,
    // 				width: cpWidth,
    // 				height: cpWidth,
    // 				fill: outlineColor,
    // 				listening: true
    // 			}), /*3*/ new Kinetic.Rect({
    // 				x: wider - borderWidth - cpWidth / 2,
    // 				y: wider - borderWidth - (cpWidth) / 2 + self.getHeight(),
    // 				width: cpWidth,
    // 				height: cpWidth,
    // 				fill: outlineColor,
    // 				listening: true
    // 			}), new Kinetic.Rect({
    // 				x: wider - borderWidth + (-cpWidth + self.getWidth()) / 2,
    // 				y: wider - borderWidth - cpWidth / 2 + self.getHeight(),
    // 				width: cpWidth,
    // 				height: cpWidth,
    // 				fill: outlineColor,
    // 				listening: true
    // 			}), new Kinetic.Rect({
    // 				x: wider - borderWidth - cpWidth / 2 + self.getWidth(),
    // 				y: wider - borderWidth - cpWidth / 2 + self.getHeight(),
    // 				width: cpWidth,
    // 				height: cpWidth,
    // 				fill: outlineColor,
    // 				listening: true
    // 			}));

    // 			var layer = this.getLayer();
    // 			layer.add(_controlPoints).draw();
    // 		}).on('mouseleave', function() {
    // 			if (lastReservedTextOverlay == this) return;
    // 			if (_controlPoints) {
    // 				_controlPoints.destroyChildren();
    // 				_controlPoints.destroy();
    // 				_controlPoints.remove();
    // 				_controlPoints = null;
    // 				this.getLayer().draw();
    // 			}
    // 		}).on('dragmove', function() {
    // 			if (Room.Boards[Room.curPage].tool != Toolkit.Hand) return;
    // 			var pos = self.getPosition();
    // 			if (_controlPoints) {
    // 				pos.x -= wider;
    // 				pos.y -= wider;
    // 				_controlPoints.position(pos);
    // 				_controlPoints.draw();
    // 				Action.send(ActionType.MOVETEXT, {
    // 					id: self.getId(),
    // 					pos: pos
    // 				});
    // 			}
    // 		}).on('click', function() {
    // 			lastReservedTextOverlay = this;
    // 			if (_controlPoints == null) return;
    // 			_controlPoints.listening(true);
    // 			var children = _controlPoints.getChildren(),
    // 				oldCursor,
    // 				$container = $('#' + Room.Boards[Room.curPage].container);
    // 			var cursors = ['nw-resize', 'n-resize', 'ne-resize', 'w-resize', 'e-resize', 'sw-resize', 's-resize', 'se-resize'];
    // 			for (var i = 0, len = cursors.length; i < len; i++) {
    // 				(function(cur) {
    // 					children[i + 1].on('mouseenter', function() {
    // 						//oldCursor = $container.css('cursor');
    // 						//$container.css('cursor', cur);
    // 					}).on('mouseleave', function() {
    // 						//$container.css('cursor', oldCursor);
    // 					});
    // 				})(cursors[i]);
    // 			}
    // 			_controlPoints.draw();
    // 		}).on('dblclick', function() {
    // 			if (this._isNew) return;
    // 			this.isUpdating = true;
    // 			var pos = this.getPosition();
    // 			var board = Room.Boards[Room.curPage];
    // 			_textarea = $('<textarea class="board-text"></textarea>');
    // 			_textarea.css({
    // 				left: pos.x,
    // 				top: pos.y,
    // 				width: this.getWidth(),
    // 				height: this.getHeight(),
    // 				color: board.color,
    // 				'font-size': (board.weight * board.baseFontSize)
    // 			}).focusout(function() {
    // 				newText = _textarea.val().trim();
    // 				self.setText(_textarea.val());
    // 				Action.send(ActionType.UPDATETEXT, {
    // 					id: self.getId(),
    // 					newText: newText
    // 				});
    // 				self.getLayer().draw();
    // 				_textarea.remove();
    // 			});
    // 			_textarea.val(this.getText());
    // 			$('#' + board.container).append(_textarea);
    // 		});
    // 	}
    // };
    // Kinetic.Util.extend(Kinetic.SelectableText, Kinetic.Text);
    // Kinetic.Util.addMethods(Kinetic.SelectableText, {
    // 	isUpdating: function(arg) {
    // 		if (arg != undefined) this._isUpdating = arg;
    // 		else return this._isUpdating;
    // 	},
    // 	isNew: function(arg) {
    // 		if (arg != undefined) this._isNew = arg;
    // 		else return this._isNew;
    // 	}
    // });
    // $(document).keydown(function(e) {
    // 	if (e.which == 46 && lastReservedTextOverlay != null) {
    // 		if (_controlPoints) {
    // 			_controlPoints.destroyChildren();
    // 			_controlPoints.destroy();
    // 			_controlPoints = null;
    // 		}
    // 		var layer = lastReservedTextOverlay.getLayer();
    // 		var data = {
    // 			id: lastReservedTextOverlay.getId()
    // 		};
    // 		lastReservedTextOverlay.destroy();
    // 		lastReservedTextOverlay = null;
    // 		layer.draw();
    // 		Action.send(ActionType.DELETETEXT, data);
    // 	}
    // });
})(Kinetic);