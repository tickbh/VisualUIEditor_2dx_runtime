
UIUtils = {}

var CacheDataTable = {}
var PathTemple = {}

UIUtils.isNum =  function(value) {
  return typeof value == 'number'
}

UIUtils.isNull = function(value) {
  return value === null || value === undefined
}

UIUtils.isValue = function(value) {
  return !UIUtils.isNull(value)
}

UIUtils.CheckPathRepeat = function(node, path) {
    var parent = node;
    while(parent) {
        if(path == parent._path || path == parent._sceneSubPath) {
            return true
        }
        parent = parent.getParent();
    }
    return false;
}

UIUtils.RegisterPathTemple = function(path, layer) {
    PathTemple[path] = layer
}

UIUtils.GetPathTemple = function(path) {
    return PathTemple[path]
}

UIUtils.GetCurJsonData = function(info, callback) {
    if(typeof(info) == "string") {
        UIDataUtils.GetJsonDataFromFile(info, callback)
    } else if(typeof(info) == "object") {
        callback(null, info)
    } else {
        callback(null, {});
    }
}

UIUtils.TryAddWaitUILoaded = function(data, node, parent) {
    if(!data.path || !node) {
        return;
    }
    if(node.getParent()) {
        parent = null
    }
    while(parent) {
        if(parent instanceof UILayer) {
            parent._addWaitPath(data.path)
        }
        parent = parent.getParent();
    }
    parent = node;
    while(parent) {
        if(parent instanceof UILayer) {
            parent._addWaitPath(data.path)
        }
        parent = parent.getParent();
    }
}

UIUtils.TryNoticeUILoaded = function(data, node) {
    if(!data.path || !node) {
        return;
    }
    var parent = node;
    while(parent) {
        if(parent instanceof UILayer) {
            parent.uiLoaded(data.path)
            parent._subUILoaded(data.path)
        }
        parent = parent.getParent();
    }
}

UIUtils.CalcNeedLoadImage = function(data) {
    var result = this.GetNeedLoadImage(data);
    var list = []
    for(var k in result) {
        list.push(k)
    }
    return list;
}

UIUtils.GetNeedLoadImage = function(data, result) {
    result = result || {};

    var _addImage = function(image) {
        if(image) {
            result[UIDataUtils.CalcUIPath(image)] = true
        }
    };

    if(data.type == "UIInput") {
        _addImage(data.spriteFrame);
    } else if(data.type == "UIImage") {
        _addImage(data.spriteFrame);
    } else if(data.type == "UIScale9") {
        _addImage(data.spriteFrame);
    } else if(data.type == "UISlider") {
        _addImage(data.barBg);
        _addImage(data.barProgress);
        _addImage(data.barNormalBall);
        _addImage(data.barSelectBall);
        _addImage(data.barDisableBall);
    } else if(data.type == "UIButton") {
        _addImage(data.bgNormal);
        _addImage(data.bgSelect);
        _addImage(data.bgDisable);
    } else if(data.type == "UICheckBox") {
        _addImage(data.back);
        _addImage(data.backSelect);
        _addImage(data.active);
        _addImage(data.backDisable);
        _addImage(data.activeDisable);
    } else if(data.type == "UITextAtlas") {
        _addImage(data.charMapFile);
    }
    data.children = data.children || {}
    for(var i = 0; i < data.children.length; i++) {
        UIUtils.GetNeedLoadImage(data.children[i], result)
    }
    return result;
}

UIUtils.CovertToColor = function(value) {
    if(!value || UIUtils.isNull(value[1])) {
        return null;
    }
    return cc.color(value[0], value[1], value[2], value[3])
}

UIUtils.CalcWidth = function(node, width, parent) {
    var isWidthPer = false;
    if(UIUtils.isNull(width) && node) {
        width = node.getContentSize().width;
    }

    width = "" + (width || 0)
    var index = width.indexOf("%")
    if(!parent || index < 0) {
        return parseInt(width)
    }

    var str = width.substring(0, index);
    width = parent.getContentSize().width * parseFloat(str) / 100
    return parseInt(width)
}

UIUtils.CalcHeight = function(node, height, parent) {
    if(UIUtils.isNull(height) && node) {
        height = node.getContentSize().height;
    }

    height = "" + (height || 0)
    var index = height.indexOf("%")
    if(!parent || index < 0) {
        return parseInt(height)
    }

    var str = height.substring(0, index);
    height = parent.getContentSize().height * parseFloat(str) / 100
    return parseInt(height)
}

UIUtils.GetControlNode = function(node, parent) {
    if(node.isControlNode) {
        return node;
    }
    var controlNode = null;
    while(parent) {
        if(parent instanceof UILayer && parent.isControlNode) {
            controlNode = parent;
            break;
        }
        parent = parent.getParent();
    }
    if(!controlNode) {
        return node;
    }
    return controlNode;

}

UIUtils.AddTouchEvent = function(node, addFunc, controlNode, baseFunc, touchListener) {
    if(!controlNode || !baseFunc) {
        return;
    }
    var listener = baseFunc;
    if(touchListener && controlNode[touchListener]) {
        listener = controlNode[touchListener]
    }

    addFunc(node, function(event) {
        listener.call(controlNode, event)
    })
}

UIUtils.addTouchListenerCallback = function(node, callback) {
    node.addTouchEventListener(function(sender, eventType) {
        var event = {}
        if(eventType == 0) {
            event.name = "began"
        } else if(eventType == 1) {
            event.name = "moved"
        } else if(eventType == 2) {
            event.name = "ended"
            playEffect("btn_click.mp3")
        } else {
            event.name = "canceled"
        }
        event.target = sender
        callback(event)
    })
}

UIUtils.onSliderEvent = function(node, callback) {
    node.addEventListener(function(sender, eventType) {
        var event = {}
        if(eventType == ccui.Slider.EVENT_PERCENT_CHANGED) {
            event.name = "ON_PERCENTAGE_CHANGED"
        }
        event.target = sender
        callback(event)
    })
}


UIUtils.onCheckBoxEvent = function(node, callback) {
    node.addEventListener(function(sender, eventType) {
        var event = {}
        if(eventType == ccui.CheckBox.EVENT_SELECTED) {
            event.name = "selected"
        } else {
            event.name = "unselected"
        }
        event.target = sender;
        callback(event)
    })
}

UIUtils.onEditboxEvent = function(node, callback) {
    var event = {}
    var delegate = {
        editBoxEditingDidBegin: function(sender) {
            event.name = "begin"
            event.target = sender
            callback(event)
        },

        editBoxEditingDidEnd: function (sender) {
            event.name = "end"
            event.target = sender
            callback(event)
        },

        editBoxTextChanged: function (sender, text) {
            event.name = "changed"
            event.target = sender
            callback(event)
        },

        editBoxReturn: function (sender) {
            event.name = "return"
            event.target = sender
            callback(event)
        }
    }

    node.setDelegate(delegate);
}


UIUtils.CocosGenBaseNodeByData = function(data, node, parent, controlNode) {
    if(!data) {
        return null;
    }
    var color = null;
    var isTouchEnable = false;
    if (data.touchEnabled) {
        isTouchEnable = data.touchEnabled
    }
    var self = this;
    if(node) {
    } else if(data.path) {
        UIUtils.TryAddWaitUILoaded(data, parent);
        if(this.CheckPathRepeat(parent, data.path)) {
            return null;
        }
        var temple = this.GetPathTemple(data.path);
        if(!temple) {
            temple = UILayer;
        }
        node = temple.create(data.path, parent, controlNode);

        if (isTouchEnable) {
            this.AddTouchEvent(node, this.addTouchListenerCallback, controlNode, controlNode.eventListener, data.touchListener)
        }
    } else if(data.type == "UIImage") {
        node = ccui.ImageView.create();
        if (isTouchEnable) {
            this.AddTouchEvent(node, this.addTouchListenerCallback, controlNode, controlNode.eventListener, data.touchListener)
        }
    } else if(data.type == "UIScale9") {
        node = ccui.Scale9Sprite.create(UIDataUtils.CalcUIPath(data.spriteFrame));

        
    } else if(data.type == "UIText") {
        node = ccui.Text.create();
    } else if(data.type == "UITextAtlas") {
        node = ccui.TextAtlas.create();
    } else if(data.type == "UIArmature") {
        if(data.plistPath) {
            cc.spriteFrameCache.addSpriteFrames(UIDataUtils.CalcUIPath(data.plistPath), UIDataUtils.CalcUIPath(data.imagePath))
        }
        if(data.configFilePath) {
            ccs.armatureDataManager.addArmatureFileInfo(UIDataUtils.CalcUIPath(data.configFilePath));
        }
        node = ccs.Armature.create(data.actionName)
    } else if(data.type == "UIInput") {
        var spriteFrame = UIDataUtils.CalcUIPath(data.spriteFrame) || "";
        var width = this.CalcWidth(node, data.width, parent)
        var height = this.CalcHeight(node, data.height, parent)
        if(spriteFrame) {
            node = cc.EditBox.create(cc.size(width, height), ccui.Scale9Sprite.create(spriteFrame))
        } else {
            node = cc.EditBox.create(cc.size(width, height), ccui.Scale9Sprite.create())
        }
        data.isSizeSeted = true
        node.setFontSize(14)
        this.AddTouchEvent(node, this.onEditboxEvent, controlNode, controlNode.eventListener, data.touchListener)
    } else if(data.type == "UISlider") {
        node = ccui.Slider.create()
        // node.setTouchEnabled(true)
        this.AddTouchEvent(node, this.onSliderEvent, controlNode, controlNode.eventListener, data.touchListener)
    } else if(data.type == "UIButton") {
        node = ccui.Button.create()
        this.AddTouchEvent(node, this.addTouchListenerCallback, controlNode, controlNode.eventListener, data.touchListener)
    } else if(data.type == "UICheckBox") {
        node = ccui.CheckBox.create()
        this.AddTouchEvent(node, this.onCheckBoxEvent, controlNode, controlNode.eventListener, data.touchListener)
    } else if(data.type == "UIScrollView") {
        node = ccui.ScrollView.create()
        if (isTouchEnable) {
            this.AddTouchEvent(node, this.addTouchListenerCallback, controlNode, controlNode.eventListener, data.touchListener)
        }
    } else if(data.type == "UIListView") {
        node = ccui.ListView.create()
        if (isTouchEnable) {
            this.AddTouchEvent(node, this.addTouchListenerCallback, controlNode, controlNode.eventListener, data.touchListener)
        }
    } else if(data.type == "UIRichText") {
        var config = {}
        if(data.oriFontSize){
            config.fontSize = data.oriFontSize
        }
        if(data.oriOSize){
            config.osize = data.oriOSize
        }

        var color = this.CovertToColor(data.oriColor)
        if(color){
            config.color = color
        }

        color = this.CovertToColor(data.oriOColor)
        if(color){
            config.ocolor = color
        }
        var text = data.text || ""
        var analyse = UIDataUtils.TryAnalyseLang(text)
        if(analyse.isKey){
            text = analyse.value
        } else {
            text = data.text
        }
        var width = this.CalcWidth(node, data.width, parent)
        var height = this.CalcHeight(node, data.height, parent)
        node = new UIRichText(data.text || "", {width:width, height:height}, config)
    } else {
        node = ccui.Widget.create()
        if (isTouchEnable) {
            this.AddTouchEvent(node, this.addTouchListenerCallback, controlNode, controlNode.eventListener, data.touchListener)
        }
    }

    if(parent && !node.getParent()) {
        parent.addChild(node)
    }

    if(node._isWaitLoad) {
        var self = this;
        var listener = cc.eventManager.addCustomListener("Loaded:" + node.__instanceId, function() {
            self.SetBaseNodeProp(node, data, parent, controlNode);
            cc.eventManager.removeListener(listener);
        })
    } else {
        this.SetBaseNodeProp(node, data, parent, controlNode);
    }

    data.children = data.children || {}
    for(var i = 0; i < data.children.length; i++) {
        var subdata = data.children[i];
        var child = this.CocosGenBaseNodeByData(subdata, null, node, controlNode)
        
    }
    return node;
}

UIUtils.SetBaseNodeProp = function(node, data, parent, controlNode) {
    if(typeof(data.touchEnabled) == "boolean" && node.setTouchEnabled) {
        node.setTouchEnabled(data.touchEnabled)
    }

    if(data.id) {
        node.setName(data.id);
        if(controlNode) {
            if(controlNode[data.id]) {
                console.log("WAINING!!! You have same tag name(" + data.id + ") node")
            }
            controlNode[data.id] = node
        }
    }

    if(!data.isSizeSeted && (data.width || data.height)) {
        var setFn = node.setPreferredSize || node.setContentSize
        var width = this.CalcWidth(node, data.width, parent)
        var height = this.CalcHeight(node, data.height, parent)
        setFn.call(node, cc.size(width, height))
    }

    if(data.autoLayout) {
        if(parent && node != parent){
            node.setContentSize(parent.getContentSize())
        } else {
            node.setContentSize(cc.winSize)
        }
    }

    var isNull = this.isNull;
    var CovertToColor = this.CovertToColor;

    (!isNull(data.x)) && (node.x = parseFloat(data.x));
    (!isNull(data.y)) && (node.y = parseFloat(data.y));

  ;(!isNull(data.left)) && (node.x = parseFloat(data.left), node.left = data.left)
  ;(!isNull(data.right) && parent) && (node.x = parent.width - parseFloat(data.right), node.right = data.right)
  ;(!isNull(data.horizontal) && parent) && (node.x = parent.width / 2 + data.horizontal, node.horizontal = data.horizontal)

  ;(!isNull(data.bottom)) && (node.y = parseFloat(data.bottom), node.bottom = data.bottom)
  ;(!isNull(data.top) && parent) && (node.y = parent.height - parseFloat(data.top), node.top = data.top)
  ;(!isNull(data.vertical) && parent) && (node.y = parent.height / 2 + data.vertical, node.vertical = data.vertical)

  ;(!isNull(data.anchorX)) && (node.anchorX = parseFloat(data.anchorX))
  ;(!isNull(data.anchorY)) && (node.anchorY = parseFloat(data.anchorY))

  ;(!isNull(data.scaleX)) && (node.scaleX = parseFloat(data.scaleX))
  ;(!isNull(data.scaleY)) && (node.scaleY = parseFloat(data.scaleY))

  ;(!isNull(data.opacity)) && (node.opacity = parseFloat(data.opacity))
  ;(!isNull(data.rotation)) && (node.rotation = parseFloat(data.rotation))

  ;(!isNull(data.visible)) && node.setVisible(data.visible)

  ;(CovertToColor(data.color)) && (node.color = CovertToColor(data.color))

  ;(!isNull(data.touchListener)) && (node.touchListener = data.touchListener)

  if(data.path) {
    data.setCustomData && data.setCustomData(data);
  } else if(data.type == "UIText") {
    if(data.string) {
        var analyse = UIDataUtils.TryAnalyseLang(data.string)
        if(analyse.isKey) {
            node.setString(analyse.value)
        } else {
            node.setString(data.string)
        }
    }
    data.textAlign && node.setTextHorizontalAlignment(data.textAlign)
    data.verticalAlign && node.setTextVerticalAlignment(data.verticalAlign)
    data.fontSize && node.setFontSize(data.fontSize)
    data.fontName && node.setFontName(data.fontName)
    color = CovertToColor(data.outlineColor)
    color && node.enableOutline(color, data.outlineSize || 1)
    if(data.boundingWidth || data.boundingHeight) {
        node.setTextAreaSize(cc.size(data.boundingWidth || 0, data.boundingHeight || 0))
    }
  } else if(data.type == "UIInput") {
    data.string && node.setString(data.string)
    data.fontSize && node.setFontSize(data.fontSize)
    data.fontName && node.setFontName(data.fontName)
    color = CovertToColor(data.fontColor)
    color && node.setFontColor(color)
    data.maxLength && node.setMaxLength(data.maxLength)
    data.placeHolder && node.setPlaceHolder(data.placeHolder)
    data.placeHolderFontSize && node.setPlaceholderFontSize(data.placeHolderFontSize)
    data.placeHolderFontName && node.setPlaceholderFontName(data.placeHolderFontName)
    data.inputFlag && node.setInputFlag(parseInt(data.inputFlag))
    data.inputMode && node.setInputMode(parseInt(data.inputMode))
    data.returnType && node.setReturnType(parseInt(data.returnType))
  } else if(data.type == "UIImage") {
    this.SetNodeBySpriteFrameName(data.spriteFrame, node, node.loadTexture)
    data.blendSrc && node.setBlendFunc({src:data.blendSrc, dst:node.getBlendFunc().dst})
    data.blendDst && node.setBlendFunc({src:node.getBlendFunc().src, dst:data.blendDst})
  } else if(data.type == "UIScale9") {
    // if(data.spriteFrame) {
    //     var size = node._cachePreferredSize || node.getPreferredSize()
    //     this.SetNodeBySpriteFrame(data.spriteFrame, node, function(frame) {
    //         node.initWithSpriteFrame(frame);
    //         if(size.width != 0 || size.height != 0) {
    //             node.setPreferredSize(size)
    //         }
    //     })
    // }

    data.insetLeft && (node.insetLeft = data.insetLeft);
    data.insetTop && (node.insetTop = data.insetTop);
    data.insetRight && (node.insetRight = data.insetRight);
    data.insetBottom && (node.insetBottom = data.insetBottom);

  } else if(data.type == "UISlider") {
    data.percent && node.setPercent(data.percent)
    
    this.SetNodeBySpriteFrameName(data.barBg, node, node.loadBarTexture)
    this.SetNodeBySpriteFrameName(data.barProgress, node, node.loadProgressBarTexture)
    this.SetNodeBySpriteFrameName(data.barNormalBall, node, node.loadSlidBallTextureNormal)
    this.SetNodeBySpriteFrameName(data.barSelectBall, node, node.loadSlidBallTexturePressed)
    this.SetNodeBySpriteFrameName(data.barDisableBall, node, node.loadSlidBallTextureDisabled)
  } else if(data.type == "UIButton") {
    data.scale9Enable && node.setScale9Enabled(data.scale9Enable)

    this.SetNodeBySpriteFrameName(data.bgNormal, node, node.loadTextureNormal)
    this.SetNodeBySpriteFrameName(data.bgSelect, node, node.loadTexturePressed)
    this.SetNodeBySpriteFrameName(data.bgDisable, node, node.loadTextureDisabled)

    data.titleText && node.setTitleText(data.titleText)
    data.fontSize && node.setTitleFontSize(data.fontSize)
    data.fontName && node.setTitleFontName(data.fontName)
    color = CovertToColor(data.fontColor)
    color && node.setTitleColor(color)
  } else if(data.type == "UICheckBox") {
    this.SetNodeBySpriteFrameName(data.back, node, node.loadTextureBackGround)
    this.SetNodeBySpriteFrameName(data.backSelect, node, node.loadTextureBackGroundSelected)
    this.SetNodeBySpriteFrameName(data.active, node, node.loadTextureFrontCross)
    this.SetNodeBySpriteFrameName(data.backDisable, node, node.loadTextureBackGroundDisabled)
    this.SetNodeBySpriteFrameName(data.activeDisable, node, node.loadTextureFrontCrossDisabled)

    data.select && node.setSelected(data.select)
    data.enable && node.setTouchEnabled(data.enable)
  } else if(data.type == "UITextAtlas") {
      if (data.charMapFile) {
          node.uiData = data
          node.setProperty(data.string, UIDataUtils.CalcUIPath(data.charMapFile), data.itemWidth, data.itemHeight, data.mapStartChar)
      }
  } else if( data.type == "UIArmature" ){
      node.getAnimation().play("stand",-1,1);
  } else if(data.type == "UIScrollView" || data.type == "UIListView") {
    node.setClippingType(1);
    if(data.innerPosX || data.innerPosY) {
        node.setInnerContainerPosition(cc.p(data.innerPosX || 0, data.innerPosY || 0));
    }

    if(data.innerSizeW || data.innerSizeH) {        
        node.setInnerContainerSize(cc.size(data.innerSizeW || 0, data.innerSizeH || 0));
    }

    data.direction && node.setDirection(data.direction)
    typeof(data.scrollBarEnabled) == "boolean" && node.setScrollBarEnabled(data.scrollBarEnabled)
    typeof(data.inertiaScrollEnabled) == "boolean" && node.setInertiaScrollEnabled(data.inertiaScrollEnabled)
    typeof(data.bounceEnabled) == "boolean" && node.setBounceEnabled(data.bounceEnabled)
  } else if(data.type == "UIRichText") {
    data.textAlign && node.setTextHorizontalAlignment(data.textAlign)
    data.verticalAlign && node.setTextVerticalAlignment(data.verticalAlign)
  }

    if(data.type == "UIListView") {
        data.gravity && node.setGravity(data.gravity)
        data.itemsMargin && node.setItemsMargin(data.itemsMargin)
    }

    // UIUtils.TryNoticeUILoaded(data, controlNode);

  return node
}

UIUtils.SetNodeBySpriteFrame = function(name, node, func) {

    if(!name) {
        return
    }
    name = UIDataUtils.CalcUIPath(name)
    var frame = this.GetSpriteFrameForName(name)
    if(!frame) {
        return
    }

    func.call(node, frame)
}

UIUtils.SetNodeBySpriteFrameName = function(name, node, func, resType) {

    if(!name) {
        return
    }

    name = UIDataUtils.CalcUIPath(name)

    var frame = this.GetSpriteFrameForName(name)
    if(!frame) {
        return
    }

    func.call(node, name, resType || 1)
}

UIUtils.GetSpriteFrameForName = function(name) {
    if(typeof(name) != "string") {
        return null
    }

    var frame = cc.spriteFrameCache.getSpriteFrame(name)
    if(!frame) {
        var texture = cc.textureCache.getTextureForKey(name);
        if(texture) {
            frame = cc.SpriteFrame.create(texture, cc.rect(0, 0, texture.getContentSize().width, texture.getContentSize().height));
            cc.spriteFrameCache.addSpriteFrame(frame, name);
        }
    }
    return frame;
}

UIUtils.GetTextureForName = function(name) {
    if(typeof(name) != "string") {
        return null
    }

    var texture = cc.textureCache.getTextureForKey(name)
    return texture;
}


UIUtils.merge = function(src, t) {
    if(typeof(src) != "object" || typeof(t) != "object") {
        return src
    }
    for(var k in t) {
        src[k] = t[k]
    }
    return src
}

UIUtils.dup = function(t) {
    if(typeof(t) != "object") {
        return t
    }
    var new_t = {}
    for(var k in t) {
        new_t[k] = t[k]
    }
    return new_t
}

