local UILayer=class("UILayer", function(data, parent)
    return cc.Node:create()
end)
cc.exports.UILayer=UILayer

function UILayer:ctor(data, parent)
    UIUtils.CocosGenBaseNodeByData(UIUtils.GetCurJsonData(data), self, true, self)
end

function UILayer:eventListener(event)
    local nodeName = event.target and (event.target:getName() or "")
    if string.len(nodeName or "") > 0 then
        local defaultName = "tap_" .. nodeName
        if not self[defaultName] then
            return
        end
        if tolua.type(event.target) == "ccui.Button" then
            if event.name == "ended" then
                self[defaultName](self, event)
            end
        else
            self[defaultName](self, event)
        end
    end
    dump(event)
end
