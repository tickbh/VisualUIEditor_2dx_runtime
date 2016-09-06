#ifndef _VISUALUI_UTILS_UITUILS_H_
#define _VISUALUI_UTILS_UITUILS_H_

#include "../ui/UILayer.h"
#include "json/json.h"

typedef std::function<void(cocos2d::ui::Widget::ccWidgetTouchCallback)> addEventFunc;

class UIUtils {
public:
	static UIUtils* GetInstance();

	std::function<UILayer*(std::string, cocos2d::Node*)>* GetPathTemple(std::string path);
	void RegisterPathTemple(std::string path, std::function<UILayer*(std::string, cocos2d::Node*)> func);
private:
	std::map<std::string, std::function<UILayer*(std::string, cocos2d::Node*)>> temples;
public:

	static bool CheckPathRepeat(cocos2d::Node* node, std::string path);
	static Json::Value& GetCurJsonData(std::string path);
	static cocos2d::Color3B CovertToColor(Json::Value& value, bool* isSuccess);
	static cocos2d::Color4B CovertToColor4(Json::Value& value, bool* isSuccess);

	static std::string IntToString(int value);
	static int CalcWidth(cocos2d::Node* node, std::string& width, cocos2d::Node* parent);
	static int CalcHeight(cocos2d::Node* node, std::string& height, cocos2d::Node* parent);

	static cocos2d::Node* CocosGenBaseNodeByData(Json::Value& data, cocos2d::Node* parent, bool isSetParent, UILayer* controlNode);

	static cocos2d::SpriteFrame* GetSpriteFrameForName(std::string name);

	static void SetNodeSpriteFrame(std::string name, std::function<void(cocos2d::SpriteFrame*)> func);

	static void SetNodeBySpriteFrameName(std::string name, std::function<void(const std::string&, cocos2d::ui::Widget::TextureResType)> func);


};

#endif