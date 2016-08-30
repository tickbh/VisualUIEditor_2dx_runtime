#ifndef _VISUALUI_UTILS_DATAUITUILS_H_
#define _VISUALUI_UTILS_DATAUITUILS_H_


#include "json/json.h"

class UIDataUtils {

public:
	static UIDataUtils* GetInstance();

	Json::Value& GetJsonDataFromUI(std::string name, std::string fullpath = "");

private:
	std::map<std::string, Json::Value> caches;

};

#endif