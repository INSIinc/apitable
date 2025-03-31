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

import { Box, ThemeName, Typography, useTheme, useThemeColors } from '@apitable/components';
import { integrateCdnHost } from '@apitable/core';
import { EmailfeedbackOutlined, LinkedinOutlined, TwitterOutlined } from '@apitable/icons';
import { getEnvVariables } from 'pc/utils/env';
import { GithubButton } from './components/github_button';
import { NavBar } from './components/nav_bar';
import { ActionType } from './pc_home';
import styles from './style.module.less';

/**
 * HomeWrapper 组件的属性接口
 * @property action 可选，当前执行的操作类型
 */
interface IHomeWrapper {
  action?: ActionType
}

/**
 * 主页包装器组件
 * 为登录、注册等页面提供统一的外层布局和样式
 * 包含页头（品牌信息和社交图标）、主体内容区和页脚导航栏
 * 
 * @param children 子组件，通常是登录/注册表单等内容
 * @param action 当前操作类型，用于导航栏状态控制
 */
export const HomeWrapper: React.FC<React.PropsWithChildren<IHomeWrapper>> = ({ children, action }) => {
  const colors = useThemeColors();

  /**
   * 社交媒体链接图标配置
   * 包括Twitter、LinkedIn和邮件联系方式
   */
  const linkIcons = [
    {
      icon: <TwitterOutlined color={colors.textCommonPrimary} size={32} />,
      link: 'https://twitter.com/apitable_com',
    },
    {
      icon: <LinkedinOutlined color={colors.textCommonPrimary} size={32} />,
      link: 'https://www.linkedin.com/company/APITable',
    },
    {
      icon: <EmailfeedbackOutlined color={colors.textCommonPrimary} size={32} />,
      link: 'mailto:support@apitable.com',
    },
  ];

  // 社交图标内容初始化
  let socialIconsContent;
  // 根据环境变量决定是否禁用登录页社交图标
  const disableLoginSocialIcons = getEnvVariables().LOGIN_SOCIAL_ICONS_DISABLE;
  if (disableLoginSocialIcons) {
    socialIconsContent = '';
  } else {
    // 生成社交图标链接列表及Github按钮
    socialIconsContent = (
      <div className={styles.iconContent}>
        <div className={styles.linkLine}>
          {linkIcons.map(({ icon, link }) => {
            return (
              <a key={link} href={link} target="_blank" rel="noreferrer">
                {icon}
              </a>
            );
          })}
        </div>
        <Box marginLeft={24}>
          <GithubButton />
        </Box>
      </div>
    );
  }

  // 根据环境配置和主题设置加载适当的品牌标识
  let logo = getEnvVariables().IS_AITABLE ? getEnvVariables().LOGO : getEnvVariables().LOGIN_LOGO!;
  let text = getEnvVariables().LOGO_TEXT_DARK;
  // 根据当前主题调整品牌标识
  if (useTheme().palette.type === ThemeName.Light ) {
    if (!getEnvVariables().IS_AITABLE) {
      logo = getEnvVariables().LOGIN_LOGO_LIGHT!;
    }
    text = getEnvVariables().LOGO_TEXT_LIGHT;
  }

  // 渲染整体布局
  return (
    <div className={styles.pcHome}>
      {/* 页头区域：包含品牌标识和社交媒体链接 */}
      <div className={styles.header}>
        <div className={styles.brand}>
          {/* 根据是否为AITable决定不同的品牌展示方式 */}
          {getEnvVariables().IS_AITABLE ? (
            <div>
              <img src={integrateCdnHost(logo)} width={32} alt="logo" />
              <img src={integrateCdnHost(text)} width={96} alt="text" />
            </div>
          ) : (
            <img src={integrateCdnHost(logo)} width={132} alt="logo" />
          )}
          {/* 品牌标语 */}
          <Typography variant={'h7'} color={colors.textCommonSecondary}>
            {getEnvVariables().IS_AITABLE
              ? 'Custom ChatGPT with Table in 1-Click'
              : getEnvVariables().LOGIN_MOTTO || "let's make the world more productive!"}
          </Typography>
        </div>
        {/* 社交媒体图标区域 */}
        {socialIconsContent}
      </div>
      {/* 主要内容区域：渲染传入的子组件（如登录表单） */}
      <div className={styles.main}>{children}</div>
      {/* 页脚导航区域 */}
      <div className={styles.footer}>
        <NavBar action={action} />
      </div>
    </div>
  );
};
