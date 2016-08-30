#include "UIEditBoxDelegate.h"

void UIEditBoxDelegate::editBoxReturn(cocos2d::ui::EditBox* editBox)
{
	_callback(UIEvent(editBox, "changed"));
}

void UIEditBoxDelegate::editBoxEditingDidBegin(cocos2d::ui::EditBox* editBox)
{
	_callback(UIEvent(editBox, "began"));
}

void UIEditBoxDelegate::editBoxEditingDidEnd(cocos2d::ui::EditBox* editBox)
{
	_callback(UIEvent(editBox, "changed"));
}

void UIEditBoxDelegate::editBoxTextChanged(cocos2d::ui::EditBox* editBox, const std::string& text)
{
	_callback(UIEvent(editBox, "changed"));
}

UIEditBoxDelegate::UIEditBoxDelegate(eventCallback callback)
	: EditBoxDelegate()
	, _callback(callback)
{

}

