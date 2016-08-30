#include "UIDataUtils.h"
#include "cocos2d.h"

UIDataUtils* UIDataUtils::GetInstance()
{
	static UIDataUtils instance;
	return &instance;
}

Json::Value& UIDataUtils::GetJsonDataFromUI(std::string name, std::string fullpath /* = "" */)
{
	static Json::Value nullValue = Json::nullValue;
	if (caches.find(name) != caches.end()) {
		return caches[name];
	}
	if (fullpath.length() == 0) {
		fullpath = name;
	}
	cocos2d::Data data = cocos2d::FileUtils::getInstance()->getDataFromFile(fullpath);
	if (data.isNull()) {
		return nullValue;
	}

	Json::Reader reader;
	Json::Value root;

	if (!reader.parse((const char*)data.getBytes(), (const char*)(data.getBytes() + data.getSize()), root, false))
	{
		return nullValue;
	}

	caches[name] = std::move(root);
	return caches[name];

}

