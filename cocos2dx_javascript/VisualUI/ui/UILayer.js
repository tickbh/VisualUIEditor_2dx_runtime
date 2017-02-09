
UILayer = ccui.Widget.extend({
    isControlNode: false,
    _listeners: null,
    _cacheParent: null,
    _waitPathNum: 0,
    _isCallLoaded: false,
    ctor: function (data, parent, controlNode) {
        ccui.Widget.prototype.ctor.call(this);
        this.uiPath = data;
        this._onSuccessInit();
        this.setAnchorPoint(cc.p(0, 0));
        this._isWaitLoad = true;
        this._listeners = [];
        this._cacheParent = parent;
        this._cacheControlNode = controlNode
        this._loadPaths = []
        var self = this;

        self._addWaitPath(data);

        UIUtils.GetCurJsonData(data, function(err, json) {
            if(err) {
                return;
            }
            var res = UIUtils.CalcNeedLoadImage(json)
            cc.loader.load(res,
                function (result, count, loadedCount) {
                }, function () {
                    if(!self._isWaitLoad) {
                        self._tryLoaded(data)
                        return;
                    }
                    self._isWaitLoad = false;
                    var controlNode = UIUtils.GetControlNode(self, parent)
                    UIUtils.CocosGenBaseNodeByData(json, self, parent, controlNode)
                    cc.eventManager.dispatchCustomEvent("Loaded:" + self.__instanceId)
                    self._subUILoaded(data);
                });
        })
    },


    onSuccessInit:function(){

    },
    _onSuccessInit: function() {
        this.onSuccessInit();
    },

    _addWaitPath: function(path) {
        // if(this.uiPath == "ui/Game.ui") {
        //     this._loadPaths.push(path)
        //     console.log("add  _addWaitPath = ", path)
        //     console.log("add  _waitPathNum = ", this._waitPathNum)
        //     console.log("add  _loadPaths = ", this._loadPaths)
        // }
        this._waitPathNum += 1;
    },

    _tryLoaded: function(path) {

        if(this._waitPathNum <= 0 && !this._isCallLoaded) {
            // if(this.uiPath == "ui/Game.ui") {
            //     console.log("add  _tryLoaded = ", this._cacheParent)
            // }
            this.onLoaded();
            this._isCallLoaded = true
            UIUtils.TryNoticeUILoaded({path: this.uiPath}, this._cacheControlNode || this._cacheParent)
        } 
        return this._isCallLoaded
    },

    _subUILoaded: function(path) {
        this._waitPathNum -= 1;
        // if(this.uiPath == "ui/Game.ui") {
        //     this._loadPaths.splice(this._loadPaths.indexOf(path), 1)
        //     console.log("sub  _subUILoaded = ", path)
        //     console.log("sub  _waitPathNum = ", this._waitPathNum)
        //     console.log("add  _loadPaths = ", this._loadPaths)
        // }
        return this._tryLoaded(path);
    },

    onLoaded: function() {

    },

    uiLoaded: function(path) {

    },


    isWaitLoad: function() {
        return this._isWaitLoad;
    },

    isLoaded: function() {
        return !this._isWaitLoad;
    },

    eventListener: function(event) {
        var nodeName = "";
        if(event.target) {
            nodeName = event.target.getName() || "";
        }
        if(nodeName) {
            var defaultName = "tap_" + nodeName;
            if (!this[defaultName]) {
                return
            }
            if(event.name == "ended") {
                this[defaultName].call(this, event)
            }
        }
    },

    close: function() {
        this.stopAllActions();
        this.removeFromParent(true);

    },

    show: function() {

    },

    addListener: function(eventName, callback) {
        var listener = cc.eventManager.addCustomListener(eventName, callback);
        this._listeners.push(listener);
        return listener;
    },

    removeListener: function(listener) {
        var index = this._listeners.indexOf(listener)
        if(index >= 0) {
            this._listeners.splice( index, 1 );
        }
        cc.eventManager.removeListener(listener);
    },

    onExit: function() {
        ccui.Widget.prototype.onExit.call(this);
        for(var i = 0; i < this._listeners.length; i++) {
            cc.eventManager.removeListener(this._listeners[i]);
        }
    },
});

UILayer.canMultiOpen = function() {
    return false;
}

UILayer.create = function(data, parent, controlNode) {
    return new UILayer(data, parent, controlNode);
}