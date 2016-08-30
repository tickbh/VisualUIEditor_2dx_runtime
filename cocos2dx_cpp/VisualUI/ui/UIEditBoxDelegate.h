#ifndef _VISUALUI_UI_UIEDITORBOXDELEGATE_H_
#define _VISUALUI_UI_UIEDITORBOXDELEGATE_H_

#include "UILayer.h"

class UIEditBoxDelegate : public cocos2d::ui::EditBoxDelegate {

public:
	UIEditBoxDelegate(eventCallback callback);
public:
	/**
	* This method is called when an edit box gains focus after keyboard is shown.
	* @param editBox The edit box object that generated the event.
	*/
	virtual void editBoxEditingDidBegin(cocos2d::ui::EditBox* editBox);;


	/**
	* This method is called when an edit box loses focus after keyboard is hidden.
	* @param editBox The edit box object that generated the event.
	*/
	virtual void editBoxEditingDidEnd(cocos2d::ui::EditBox* editBox);;

	/**
	* This method is called when the edit box text was changed.
	* @param editBox The edit box object that generated the event.
	* @param text The new text.
	*/
	virtual void editBoxTextChanged(cocos2d::ui::EditBox* editBox, const std::string& text);;

	/**
	* This method is called when the return button was pressed or the outside area of keyboard was touched.
	* @param editBox The edit box object that generated the event.
	*/
	virtual void editBoxReturn(cocos2d::ui::EditBox* editBox);
private:
	eventCallback _callback;
};

#endif