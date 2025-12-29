// 错误配置常量
var ERROR_CONF = {
    KEY_ERR: 311,
    KEY_ERR_MSG: 'key格式错误',
    PARAM_ERR: 310,
    PARAM_ERR_MSG: '请求参数信息有误',
    SYSTEM_ERR: 600,
    SYSTEM_ERR_MSG: '系统错误',
    WX_ERR_CODE: 1000,
    WX_OK_CODE: 200
};

// 接口基础地址及各接口地址
var BASE_URL = 'https://apis.map.qq.com/ws/';
var URL_SEARCH = BASE_URL + 'place/v1/search';
var URL_SUGGESTION = BASE_URL + 'place/v1/suggestion';
var URL_GET_GEOCODER = BASE_URL + 'geocoder/v1/';
var URL_CITY_LIST = BASE_URL + 'district/v1/list';
var URL_AREA_LIST = BASE_URL + 'district/v1/getchildren';
var URL_DISTANCE = BASE_URL + 'distance/v1/';

// 地球半径常量
var EARTH_RADIUS = 6378136.49;

// 工具类对象
var Utils = {
    /**
     * 位置信息转查询参数
     * @param {string|array} data 位置数据
     * @returns {string} 拼接后的查询参数
     */
    location2query(data) {
        if (typeof data === 'string') {
            return data;
        }
        var query = '';
        for (var i = 0; i < data.length; i++) {
            var d = data[i];
            if (!!query) {
                query += ';';
            }
            if (d.location) {
                query = query + d.location.lat + ',' + d.location.lng;
            }
            if (d.latitude && d.longitude) {
                query = query + d.latitude + ',' + d.longitude;
            }
        }
        return query;
    },

    /**
     * 角度转弧度
     * @param {number} d 角度值
     * @returns {number} 弧度值
     */
    rad(d) {
        return d * Math.PI / 180.0;
    },

    /**
     * 解析结束位置信息
     * @param {string} location 位置字符串
     * @returns {array} 解析后的位置数组
     */
    getEndLocation(location) {
        var to = location.split(';');
        var endLocation = [];
        for (var i = 0; i < to.length; i++) {
            endLocation.push({
                lat: parseFloat(to[i].split(',')[0]),
                lng: parseFloat(to[i].split(',')[1])
            });
        }
        return endLocation;
    },

    /**
     * 计算两点间距离（球面距离）
     * @param {number} latFrom 起点纬度
     * @param {number} lngFrom 起点经度
     * @param {number} latTo 终点纬度
     * @param {number} lngTo 终点经度
     * @returns {number} 距离（米）
     */
    getDistance(latFrom, lngFrom, latTo, lngTo) {
        var radLatFrom = this.rad(latFrom);
        var radLatTo = this.rad(latTo);
        var a = radLatFrom - radLatTo;
        var b = this.rad(lngFrom) - this.rad(lngTo);
        var distance = 2 * Math.asin(
            Math.sqrt(
                Math.pow(Math.sin(a / 2), 2) +
                Math.cos(radLatFrom) * Math.cos(radLatTo) * Math.pow(Math.sin(b / 2), 2)
            )
        );
        distance = distance * EARTH_RADIUS;
        distance = Math.round(distance * 10000) / 10000;
        return parseFloat(distance.toFixed(0));
    },

    /**
     * 获取微信定位信息
     * @param {function} success 成功回调
     * @param {function} fail 失败回调
     * @param {function} complete 完成回调
     */
    getWXLocation(success, fail, complete) {
        wx.getLocation({
            type: 'gcj02',
            success: success,
            fail: fail,
            complete: complete
        });
    },

    /**
     * 处理位置参数格式
     * @param {string|object} location 位置参数
     * @returns {object} 标准化的位置对象
     */
    getLocationParam(location) {
        if (typeof location === 'string') {
            var locationArr = location.split(',');
            if (locationArr.length === 2) {
                location = {
                    latitude: location.split(',')[0],
                    longitude: location.split(',')[1]
                };
            } else {
                location = {};
            }
        }
        return location;
    },

    /**
     * 补全参数的回调函数（默认空函数）
     * @param {object} param 入参对象
     */
    polyfillParam(param) {
        param.success = param.success || function () { };
        param.fail = param.fail || function () { };
        param.complete = param.complete || function () { };
    },

    /**
     * 检查参数指定key是否为空
     * @param {object} param 入参对象
     * @param {string} key 要检查的key
     * @returns {boolean} 是否为空
     */
    checkParamKeyEmpty(param, key) {
        if (!param[key]) {
            var errconf = this.buildErrorConfig(ERROR_CONF.PARAM_ERR, ERROR_CONF.PARAM_ERR_MSG + key + '参数格式有误');
            param.fail(errconf);
            param.complete(errconf);
            return true;
        }
        return false;
    },

    /**
     * 检查关键词参数
     * @param {object} param 入参对象
     * @returns {boolean} 是否合法
     */
    checkKeyword(param) {
        return !this.checkParamKeyEmpty(param, 'keyword');
    },

    /**
     * 检查位置参数
     * @param {object} param 入参对象
     * @returns {boolean} 是否合法
     */
    checkLocation(param) {
        var location = this.getLocationParam(param.location);
        if (!location || !location.latitude || !location.longitude) {
            var errconf = this.buildErrorConfig(ERROR_CONF.PARAM_ERR, ERROR_CONF.PARAM_ERR_MSG + ' location参数格式有误');
            param.fail(errconf);
            param.complete(errconf);
            return false;
        }
        return true;
    },

    /**
     * 构建错误配置对象
     * @param {number} errCode 错误码
     * @param {string} errMsg 错误信息
     * @returns {object} 错误配置
     */
    buildErrorConfig(errCode, errMsg) {
        return {
            status: errCode,
            message: errMsg
        };
    },

    /**
     * 处理接口返回数据，格式化后回调
     * @param {object} param 入参对象（含回调）
     * @param {object} data 接口返回数据
     * @param {string} feature 功能类型（search/suggest等）
     */
    handleData(param, data, feature) {
        if (feature === 'search') {
            var searchResult = data.data;
            var searchSimplify = [];
            for (var i = 0; i < searchResult.length; i++) {
                searchSimplify.push({
                    id: searchResult[i].id || null,
                    title: searchResult[i].title || null,
                    latitude: searchResult[i].location && searchResult[i].location.lat || null,
                    longitude: searchResult[i].location && searchResult[i].location.lng || null,
                    address: searchResult[i].address || null,
                    category: searchResult[i].category || null,
                    tel: searchResult[i].tel || null,
                    adcode: searchResult[i].ad_info && searchResult[i].ad_info.adcode || null,
                    city: searchResult[i].ad_info && searchResult[i].ad_info.city || null,
                    district: searchResult[i].ad_info && searchResult[i].ad_info.district || null,
                    province: searchResult[i].ad_info && searchResult[i].ad_info.province || null
                });
            }
            param.success(data, {
                searchResult: searchResult,
                searchSimplify: searchSimplify
            });
        } else if (feature === 'suggest') {
            var suggestResult = data.data;
            var suggestSimplify = [];
            for (var i = 0; i < suggestResult.length; i++) {
                suggestSimplify.push({
                    adcode: suggestResult[i].adcode || null,
                    address: suggestResult[i].address || null,
                    category: suggestResult[i].category || null,
                    city: suggestResult[i].city || null,
                    district: suggestResult[i].district || null,
                    id: suggestResult[i].id || null,
                    latitude: suggestResult[i].location && suggestResult[i].location.lat || null,
                    longitude: suggestResult[i].location && suggestResult[i].location.lng || null,
                    province: suggestResult[i].province || null,
                    title: suggestResult[i].title || null,
                    type: suggestResult[i].type || null
                });
            }
            param.success(data, {
                suggestResult: suggestResult,
                suggestSimplify: suggestSimplify
            });
        } else if (feature === 'reverseGeocoder') {
            var reverseGeocoderResult = data.result;
            var reverseGeocoderSimplify = {
                address: reverseGeocoderResult.address || null,
                latitude: reverseGeocoderResult.location && reverseGeocoderResult.location.lat || null,
                longitude: reverseGeocoderResult.location && reverseGeocoderResult.location.lng || null,
                adcode: reverseGeocoderResult.ad_info && reverseGeocoderResult.ad_info.adcode || null,
                city: reverseGeocoderResult.address_component && reverseGeocoderResult.address_component.city || null,
                district: reverseGeocoderResult.address_component && reverseGeocoderResult.address_component.district || null,
                nation: reverseGeocoderResult.address_component && reverseGeocoderResult.address_component.nation || null,
                province: reverseGeocoderResult.address_component && reverseGeocoderResult.address_component.province || null,
                street: reverseGeocoderResult.address_component && reverseGeocoderResult.address_component.street || null,
                street_number: reverseGeocoderResult.address_component && reverseGeocoderResult.address_component.street_number || null,
                recommend: reverseGeocoderResult.formatted_addresses && reverseGeocoderResult.formatted_addresses.recommend || null,
                rough: reverseGeocoderResult.formatted_addresses && reverseGeocoderResult.formatted_addresses.rough || null
            };
            if (reverseGeocoderResult.pois) {
                var pois = reverseGeocoderResult.pois;
                var poisSimplify = [];
                for (var i = 0; i < pois.length; i++) {
                    poisSimplify.push({
                        id: pois[i].id || null,
                        title: pois[i].title || null,
                        latitude: pois[i].location && pois[i].location.lat || null,
                        longitude: pois[i].location && pois[i].location.lng || null,
                        address: pois[i].address || null,
                        category: pois[i].category || null,
                        adcode: pois[i].ad_info && pois[i].ad_info.adcode || null,
                        city: pois[i].ad_info && pois[i].ad_info.city || null,
                        district: pois[i].ad_info && pois[i].ad_info.district || null,
                        province: pois[i].ad_info && pois[i].ad_info.province || null
                    });
                }
                param.success(data, {
                    reverseGeocoderResult: reverseGeocoderResult,
                    reverseGeocoderSimplify: reverseGeocoderSimplify,
                    pois: pois,
                    poisSimplify: poisSimplify
                });
            } else {
                param.success(data, {
                    reverseGeocoderResult: reverseGeocoderResult,
                    reverseGeocoderSimplify: reverseGeocoderSimplify
                });
            }
        } else if (feature === 'geocoder') {
            var geocoderResult = data.result;
            var geocoderSimplify = {
                title: geocoderResult.title || null,
                latitude: geocoderResult.location && geocoderResult.location.lat || null,
                longitude: geocoderResult.location && geocoderResult.location.lng || null,
                adcode: geocoderResult.ad_info && geocoderResult.ad_info.adcode || null,
                province: geocoderResult.address_components && geocoderResult.address_components.province || null,
                city: geocoderResult.address_components && geocoderResult.address_components.city || null,
                district: geocoderResult.address_components && geocoderResult.address_components.district || null,
                street: geocoderResult.address_components && geocoderResult.address_components.street || null,
                street_number: geocoderResult.address_components && geocoderResult.address_components.street_number || null,
                level: geocoderResult.level || null
            };
            param.success(data, {
                geocoderResult: geocoderResult,
                geocoderSimplify: geocoderSimplify
            });
        } else if (feature === 'getCityList') {
            var provinceResult = data.result[0];
            var cityResult = data.result[1];
            var districtResult = data.result[2];
            param.success(data, {
                provinceResult: provinceResult,
                cityResult: cityResult,
                districtResult: districtResult
            });
        } else if (feature === 'getDistrictByCityId') {
            var districtByCity = data.result[0];
            param.success(data, districtByCity);
        } else if (feature === 'calculateDistance') {
            var calculateDistanceResult = data.result.elements;
            var distance = [];
            for (var i = 0; i < calculateDistanceResult.length; i++) {
                distance.push(calculateDistanceResult[i].distance);
            }
            param.success(data, {
                calculateDistanceResult: calculateDistanceResult,
                distance: distance
            });
        } else {
            param.success(data);
        }
    },

    /**
     * 构建微信请求配置
     * @param {object} param 入参对象（含回调）
     * @param {object} options 基础请求配置
     * @param {string} feature 功能类型
     * @returns {object} 完整的请求配置
     */
    buildWxRequestConfig(param, options, feature) {
        var that = this;
        options.header = {
            "content-type": "application/json"
        };
        options.method = 'GET';
        options.success = function (res) {
            var data = res.data;
            if (data.status === 0) {
                that.handleData(param, data, feature);
            } else {
                param.fail(data);
            }
        };
        options.fail = function (res) {
            res.statusCode = ERROR_CONF.WX_ERR_CODE;
            param.fail(that.buildErrorConfig(ERROR_CONF.WX_ERR_CODE, res.errMsg));
        };
        options.complete = function (res) {
            var statusCode = +res.statusCode;
            switch (statusCode) {
                case ERROR_CONF.WX_ERR_CODE:
                    param.complete(that.buildErrorConfig(ERROR_CONF.WX_ERR_CODE, res.errMsg));
                    break;
                case ERROR_CONF.WX_OK_CODE:
                    var data = res.data;
                    if (data.status === 0) {
                        param.complete(data);
                    } else {
                        param.complete(that.buildErrorConfig(data.status, data.message));
                    }
                    break;
                default:
                    param.complete(that.buildErrorConfig(ERROR_CONF.SYSTEM_ERR, ERROR_CONF.SYSTEM_ERR_MSG));
            }
        };
        return options;
    },

    /**
     * 位置参数处理（自动获取定位或验证已有定位）
     * @param {object} param 入参对象
     * @param {function} locationsuccess 定位成功回调
     * @param {function} locationfail 定位失败回调
     * @param {function} locationcomplete 定位完成回调
     */
    locationProcess(param, locationsuccess, locationfail, locationcomplete) {
        var that = this;
        locationfail = locationfail || function (res) {
            res.statusCode = ERROR_CONF.WX_ERR_CODE;
            param.fail(that.buildErrorConfig(ERROR_CONF.WX_ERR_CODE, res.errMsg));
        };
        locationcomplete = locationcomplete || function (res) {
            if (res.statusCode == ERROR_CONF.WX_ERR_CODE) {
                param.complete(that.buildErrorConfig(ERROR_CONF.WX_ERR_CODE, res.errMsg));
            }
        };
        if (!param.location) {
            that.getWXLocation(locationsuccess, locationfail, locationcomplete);
        } else if (that.checkLocation(param)) {
            var location = Utils.getLocationParam(param.location);
            locationsuccess(location);
        }
    }
};

/**
 * 腾讯地图微信小程序SDK类
 * @class QQMapWX
 * @param {object} options 初始化配置（含key）
 */
class QQMapWX {
    constructor(options) {
        if (!options.key) {
            throw Error('key值不能为空');
        }
        this.key = options.key;
    }

    /**
     * 地点搜索
     * @param {object} options 搜索参数
     */
    search(options) {
        var that = this;
        options = options || {};
        Utils.polyfillParam(options);
        if (!Utils.checkKeyword(options)) {
            return;
        }
        var requestParam = {
            keyword: options.keyword,
            orderby: options.orderby || '_distance',
            page_size: options.page_size || 10,
            page_index: options.page_index || 1,
            output: 'json',
            key: that.key
        };
        if (options.address_format) {
            requestParam.address_format = options.address_format;
        }
        if (options.filter) {
            requestParam.filter = options.filter;
        }
        var distance = options.distance || "1000";
        var auto_extend = options.auto_extend || 1;
        var region = null;
        var rectangle = null;
        if (options.region) {
            region = options.region;
        }
        if (options.rectangle) {
            rectangle = options.rectangle;
        }
        var locationsuccess = function (result) {
            if (region && !rectangle) {
                requestParam.boundary = "region(" + region + "," + auto_extend + "," + result.latitude + "," + result.longitude + ")";
            } else if (rectangle && !region) {
                requestParam.boundary = "rectangle(" + rectangle + ")";
            } else {
                requestParam.boundary = "nearby(" + result.latitude + "," + result.longitude + "," + distance + "," + auto_extend + ")";
            }
            wx.request(Utils.buildWxRequestConfig(options, {
                url: URL_SEARCH,
                data: requestParam
            }, 'search'));
        };
        Utils.locationProcess(options, locationsuccess);
    }

    /**
     * 地点建议搜索
     * @param {object} options 建议搜索参数
     */
    getSuggestion(options) {
        var that = this;
        options = options || {};
        Utils.polyfillParam(options);
        if (!Utils.checkKeyword(options)) {
            return;
        }
        var requestParam = {
            keyword: options.keyword,
            region: options.region || '全国',
            region_fix: options.region_fix || 0,
            policy: options.policy || 0,
            page_size: options.page_size || 10,
            page_index: options.page_index || 1,
            get_subpois: options.get_subpois || 0,
            output: 'json',
            key: that.key
        };
        if (options.address_format) {
            requestParam.address_format = options.address_format;
        }
        if (options.filter) {
            requestParam.filter = options.filter;
        }
        if (options.location) {
            var locationsuccess = function (result) {
                requestParam.location = result.latitude + ',' + result.longitude;
                wx.request(Utils.buildWxRequestConfig(options, {
                    url: URL_SUGGESTION,
                    data: requestParam
                }, "suggest"));
            };
            Utils.locationProcess(options, locationsuccess);
        } else {
            wx.request(Utils.buildWxRequestConfig(options, {
                url: URL_SUGGESTION,
                data: requestParam
            }, "suggest"));
        }
    }

    /**
     * 逆地理编码（坐标转地址）
     * @param {object} options 逆地理编码参数
     */
    reverseGeocoder(options) {
        var that = this;
        options = options || {};
        Utils.polyfillParam(options);
        var requestParam = {
            coord_type: options.coord_type || 5,
            get_poi: options.get_poi || 0,
            output: 'json',
            key: that.key
        };
        if (options.poi_options) {
            requestParam.poi_options = options.poi_options;
        }
        var locationsuccess = function (result) {
            requestParam.location = result.latitude + ',' + result.longitude;
            wx.request(Utils.buildWxRequestConfig(options, {
                url: URL_GET_GEOCODER,
                data: requestParam
            }, 'reverseGeocoder'));
        };
        Utils.locationProcess(options, locationsuccess);
    }

    /**
     * 地理编码（地址转坐标）
     * @param {object} options 地理编码参数
     */
    geocoder(options) {
        var that = this;
        options = options || {};
        Utils.polyfillParam(options);
        if (Utils.checkParamKeyEmpty(options, 'address')) {
            return;
        }
        var requestParam = {
            address: options.address,
            output: 'json',
            key: that.key
        };
        if (options.region) {
            requestParam.region = options.region;
        }
        wx.request(Utils.buildWxRequestConfig(options, {
            url: URL_GET_GEOCODER,
            data: requestParam
        }, 'geocoder'));
    }

    /**
     * 获取城市列表
     * @param {object} options 配置参数
     */
    getCityList(options) {
        var that = this;
        options = options || {};
        Utils.polyfillParam(options);
        var requestParam = {
            output: 'json',
            key: that.key
        };
        wx.request(Utils.buildWxRequestConfig(options, {
            url: URL_CITY_LIST,
            data: requestParam
        }, 'getCityList'));
    }

    /**
     * 根据城市ID获取区县列表
     * @param {object} options 配置参数（含id）
     */
    getDistrictByCityId(options) {
        var that = this;
        options = options || {};
        Utils.polyfillParam(options);
        if (Utils.checkParamKeyEmpty(options, 'id')) {
            return;
        }
        var requestParam = {
            id: options.id || '',
            output: 'json',
            key: that.key
        };
        wx.request(Utils.buildWxRequestConfig(options, {
            url: URL_AREA_LIST,
            data: requestParam
        }, 'getDistrictByCityId'));
    }

    /**
     * 计算距离
     * @param {object} options 配置参数（含to）
     */
    calculateDistance(options) {
        var that = this;
        options = options || {};
        Utils.polyfillParam(options);
        if (Utils.checkParamKeyEmpty(options, 'to')) {
            return;
        }
        var requestParam = {
            mode: options.mode || 'walking',
            to: Utils.location2query(options.to),
            output: 'json',
            key: that.key
        };
        if (options.from) {
            options.location = options.from;
        }
        if (requestParam.mode === 'straight') {
            var locationsuccess = function (result) {
                var locationTo = Utils.getEndLocation(requestParam.to);
                var data = {
                    message: "query ok",
                    result: { elements: [] },
                    status: 0
                };
                for (var i = 0; i < locationTo.length; i++) {
                    data.result.elements.push({
                        distance: Utils.getDistance(result.latitude, result.longitude, locationTo[i].lat, locationTo[i].lng),
                        duration: 0,
                        from: { lat: result.latitude, lng: result.longitude },
                        to: { lat: locationTo[i].lat, lng: locationTo[i].lng }
                    });
                }
                var calculateResult = data.result.elements;
                var distanceResult = [];
                for (var i = 0; i < calculateResult.length; i++) {
                    distanceResult.push(calculateResult[i].distance);
                }
                return options.success(data, {
                    calculateResult: calculateResult,
                    distanceResult: distanceResult
                });
            };
            Utils.locationProcess(options, locationsuccess);
        } else {
            var locationsuccess = function (result) {
                requestParam.from = result.latitude + ',' + result.longitude;
                wx.request(Utils.buildWxRequestConfig(options, {
                    url: URL_DISTANCE,
                    data: requestParam
                }, 'calculateDistance'));
            };
            Utils.locationProcess(options, locationsuccess);
        }
    }
}

// 导出SDK类
module.exports = QQMapWX;