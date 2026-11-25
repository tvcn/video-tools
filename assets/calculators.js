(function(){
  var std = [2,4,8,16,32,64,128,256,512,1024,2048,4096,8192,16384];
  function num(root, name){ var el = root.querySelector('[data-calc="'+name+'"]'); var n = el ? parseFloat(el.value) : NaN; return isFinite(n) ? n : NaN; }
  function text(root, name, value){ var el = root.querySelector('[data-out="'+name+'"]'); if(el) el.textContent = value; }
  function f(n, d){ if(!isFinite(n)) return '—'; var p = Math.pow(10, d||0); return (Math.round(n*p)/p).toLocaleString('zh-CN', {maximumFractionDigits: d||0}); }
  function nearestStd(v){ var best = std[0]; for(var i=0;i<std.length;i++){ if(std[i] <= v + 0.001) best = std[i]; } return best; }
  function calc(root){
    var type = root.getAttribute('data-calculator');
    if(type === 'nd-calculator'){
      var cur = num(root,'current'), target = num(root,'target');
      if(!isFinite(cur)||!isFinite(target)||cur<=0||target<=0){ text(root,'result','ND —'); text(root,'detail','请输入大于 0 的快门分母。'); return; }
      var stops = Math.log2(cur/target); var factor = Math.pow(2, stops); var nd = nearestStd(factor);
      if(stops <= 0.05){ text(root,'result','无需 ND'); text(root,'detail','目标快门不比当前慢；可收小光圈或降 ISO。'); return; }
      text(root,'result','ND' + nd); text(root,'detail','需要 ' + f(stops,1) + ' 档；理论系数 ' + f(factor,1) + '，最接近 ND' + nd + '。');
    }
    if(type === 'dof-calculator'){
      var fo=num(root,'focal'), fn=num(root,'fnumber'), s=num(root,'distance'), c=num(root,'coc');
      if(!isFinite(fo)||!isFinite(fn)||!isFinite(s)||!isFinite(c)||fo<=0||fn<=0||s<=0||c<=0){ text(root,'result','景深 —'); return; }
      var sm = s * 1000;
      var H = (fo*fo)/(fn*c) + fo; var near = (H*sm)/(H+sm-fo); var far = sm < H ? (H*sm)/(H-sm+fo) : Infinity;
      var dof = isFinite(far) ? (far-near)/1000 : Infinity;
      text(root,'result', isFinite(dof) ? f(dof,2)+' m' : '无限远');
      text(root,'detail','近界 ' + f(near/1000,2) + ' m；远界 ' + (isFinite(far) ? f(far/1000,2)+' m' : '∞') + '；超焦距 ' + f(H/1000,1) + ' m。');
    }
    if(type === 'storage-calculator'){
      var cap=num(root,'capacity'), br=num(root,'bitrate'), safe=num(root,'safety');
      if(!isFinite(cap)||!isFinite(br)||cap<=0||br<=0){ text(root,'result','可录 —'); return; }
      var mins = cap*8000/br/60*(1-(isFinite(safe)?safe:0)/100);
      text(root,'result', f(mins,1)+' 分钟');
      text(root,'detail','约 ' + f(mins/60,2) + ' 小时；按十进制 GB 估算，未计格式化损耗。');
    }
    if(type === 'bitrate-calculator'){
      var m=num(root,'minutes'), sz=num(root,'size');
      if(!isFinite(m)||!isFinite(sz)||m<=0||sz<=0){ text(root,'result','码率 —'); return; }
      var mbps = sz*8000/(m*60);
      text(root,'result', f(mbps,1)+' Mbps');
      text(root,'detail','含音频与封装前；留 5%–10% 余量更稳。');
    }
    if(type === 'budget-calculator'){
      var total=num(root,'total'), a=num(root,'shoot'), b=num(root,'post'), g=num(root,'gear'), e=num(root,'contingency');
      if(!isFinite(total)){ text(root,'result','未分配 —'); return; }
      var pct = (isFinite(a)?a:0)+(isFinite(b)?b:0)+(isFinite(g)?g:0)+(isFinite(e)?e:0);
      var left = total*(1-pct/100);
      text(root,'result', '未分配 ' + f(left,0) + ' 元');
      text(root,'detail','拍摄 ' + f(total*(a||0)/100,0) + '；后期 ' + f(total*(b||0)/100,0) + '；器材 ' + f(total*(g||0)/100,0) + '；意外金 ' + f(total*(e||0)/100,0) + '。');
    }
    if(type === 'subtitle-cps'){
      var ch=num(root,'chars'), sec=num(root,'seconds');
      if(!isFinite(ch)||!isFinite(sec)||ch<=0||sec<=0){ text(root,'result','CPS —'); return; }
      var cps = ch/sec; var label = cps<=9 ? '偏慢' : cps<=15 ? '合适' : '偏快';
      text(root,'result', f(cps,1)+' CPS · '+label);
      text(root,'detail','中文建议 9–15 字/秒；超过 15 先删字，再考虑延长停留。');
    }
    if(type === 'aspect-calculator'){
      var w=num(root,'width'), h=num(root,'height'), r=root.querySelector('[data-calc="ratio"]').value;
      if(!isFinite(w)||!isFinite(h)||w<=0||h<=0){ text(root,'result','裁切 —'); return; }
      var parts = r.split(':'); var tr = parseFloat(parts[0])/parseFloat(parts[1]);
      var sr = w/h, kw, kh;
      if(sr > tr){ kh = h; kw = Math.round(h*tr); } else { kw = w; kh = Math.round(w/tr); }
      text(root,'result', kw+' × '+kh);
      text(root,'detail','保留原片 ' + f((kw*kh)/(w*h)*100,0) + '%；目标比例 ' + r + '。');
    }
  }
  document.querySelectorAll('[data-calculator]').forEach(function(root){
    root.addEventListener('input', function(){ calc(root); });
    root.addEventListener('change', function(){ calc(root); });
    var reset = root.querySelector('[data-reset]');
    if(reset){ reset.addEventListener('click', function(){ root.querySelectorAll('[data-calc]').forEach(function(el){ var d = el.getAttribute('data-default'); if(d !== null){ el.value = d; } }); calc(root); }); }
    calc(root);
  });
})();