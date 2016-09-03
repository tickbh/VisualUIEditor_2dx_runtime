--UI创建模块
module("UIDataUtils", package.seeall)

local CacheDataTable = {}

function GetJsonDataFromUI(name, fullpath)
    if CacheDataTable[name] then
        return CacheDataTable[name]
    end

    local filePath = name
    if fullpath and string.len(fullpath) > 0 then
        filePath = fullpath
    end

    local content = cc.FileUtils:getInstance():getStringFromFile(filePath)
    if not content or string.len(content) == 0 then
        return nil
    end
    local success, ret = pcall(cjson.decode, content)
    if type(ret) ~= "table" then
        success = false
    end

    if not success then
        return nil
    end
    CacheDataTable[name] = ret
    return ret
end