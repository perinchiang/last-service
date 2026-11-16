import {BOOT_LOG, BOOT_TELEMETRY, WAKE_DURATION, entriesAt, authorizationForPhase, mayRecordEvent} from './diagnostics.js';

const TELEMETRY_KEYS = {
  '设施时钟':'clock', '环境温度':'temperature', '照明强度':'lighting',
  '人类信号':'human', '机体完整度':'integrity', '维修脉冲器':'tool',
  '安保发射权限':'authorization'
};

// Scripted in-world diagnostics. They never evaluate code or contact an AI service.
export function makeDiagnosticHUD(doc) {
  const $ = id => doc.getElementById(id);
  const panel = $('diagnostics'), telemetry = $('telemetry'), lines = $('traceLines');
  const rows = new Map([...telemetry.querySelectorAll('[data-telemetry]')].map(row => [row.dataset.telemetry,row]));
  let bootIndex=0, traceCount=0, revealed=new Set(), lastEventAt=-Infinity;
  let lastSummaryAt=0, movementSeconds=0, pulseCount=0, expandedUntil=0, activeMode='title';

  function value(key, text, state='normal') {
    const row=rows.get(key);
    if(row.lastElementChild.textContent!==text)row.lastElementChild.textContent=text;
    row.dataset.state=state;
  }

  function append(entry) {
    const row=doc.createElement('div'), code=doc.createElement('span'), copy=doc.createElement('span');
    row.className='trace-row';code.className='trace-code';copy.className='trace-copy';
    code.textContent=entry.code;copy.textContent=entry.text;row.append(code,copy);lines.append(row);
    while(lines.children.length>4)lines.firstElementChild.remove();
    traceCount++;
  }

  function reveal(elapsed) {
    for(const entry of entriesAt(BOOT_TELEMETRY,elapsed)) {
      if(revealed.has(entry.label))continue;
      revealed.add(entry.label);value(TELEMETRY_KEYS[entry.label],entry.value,entry.state);
    }
  }

  function setMode(mode) {
    activeMode=mode;
    doc.body.classList.toggle('diagnostic-boot',mode==='wake');
    panel.classList.toggle('hidden',mode!=='wake'&&mode!=='play');
    telemetry.classList.toggle('hidden',mode!=='wake'&&mode!=='play');
    panel.classList.toggle('live',mode!=='wake');
    telemetry.classList.toggle('monitoring',mode!=='wake');
    if(mode!=='play')doc.body.classList.remove('diagnostic-active');
  }

  function reset() {
    bootIndex=traceCount=pulseCount=movementSeconds=lastSummaryAt=expandedUntil=0;
    lastEventAt=-Infinity;revealed=new Set();lines.replaceChildren();
    $('diagTarget').classList.add('hidden');$('diagGoal').textContent='';
    $('diagProgressBar').style.transform='scaleX(0)';
    $('cognitiveState').textContent='正在思考';$('scanState').textContent='READING';
    for(const key of rows.keys())value(key,'--','pending');
    setMode('wake');
  }

  function boot(elapsed) {
    while(bootIndex<BOOT_LOG.length&&elapsed>=BOOT_LOG[bootIndex].at)append(BOOT_LOG[bootIndex++]);
    reveal(elapsed);
    $('diagProgressBar').style.transform='scaleX('+Math.min(1,elapsed/WAKE_DURATION)+')';
    if(elapsed>=6.65) {
      $('diagTarget').classList.remove('hidden');
      $('diagGoal').textContent='寻找值班主管 → 门禁终端';
      $('cognitiveState').textContent='目标已建立';
    }
  }

  function event(code,text,elapsed,{important=true}={}) {
    const now=Number.isFinite(elapsed)?elapsed:0;
    if(!mayRecordEvent(lastEventAt,now,important))return false;
    append({code,text});lastEventAt=now;expandedUntil=now+7;
    $('cognitiveState').textContent=important?'状态更新':'行动摘要';
    doc.body.classList.toggle('diagnostic-active',activeMode==='play');
    return true;
  }

  function enterPlay(elapsed=0) {
    // Skipping the cinematic changes presentation, not the resulting mission state.
    reveal(WAKE_DURATION);setMode('play');lastSummaryAt=elapsed;
    lines.replaceChildren();
    $('diagTarget').classList.remove('hidden');$('diagGoal').textContent='寻找值班主管';
    event('PLAN / NAVIGATE','查询门禁终端，寻找值班主管的下落。',elapsed);
    $('scanState').textContent='MONITOR';
  }

  function authorization(phase) {
    const auth=authorizationForPhase(phase);
    value('authorization',auth.label,auth.state);
  }

  function update(dt,{elapsed,phase,health,moving,goal}) {
    value('integrity',Math.ceil(health)+'%');authorization(phase);
    if($('diagGoal').textContent!==goal)$('diagGoal').textContent=goal;
    movementSeconds+=moving?dt:0;
    if(elapsed-lastSummaryAt>=30) {
      if(pulseCount>0)event('TOOL / PULSE','已输出 '+pulseCount+' 次维护脉冲',elapsed,{important:false});
      // Do not invent an event just because thirty seconds elapsed.
      else if(movementSeconds>=4)event('NAV / MOVEMENT','移动状态正常 · 继续当前任务',elapsed,{important:false});
      lastSummaryAt=elapsed;pulseCount=movementSeconds=0;
    }
    doc.body.classList.toggle('diagnostic-active',elapsed<expandedUntil&&activeMode==='play');
  }

  return {reset,boot,enterPlay,setMode,event,authorization,update,shot(){pulseCount++;},get count(){return traceCount;}};
}
