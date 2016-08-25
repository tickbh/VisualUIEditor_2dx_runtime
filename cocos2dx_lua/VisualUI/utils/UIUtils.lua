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
    elseif data.type == "Sprite" then
        node = cc.Sprite:create()
    elseif data.type == "Scale9" then
        node = ccui.Scale9Sprite:create()
    elseif data.type == "LabelTTF" then
        node = cc.LabelTTF:create()
    elseif data.type == "Input" then
        data.spriteBg = data.spriteBg or ""
        local frame = GetSpriteFrameForName(data.spriteBg)
        if not frame then
            node = ccui.EditBox:create(cc.size(100, 20),  ccui.Scale9Sprite:create())
        else
            node = ccui.EditBox:create(cc.size(100, 20),  data.spriteBg, 1)
        end

        AddTouchEvent(node, node.onEditHandler, controlNode, controlNode.eventListener, data.touchListener)
        node:setFontSize(14)
    elseif data.type == "Slider" then
        node = ccui.Slider:create()
        AddTouchEvent(node, node.onEvent, controlNode, controlNode.eventListener, data.touchListener)
    elseif data.type == "CheckBox" then
        node = ccui.CheckBox:create()
        AddTouchEvent(node, node.onEvent, controlNode, controlNode.eventListener, data.touchListener)
    elseif data.type == "Button" then
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
        node = cc.Node:create()
    end

    if type(data.touchEnabled) == "boolean" and node.setTouchEnabled then
        node:setTouchEnabled(data.touchEnabled)
    end
 
    local _ = data.id and node:setName(data.id)
    if data.width or data.height then
        local setFn = node.setPreferredSize or node.setContentSize
        local width = tonumber(data.width) or node.getContentSize().width
        local height = tonumber(data.height) or node.getContentSize().height
        setFn(node, cc.size(width, height))
    end

    local _ = data.x and node:setPositionX(tonumber(data.x))
    local _ = data.y and node:setPositionY(tonumber(data.y))

    local _ = data.left and node:setPositionX(tonumber(data.left))
    local _ = data.right and parent and node:setPositionX(parent.getContentSize().width - tonumber(data.right))

    local _ = data.bottom and node:setPositionY(tonumber(data.bottom))
    local _ = data.top and parent and node:setPositionY(parent.getContentSize().height - tonumber(data.top))

    if data.anchorX or data.anchorY then
        local anchorX = tonumber(data.anchorX) or node.getAnchorPoint().x
        local anchorY = tonumber(data.anchorY) or node.getAnchorPoint().y
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

    if data.type == "LabelTTF" then
        local _ = data.string and node:setString(data.string)
        local _ = data.textAlign and node:setHorizontalAlignment(data.textAlign)
        local _ = data.verticalAlign and node:setVerticalAlignment(data.verticalAlign)
        local _ = data.fontSize and node:setFontSize(data.fontSize)
        local _ = data.fontName and node:setFontName(data.fontName)
        local _ = data.string and node:setString(data.string)
        color = CovertToColor(data.fillStyle)
        local _ = color and node:setFontFillColor(color, true)
        -- color = CovertToColor(data.strokeStyle)
        -- local _ = color and node:setFontFillColor(color, true)

    elseif data.type == "Input" then

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

        -- SetNodeSpriteFrame(data.spriteBg, node, function(node, frame)
        --         local x, y = node:getPosition()
        --         node:initWithSizeAndBackgroundSprite(node:getContentSize(), cc.Scale9Sprite:createWithSpriteFrame(frame))
        --         node:setPosition(x, y)
        --     end)
    elseif data.type == "Sprite" then
        SetNodeSpriteFrame(data.spriteFrame, node, node.setSpriteFrame)

        local _ = data.blendSrc and node:setBlendFunc({src=data.blendSrc, dst=node:getBlendFunc().dst})
        local _ = data.blendDst and node:setBlendFunc({src=node:getBlendFunc().src, dst=data.blendDst})
    elseif data.type == "Scale9" then
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
    elseif data.type == "Slider" then
        local _ = data.percent and node:setPercent(data.percent)
        
        SetNodeBySpriteFrameName(data.barBg, node, node.loadBarTexture)
        SetNodeBySpriteFrameName(data.barProgress, node, node.loadProgressBarTexture)
        SetNodeBySpriteFrameName(data.barNormalBall, node, node.loadSlidBallTextureNormal)
        SetNodeBySpriteFrameName(data.barSelectBall, node, node.loadSlidBallTexturePressed)
        SetNodeBySpriteFrameName(data.barDisableBall, node, node.loadSlidBallTextureDisabled)
    elseif data.type == "Button" then
        SetNodeBySpriteFrameName(data.bgNormal, node, node.loadTextureNormal)
        SetNodeBySpriteFrameName(data.bgSelect, node, node.loadTexturePressed)
        SetNodeBySpriteFrameName(data.bgDisable, node, node.loadTextureDisabled)

        local _ = data.titleText and node:setTitleText(data.titleText)
        local _ = data.fontSize and node:setTitleFontSize(data.fontSize)
        local _ = data.fontName and node:setTitleFontName(data.fontName)
        color = CovertToColor(data.fontColor)
        local _ = color and node:setTitleColor(color)
    elseif data.type == "CheckBox" then
        SetNodeBySpriteFrameName(data.back, node, node.loadTextureBackGround)
        SetNodeBySpriteFrameName(data.backSelect, node, node.loadTextureBackGroundSelected)
        SetNodeBySpriteFrameName(data.active, node, node.loadTextureFrontCross)
        SetNodeBySpriteFrameName(data.backDisable, node, node.loadTextureBackGroundDisabled)
        SetNodeBySpriteFrameName(data.activeDisable, node, node.loadTextureFrontCrossDisabled)

        local _ = data.select and node:setSelected(data.select)
        local _ = data.enable and node:setTouchEnabled(data.enable)
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
