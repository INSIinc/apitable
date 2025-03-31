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

// 导入响应式相关的hooks
import { configResponsive, useResponsive } from 'ahooks';
import { FC } from 'react';
import { shallowEqual } from 'react-redux';
import { IReduxState, Navigation } from '@apitable/core';
import { Router } from 'pc/components/route_manager/router';
import { useAppSelector } from 'pc/store/react-redux';
import { getSearchParams } from 'pc/utils';
import { getEnvVariables } from 'pc/utils/env';
// 导入移动端和PC端首页组件
import { MobileHome } from './mobile_home';
import { PcHome } from './pc_home';
//@ts-ignore
// 导入企业版首页组件
import { Home as EnterpriseHome } from 'enterprise/home/home';
import styles from './style.module.less';

// 配置响应式布局断点，large设置为1023.98px
configResponsive({
  large: 1023.98,
});

/**
 * 基础首页组件
 * 负责根据设备屏幕尺寸渲染PC版或移动版首页
 * 同时处理登录状态的重定向逻辑
 */
const HomeBase: FC<React.PropsWithChildren<unknown>> = () => {
  // 再次配置响应式断点（这里有重复配置，可能是为了确保组件内部也获取到正确的配置）
  configResponsive({
    large: 1023.98,
  });
  // 获取响应式信息
  const responsive = useResponsive();
  // 获取URL参数
  const urlParams = getSearchParams();
  // 获取reference参数，用于跟踪用户来源
  const reference = urlParams.get('reference') || undefined;

  // 从Redux状态获取用户登录状态
  const { isLogin } = useAppSelector((state: IReduxState) => ({ isLogin: state.user.isLogin, user: state.user }), shallowEqual);

  // 如果用户已登录，根据reference参数决定重定向到哪个页面
  if (isLogin) {
    if (reference) {
      // 有reference参数，重定向到首页并保留reference参数
      Router.redirect(Navigation.HOME, {
        query: {
          reference,
        },
      });
    } else {
      // 无reference参数，直接重定向到工作台
      Router.redirect(Navigation.WORKBENCH);
    }
  }

  // 渲染首页内容
  return (
    <>
      <div className={styles.homeWrapper}>
        {/* 根据屏幕尺寸或SSR环境判断显示PC版还是移动版首页 */}
        {responsive?.large || process.env.SSR ? <PcHome /> : <MobileHome />}
      </div>
    </>
  );
};

/**
 * 首页组件
 * 根据环境判断使用企业版首页还是社区版首页
 * @returns 适合当前环境的首页组件
 */
export const Home = () => {
  // 如果企业版首页组件存在且未指定使用社区版登录页，则使用企业版首页
  // 否则使用基础首页组件
  return Boolean(EnterpriseHome) && !getEnvVariables().USE_CE_LOGIN_PAGE ? <EnterpriseHome /> : <HomeBase />;
};
