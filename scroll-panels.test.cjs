const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
function mobile(reduce = false) {
  const events = {}, frames = new Map(); let next = 0;
  const context = {scrollY:0,performance:{now:()=>0},Date,Math,setTimeout,clearTimeout,
    matchMedia:query=>({matches:query.includes('reduced-motion') ? reduce : false,addEventListener(){}}),
    requestAnimationFrame:fn=>{frames.set(++next,fn);return next;},cancelAnimationFrame:id=>frames.delete(id),
    document:{hidden:false,querySelector:selector=>selector==='#catalogo' ? {closest:()=>({getBoundingClientRect:()=>({top:700-context.scrollY})})} : null,addEventListener(){}},
    window:{addEventListener:(event,fn)=>events[event]=fn,scrollTo:({top})=>{context.scrollY=top;events.scroll?.();}}
  };
  vm.runInNewContext(fs.readFileSync('scroll-panels.js','utf8'),context);
  const swipe = (start,end) => {
    let prevented = false;
    events.touchstart({touches:[{clientX:100,clientY:start}]});
    events.touchmove({touches:[{clientX:100,clientY:end}],cancelable:true,preventDefault:()=>prevented=true});
    events.touchend({changedTouches:[{clientX:100,clientY:end}]});
    return prevented;
  };
  const tick = time => { const pending=[...frames.values()];frames.clear();pending.forEach(fn=>fn(time)); };
  return {context,events,frames,swipe,tick};
}
test('El primer swipe móvil baja suavemente al inicio del catálogo, sin imán después',()=>{
  const ui=mobile();assert.equal(ui.swipe(400,300),true);assert.equal(ui.frames.size,1);
  ui.tick(750);assert.ok(ui.context.scrollY>0 && ui.context.scrollY<700);
  ui.tick(1600);assert.equal(ui.context.scrollY,700);assert.equal(ui.frames.size,0);
  ui.context.scrollY=850;ui.events.scroll();assert.equal(ui.swipe(400,300),false);assert.equal(ui.frames.size,0);
});
test('Un swipe hacia arriba, movimiento reducido o una cancelación no fuerzan la transición',()=>{
  const up=mobile();assert.equal(up.swipe(300,400),false);assert.equal(up.frames.size,0);
  const reduced=mobile(true);assert.equal(reduced.swipe(400,300),false);assert.equal(reduced.frames.size,0);
  const cancelled=mobile();cancelled.swipe(400,300);cancelled.events.touchcancel();assert.equal(cancelled.frames.size,0);
});
