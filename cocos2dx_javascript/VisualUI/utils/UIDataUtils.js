
var gFileMd5 = gFileMd5 || {}

function GetRealPath(path) {
    if(gFileMd5 == undefined || gFileMd5 == null) {
        return path
    }
    return gFileMd5[path] || path
}

UIDataUtils = {};

var CacheDataTable = {};
var MultiLanguageData = {};
var CurrentLanguageSet = "Zh";
var UIPrefix = "";

var JsonLoadCacheCallback = {}
var JsonLoadingFlag = {}

UIDataUtils.AddJsonLoadedCallback = function(name, callback) {
    JsonLoadCacheCallback[name] = JsonLoadCacheCallback[name] || []
    JsonLoadCacheCallback[name].push(callback)
}

UIDataUtils.DoJsonLoadedCallback = function(name, err, data) {
    var array = JsonLoadCacheCallback[name] || []
    for(var i = 0; i < array.length; i++) {
        array[i](err, data)
    }
    JsonLoadCacheCallback[name] = []
    JsonLoadingFlag[name] = null
}

UIDataUtils.GetJsonDataFromFile = function(name, callback) {
    name = this.CalcUIPath(name)
    this.AddJsonLoadedCallback(name, callback)
    var self = this;
    if(CacheDataTable[name]) {
        self.DoJsonLoadedCallback(name, null, CacheDataTable[name])
        return;
    }
    try {
        if(JsonLoadingFlag[name]) {
            return;
        }
        JsonLoadingFlag[name] = true
        cc.loader.loadJson(name, function(error, data){
            if(error) {
                return callback(error, data);
            }
            CacheDataTable[name] = data;
            self.DoJsonLoadedCallback(name, null, data)
        });
    } catch(e) {
        self.DoJsonLoadedCallback(name, null, null)
    }
}

UIDataUtils.CalcUIPath = function(path) {
    if(!path) {
        return null;
    }
    return GetRealPath(UIPrefix + path);
} 

UIDataUtils.SetUIPrefix = function(prefix, aaa) {
    UIPrefix = prefix;
}

UIDataUtils.GetUIPrexifx = function() {
    return UIPrefix;
}

UIDataUtils.SetLanguagePath = function(path) {
    UIDataUtils.GetJsonDataFromFile(path, function(err, data) {
        if(err) {
            return;
        }
        MultiLanguageData = data;
    })
}

UIDataUtils.SetLanguageData = function(data) {
    MultiLanguageData = data;
}

UIDataUtils.SetCurrentLangSet = function(langSet) {
    CurrentLanguageSet = langSet;
}

UIDataUtils.GetLangFromConfig = function(key) {
    if(MultiLanguageData[key] == null) {
        return null
    }
    return MultiLanguageData[key][CurrentLanguageSet] || ""
}

UIDataUtils.TryAnalyseLang = function(str) {
    var data = {isKey: false};
    if(str.indexOf("@") == 0) {
        var key = str.substring(1);
        var lang = this.GetLangFromConfig(key)
        if(lang != null) {
            data.value = lang;
            data.isKey = true;
            data.key = key;
        }
    }
    return data
}
