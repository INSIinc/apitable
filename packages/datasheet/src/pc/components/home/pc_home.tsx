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

import { useMount } from 'ahooks';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { IReduxState, Strings, t } from '@apitable/core';
import { ActiveAppSumo } from 'pc/components/home/components/active_app_sumo';
import { useAppSelector } from 'pc/store/react-redux';
import { ForgetPassword } from './components/forget_password';
import { Login } from './components/login';
import { SignUp } from './components/sign_up';
import { HomeWrapper } from './home_wrapper';
import styles from './style.module.less';

/**
 * 定义页面可能的操作类型
 * SignIn - 登录页面
 * SignUp - 注册页面
 * ForgetPassword - 忘记密码页面
 * BindAppSumo - AppSumo绑定页面
 */
export enum ActionType {
  SignIn = 'SignIn',
  SignUp = 'SignUp',
  ForgetPassword = 'ForgetPassword',
  BindAppSumo = 'BindAppSumo',
}

/**
 * PC端主页组件
 * 负责管理不同的认证状态和视图（登录、注册、忘记密码等）
 */
export const PcHome: React.FC<React.PropsWithChildren<unknown>> = () => {
  // 从 Redux store 获取邀请相关信息
  const inviteLinkInfo = useAppSelector((state: IReduxState) => state.invite.inviteLinkInfo);
  const inviteEmailInfo = useAppSelector((state: IReduxState) => state.invite.inviteEmailInfo);
  
  // 管理当前活动类型（默认为注册）和邮箱状态
  const [action, setAction] = useState<ActionType>(ActionType.SignUp);
  const [email, setEmail] = useState<string>('');
  const router = useRouter();

  /**
   * 切换操作类型的处理函数
   * @param actionType 目标操作类型
   */
  const switchActionType = (actionType: ActionType) => {
    setAction(actionType);
  };
  
  // 从本地存储获取登录操作
  const loginAction = localStorage.getItem('loginAction');
  
  // 组件挂载时执行的逻辑
  useMount(() => {
    // 判断 URL 是否包含 'sumo'，如果是则设置为 AppSumo 绑定页面
    if (router.asPath.includes('sumo')) {
      setAction(ActionType.BindAppSumo);
      return;
    }
    
    // 如果本地存储中有登录动作，则设置为登录页面并清除存储
    if (loginAction === ActionType.SignIn) {
      setAction(ActionType.SignIn);
      localStorage.removeItem('loginAction');
    }
  });

  /**
   * 根据当前操作类型返回对应的组件
   * @param action 当前操作类型
   * @returns 对应的组件
   */
  const homeModal = (action: ActionType) => {
    switch (action) {
      case ActionType.SignIn:
        return <Login switchClick={switchActionType} email={email} setEmail={setEmail} />;
      case ActionType.BindAppSumo:
        return <ActiveAppSumo />;
      case ActionType.SignUp:
        return <SignUp switchClick={switchActionType} />;
      case ActionType.ForgetPassword:
        return <ForgetPassword switchClick={switchActionType} email={email} setEmail={setEmail} />;
    }
  };

  /**
   * 根据当前操作类型获取对应的标题文本
   * @param action 当前操作类型
   * @returns 对应的标题文本
   */
  const getTitle = (action: ActionType) => {
    switch (action) {
      case ActionType.SignIn:
        return 'Sign In';
      case ActionType.SignUp:
        return 'Sign Up';
      case ActionType.ForgetPassword:
        return 'Reset Password';
      case ActionType.BindAppSumo:
        return 'Welcome Sumo-ling!';
    }
  };

  // 渲染主页组件
  return (
    <HomeWrapper action={action}>
      <div className={styles.loginBox}>
        {/* 如果有邀请信息则显示邀请提示，否则显示标题 */}
        {inviteLinkInfo || inviteEmailInfo ? (
          <div className={styles.invite}>
            <h4>
              {inviteLinkInfo?.data.memberName || inviteEmailInfo?.data.inviter} {t(Strings.invite_your_join)}
            </h4>
            <p>{`"${inviteLinkInfo?.data.spaceName || inviteEmailInfo?.data.spaceName}"`}</p>
          </div>
        ) : (
          <h3 className={styles.title}>{getTitle(action)}</h3>
        )}
        {/* 背景装饰元素 */}
        <div className={styles.bgBox1} />
        <div className={styles.bgBox2} />
        <div className={styles.bgBox3} />
        {/* 根据当前操作类型渲染对应的组件 */}
        {homeModal(action)}
      </div>
    </HomeWrapper>
  );
};
