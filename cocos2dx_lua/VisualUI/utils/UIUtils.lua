--UI创建模块
module("UIUtils", package.seeall)

local PathTemple = {}

function CheckPathRepeat(node, path)
    local parent = node
    while parent do
        if path == parent._path or path == parent._sceneSubPath then
            return true
        end
        parent = parent:getParent()
    end
    return false
end

function RegisterPathTemple(path, layer)
    PathTemple[path] = layer
end

function GetPathTemple(path)
    return PathTemple[path]
end

function GetCurJsonData(info)
    dump(info)
    if type(info) == "string" then
        local jsonData = UIDataUtils.GetJsonDataFromUI(info)
        if not jsonData then
            return nil
        end
        return jsonData
    elseif type(info) == "table" then
        return info
    end
    return nil
end

function CovertToColor(value)
    if not value or not value[1] or not value[4] then
        return nil
    end
    return cc.c4b(value[1], value[2], value[3], value[4])
end

function AddTouchEvent(node, addFunc, controlNode, baseFunc, touchListener)
    if not controlNode or not baseFunc then
        return
    end
    local listener = baseFunc
    if touchListener and controlNode[touchListener] then
        listener = controlNode[touchListener]
    end

    addFunc(node, handler(controlNode, listener))
end

function CalcWidth(node, width, parent)
    local isWidthPer = false;
    if not width and node then
        width = node:getContentSize().width
    end

    width = tostring(width or 0)
    local index = string.find(width, "%%")
    if not parent or not index then
        return tonumber(width), isWidthPer
    end

    isWidthPer = true
    local str = string.sub(width, 1, index - 1)
    width = parent:getContentSize().width * tonumber(string.sub(width, 1, index - 1)) / 100
    return width, isWidthPer
end

function CalcHeight(node, height, parent)
    local isHeightPer = false;
    if not height and node then
        height = node:getContentSize().height
    end

    height = tostring(height or 0)
    local index = string.find(height, "%%")
    if not parent or not index then
        return tonumber(height), isHeightPer
    end

    isHeightPer = true
    local str = string.sub(height, 1, index - 1)
    height = parent:getContentSize().height * tonumber(string.sub(height, 1, index - 1)) / 100
    return height, isHeightPer
end


function CocosGenBaseNodeByData(data, parent, isSetParent, controlNode)
    if not data then
        return
    end

    local node = nil
    if isSetParent then
        node = parent
    elseif data.path then
        if CheckPathRepeat(parent, data.path) then
            return nil
        end
        local temple = GetPathTemple(data.path)
        print("data.path is " .. data.path)
        dump(temple)
        if not temple then
            temple = UILayer
        end
        node = temple:create(data.path, parent)
    elseif data.type == "UIImage" then
        node = ccui.ImageView:create()
    elseif data.type == "UIScale9" then
        node = ccui.Scale9Sprite:create()
    elseif data.type == "UIText" then
        node = ccui.Text:create()
    elseif data.type == "UITextAtlas" then
        node = ccui.TextAtlas:create()
    elseif data.type == "UIInput" then
        data.spriteFrame = data.spriteFrame or ""
        local width = CalcWidth(node, data.width, parent)
        local height = CalcHeight(node, data.height, parent)
        local frame = GetSpriteFrameForName(data.spriteFrame)
        if not frame then
            node = ccui.EditBox:create(cc.size(width, height),  ccui.Scale9Sprite:create())
        else
            node = ccui.EditBox:create(cc.size(width, height),  data.spriteFrame, 1)
        end

        AddTouchEvent(node, node.onEditHandler, controlNode, controlNode.eventListener, data.touchListener)
        node:setFontSize(14)
    elseif data.type == "UISlider" then
        node = ccui.Slider:create()
        AddTouchEvent(node, node.onEvent, controlNode, controlNode.eventListener, data.touchListener)
    elseif data.type == "UICheckBox" then
        node = ccui.CheckBox:create()
        AddTouchEvent(node, node.onEvent, controlNode, controlNode.eventListener, data.touchListener)
    elseif data.type == "UIButton" then
        node = ccui.Button:create()
        local func = function(node, callback) 
            node:addTouchEventListener(function(sender, eventType)
                local event = {}
                if eventType == 0 then
                    event.name = "began"
                elseif eventType == 1 then
                    event.name = "moved"
                elseif eventType == 2 then
                    event.name = "ended"
                else
                    event.name = "canceled"
                end
                event.target = sender
                callback(event)
            end)
        end
        AddTouchEvent(node, func, controlNode, controlNode.eventListener, data.touchListener)
    else
        node = ccui.Widget:create()
    end

    if type(data.touchEnabled) == "boolean" and node.setTouchEnabled then
        node:setTouchEnabled(data.touchEnabled)
    end
    
    if data.id then
        node:setName(data.id)
        if controlNode then
            if controlNode[data.id] then
                print("WAINING!!! You have same tag name(" .. data.id .. ") node")
            end
            controlNode[data.id] = node
        end
    end
    local _ = data.id and node:setName(data.id)
    if data.width or data.height then
        local setFn = node.setPreferredSize or node.setContentSize
        local width = CalcWidth(node, data.width, parent)
        local height = CalcHeight(node, data.height, parent) tonumber(data.height)
        setFn(node, cc.size(width, height))
    end

    if data.autoLayout then
        if parent and node ~= parent then
            node:setContentSize(parent:getContentSize())
        else
            node:setContentSize(cc.Director:getInstance():getWinSize())
        end
    end

    local _ = data.x and node:setPositionX(tonumber(data.x))
    local _ = data.y and node:setPositionY(tonumber(data.y))

    
    local function calcCompareWidth(node, parent)
        return parent and parent:getContentSize().width or node:getContentSize().width
    end

    local function calcCompareHeight(node, parent)
        return parent and parent:getContentSize().height or node:getContentSize().height
    end

    local _ = data.left and node:setPositionX(tonumber(data.left))
    local _ = data.right and node:setPositionX(calcCompareWidth(node, parent) - tonumber(data.right))
    local _ = data.bottom and node:setPositionY(tonumber(data.bottom))
    local _ = data.top and node:setPositionY(calcCompareHeight(node, parent) - tonumber(data.top))

    local _ = data.horizontal and node:setPositionX(calcCompareWidth(node, parent) / 2 + tonumber(data.horizontal))
    local _ = data.vertical and node:setPositionY(calcCompareHeight(node, parent) / 2 + tonumber(data.vertical))

    if data.anchorX or data.anchorY then
        local anchorX = tonumber(data.anchorX) or node:getAnchorPoint().x
        local anchorY = tonumber(data.anchorY) or node:getAnchorPoint().y
        node:setAnchorPoint(anchorX, anchorY)
    end

    local _ = data.scaleX and node:setScaleX(tonumber(data.scaleX))
    local _ = data.scaleY and node:setScaleY(tonumber(data.scaleY))


    local _ = data.opacity and node:setOpacity(tonumber(data.opacity))
    local _ = data.rotation and node:setRotation(tonumber(data.rotation))

    local _ = data.visible and node:setVisible(data.visible)

    local color = CovertToColor(data.color)
    if color then
        node:setColor(color)
    end

    if data.type == "UIText" then
        local _ = data.string and node:setString(data.string)
        local _ = data.textAlign and node:setTextHorizontalAlignment(data.textAlign)
        local _ = data.verticalAlign and node:setTextVerticalAlignment(data.verticalAlign)
        local _ = data.fontSize and node:setFontSize(data.fontSize)
        local _ = data.fontName and node:setFontName(data.fontName)
        local _ = data.string and node:setString(data.string)
        color = CovertToColor(data.fillStyle)
        local _ = color and node:setFontFillColor(color, true)
        -- color = CovertToColor(data.strokeStyle)
        -- local _ = color and node:setFontFillColor(color, true)

    elseif data.type == "UIInput" then

        local _ = data.string and node:setText(data.string)
        local _ = data.fontSize and node:setFontSize(data.fontSize)
        local _ = data.fontName and node:setFontName(data.fontName)
        color = CovertToColor(data.fontColor)
        local _ = color and node:setFontColor(color)
        local _ = data.maxLength and node:setMaxLength(data.maxLength)
        local _ = data.placeHolder and node:setPlaceHolder(data.placeHolder)
        local _ = data.placeHolderFontSize and node:setPlaceholderFontSize(data.placeHolderFontSize)
        local _ = data.placeHolderFontName and node:setPlaceholderFontName(data.placeHolderFontName)
        local _ = data.inputFlag and node:setInputFlag(data.inputFlag)
        local _ = data.inputMode and node:setInputMode(data.inputMode)
        local _ = data.returnType and node:setReturnType(data.returnType)
    elseif data.type == "UIImage" then
        SetNodeBySpriteFrameName(data.spriteFrame, node, node.loadTexture)

        local _ = data.blendSrc and node:setBlendFunc({src=data.blendSrc, dst=node:getBlendFunc().dst})
        local _ = data.blendDst and node:setBlendFunc({src=node:getBlendFunc().src, dst=data.blendDst})
    elseif data.type == "UIScale9" then
        if data.spriteFrame then
            local size = node:getContentSize()
            SetNodeSpriteFrame(data.spriteFrame, node, node.initWithSpriteFrame)
            if(size.width ~= 0 or size.height ~= 0) then
                node:setPreferredSize(size)
            end
        end
--         data.insetLeft && (node.insetLeft = data.insetLeft);
--         data.insetTop && (node.insetTop = data.insetTop);
--         data.insetRight && (node.insetRight = data.insetRight);
--         data.insetBottom && (node.insetBottom = data.insetBottom);
    elseif data.type == "UISlider" then
        local _ = data.percent and node:setPercent(data.percent)
        
        SetNodeBySpriteFrameName(data.barBg, node, node.loadBarTexture)
        SetNodeBySpriteFrameName(data.barProgress, node, node.loadProgressBarTexture)
        SetNodeBySpriteFrameName(data.barNormalBall, node, node.loadSlidBallTextureNormal)
        SetNodeBySpriteFrameName(data.barSelectBall, node, node.loadSlidBallTexturePressed)
        SetNodeBySpriteFrameName(data.barDisableBall, node, node.loadSlidBallTextureDisabled)
    elseif data.type == "UIButton" then
        local _ = data.scale9Enable and node:setScale9Enabled(data.scale9Enable)

        SetNodeBySpriteFrameName(data.bgNormal, node, node.loadTextureNormal)
        SetNodeBySpriteFrameName(data.bgSelect, node, node.loadTexturePressed)
        SetNodeBySpriteFrameName(data.bgDisable, node, node.loadTextureDisabled)

        local _ = data.titleText and node:setTitleText(data.titleText)
        local _ = data.fontSize and node:setTitleFontSize(data.fontSize)
        local _ = data.fontName and node:setTitleFontName(data.fontName)
        color = CovertToColor(data.fontColor)
        local _ = color and node:setTitleColor(color)
    elseif data.type == "UICheckBox" then
        SetNodeBySpriteFrameName(data.back, node, node.loadTextureBackGround)
        SetNodeBySpriteFrameName(data.backSelect, node, node.loadTextureBackGroundSelected)
        SetNodeBySpriteFrameName(data.active, node, node.loadTextureFrontCross)
        SetNodeBySpriteFrameName(data.backDisable, node, node.loadTextureBackGroundDisabled)
        SetNodeBySpriteFrameName(data.activeDisable, node, node.loadTextureFrontCrossDisabled)

        local _ = data.select and node:setSelected(data.select)
        local _ = data.enable and node:setTouchEnabled(data.enable)
    elseif data.type == "UITextAtlas" then
        if data.charMapFile and cc.FileUtils:getInstance():isFileExist(data.charMapFile) then
            local mapStar = string.byte('0')
            if type(data.mapStartChar) == "number" then
                mapStar = data.mapStartChar
            else
                mapStar = string.byte(data.mapStartChar)
            end
            node:setProperty(data.string, data.charMapFile, data.itemWidth, data.itemHeight, mapStar)
        end
    end


    for _,subdata in ipairs(data.children or {}) do
        local child = CocosGenBaseNodeByData(subdata, node, false, controlNode)
        if child then
            node:addChild(child)
        end
    end

    return node
end

function SetNodeBySpriteFrameName(name, node, func, resType)
    if not name then
        return
    end
    local frame = GetSpriteFrameForName(name)
    if not frame then
        return
    end

    func(node, name, resType or 1)
end

function SetNodeSpriteFrame(name, node, func)
    if not name then
        return
    end
    local frame = GetSpriteFrameForName(name)
    if not frame then
        return
    end

    func(node, frame)
end

function GetSpriteFrameForName(name)
    if type(name) ~= "string" then
        return nil
    end

    local frame = cc.SpriteFrameCache:getInstance():getSpriteFrameByName(name)
    if not frame then
        local filePath = cc.FileUtils:getInstance():fullPathForFilename(name)
        if string.len(filePath) == 0 then
            return nil
        end
        local sprite = cc.Sprite:create(filePath)
        if not sprite then
            return nil
        end
        frame = cc.SpriteFrame:createWithTexture(sprite:getTexture(), sprite:getTextureRect())
        cc.SpriteFrameCache:getInstance():addSpriteFrame(frame, name)
    end
    return frame
end
