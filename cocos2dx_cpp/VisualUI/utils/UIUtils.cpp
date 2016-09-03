#include "UIUtils.h"
#include "UIDataUtils.h"
#include "../ui/UIEditBoxDelegate.h"

UIUtils* UIUtils::GetInstance()
{
	static UIUtils instance;
	return &instance;
}

std::function<UILayer*(std::string, cocos2d::Node*)>* UIUtils::GetPathTemple(std::string path)
{
	if (temples.find(path) == temples.end()) {
		return nullptr;
	}
	return &temples[path];
}

void UIUtils::RegisterPathTemple(std::string path, std::function<UILayer*(std::string, cocos2d::Node*)> func)
{
	temples.insert(make_pair(path, func));
}



bool UIUtils::CheckPathRepeat(cocos2d::Node* node, std::string path)
{
	auto parent = node;
	while (parent) {
		auto layer = dynamic_cast<UILayer*>(parent);
		if (layer && layer->path == path) {
			return true;
		}
		parent = parent->getParent();
	}
	return false;
}

Json::Value& UIUtils::GetCurJsonData(std::string path)
{
	return UIDataUtils::GetInstance()->GetJsonDataFromUI(path);
}

cocos2d::Color3B UIUtils::CovertToColor(Json::Value& value, bool* isSuccess)
{
	cocos2d::Color3B ret = cocos2d::Color3B::BLACK;
	if (value.isNull() || value[0].isNull() || value[1].isNull() || value[2].isNull()) {
		if (isSuccess) { *isSuccess = false; }
	} else {
		ret.r = value[0].asInt();
		ret.g = value[1].asInt();
		ret.b = value[2].asInt();
		if (isSuccess) { *isSuccess = true; }
	}
	return ret;
}

std::string UIUtils::IntToString(int value)
{
	std::ostringstream out;
	out << value;
	return out.str();
}

int UIUtils::CalcWidth(cocos2d::Node* node, std::string& width, cocos2d::Node* parent)
{
	if (width.length() == 0 && node != nullptr) {
		width = IntToString(node->getContentSize().width);
	}
	auto index = width.find("%");
	if (!parent || index == std::string::npos) {
		return atoi(width.c_str());
	}
	auto convert = atoi(width.c_str());
	return parent->getContentSize().width * atoi(width.c_str()) / 100;
}

int UIUtils::CalcHeight(cocos2d::Node* node, std::string& height, cocos2d::Node* parent)
{
	if (height.length() == 0 && node != nullptr) {
		height = IntToString(node->getContentSize().height);
	}
	auto index = height.find("%");
	if (!parent || index == std::string::npos) {
		return atoi(height.c_str());
	}
	auto convert = atoi(height.c_str());
	return parent->getContentSize().height * atoi(height.c_str()) / 100;

}

cocos2d::Node* UIUtils::CocosGenBaseNodeByData(Json::Value& data, cocos2d::Node* parent, bool isSetParent, UILayer* controlNode)
{
	if (data.isNull()) {
		return nullptr;
	}
	cocos2d::Node* node = nullptr;
	auto type = data["type"].asString();
	auto width = CalcWidth(node, data["width"].asString(), parent);
	auto height = CalcHeight(node, data["height"].asString(), parent);
	if (isSetParent) {
		node = parent;
	} else if (data["path"].isString()) {
		if (CheckPathRepeat(parent, data["path"].asString())) {
			return nullptr;
		}
		auto temple = UIUtils::GetInstance()->GetPathTemple(data["path"].asString());
		if (temple) {
			node = (*temple)(data["path"].asString(), parent);
		} else {
			node = UILayer::create(data["path"].asString(), parent);
		}
	} else if (type == "Sprite") {
		node = cocos2d::Sprite::create();
	} else if (type == "Scale9") {
		node = cocos2d::ui::Scale9Sprite::create();
	} else if (type == "LabelTTF") {
		node = cocos2d::LabelTTF::create();
	} else if (type == "LabelAtlas") {
		node = cocos2d::LabelAtlas::create();
	} else if (type == "Input") {
		auto spriteBg = data["spriteBg"].asString();
		auto frame = GetSpriteFrameForName(spriteBg);
		cocos2d::ui::EditBox* edBox;
		if (!frame) {
			edBox = cocos2d::ui::EditBox::create(cocos2d::Size(width, height), cocos2d::ui::Scale9Sprite::create());
		} else {
			edBox = cocos2d::ui::EditBox::create(cocos2d::Size(width, height), spriteBg, cocos2d::ui::Widget::TextureResType::PLIST);
		}
		if (controlNode) {
			edBox->setDelegate(new UIEditBoxDelegate(controlNode->GetEventListener(data["touchListener"].asString())));
		}
		node = edBox;
		edBox->setFontSize(14);
	} else if (type == "Slider") {
		auto slider = cocos2d::ui::Slider::create();
		slider->addEventListener([=](cocos2d::Ref*, cocos2d::ui::Slider::EventType event) {
			auto callback = controlNode->GetEventListener(data["touchListener"].asString());
			auto uievent = UIEvent(slider, "ON_PERCENTAGE_CHANGED");
			callback(uievent);
		});
		node = slider;
	} else if (type == "CheckBox") {
		auto checkbox = cocos2d::ui::CheckBox::create();
		checkbox->addEventListener([=](cocos2d::Ref*, cocos2d::ui::CheckBox::EventType event) {
			auto callback = controlNode->GetEventListener(data["touchListener"].asString());
			auto uievent = UIEvent(checkbox, "selected");
			if (event == cocos2d::ui::CheckBox::EventType::UNSELECTED) {
				uievent.name = "unselected";
			}
			callback(uievent);
		});
		node = checkbox;
	} else if (type == "Button") {
		auto button = cocos2d::ui::Button::create();
		button->addTouchEventListener([=](cocos2d::Ref*, cocos2d::ui::Widget::TouchEventType event) {
			auto callback = controlNode->GetEventListener(data["touchListener"].asString());
			auto uievent = UIEvent(button, "began");
			if (event == cocos2d::ui::Widget::TouchEventType::MOVED) {
				uievent.name = "moved";
			}
			else if (event == cocos2d::ui::Widget::TouchEventType::ENDED) {
				uievent.name = "ended";
			}
			else if (event == cocos2d::ui::Widget::TouchEventType::CANCELED) {
				uievent.name = "canceled";
			}
			callback(uievent);
		});
		node = button;
	} else {
		node = cocos2d::Node::create();
	}

	auto widget = dynamic_cast<cocos2d::ui::Widget*>(node);
	if (data["touchEnabled"].isBool() && widget) {
		widget->setTouchEnabled(data["touchEnabled"].asBool());
	}

	if (data["id"].isString()) { node->setName(data["id"].asString()); }
	if (data["width"].isString() || data["height"].isString()) {
		if (type == "Scale9") {
			dynamic_cast<cocos2d::ui::Scale9Sprite*>(node)->setPreferredSize(cocos2d::Size(width, height));
		} else {
			node->setContentSize(cocos2d::Size(width, height));
		}
	}

	if (data["x"].isInt()) { node->setPositionX(data["x"].asInt()); };
	if (data["y"].isInt()) { node->setPositionY(data["y"].asInt()); };
	if (data["left"].isInt()) { node->setPositionX(data["left"].asInt()); };
	if (data["right"].isInt() && parent) { node->setPositionX(parent->getContentSize().width - data["right"].asInt()); };
	if (data["bottom"].isInt()) { node->setPositionY(data["bottom"].asInt()); };
	if (data["top"].isInt() && parent) { node->setPositionY(parent->getContentSize().height - data["top"].asInt()); };

	if (data["horizontal"].isInt() && parent) { node->setPositionX(parent->getContentSize().width / 2 + data["horizontal"].asInt()); };
	if (data["vertical"].isInt() && parent) { node->setPositionY(parent->getContentSize().height / 2 + data["vertical"].asInt()); };

	if (data["anchorX"].isDouble() || data["anchorY"].isDouble()) {
		auto anchorX = data["anchorX"].isDouble() ? data["anchorX"].asDouble() : node->getAnchorPoint().x;
		auto anchorY = data["anchorY"].isDouble() ? data["anchorY"].asDouble() : node->getAnchorPoint().y;
		node->setAnchorPoint(cocos2d::Vec2(anchorX, anchorY));
	}

	if (data["scaleX"].isDouble()) { node->setScaleX(data["scaleX"].asDouble()); };
	if (data["scaleY"].isDouble()) { node->setScaleY(data["scaleY"].asDouble()); };

	if (data["opacity"].isInt()) { node->setOpacity(data["opacity"].isInt()); };
	if (data["rotation"].isInt()) { node->setOpacity(data["rotation"].isInt()); };

	if (data["visible"].isBool()) { node->setVisible(data["visible"].asBool()); };

	bool isSuccess = false;
	auto color = CovertToColor(data["color"], &isSuccess);
	if (isSuccess) {
		node->setColor(color);
	}

	if (type == "LabelTTF") {
		auto opnode = dynamic_cast<cocos2d::LabelTTF*>(node);
		if (data["string"].isString()) { opnode->setString(data["string"].asString()); };
		if (data["textAlign"].isInt()) { opnode->setHorizontalAlignment((cocos2d::TextHAlignment)data["textAlign"].asInt()); };
		if (data["verticalAlign"].isInt()) { opnode->setVerticalAlignment((cocos2d::TextVAlignment)data["verticalAlign"].asInt()); };
		if (data["fontSize"].isInt()) { opnode->setFontSize(data["fontSize"].asInt()); };
		if (data["fontName"].isString()) { opnode->setFontName(data["fontName"].asString()); };
		color = CovertToColor(data["fillStyle"], &isSuccess);
		if (isSuccess) { opnode->setFontFillColor(color); };
		color = CovertToColor(data["strokeStyle"], &isSuccess);
		if (isSuccess) { opnode->setFontFillColor(color); };
	}
	else if (type == "Input") {
		auto opnode = dynamic_cast<cocos2d::ui::EditBox*>(node);
		if (data["string"].isString()) { opnode->setText(data["string"].asString().c_str()); };
		if (data["fontSize"].isInt()) { opnode->setFontSize(data["fontSize"].asInt()); };
		if (data["fontName"].isString()) { opnode->setFontName(data["fontName"].asString().c_str()); };
		color = CovertToColor(data["fontColor"], &isSuccess);
		if (isSuccess) { opnode->setFontColor(color); };
		if (data["maxLength"].isInt()) { opnode->setMaxLength(data["maxLength"].asInt()); };
		if (data["placeHolder"].isString()) { opnode->setPlaceHolder(data["placeHolder"].asString().c_str()); };
		if (data["placeHolderFontSize"].isInt()) { opnode->setPlaceholderFontSize(data["placeHolderFontSize"].asInt()); };
		if (data["placeHolderFontName"].isString()) { opnode->setPlaceholderFontName(data["placeHolderFontName"].asString().c_str()); };
		if (data["inputFlag"].isInt()) { opnode->setInputFlag((cocos2d::ui::EditBox::InputFlag)data["inputFlag"].asInt()); };
		if (data["inputMode"].isInt()) { opnode->setInputMode((cocos2d::ui::EditBox::InputMode)data["inputMode"].asInt()); };
		if (data["returnType"].isInt()) { opnode->setReturnType((cocos2d::ui::EditBox::KeyboardReturnType)data["returnType"].asInt()); };
	}
	else if (type == "Sprite") {
		auto opnode = dynamic_cast<cocos2d::Sprite*>(node);
		SetNodeSpriteFrame(data["spriteFrame"].asString(), [=](cocos2d::SpriteFrame* frame) {
			opnode->setSpriteFrame(frame);
		});

		cocos2d::BlendFunc _blendFunc = opnode->getBlendFunc();
		auto isChange = false;
		if (data["blendSrc"].isInt()) {
			_blendFunc.src = (GLenum)(data["blendSrc"].asInt());
		}
		if (data["blendDst"].isInt()) {
			_blendFunc.dst = (GLenum)(data["blendDst"].asInt());
		}
		opnode->setBlendFunc(_blendFunc);
	}
	else if (type == "Scale9") {
		auto opnode = dynamic_cast<cocos2d::ui::Scale9Sprite*>(node);
		SetNodeSpriteFrame(data["spriteFrame"].asString(), [=](cocos2d::SpriteFrame* frame) {
			opnode->setSpriteFrame(frame);
		});
			//--data.insetLeft && (node.insetLeft = data.insetLeft);
			//--data.insetTop && (node.insetTop = data.insetTop);
			//--data.insetRight && (node.insetRight = data.insetRight);
			//--data.insetBottom && (node.insetBottom = data.insetBottom);
	}
	else if (type == "Slider") {
		auto opnode = dynamic_cast<cocos2d::ui::Slider*>(node);
		SetNodeBySpriteFrameName(data["barBg"].asString(), [=](const std::string& fileName, cocos2d::ui::Widget::TextureResType resType) {
			opnode->loadBarTexture(fileName, resType);
		});
		SetNodeBySpriteFrameName(data["barProgress"].asString(), [=](const std::string& fileName, cocos2d::ui::Widget::TextureResType resType) {
			opnode->loadProgressBarTexture(fileName, resType);
		});
		SetNodeBySpriteFrameName(data["barNormalBall"].asString(), [=](const std::string& fileName, cocos2d::ui::Widget::TextureResType resType) {
			opnode->loadSlidBallTextureNormal(fileName, resType);
		});
		SetNodeBySpriteFrameName(data["barSelectBall"].asString(), [=](const std::string& fileName, cocos2d::ui::Widget::TextureResType resType) {
			opnode->loadSlidBallTexturePressed(fileName, resType);
		});
		SetNodeBySpriteFrameName(data["barDisableBall"].asString(), [=](const std::string& fileName, cocos2d::ui::Widget::TextureResType resType) {
			opnode->loadSlidBallTextureDisabled(fileName, resType);
		});
		if (data["percent"].isInt()) {
			opnode->setPercent(data["percent"].asInt());
		}
	}
	else if (type == "Button") {
		auto opnode = dynamic_cast<cocos2d::ui::Button*>(node);

		if (data["scale9Enable"].isBool()) { opnode->setScale9Enabled(data["scale9Enable"].asBool()); };

		SetNodeBySpriteFrameName(data["bgNormal"].asString(), [=](const std::string& fileName, cocos2d::ui::Widget::TextureResType resType) {
			opnode->loadTextureNormal(fileName, resType);
		});
		SetNodeBySpriteFrameName(data["bgSelect"].asString(), [=](const std::string& fileName, cocos2d::ui::Widget::TextureResType resType) {
			opnode->loadTexturePressed(fileName, resType);
		});
		SetNodeBySpriteFrameName(data["bgDisable"].asString(), [=](const std::string& fileName, cocos2d::ui::Widget::TextureResType resType) {
			opnode->loadTextureDisabled(fileName, resType);
		});


		if (data["titleText"].isString()) { opnode->setTitleText(data["titleText"].asString()); };
		if (data["fontSize"].isInt()) { opnode->setTitleFontSize(data["fontSize"].asInt()); };
		if (data["fontName"].isString()) { opnode->setTitleFontName(data["fontName"].asString()); };
		color = CovertToColor(data["fontColor"], &isSuccess);
		if (isSuccess) { opnode->setTitleColor(color); };

	}
	else if (type == "CheckBox") {
		auto opnode = dynamic_cast<cocos2d::ui::CheckBox*>(node);

		if (data["select"].isBool()) { opnode->setSelected(data["select"].asBool()); };

		SetNodeBySpriteFrameName(data["back"].asString(), [=](const std::string& fileName, cocos2d::ui::Widget::TextureResType resType) {
			opnode->loadTextureBackGround(fileName, resType);
		});
		SetNodeBySpriteFrameName(data["backSelect"].asString(), [=](const std::string& fileName, cocos2d::ui::Widget::TextureResType resType) {
			opnode->loadTextureBackGroundSelected(fileName, resType);
		});
		SetNodeBySpriteFrameName(data["active"].asString(), [=](const std::string& fileName, cocos2d::ui::Widget::TextureResType resType) {
			opnode->loadTextureFrontCross(fileName, resType);
		});
		SetNodeBySpriteFrameName(data["backDisable"].asString(), [=](const std::string& fileName, cocos2d::ui::Widget::TextureResType resType) {
			opnode->loadTextureBackGroundDisabled(fileName, resType);
		});
		SetNodeBySpriteFrameName(data["activeDisable"].asString(), [=](const std::string& fileName, cocos2d::ui::Widget::TextureResType resType) {
			opnode->loadTextureFrontCrossDisabled(fileName, resType);
		});
	}
	else if (type == "LabelAtlas") {
		auto opnode = dynamic_cast<cocos2d::LabelAtlas*>(node);
		if (data["charMapFile"].isString() && cocos2d::FileUtils::getInstance()->isFileExist(data["charMapFile"].asString())) {
			int mapStar = '0';
			if (data["mapStartChar"].isInt()) {
				mapStar = data["mapStartChar"].asInt();
			} else {
				mapStar += atoi(data["mapStartChar"].asString().c_str());
			}
			opnode->initWithString(data["string"].asString(), data["charMapFile"].asString(), data["itemWidth"].asInt(), data["itemHeight"].asInt(), mapStar);
		}
	}

	if (data["children"].isArray()) {
		auto& children = data["children"];
		for (auto iter = children.begin(); iter != children.end(); iter++)
		{
			auto child = CocosGenBaseNodeByData(*iter, node, false, controlNode);
			if (child) {
				node->addChild(child);
			}
		}
	}
	return node;
}

cocos2d::SpriteFrame* UIUtils::GetSpriteFrameForName(std::string name)
{
	if (name.length() == 0) {
		return nullptr;
	}
	auto frame = cocos2d::SpriteFrameCache::getInstance()->spriteFrameByName(name);
	if (frame) {
		return frame;
	}
	auto filePath = cocos2d::FileUtils::getInstance()->fullPathForFilename(name);
	if (filePath.length() == 0) {
		return nullptr;
	}
	auto sprite = cocos2d::Sprite::create(filePath);
	if (!sprite) {
		return nullptr;
	}
	frame = cocos2d::SpriteFrame::createWithTexture(sprite->getTexture(), sprite->getTextureRect());
	cocos2d::SpriteFrameCache::getInstance()->addSpriteFrame(frame, name);
	return frame;
}

void UIUtils::SetNodeSpriteFrame(std::string name, std::function<void(cocos2d::SpriteFrame*)> func)
{
	auto frame = GetSpriteFrameForName(name);
	if (!frame) {
		return;
	}
	func(frame);
}

void UIUtils::SetNodeBySpriteFrameName(std::string name, std::function<void(const std::string&, cocos2d::ui::Widget::TextureResType)> func)
{
	auto frame = GetSpriteFrameForName(name);
	if (!frame) {
		return;
	}
	func(name, cocos2d::ui::Widget::TextureResType::PLIST);
}

