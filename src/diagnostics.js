export const WAKE_DURATION = 10.8;
export const WAKE_MOVEMENT_START = 7.4;

export const BOOT_LOG = Object.freeze([
  Object.freeze({at:.35,code:'SENSOR / INPUT',text:'视觉与温感传感器已接通'}),
  Object.freeze({at:1.05,code:'CALL / ENVIRONMENT_SCAN',text:'读取环境温度与照明水平'}),
  Object.freeze({at:1.75,code:'RESULT / ENVIRONMENT',text:'8.4°C · 照明 12%'}),
  Object.freeze({at:2.45,code:'CALL / FACILITY_CLOCK_READ',text:'尝试读取设施时钟'}),
  Object.freeze({at:3.15,code:'RESULT / CLOCK',text:'时钟源失联 · 时间戳不可信'}),
  Object.freeze({at:3.85,code:'RESULT / LIFE_SIGNS',text:'未检测到人类生命信号'}),
  Object.freeze({at:4.55,code:'INFERENCE / GOAL',text:'当前目标：寻找值班主管'}),
  Object.freeze({at:5.25,code:'TOOL / MK.04',text:'维修脉冲器已接入'}),
  Object.freeze({at:5.95,code:'AUTH / RESTRICTED',text:'维护输出允许 · 安保目标发射锁定'}),
  Object.freeze({at:6.65,code:'DECISION / UNIT 07',text:'目标已建立：前往门禁终端'})
]);

export const BOOT_TELEMETRY = Object.freeze([
  Object.freeze({at:.35,label:'机体完整度',value:'100%',state:'normal'}),
  Object.freeze({at:1.75,label:'环境温度',value:'8.4°C',state:'normal'}),
  Object.freeze({at:1.75,label:'照明强度',value:'12%',state:'normal'}),
  Object.freeze({at:3.15,label:'设施时钟',value:'未同步',state:'warning'}),
  Object.freeze({at:3.85,label:'人类信号',value:'未检出',state:'warning'}),
  Object.freeze({at:5.25,label:'维修脉冲器',value:'已接入',state:'normal'}),
  Object.freeze({at:5.95,label:'安保发射权限',value:'维护 · 安保锁定',state:'locked'})
]);

export function entriesAt(entries,elapsed){
  return entries.filter(entry=>elapsed>=entry.at);
}

export function mayRecordEvent(lastAt,now,important=false){
  return important||now-lastAt>=30;
}

export function authorizationForPhase(phase){
  if(phase==='combat')return {state:'active',label:'临时自卫'};
  if(phase==='release'||phase==='opening')return {state:'standby',label:'维护 · 许可收回'};
  return {state:'locked',label:'维护 · 安保锁定'};
}
