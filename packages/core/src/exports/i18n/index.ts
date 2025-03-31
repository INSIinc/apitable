/**
 * APITable <https://github.com/apitable/apitable>
 * Copyright (C) 2022 APITable Ltd. <https://apitable.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

/*
 * 读取 strings.auto.json 文件，进行翻译处理
 */
import { I18N } from '@apitable/i18n';
import LANGUAGE_DATA from '@apitable/i18n-lang/src/config/strings.json';
import type { StringKeysMapType, StringKeysType } from '../../config/stringkeys.interface';

export { StringKeysMapType, StringKeysType };

// @ts-ignore nextjs
// 判断当前环境是否为浏览器
const isBrowser = process.browser || typeof window !== 'undefined';

// 创建字符串代理对象，用于获取翻译键名
export const Strings = new Proxy({} as Record<keyof StringKeysMapType, string>, {
  get: function (_target, key: string) {
    return key;
  },
}) as StringKeysType;

/**
 * 读取配置中的设置
 */
declare const window: any;
declare const global: any;

// 获取全局对象（浏览器中为window，Node环境中为global）
const _global = global || window;

/**
 * 获取浏览器语言设置
 * 返回标准化的语言代码
 */
const getBrowserLanguage = (): string | undefined => {
  // 如果已经有缓存的浏览器语言，直接返回
  if (_global.browserLang){
    return _global.browserLang;
  }
  // @ts-ignore
  // 获取语言映射表
  const languageMap = _global.languageManifest;

  // 如果没有navigator对象或语言映射表，返回undefined
  if (!_global.navigator || !languageMap) {
    return undefined;
  }
  // 获取用户浏览器语言
  let userLanguage: string | undefined = _global.navigator.language as string;
  if (userLanguage){
    // 标准化语言代码，将地区代码转为大写 (如 zh-cn 转为 zh-CN)
    userLanguage = userLanguage.replace(/-(.+)/g, (match, group1) => {
      return `-${group1.toUpperCase()}`;
    });
  }
  // 特殊处理：繁体中文台湾版映射到香港版
  if (userLanguage === 'zh-TW') {
    userLanguage = 'zh-HK';
  }
  // 特殊处理：所有英语变体统一映射到美式英语
  if (userLanguage?.startsWith('en')) {
    userLanguage = 'en-US';
  }
  // 如果语言映射表中没有对应的语言，尝试查找相似的语言
  if (!languageMap[userLanguage]) {
    userLanguage = undefined;
    const langArr = Object.keys(languageMap);
    if (langArr) {
      for (let i = 0; i < langArr.length; i++) {
        // @ts-ignore
        if (langArr[i] !== undefined && langArr[i].indexOf(userLanguage) > -1) {
          userLanguage = langArr[i];
          break;
        }
      }
    }
  }
  // 缓存浏览器语言到全局变量
  _global.browserLang = userLanguage;
  return userLanguage;
};

/**
 * 获取应用当前使用的语言
 * 遵循优先级：本地存储 > 浏览器语言 > 初始化数据中的locale > 默认语言(zh-CN)
 */
export function getLanguage() {
  let clientLang = null;
  // 在浏览器环境中，尝试从localStorage读取用户设置的语言
  if (isBrowser) {
    try {
      // @ts-ignore
      clientLang = localStorage.getItem('client-lang');
    } catch (e) {}
  }
  // 获取浏览器语言
  const browserLang = getBrowserLanguage();
  // console.log('browser language is', browserLang);
  // 从初始化数据中获取语言设置，排除'und'(未定义)值
  const language = typeof _global == 'object' && _global.__initialization_data__ &&
    _global.__initialization_data__.locale != 'und' && _global.__initialization_data__.locale;
  // 获取系统配置的默认语言，如果没有则使用中文简体
  const defaultLang = (typeof _global == 'object' && _global.__initialization_data__?.envVars?.SYSTEM_CONFIGURATION_DEFAULT_LANGUAGE) || 'zh-CN';
  // 按优先级返回语言
  return clientLang || browserLang || language || defaultLang;
}

/**
 * 从服务器获取语言包
 * @param lang 语言代码
 * @param data 存储语言数据的对象
 */
const fetchLanguagePack = (lang: string, data: any) => {
  // @ts-ignore
  // 使用同步XHR请求获取语言包
  const xhr = new XMLHttpRequest();
  const version = window.__initialization_data__.version;
  if (lang) {
    // 获取特定语言的翻译
    xhr.open('GET', `/file/langs/strings.${lang}.json?version=${version}`, false);
  } else {
    // 获取所有语言的翻译
    xhr.open('GET', '/file/langs/strings.json?version=${version}', false);
  }
  xhr.send();
  if (xhr.readyState === 4 && xhr.status === 200) {
    // 请求成功，解析语言数据
    const languageData = JSON.parse(xhr.responseText);
    if (lang) {
      // 存储特定语言的数据
      data[lang] = languageData;
    } else {
      // 存储所有语言的数据
      Object.keys(languageData).forEach((key) => {
        data[key] = languageData[key];
      });
    }
  } else {
    // 请求失败，输出错误日志
    console.error('load language from remote error', xhr.statusText);
  }
};

/**
 * 加载客户端语言包
 * @param lang 语言代码
 * @returns 语言数据对象
 */
const loadClientLanguage = (lang: string) => {
  const data = {};
  fetchLanguagePack(lang, data);
  return data;
};

/**
 * 用特定版本的翻译覆盖原有的翻译
 * 用于支持不同版本的个性化文本
 */
const rewriteI18nForEdition = () => {
  for (const k in _global.apitable_i18n) {
    if (_global.apitable_i18n_edition?.[k]) {
      // 使用版本特定的翻译覆盖原有翻译
      _global.apitable_i18n[k] = {
        ..._global.apitable_i18n[k],
        ..._global.apitable_i18n_edition[k]
      };
    }
  }
};

// 仅在浏览器环境执行的代码
if (isBrowser) {
  require('@apitable/i18n-lang');

  // 设置语言清单
  if (_global.apitable_language_list && Object.keys(_global.apitable_language_list).length > 0) {
    _global.languageManifest = _global.apitable_language_list;
  }
}

// 获取当前语言，并替换下划线为连字符（例如：zh_CN 转为 zh-CN）
const currentLang = getLanguage().replace('_', '-');
// 设置当前语言到全局变量
_global.currentLang = currentLang;
// 加载语言数据：浏览器环境从服务器加载，非浏览器环境使用本地导入的数据
_global.apitable_i18n = isBrowser ? loadClientLanguage(currentLang) : LANGUAGE_DATA;

// 应用版本特定的翻译覆盖
rewriteI18nForEdition();
// 创建国际化实例
const i18n = I18N.createByLanguagePacks(_global.apitable_i18n, currentLang);

/**
 * 翻译函数：将字符串键转换为对应语言的文本
 * @param stringKey 字符串键
 * @param options 插值选项，用于替换文本中的变量
 * @param isPlural 是否使用复数形式
 * @returns 翻译后的文本
 */
export function t(stringKey: keyof StringKeysMapType | unknown, options: any = null, isPlural = false): string {
  const text = i18n.getText(stringKey as string, options, isPlural);
  return text;
}

