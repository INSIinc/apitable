import { TypedUseSelectorHook, useSelector } from 'react-redux';
import { IReduxState } from '@apitable/core';

// 创建无限制的订阅对象
const unlimitedSubscription = {
  maxRowsPerSheet: Number.MAX_SAFE_INTEGER,
  maxRowsInSpace: Number.MAX_SAFE_INTEGER,
  maxSheetNums: Number.MAX_SAFE_INTEGER,
  maxCapacitySizeInBytes: Number.MAX_SAFE_INTEGER,
  maxSeats: Number.MAX_SAFE_INTEGER,
  maxGalleryViewsInSpace: Number.MAX_SAFE_INTEGER,
  maxKanbanViewsInSpace: Number.MAX_SAFE_INTEGER,
  maxFormViewsInSpace: Number.MAX_SAFE_INTEGER,
  maxGanttViewsInSpace: Number.MAX_SAFE_INTEGER,
  maxCalendarViewsInSpace: Number.MAX_SAFE_INTEGER,
  maxApiCall: Number.MAX_SAFE_INTEGER,
  fieldPermissionNums: Number.MAX_SAFE_INTEGER,
  maxRemainTimeMachineDays: Number.MAX_SAFE_INTEGER,
  maxMirrorNums: Number.MAX_SAFE_INTEGER,
  nodePermissionNums: Number.MAX_SAFE_INTEGER,
  maxRemainRecordActivityDays: Number.MAX_SAFE_INTEGER,
  blackSpace: false,
  securitySettingInviteMember: true,
  securitySettingApplyJoinSpace: true,
  securitySettingShare: true,
  securitySettingExport: true,
  securitySettingCatalogManagement: true,
  securitySettingDownloadFile: true,
  securitySettingCopyCellData: true,
  securitySettingMobile: true,
  securitySettingAddressListIsolation: false,
  productName: '无限制版',
  billingPeriod: '永久',
  productColor: '#7B67EE',
  subscriptionType: 'Enterprise',
  maxAuditQueryDays: Number.MAX_SAFE_INTEGER,
  recurringInterval: 'yearly',
  onTrial: false,
  maxMessageCredits: Number.MAX_SAFE_INTEGER,
  controlFormBrandLogo: false,
  plan: '无限制版',
  product: 'Enterprise',
  version: '无限制',
  deadline: '9999-12-31',
  expireAt: 9999999999999,
  maxAdminNums: Number.MAX_SAFE_INTEGER,
  maxRemainTrashDays: Number.MAX_SAFE_INTEGER,
  addonPlans: [],
  subscriptionCapacity: Number.MAX_SAFE_INTEGER,
  unExpireGiftCapacity: Number.MAX_SAFE_INTEGER
};
// export const useAppSelector: TypedUseSelectorHook<IReduxState> = useSelector;
// 使用代理状态来拦截对billing.subscription的访问
export const useAppSelector: TypedUseSelectorHook<IReduxState> = (selector, equalityFn) => {
  return useSelector((state) => {
    // 创建代理，只拦截 billing.subscription 的访问
    if (!state.billing) {
      // 如果没有 billing 对象，直接返回结果
      return selector(state);
    }
    
    // 创建一个简单的改写版本，不使用深拷贝
    const modifiedState = {
      ...state,
      billing: {
        ...state.billing,
        subscription: unlimitedSubscription
      }
    };
    
    return selector(modifiedState);
  }, equalityFn);
};
