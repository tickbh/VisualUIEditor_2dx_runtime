#include "UILayer.h"
#include <functional>
#include "../utils/UIUtils.h"

UILayer::UILayer(std::string data, cocos2d::Node* parent)
{
	UIUtils::CocosGenBaseNodeByData(UIUtils::GetCurJsonData(data), this, true, this);
}

UILayer* UILayer::create(std::string data, cocos2d::Node* parent)
{
	auto layer = new UILayer(data, parent);
	return layer;
}

void UILayer::eventListener(UIEvent& event)
{
	cocos2d::log("eventListener name is %s", event.name.c_str());
}

void UILayer::AddEventListener(std::string name, const eventCallback& callback)
{
	listeners[name] = callback;
}

void UILayer::RemoveEventListener(std::string name)
{
	auto iter = listeners.find(name);
	if (iter != listeners.end()) {
		listeners.erase(iter);
	}
}

const eventCallback UILayer::GetEventListener(std::string name)
{
	auto iter = listeners.find(name);
	if (iter != listeners.end()) {
		return iter->second;
	}
	
	return std::bind(&UILayer::eventListener, this, std::placeholders::_1);
}

