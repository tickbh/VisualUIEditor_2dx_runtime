#ifndef _VISUALUI_UI_UILAYER_H_
#define _VISUALUI_UI_UILAYER_H_

#include "cocos2d.h"
//#include "cocos-ext.h"
#include "ui/CocosGUI.h"
#include <functional>


class UIEvent {
public:
	cocos2d::Node* sender;
	std::string name;
	UIEvent(cocos2d::Node* sender, std::string name) 
		: sender(sender)
		, name(name){

	}
};
typedef std::function<void(UIEvent&)> eventCallback;

class UILayer : public cocos2d::Layer {
public:
	static UILayer* create(std::string data, cocos2d::Node* parent);

public:
	UILayer(std::string data, cocos2d::Node* parent);
	
	void AddEventListener(std::string name, const eventCallback& callback);
	void RemoveEventListener(std::string name);
	const eventCallback GetEventListener(std::string name);
	void eventListener(UIEvent& event);
	std::string path;
private:
	std::map<std::string, eventCallback> listeners;
};

#endif