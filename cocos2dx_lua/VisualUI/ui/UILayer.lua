local UILayer=class("UILayer", function(data, parent)
    return cc.Node:create()
end)
cc.exports.UILayer=UILayer

function UILayer:ctor(data, parent)
    UIUtils.CocosGenBaseNodeByData(UIUtils.GetCurJsonData(data), self, true, self)
end

function UILayer:eventListener(event)
    dump(event)
end
