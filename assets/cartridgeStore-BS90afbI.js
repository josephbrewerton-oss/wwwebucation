const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/__vite-browser-external-2W3EstLn.js","assets/rolldown-runtime-hePW80VL.js"])))=>i.map(i=>d[i]);
import{r as e}from"./rolldown-runtime-hePW80VL.js";import{a as t,n,p as r,r as i}from"./dbStore-ypxTr1n8.js";import{u as a}from"./aicaller-D3zjbFV6.js";var o=class{buffer;bytePos=0;bitPos=0;constructor(e,t=0){this.buffer=e,this.bytePos=t,this.bitPos=0}get length(){return this.buffer.length}get offset(){return this.bytePos}set offset(e){this.bytePos=e,this.bitPos=0}readUI8(){return this.syncBits(),this.bytePos>=this.buffer.length?0:this.buffer[this.bytePos++]}readUI16(){if(this.syncBits(),this.bytePos+1>=this.buffer.length)return 0;let e=this.buffer[this.bytePos]|this.buffer[this.bytePos+1]<<8;return this.bytePos+=2,e}readSI16(){let e=this.readUI16();return e&32768?e-65536:e}readUI32(){if(this.syncBits(),this.bytePos+3>=this.buffer.length)return 0;let e=(this.buffer[this.bytePos]|this.buffer[this.bytePos+1]<<8|this.buffer[this.bytePos+2]<<16|this.buffer[this.bytePos+3]<<24)>>>0;return this.bytePos+=4,e}readString(){this.syncBits();let e=``;for(;this.bytePos<this.buffer.length;){let t=this.buffer[this.bytePos++];if(t===0)break;e+=String.fromCharCode(t)}return e}readBytes(e){this.syncBits();let t=Math.min(this.bytePos+e,this.buffer.length),n=this.buffer.slice(this.bytePos,t);return this.bytePos=t,n}syncBits(){this.bitPos>0&&(this.bytePos++,this.bitPos=0)}readUBits(e){if(e===0)return 0;let t=0;for(let n=0;n<e;n++){if(this.bytePos>=this.buffer.length)return t;let e=this.buffer[this.bytePos]>>7-this.bitPos&1;t=t<<1|e,this.bitPos++,this.bitPos===8&&(this.bitPos=0,this.bytePos++)}return t}readSBits(e){if(e===0)return 0;let t=this.readUBits(e),n=1<<e-1;return t&n&&(t-=1<<e),t}readRect(){this.syncBits();let e=this.readUBits(5),t=this.readSBits(e)/20,n=this.readSBits(e)/20,r=this.readSBits(e)/20,i=this.readSBits(e)/20;return this.syncBits(),{xMin:t,xMax:n,yMin:r,yMax:i,width:Math.abs(n-t),height:Math.abs(i-r)}}readMatrix(){this.syncBits();let e=1,t=1;if(this.readUBits(1)===1){let n=this.readUBits(5);e=this.readSBits(n)/65536,t=this.readSBits(n)/65536}let n=0,r=0;if(this.readUBits(1)===1){let e=this.readUBits(5);n=this.readSBits(e)/65536,r=this.readSBits(e)/65536}let i=this.readUBits(5),a=this.readSBits(i)/20,o=this.readSBits(i)/20;return this.syncBits(),{scaleX:e,scaleY:t,rotateSkew0:n,rotateSkew1:r,transX:a,transY:o}}readRGBA(e=!0){this.syncBits();let t=this.readUI8(),n=this.readUI8(),r=this.readUI8(),i=e?this.readUI8()/255:1;return i<1?`rgba(${t}, ${n}, ${r}, ${i.toFixed(2)})`:`#${((1<<24)+(t<<16)+(n<<8)+r).toString(16).slice(1)}`}};async function s(t){if(typeof process<`u`&&process.versions&&process.versions.node)try{let n=await a(()=>import(`./__vite-browser-external-2W3EstLn.js`).then(t=>e(t.default,1)),__vite__mapDeps([0,1])),r=n.default||n,i=Buffer.from(t);try{let e=r.inflateSync(i);return new Uint8Array(e.buffer,e.byteOffset,e.byteLength)}catch{let e=i.subarray(2,i.length-4),t=r.inflateRawSync(e);return new Uint8Array(t.buffer,t.byteOffset,t.byteLength)}}catch{}if(typeof DecompressionStream<`u`)try{let e=new ReadableStream({start(e){e.enqueue(t),e.close()}}).pipeThrough(new DecompressionStream(`deflate`)),n=await new Response(e).arrayBuffer();return new Uint8Array(n)}catch{try{let e=t.slice(2,t.length-4),n=new ReadableStream({start(t){t.enqueue(e),t.close()}}).pipeThrough(new DecompressionStream(`deflate-raw`)),r=await new Response(n).arrayBuffer();return new Uint8Array(r)}catch(e){console.warn(`[SWF-Parser] DecompressionStream error, trying fallback:`,e)}}throw Error(`Could not decompress zlib-encoded SWF binary in this environment.`)}function c(e,t,n){let r=e.readRect();n===4&&(e.readRect(),e.readUI8()),e.syncBits();let i=e.readUI8();i===255&&n>=2&&(i=e.readUI16());let a=[`none`];for(let t=0;t<i;t++){let t=e.readUI8();if(t===0)a.push(e.readRGBA(n>=3));else if(t===16||t===18){e.readMatrix();let t=e.readUI8()&15,r=`#38bdf8`;for(let i=0;i<t;i++){e.readUI8();let t=e.readRGBA(n>=3);i===0&&(r=t)}a.push(r)}else e.readUI16(),e.readMatrix(),a.push(`#6366f1`)}let o=e.readUI8();o===255&&n>=2&&(o=e.readUI16());let s=[{width:0,color:`none`}];for(let t=0;t<o;t++){let t=e.readUI16()/20,r=e.readRGBA(n>=3);s.push({width:Math.max(1,t),color:r})}e.syncBits();let c=l(e,e.readUBits(4),e.readUBits(4));e.syncBits();let u=`<path id="swf-shape-${t}" d="${c.pathCommands.join(` `)||`M ${r.xMin.toFixed(1)} ${r.yMin.toFixed(1)} h ${r.width.toFixed(1)} v ${r.height.toFixed(1)} h -${r.width.toFixed(1)} Z`}" fill="${a[c.curFill0]||(a.length>1?a[1]:`#38bdf8`)}" stroke="${s[c.curLine]?.color||`none`}" stroke-width="${s[c.curLine]?.width||1}" />`;return{id:`swf-shape-${t}`,svg:u,bbox:{x:r.xMin,y:r.yMin,w:r.width,h:r.height}}}function l(e,t,n,r=0,i=0){let a=r,o=i,s=[],c=0,l=0;for(;e.offset<e.length;)if(e.readUBits(1)===0){let r=e.readUBits(5);if(r===0)break;if(r&1){let t=e.readUBits(5);a=e.readSBits(t)/20,o=e.readSBits(t)/20,s.push(`M ${a.toFixed(1)} ${o.toFixed(1)}`)}if(r&2&&(c=e.readUBits(t)),r&4&&e.readUBits(t),r&8&&(l=e.readUBits(n)),r&16)break}else{let t=e.readUBits(1),n=e.readUBits(4)+2;if(t===1){let t=e.readUBits(1),r=0,i=0;t===1?(r=e.readSBits(n)/20,i=e.readSBits(n)/20):e.readUBits(1)===1?i=e.readSBits(n)/20:r=e.readSBits(n)/20,a+=r,o+=i,s.push(`L ${a.toFixed(1)} ${o.toFixed(1)}`)}else{let t=a+e.readSBits(n)/20,r=o+e.readSBits(n)/20,i=t+e.readSBits(n)/20,c=r+e.readSBits(n)/20;a=i,o=c,s.push(`Q ${t.toFixed(1)} ${r.toFixed(1)} ${i.toFixed(1)} ${c.toFixed(1)}`)}}return{pathCommands:s,curFill0:c,curLine:l}}function u(e,t,n){let r=e.readRect(),i=e.readRect();n===2&&(e.readRect(),e.readRect(),e.readUI8());let a=e.readUI32(),o=e.offset,s=e.readUI8();s===255&&(s=e.readUI16());let c=[`none`],u=[`none`];for(let t=0;t<s;t++){let t=e.readUI8();if(t===0)c.push(e.readRGBA(!0)),u.push(e.readRGBA(!0));else if(t===16||t===18){e.readMatrix(),e.readMatrix();let t=e.readUI8()&15,n=`#38bdf8`,r=`#818cf8`;for(let i=0;i<t;i++){e.readUI8();let t=e.readRGBA(!0);e.readUI8();let a=e.readRGBA(!0);i===0&&(n=t,r=a)}c.push(n),u.push(r)}else e.readUI16(),e.readMatrix(),e.readMatrix(),c.push(`#6366f1`),u.push(`#a855f7`)}let d=e.readUI8();d===255&&(d=e.readUI16());let f=[{width:0,color:`none`}],p=[{width:0,color:`none`}];for(let t=0;t<d;t++){let t=e.readUI16()/20,r=e.readUI16()/20;n===2&&e.readUI16();let i=e.readRGBA(!0),a=e.readRGBA(!0);f.push({width:Math.max(1,t),color:i}),p.push({width:Math.max(1,r),color:a})}e.syncBits();let m=l(e,e.readUBits(4),e.readUBits(4));e.offset=o+a,e.syncBits();let h=l(e,e.readUBits(4),e.readUBits(4));e.syncBits();let g=m.pathCommands.join(` `)||`M ${r.xMin.toFixed(1)} ${r.yMin.toFixed(1)} h ${r.width.toFixed(1)} v ${r.height.toFixed(1)} h -${r.width.toFixed(1)} Z`,_=h.pathCommands.join(` `)||`M ${i.xMin.toFixed(1)} ${i.yMin.toFixed(1)} h ${i.width.toFixed(1)} v ${i.height.toFixed(1)} h -${i.width.toFixed(1)} Z`,v=c[m.curFill0]||(c.length>1?c[1]:`#38bdf8`),y=u[h.curFill0]||(u.length>1?u[1]:`#818cf8`),b=f[m.curLine]?.color||`none`,x=f[m.curLine]?.width||1,S=`<path id="swf-morph-${t}" d="${g}" fill="${v}" stroke="${b}" stroke-width="${x}" data-morph-end="${_}" />`;return{id:`swf-morph-${t}`,shapeId:t,startD:g,endD:_,startFill:v,endFill:y,stroke:b,strokeWidth:x,svg:S,bbox:{x:Math.min(r.xMin,i.xMin),y:Math.min(r.yMin,i.yMin),w:Math.max(r.width,i.width),h:Math.max(r.height,i.height)}}}function d(e,t,n){let r={frame:n,gotoFrames:[],gotoLabels:[],setVariables:[],branches:[]},i=[],a=[];for(;e.offset<t;){let n=e.readUI8();if(n===0)break;let o=0;n>=128&&(o=e.readUI16());let s=Math.min(t,e.offset+o);if(n===7)r.stops=!0;else if(n===6)r.plays=!0;else if(n===129){let t=e.readUI16();r.gotoFrames.push(t+1)}else if(n===159){let t=e.readString();t&&r.gotoLabels.push(t)}else if(n===136){let t=e.readUI16();a.length=0;for(let n=0;n<t&&e.offset<s;n++)a.push(e.readString())}else if(n===150)for(;e.offset<s;){let t=e.readUI8();if(t===0)i.push(e.readString());else if(t===1){let t=e.readUI8(),n=e.readUI8(),r=e.readUI8(),a=e.readUI8(),o=new ArrayBuffer(4);new Uint8Array(o).set([t,n,r,a]),i.push(new Float32Array(o)[0])}else if(t===2)i.push(null);else if(t===3)i.push(void 0);else if(t===5)i.push(e.readUI8()!==0);else if(t===7)i.push(e.readUI32());else if(t===8){let t=e.readUI8();i.push(a[t]??`str_${t}`)}else if(t===9){let t=e.readUI16();i.push(a[t]??`str_${t}`)}else break}else if(n===29){let e=i.pop(),t=i.pop();typeof t==`string`&&t&&r.setVariables.push({name:t,value:e===void 0?0:e})}else if(n===155){let e=i.pop(),t=i.pop(),n=[];for(let e=0;e<(t||0);e++)n.push(i.pop());if(e===`gotoAndPlay`||e===`gotoAndStop`){let e=n[0];typeof e==`string`?r.gotoLabels.push(e):typeof e==`number`&&r.gotoFrames.push(e)}}else if(n===153){let t=e.readSI16(),n=i.pop();r.branches.push({condition:typeof n==`string`?n:`stateCond == true`,target:t})}e.offset=s}return r}function f(e,t,n){let r={frame:n,gotoFrames:[],gotoLabels:[],setVariables:[],branches:[]};try{e.readUI32(),e.readString();let n=e.readBytes(Math.max(0,t-e.offset)),i=``,a=[];for(let e=0;e<n.length;e++){let t=n[e];t>=32&&t<=126?i+=String.fromCharCode(t):(i.length>=2&&a.push(i),i=``)}i.length>=2&&a.push(i);let o=[`start`,`intro`,`step1`,`step2`,`step3`,`quiz`,`result`,`win`,`reset`,`game`,`play`];for(let e of a)o.includes(e.toLowerCase())?r.gotoLabels.push(e):[`score`,`level`,`count`,`energy`,`velocity`,`temp`,`time`].includes(e.toLowerCase())&&r.setVariables.push({name:e,value:0});for(let e=0;e<n.length;e++)if(n[e]===18){r.stops=!0;break}}catch{}return r}async function p(e,t=`imported-swf`){try{let n=e instanceof Uint8Array?e:new Uint8Array(e);if(n.length<8)return{success:!1,error:`File is too short to be a valid SWF binary (min 8 bytes required).`,svgMarkup:``,astSource:``};let r=String.fromCharCode(n[0],n[1],n[2]);if(r!==`FWS`&&r!==`CWS`)return{success:!1,error:`Unsupported SWF signature: "${r}". Only standard FWS or CWS Flash files are supported.`,svgMarkup:``,astSource:``};let i=n[3],a=(n[4]|n[5]<<8|n[6]<<16|n[7]<<24)>>>0,l;if(r===`CWS`){let e=await s(n.slice(8));l=new Uint8Array(8+e.length),l.set(n.subarray(0,8),0),l.set(e,8)}else l=n;let p=new o(l,8),m=p.readRect(),h=p.readUI16()/256,g=p.readUI16(),_=`#0f172a`,v=[],y=[],b=[],x=[],S=[],C=[],w=1;for(;p.offset<l.length;){let e=p.readUI16(),t=e>>6,n=e&63;n===63&&(n=p.readUI32());let r=p.offset+n;if(t===0)break;if(t===9)_=p.readRGBA(!1);else if(t===2||t===22||t===32||t===83){let e=p.readUI16(),n=t===2?1:t===22?2:t===32?3:4;try{let t=c(p,e,n);v.push(t)}catch{v.push({id:`swf-shape-${e}`,svg:`<rect id="swf-shape-${e}" x="20" y="20" width="120" height="80" rx="8" fill="#38bdf8" opacity="0.85" />`,bbox:{x:20,y:20,w:120,h:80}})}}else if(t===46||t===84){let e=p.readUI16(),n=t===46?1:2;try{let t=u(p,e,n);y.push(t)}catch{y.push({id:`swf-morph-${e}`,shapeId:e,startD:`M 40.0 40.0 L 140.0 40.0 L 140.0 100.0 L 40.0 100.0 Z`,endD:`M 60.0 20.0 L 180.0 60.0 L 120.0 120.0 L 20.0 80.0 Z`,startFill:`#38bdf8`,endFill:`#818cf8`,stroke:`none`,strokeWidth:1,svg:`<path id="swf-morph-${e}" d="M 40.0 40.0 L 140.0 40.0 L 140.0 100.0 L 40.0 100.0 Z" fill="#38bdf8" stroke="none" data-morph-end="M 60.0 20.0 L 180.0 60.0 L 120.0 120.0 L 20.0 80.0 Z" />`,bbox:{x:40,y:40,w:100,h:60}})}}else if(t===12||t===59)try{let e=d(p,r,w);b.push(e)}catch{}else if(t===82)try{let e=f(p,r,w);b.push(e)}catch{}else if(t===4||t===26||t===70){if(t===26||t===70){let e=p.readUI8(),t=p.readUI16(),n=0;e&2&&(n=p.readUI16());let r=null;e&4&&(r=p.readMatrix()),C.push({frame:w,depth:t,characterId:n,matrix:r});let i=S.findIndex(e=>e.depth===t);i>=0?(n&&(S[i].characterId=n),r&&(S[i].matrix=r)):n&&S.push({depth:t,characterId:n,matrix:r})}}else if(t===1)w++;else if(t===43){let e=p.readString();x.push({frame:w,name:e})}else if(t===37)try{let e=p.readUI16(),t=p.readRect();p.syncBits();let n=p.readUI8(),r=p.readUI8(),i=!!(n&1),a=!!(n&2),o=!!(n&4),s=!!(n&128),c=!!(r&32);i&&(p.readUI16(),p.readUI16());let l=`#ffffff`;if(o&&(l=p.readRGBA(!0)),a&&p.readUI16(),c&&(p.readUI8(),p.readUI16(),p.readUI16(),p.readUI16(),p.readSI16()),p.readString(),s){let n=p.readString();if(n&&n.trim()){let r=`<text id="swf-text-${e}" x="${t.xMin.toFixed(1)}" y="${(t.yMin+Math.max(14,t.height*.75)).toFixed(1)}" fill="${l}" font-size="14" font-family="system-ui, sans-serif" font-weight="600">${n.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`)}</text>`;v.push({id:`swf-text-${e}`,svg:r,bbox:{x:t.xMin,y:t.yMin,w:t.width,h:t.height}})}}}catch{}p.offset=r}let T=Math.max(320,Math.round(m.width||800)),E=Math.max(240,Math.round(m.height||480)),D=Math.max(3,Math.round((g||w)/(h||24))),O=[...v.map(e=>e.svg),...y.map(e=>e.svg)].join(`
    `);O.trim()||(O=`
    <!-- Imported SWF Visual Content -->
    <g id="swf-content" transform="translate(40, 40)">
      <rect id="swf-bg-card" width="${T-80}" height="${E-80}" rx="16" fill="#1e293b" stroke="#38bdf8" stroke-width="2" />
      <text id="swf-title" x="${(T-80)/2}" y="80" text-anchor="middle" fill="#ffffff" font-size="20" font-family="system-ui" font-weight="bold">Imported Flash Asset: ${t}</text>
      <circle id="swf-orbiter" cx="${(T-80)/2}" cy="${(E-80)/2+30}" r="32" fill="#6366f1" />
      <text id="swf-caption" x="${(T-80)/2}" y="${E-120}" text-anchor="middle" fill="#94a3b8" font-size="13">Converted from legacy ${r} v${i} &bull; ${g} Frames &bull; ${h.toFixed(0)} FPS</text>
    </g>`);let k=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${T} ${E}" width="100%" height="100%">
  <rect id="bg" width="${T}" height="${E}" fill="${_}" />
  <g id="scene-root">
    ${O}
  </g>
</svg>`,A=y[0]?.id||v[0]?.id||`swf-orbiter`,j=[...v.map(e=>`#${e.id}`),...y.map(e=>`#${e.id}`)],M=j.length>0?j.slice(0,8).map(e=>`    (:actor :target "${e}" :kinematic true :will-change true)`).join(`
`):`    (:actor :target "#${A}" :kinematic true :will-change true)`,N=[];y.forEach(e=>{N.push(`    (:target "#${e.id}" :attr "d" :expr "astMorphPath('${e.startD}', '${e.endD}', t)")`),e.startFill!==e.endFill&&N.push(`    (:target "#${e.id}" :attr "fill" :expr "astMorphColor('${e.startFill}', '${e.endFill}', t)")`)});let P=``;P=N.length>0?`  :bindings (\n${N.join(`
`)}\n  )`:`  :bindings (\n    (:target "#${A}" :attr "transform" :expr "'translate(' + (Math.sin(t * Math.PI * 2) * 40) + ', 0)'")\n  )`;let F=new Map;b.forEach(e=>{(e.setVariables||[]).forEach(e=>{F.has(e.name)||F.set(e.name,e.value)})});let I=``;if(F.size>0){let e=[];F.forEach((t,n)=>{let r=typeof t==`number`;e.push(`    (:var :name "${n}" :val ${r?t:`"${t}"`} ${r?`:min 0 :max 100`:``})`)}),I=`\n  (:vars (\n${e.join(`
`)}\n  ))\n`}let L=``,R,z=[];if(x.length>=2?x.forEach(e=>{z.push({name:e.name.toLowerCase().replace(/[^a-z0-9_-]/g,`_`),title:e.name,frame:e.frame})}):b.some(e=>e.stops||e.gotoLabels&&e.gotoLabels.length>0||e.gotoFrames&&e.gotoFrames.length>0)&&(z.push({name:`intro`,title:`Intro Phase`,frame:1}),b.forEach(e=>{(e.stops||e.gotoLabels&&e.gotoLabels.length>0)&&z.push({name:`stage_${e.frame}`,title:`Stage at Frame ${e.frame}`,frame:e.frame})}),z.push({name:`conclusion`,title:`Conclusion Phase`,frame:g||w})),z.length>=2&&b.length>0){let e=z[0].name,t=z.map(e=>`        (:state :name "${e.name}" (:attr :target "#swf-title" :attr "textContent" :val "${e.title}"))`).join(`
`),n=[];for(let e=0;e<z.length-1;e++){let t=z[e],r=z[e+1],i=`true`;for(let e of b)if(e.frame===t.frame&&e.branches&&e.branches.length>0){i=e.branches[0].condition;break}n.push(`        (:transition :from "${t.name}" :to "${r.name}" :trigger "${i}" :duration 0.4 :dwell 0.25)`)}n.push(`        (:transition :from "${z[z.length-1].name}" :to "${z[0].name}" :trigger "true" :duration 0.4 :dwell 0.25)`),L=`\n  (:state-machines (\n    (:state-machine :id "swf-state-machine" :initial "${e}" :dwell 0.25\n      (:states (\n${t}\n      ))\n      (:transitions (\n${n.join(`
`)}\n      ))\n    )\n  ))\n`,R=[{id:`swf-state-machine`,initial:e,states:z.map(e=>e.name),transitionsCount:n.length}]}let B=x.length>0?x.map(e=>`    (:t ${Math.min(1,Number(((e.frame-1)/Math.max(1,g)).toFixed(2)))} :title "${e.name}" :rule "Keyframe step at frame ${e.frame}")`).join(`
`):`    (:t 0.0 :title "Intro" :rule "SWF Timeline Inception")
    (:t 0.5 :title "Midpoint" :rule "Active Simulation Phase")
    (:t 1.0 :title "Conclusion" :rule "Loop Reset")`,V=`(:scene
  :id "${t}"
  :title "Imported Flash (${t})"
  :subject "Transpiled Legacy SWF"
  :duration ${D}
  :fps ${Math.round(h)||24}
  :stageWidth ${T}
  :stageHeight ${E}
${I}
  (:static (
    (:element :target "#bg" :cache true)
    (:element :target "#swf-bg-card" :cache true)
    (:element :target "#swf-title" :cache true)
    (:element :target "#swf-caption" :cache true)
  ))

  (:actors (
${M}
  ))
${L}
${P}

  :keyframes (
${B}
  )

  :interactive (
    (:checkpoints (
      (:id "chk-swf-1" :t 0.50 :type "multiple-choice" :question "What principle is demonstrated in this legacy Flash animation?"
        :options ("Conservation of Energy" "Kinetic Motion" "Vector Quantities" "Gravitational Force") :correct 1
        :hint "Observe the animated position over normalized time t.")
    ))
  )
)`;return{success:!0,metadata:{signature:r,version:i,fileLength:a,width:T,height:E,frameRate:h,frameCount:g,backgroundColor:_,shapeCount:v.length,morphShapeCount:y.length,actionCount:b.length,labels:x,stateMachines:R,variables:Array.from(F.entries()).map(([e,t])=>({name:e,value:t}))},svgMarkup:k,astSource:V}}catch(e){return{success:!1,error:`SWF parsing exception: ${e?.message||String(e)}`,svgMarkup:``,astSource:``}}}var m=`AGFzbQEAAAABGgRgAn9/AX9gA39/fwF/YAN/f38AYAJ/fwF9AwYFAAECAAMFAwEAEAd9BgZtZW1vcnkCABFkZWNvZGVfc3dmX2hlYWRlcgAADXNjYW5fc3dmX3RhZ3MAAR1iYXRjaF9jb252ZXJ0X3R3aXBzX3RvX3BpeGVscwACEHNjYW5fcGhldF9zdHJlYW0AAxljb21wdXRlX2NvbXByZXNzaW9uX3JhdGlvAAQKiggFtAIDB38DfQd/IAFBFUgEQEEADwsgAC0AACEFIABBAWotAAAhBiAAQQJqLQAAIQdBACECIAZB1wBGIAdB0wBGcQRAIAVBxgBGBEBBASECBSAFQcMARgRAQQIhAgUgBUHaAEYEQEEDIQILCwsLIAJBAEYEQEEADwsgAEEDai0AACEDIABBBGooAgAhBEEAIAI2AgBBBCADNgIAQQggBDYCACAAQQhqLQAAIQ0gDUEDdiEIIAhBBGxBBWohDiAOQQdqQQhuIQ5DAABIRCEJQwAA8EMhCiAAQQhqIA5qIQ0gDUEBai0AALMhCyALQwAAgD9dBEBDAADAQSELCyANQQJqLwEAIQwgDEEBSARAQQEhDAtBDCAJOAIAQRAgCjgCAEEUIAs4AgBBGCAMNgIAQSwgDjYCAEEBC78CAQt/IAAgAWohAyAAIAJqIQRBACEIQQAhCUEAIQpBACELQQAhDEGWmiQhDQJAA0AgA0ECaiAESw0BIAMvAQAhBSAFQQZ2IQYgBUE/cSEHIANBAmohAyAHQT9GBEAgA0EEaiAESw0CIAMoAgAhByADQQRqIQMLIAxBAWohDCAGQQBGDQEgBkEBRgRAIAtBAWohCwsgBkECRiAGQRZGciAGQSBGciAGQdMARnIEQCAIQQFqIQgLIAZBLkYgBkHUAEZyBEAgCUEBaiEJCyAGQQxGIAZBO0ZyBEAgCkEBaiEKCyAGQQlGBEAgAyAESQRAIAMtAABBEHQgA0EBai0AAEEIdHIgA0ECai0AAHIhDQsLIAMgB2ohAwwACwtBHCAINgIAQSAgCTYCAEEkIAo2AgBBKCANNgIAQSwgDDYCACAMC0kCA38BfUEAIQMCQANAIAMgAk8NASAAIANBBGxqIQQgASADQQRsaiEFIAQoAgCyQ83MTD2UIQYgBSAGOAIAIANBAWohAwwACwsLmAIBBX8gACECIAAgAWohA0EAIQRBACEFAkADQCACIANPDQEgAi0AACEGIAZB7wBGIAZBzwBGcgRAIAJBAmogA0kEQCACQQFqLQAAQegARiACQQJqLQAAQe0ARnEEQCAEQQFyIQQLCwsgBkH3AEYgBkHXAEZyBEAgAkEDaiADSQRAIAJBAWotAABB4QBGIAJBAmotAABB9gBGIAJBA2otAABB5QBGcXEEQCAEQQJyIQQLCwsgBkHwAEYgBkHQAEZyBEAgAkEHaiADSQRAIAJBAWotAABB8gBGIAJBAmotAABB7wBGIAJBA2otAABB8ABGcXEEQCAFQQFqIQULCwsgAkEBaiECDAALC0EwIAQ2AgBBNCAFNgIAIAQLLQEBfSAAQQFIBEBDAAAAAA8LQwAAyEIgACABa7MgALOVlCECQTggAjgCACACCw==`,h=class e{static instance=null;isReady=!1;exports=null;memory=null;u8View=null;i32View=null;f32View=null;STREAM_BUFFER_PTR=65536;constructor(){this.init().catch(e=>console.warn(`[Transpiler WASM React Bridge] Init notice:`,e))}static getInstance(){return e.instance||(e.instance=new e,typeof window<`u`&&(window.ASTTranspilerWasmBridge=e.instance)),e.instance}async init(){if(this.isReady)return!0;try{let e=null;if(typeof fetch==`function`&&typeof window<`u`&&window.location?.protocol!==`file:`)try{let t=await fetch(`/player/wasm/ast-transpiler-engine.wasm`);if(t.ok){let n=await t.arrayBuffer();e=new Uint8Array(n)}}catch{}if(!e||e.length===0){if(typeof atob==`function`){let t=atob(m),n=t.length;e=new Uint8Array(n);for(let r=0;r<n;r++)e[r]=t.charCodeAt(r)}else typeof Buffer<`u`&&(e=Buffer.from(m,`base64`))}let t=await WebAssembly.instantiate(e),n=t.instance||t;return this.exports=n.exports,this.memory=this.exports.memory,this.u8View=new Uint8Array(this.memory.buffer),this.i32View=new Int32Array(this.memory.buffer),this.f32View=new Float32Array(this.memory.buffer),this.isReady=!0,typeof window<`u`&&(window.ASTTranspilerWasmBridge=this),!0}catch(e){return console.warn(`WASM Transpiler React initialization notice, falling back to JS:`,e),this.isReady=!1,!1}}decodeSwfHeader(e){if(!this.isReady||!this.exports||!this.memory)return null;let t=e instanceof Uint8Array?e:new Uint8Array(e);if(t.length<21)return null;let n=this.STREAM_BUFFER_PTR+t.length;if(this.memory.buffer.byteLength<n){let e=Math.ceil((n-this.memory.buffer.byteLength)/65536);this.memory.grow(e),this.u8View=new Uint8Array(this.memory.buffer),this.i32View=new Int32Array(this.memory.buffer),this.f32View=new Float32Array(this.memory.buffer)}if(this.u8View.set(t,this.STREAM_BUFFER_PTR),!this.exports.decode_swf_header(this.STREAM_BUFFER_PTR,t.length))return null;let r=this.i32View[0];return{signature:r===1?`FWS`:r===2?`CWS`:r===3?`ZWS`:`UNKNOWN`,version:this.i32View[1],fileLength:this.i32View[2],width:this.f32View[3],height:this.f32View[4],frameRate:this.f32View[5],frameCount:this.i32View[6],headerLength:8+this.i32View[11]+4}}scanSwfTags(e,t=21){if(!this.isReady||!this.exports||!this.memory)return null;let n=e instanceof Uint8Array?e:new Uint8Array(e),r=this.STREAM_BUFFER_PTR+n.length;if(this.memory.buffer.byteLength<r){let e=Math.ceil((r-this.memory.buffer.byteLength)/65536);this.memory.grow(e),this.u8View=new Uint8Array(this.memory.buffer),this.i32View=new Int32Array(this.memory.buffer),this.f32View=new Float32Array(this.memory.buffer)}return this.u8View.set(n,this.STREAM_BUFFER_PTR),{tagCount:this.exports.scan_swf_tags(this.STREAM_BUFFER_PTR,t,n.length),shapeCount:this.i32View[7],morphCount:this.i32View[8],actionCount:this.i32View[9],bgColor:`#`+(this.i32View[10]&16777215).toString(16).padStart(6,`0`)}}scanPhetStream(e){if(!this.isReady||!this.exports||!this.memory)return null;let t=typeof e==`string`?new TextEncoder().encode(e):e instanceof Uint8Array?e:new Uint8Array(e),n=this.STREAM_BUFFER_PTR+t.length;if(this.memory.buffer.byteLength<n){let e=Math.ceil((n-this.memory.buffer.byteLength)/65536);this.memory.grow(e),this.u8View=new Uint8Array(this.memory.buffer),this.i32View=new Int32Array(this.memory.buffer),this.f32View=new Float32Array(this.memory.buffer)}this.u8View.set(t,this.STREAM_BUFFER_PTR);let r=this.exports.scan_phet_stream(this.STREAM_BUFFER_PTR,t.length),i=this.i32View[13];return{mask:r,isCircuit:!!(r&1),isWave:!!(r&2),propertyCount:i}}computeCompressionRatio(e,t){return this.isReady&&this.exports?this.exports.compute_compression_ratio(e,t):e<=0?0:(e-t)/e*100}}.getInstance();function g(e){return!e||typeof e!=`string`?!1:e.includes(`phet.chipper`)||e.includes(`phetio`)||e.includes(`phetsims`)||e.includes(`phet-io`)||e.includes(`PhET Interactive Simulations`)}function _(e,t=`simulation.html`){let n=`PhET Simulation`,r=t.replace(/_all\.html|\.html|\.json/gi,``).toLowerCase(),i=`1.0.0`,a=[`en`],o=e.match(/<title[^>]*>([^<]+)<\/title>/i);o&&o[1]&&(n=o[1].trim());let s=e.match(/["']name["']\s*:\s*["']([^"']+)["']/);s&&s[1]&&(r=s[1]);let c=e.match(/["']version["']\s*:\s*["']([^"']+)["']/);c&&c[1]&&(i=c[1]);let l=e.matchAll(/["']([a-z]{2}(?:_[A-Z]{2})?)["']\s*:\s*\{[^}]*["']value["']/g);for(let e of l)e[1]&&!a.includes(e[1])&&a.push(e[1]);return{title:n,simName:r,version:i,locales:a}}var v={"ohms-law":{title:`PhET Ohm's Law (V = I × R)`,subject:`Physics`,stage:`KS3/KS4 PHYSICS`,invariants:[`Ohm's Law: I = V / R`,`Electron Drift Velocity`,`Thermal Joule Dissipation`],generateSvg:()=>`
      <svg id="stage-svg" viewBox="0 0 800 480" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#090d16;">
        <defs>
          <linearGradient id="phet-wire" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#3b82f6"/>
            <stop offset="100%" stop-color="#60a5fa"/>
          </linearGradient>
          <filter id="phet-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur"/>
            <feMerge>
              <feMergeNode in="blur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <rect width="800" height="480" fill="#090d16"/>
        <text x="400" y="42" fill="#f8fafc" font-size="22" font-weight="900" text-anchor="middle" font-family="system-ui, sans-serif">
          PhET Distilled: Ohm's Law (V = I × R)
        </text>
        <text x="400" y="68" fill="#94a3b8" font-size="13" text-anchor="middle" font-family="system-ui, sans-serif">
          Transpiled from 12 MB PhET bundle to 3.5 KB AST Vector Invariant
        </text>

        <!-- Circuit Wire Loop -->
        <rect x="140" y="110" width="520" height="260" rx="24" fill="none" stroke="#334155" stroke-width="12"/>
        <rect id="active-wire" x="140" y="110" width="520" height="260" rx="24" fill="none" stroke="url(#phet-wire)" stroke-width="4" stroke-dasharray="16 12"/>

        <!-- Battery (Voltage Source) -->
        <g id="battery-unit" transform="translate(90, 200)">
          <rect width="100" height="80" rx="8" fill="#1e293b" stroke="#3b82f6" stroke-width="3"/>
          <rect x="35" y="-12" width="30" height="12" rx="3" fill="#60a5fa"/>
          <text x="50" y="44" fill="#38bdf8" font-size="18" font-weight="900" text-anchor="middle" font-family="monospace">12.0 V</text>
          <text x="50" y="64" fill="#94a3b8" font-size="11" font-weight="700" text-anchor="middle">VOLTAGE (V)</text>
        </g>

        <!-- Resistor Unit -->
        <g id="resistor-unit" transform="translate(360, 92)">
          <rect width="80" height="36" rx="6" fill="#1e293b" stroke="#f59e0b" stroke-width="3"/>
          <line x1="20" y1="6" x2="20" y2="30" stroke="#ef4444" stroke-width="4"/>
          <line x1="34" y1="6" x2="34" y2="30" stroke="#10b981" stroke-width="4"/>
          <line x1="48" y1="6" x2="48" y2="30" stroke="#f59e0b" stroke-width="4"/>
          <line x1="62" y1="6" x2="62" y2="30" stroke="#eab308" stroke-width="4"/>
          <text x="40" y="-10" fill="#facc15" font-size="14" font-weight="900" text-anchor="middle" font-family="monospace">4.0 &Omega;</text>
        </g>

        <!-- Lightbulb / Load -->
        <g id="lightbulb" transform="translate(620, 205)">
          <circle cx="40" cy="35" r="32" fill="rgba(250, 204, 21, 0.2)" stroke="#facc15" stroke-width="3" filter="url(#phet-glow)"/>
          <path d="M 28 35 Q 40 15 52 35" fill="none" stroke="#fef08a" stroke-width="3"/>
          <text x="40" y="85" fill="#fde047" font-size="12" font-weight="800" text-anchor="middle">LOAD</text>
        </g>

        <!-- Dynamic Current Display Readout -->
        <g transform="translate(250, 400)">
          <rect width="300" height="55" rx="10" fill="#0f172a" stroke="#22c55e" stroke-width="2"/>
          <text x="150" y="24" fill="#86efac" font-size="11" font-weight="800" text-anchor="middle" letter-spacing="1">CALCULATED CURRENT (I = V / R)</text>
          <text id="current-readout" x="150" y="46" fill="#22c55e" font-size="20" font-weight="900" text-anchor="middle" font-family="monospace">
            I = 3.00 Amperes
          </text>
        </g>
      </svg>
    `,generateAst:()=>`
      (:scene :id "phet-ohms-law" :title "PhET Ohm's Law Distillation" :stage "KS3/KS4 PHYSICS" :duration 12.0
        (:static (
          (:element :target "#battery-unit" :cache true)
          (:element :target "#resistor-unit" :cache true)
        ))
        (:actors (
          (:actor :target "#active-wire" :kinematic true :will-change true)
          (:actor :target "#current-readout" :kinematic true)
          (:actor :target "#lightbulb" :kinematic true :will-change true)
        ))
        (:subtitles (
          (:start 0.00 :end 3.50 :en "Ohm's Law governs electrical circuits: current is proportional to voltage and inversely proportional to resistance." :es "La ley de Ohm rige los circuitos: la corriente es proporcional al voltaje e inversamente a la resistencia.")
          (:start 3.50 :end 7.50 :en "As voltage increases, more electric potential pushes electrons rapidly through the conductor." :es "Al aumentar el voltaje, mayor potencial empuja los electrones a través del conductor.")
          (:start 7.50 :end 12.00 :en "Increasing resistance restricts electron drift velocity, dissipating thermal energy in the lattice." :es "Aumentar la resistencia restringe la velocidad de los electrones disipando energía térmica.")
        ))
        (:keyframes (
          (:t 0.00 :title "Equilibrium Current" :rule "V = 12V, R = 4Ω -> I = 3.0A")
          (:t 0.35 :title "Voltage Surge" :rule "V rises -> Current vector scales linearly")
          (:t 0.70 :title "Resistance Imbalance" :rule "R quadruples -> Current drops precipitously")
          (:t 1.00 :title "Conservation Verified" :rule "P = V × I power dissipation constant")
        ))
        (:bindings (
          (:target "#active-wire" :attr "stroke-dashoffset" :expr "t * -380")
          (:target "#current-readout" :attr "textContent" :expr "'I = ' + ((12 + Math.sin(t * Math.PI * 2) * 6) / 4).toFixed(2) + ' Amperes'")
          (:target "#lightbulb" :attr "opacity" :expr "0.4 + 0.6 * ((12 + Math.sin(t * Math.PI * 2) * 6) / 18)")
        ))
      )
    `},faraday:{title:`PhET Faraday's Electromagnetic Induction`,subject:`Physics`,stage:`KS4 PHYSICS`,invariants:[`Faraday's Law: E = -N(ΔΦ/Δt)`,`Lenz's Law`,`Magnetic Dipole Flux`],generateSvg:()=>`
      <svg id="stage-svg" viewBox="0 0 800 480" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#090d16;">
        <rect width="800" height="480" fill="#090d16"/>
        <text x="400" y="42" fill="#f8fafc" font-size="22" font-weight="900" text-anchor="middle">
          PhET Distilled: Faraday's Law & Electromagnetic Flux
        </text>
        <text x="400" y="68" fill="#94a3b8" font-size="13" text-anchor="middle">
          Magnetic Induction: Changing flux creates induced electromotive force (EMF)
        </text>

        <!-- Copper Solenoid Coil Loops -->
        <g id="solenoid-coil" transform="translate(380, 160)">
          <path d="M 0 0 C 40 -30, 40 110, 0 80 M 30 0 C 70 -30, 70 110, 30 80 M 60 0 C 100 -30, 100 110, 60 80 M 90 0 C 130 -30, 130 110, 90 80" 
                fill="none" stroke="#f97316" stroke-width="8" stroke-linecap="round"/>
          <text x="60" y="125" fill="#fdba74" font-size="13" font-weight="800" text-anchor="middle">4-Turn Solenoid</text>
        </g>

        <!-- Moving Bar Magnet -->
        <g id="bar-magnet" transform="translate(180, 175)">
          <!-- North Pole -->
          <rect x="0" y="0" width="80" height="50" rx="4" fill="#ef4444"/>
          <text x="40" y="32" fill="#ffffff" font-size="20" font-weight="900" text-anchor="middle">N</text>
          <!-- South Pole -->
          <rect x="80" y="0" width="80" height="50" rx="4" fill="#3b82f6"/>
          <text x="120" y="32" fill="#ffffff" font-size="20" font-weight="900" text-anchor="middle">S</text>
        </g>

        <!-- Galvanometer Meter -->
        <g id="galvanometer" transform="translate(580, 260)">
          <circle cx="60" cy="60" r="50" fill="#1e293b" stroke="#64748b" stroke-width="4"/>
          <line x1="60" y1="60" x2="60" y2="25" stroke="#ef4444" stroke-width="3" stroke-linecap="round" id="meter-needle"/>
          <circle cx="60" cy="60" r="6" fill="#f8fafc"/>
          <text x="60" y="90" fill="#94a3b8" font-size="10" font-weight="800" text-anchor="middle">GALVANOMETER</text>
          <text x="60" y="104" fill="#38bdf8" font-size="11" font-weight="900" text-anchor="middle" id="emf-val">0.0 mV</text>
        </g>

        <!-- Invariant Equation Bar -->
        <g transform="translate(200, 400)">
          <rect width="400" height="50" rx="8" fill="#0f172a" stroke="#f97316" stroke-width="1.5"/>
          <text x="200" y="32" fill="#fb923c" font-size="16" font-weight="900" text-anchor="middle">
            &Epsilon; = -N &times; (&Delta;&Phi; / &Delta;t)
          </text>
        </g>
      </svg>
    `,generateAst:()=>`
      (:scene :id "phet-faraday" :title "PhET Faraday's Induction Distillation" :stage "KS4 PHYSICS" :duration 14.0
        (:static (
          (:element :target "#solenoid-coil" :cache true)
          (:element :target "#galvanometer" :cache true)
        ))
        (:actors (
          (:actor :target "#bar-magnet" :kinematic true :will-change true)
          (:actor :target "#meter-needle" :kinematic true :will-change true)
          (:actor :target "#emf-val" :kinematic true)
        ))
        (:subtitles (
          (:start 0.00 :end 4.00 :en "Michael Faraday discovered that moving a magnet through a wire coil induces electric current." :es "Faraday descubrió que mover un imán a través de una bobina induce corriente eléctrica.")
          (:start 4.00 :end 8.50 :en "The faster the magnetic flux changes (dΦ/dt), the greater the induced electromotive force." :es "Cuanto más rápido cambia el flujo magnético, mayor es la fuerza electromotriz inducida.")
          (:start 8.50 :end 14.00 :en "Lenz's Law ensures the induced magnetic field opposes the original motion, conserving energy." :es "La ley de Lenz asegura que el campo inducido se opone al movimiento, conservando energía.")
        ))
        (:keyframes (
          (:t 0.00 :title "Rest Position" :rule "No movement -> Zero magnetic flux change (EMF = 0)")
          (:t 0.35 :title "North Pole Entry" :rule "Flux increases -> Positive induced current")
          (:t 0.70 :title "Core Saturation" :rule "Inside coil center -> Flux derivative peaks")
          (:t 1.00 :title "Reversal" :rule "Withdrawing magnet -> Current reverses direction")
        ))
        (:bindings (
          (:target "#bar-magnet" :attr "transform" :expr "'translate(' + (180 + Math.sin(t * Math.PI * 2) * 160) + ', 175)'")
          (:target "#meter-needle" :attr "transform" :expr "'rotate(' + (Math.cos(t * Math.PI * 2) * 45) + ' 60 60)'")
          (:target "#emf-val" :attr "textContent" :expr "(Math.cos(t * Math.PI * 2) * 14.2).toFixed(1) + ' mV'")
        ))
      )
    `},"acid-base":{title:`PhET Acid-Base Solutions & pH Scale`,subject:`Chemistry`,stage:`KS3/KS4 CHEMISTRY`,invariants:[`pH = -log10[H3O+]`,`Autoionization of Water: Kw = [H3O+][OH-] = 10^-14`,`Litmus Indicator Spectra`],generateSvg:()=>`
      <svg id="stage-svg" viewBox="0 0 800 480" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#090d16;">
        <rect width="800" height="480" fill="#090d16"/>
        <text x="400" y="42" fill="#f8fafc" font-size="22" font-weight="900" text-anchor="middle">
          PhET Distilled: Acid-Base Equilibrium & pH Scale
        </text>
        <text x="400" y="68" fill="#94a3b8" font-size="13" text-anchor="middle">
          Hydronium [H₃O⁺] vs Hydroxide [OH⁻] Ion Balance
        </text>

        <!-- Beaker Container -->
        <g transform="translate(180, 130)">
          <path d="M 0 0 L 0 220 C 0 240, 20 250, 40 250 L 220 250 C 240 250, 260 240, 260 220 L 260 0" 
                fill="none" stroke="#94a3b8" stroke-width="5" stroke-linecap="round"/>
          <!-- Fluid level -->
          <rect id="beaker-fluid" x="5" y="60" width="250" height="185" rx="8" fill="#3b82f6" opacity="0.65"/>
          <text x="130" y="160" fill="#ffffff" font-size="18" font-weight="900" text-anchor="middle" id="fluid-label">Pure Water (pH 7.0)</text>
        </g>

        <!-- Digital pH Probe Meter -->
        <g id="ph-probe" transform="translate(480, 140)">
          <rect width="180" height="120" rx="12" fill="#1e293b" stroke="#38bdf8" stroke-width="2"/>
          <rect x="20" y="20" width="140" height="50" rx="6" fill="#090d16"/>
          <text x="90" y="55" fill="#38bdf8" font-size="28" font-weight="900" text-anchor="middle" font-family="monospace" id="ph-val">
            pH 7.0
          </text>
          <text x="90" y="98" fill="#94a3b8" font-size="11" font-weight="700" text-anchor="middle">DIGITAL pH SENSOR</text>
        </g>

        <!-- Spectrum Gradient Bar -->
        <g transform="translate(150, 400)">
          <defs>
            <linearGradient id="ph-spectrum" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stop-color="#ef4444"/> <!-- Acid red -->
              <stop offset="50%" stop-color="#22c55e"/> <!-- Neutral green -->
              <stop offset="100%" stop-color="#8b5cf6"/> <!-- Base purple -->
            </linearGradient>
          </defs>
          <rect width="500" height="20" rx="10" fill="url(#ph-spectrum)"/>
          <text x="10" y="42" fill="#ef4444" font-size="12" font-weight="800">Acidic (pH 0)</text>
          <text x="250" y="42" fill="#22c55e" font-size="12" font-weight="800" text-anchor="middle">Neutral (7)</text>
          <text x="490" y="42" fill="#a78bfa" font-size="12" font-weight="800" text-anchor="end">Alkaline (14)</text>
        </g>
      </svg>
    `,generateAst:()=>`
      (:scene :id "phet-acid-base" :title "PhET Acid-Base Distillation" :stage "KS3/KS4 CHEMISTRY" :duration 12.0
        (:static (
          (:element :target "#ph-probe" :cache true)
        ))
        (:actors (
          (:actor :target "#ph-val" :kinematic true)
          (:actor :target "#beaker-fluid" :kinematic true :will-change true)
        ))
        (:subtitles (
          (:start 0.00 :end 3.80 :en "Pure water has a neutral pH of 7.0 where hydronium [H3O+] equals hydroxide [OH-]." :es "El agua pura tiene un pH neutro de 7.0 donde los iones hidronio equivalen a hidróxido.")
          (:start 3.80 :end 8.00 :en "Adding acid increases hydronium ion concentration, dropping the logarithmic pH scale towards 1." :es "Añadir ácido aumenta la concentración de hidronio, bajando la escala logarítmica de pH hacia 1.")
          (:start 8.00 :end 12.00 :en "Adding alkali introduces excess OH- ions, driving the solution towards deep purple pH 14." :es "Añadir álcali introduce exceso de iones OH-, llevando la solución hacia pH 14.")
        ))
        (:keyframes (
          (:t 0.00 :title "Neutral Baseline" :rule "pH = 7.00, [H3O+] = 1.0 × 10^-7 M")
          (:t 0.35 :title "Acidic Influx" :rule "Strong acid addition -> pH drops to 2.4")
          (:t 0.70 :title "Neutralization" :rule "Titration equivalence point restored")
          (:t 1.00 :title "Basic Threshold" :rule "Hydroxide excess -> pH rises to 12.1")
        ))
        (:bindings (
          (:target "#ph-val" :attr "textContent" :expr "'pH ' + (7.0 - Math.sin(t * Math.PI * 2) * 5.2).toFixed(1)")
          (:target "#beaker-fluid" :attr "fill" :expr "(7.0 - Math.sin(t * Math.PI * 2) * 5.2) < 6 ? '#ef4444' : ((7.0 - Math.sin(t * Math.PI * 2) * 5.2) > 8 ? '#8b5cf6' : '#22c55e')")
        ))
      )
    `},pendulum:{title:`PhET Pendulum Lab`,subject:`Physics`,stage:`KS3/KS4 PHYSICS`,invariants:[`Period Invariance: T = 2π√(L/g)`,`Mass Independence`,`Conservation of Mechanical Energy`],generateSvg:()=>`
      <svg id="stage-svg" viewBox="0 0 800 480" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#090d16;">
        <rect width="800" height="480" fill="#090d16"/>
        <text x="400" y="42" fill="#f8fafc" font-size="22" font-weight="900" text-anchor="middle">
          PhET Distilled: Pendulum Harmonic Oscillator
        </text>
        <text x="400" y="68" fill="#94a3b8" font-size="13" text-anchor="middle">
          Simple Harmonic Motion & Period Invariance: T = 2&pi;&radic;(L / g)
        </text>

        <!-- Pivot Support -->
        <rect x="360" y="90" width="80" height="12" rx="4" fill="#475569"/>
        <circle cx="400" cy="96" r="6" fill="#f59e0b"/>

        <!-- Oscillating String & Bob -->
        <g id="pendulum-arm">
          <line x1="400" y1="96" x2="400" y2="310" stroke="#94a3b8" stroke-width="3" id="string-line"/>
          <circle cx="400" cy="310" r="24" fill="#3b82f6" stroke="#60a5fa" stroke-width="3" id="bob-circle"/>
          <text x="400" y="316" fill="#ffffff" font-size="12" font-weight="900" text-anchor="middle">1.5 kg</text>
        </g>

        <!-- Energy Telemetry Card -->
        <g transform="translate(560, 150)">
          <rect width="180" height="130" rx="10" fill="#0f172a" stroke="#334155" stroke-width="1.5"/>
          <text x="90" y="24" fill="#cbd5e1" font-size="11" font-weight="800" text-anchor="middle">ENERGY EXCHANGE</text>
          <text x="20" y="55" fill="#38bdf8" font-size="12" font-weight="700">Kinetic (KE):</text>
          <text x="20" y="80" fill="#facc15" font-size="12" font-weight="700">Potential (PE):</text>
          <text x="20" y="108" fill="#4ade80" font-size="12" font-weight="900">Total (E): 15.0 J</text>
        </g>

        <text x="400" y="430" fill="#38bdf8" font-size="15" font-weight="800" text-anchor="middle">
          Invariant: Mass does not affect pendulum frequency—only length and gravity matter.
        </text>
      </svg>
    `,generateAst:()=>`
      (:scene :id "phet-pendulum" :title "PhET Pendulum Distillation" :stage "KS3/KS4 PHYSICS" :duration 10.0
        (:static (
          (:element :target "#stage-svg text" :cache true)
        ))
        (:actors (
          (:actor :target "#pendulum-arm" :kinematic true :will-change true)
        ))
        (:subtitles (
          (:start 0.00 :end 3.50 :en "A pendulum's period depends strictly on its length and gravitational acceleration." :es "El período de un péndulo depende estrictamente de su longitud y de la gravedad.")
          (:start 3.50 :end 7.00 :en "At the highest amplitude, kinetic energy is zero and potential energy reaches maximum." :es "En la amplitud máxima, la energía cinética es cero y la energía potencial es máxima.")
          (:start 7.00 :end 10.00 :en "At the center equilibrium point, all energy converts into maximum velocity." :es "En el punto de equilibrio central, toda la energía se convierte en velocidad máxima.")
        ))
        (:keyframes (
          (:t 0.00 :title "Peak Displacement" :rule "θ = +30° -> PE maximum, KE zero")
          (:t 0.25 :title "Equilibrium Velocity" :rule "θ = 0° -> PE zero, KE maximum")
          (:t 0.50 :title "Opposite Amplitude" :rule "θ = -30° -> Complete harmonic inversion")
          (:t 1.00 :title "Harmonic Cycle" :rule "T = 2π√(L/g) cycle completed")
        ))
        (:bindings (
          (:target "#pendulum-arm" :attr "transform" :expr "'rotate(' + (Math.sin(t * Math.PI * 4) * 32) + ' 400 96)'")
        ))
      )
    `},"balancing-chemical":{title:`PhET Balancing Chemical Equations`,subject:`Chemistry`,stage:`KS3/KS4 CHEMISTRY`,invariants:[`Conservation of Mass: Lavoisier Law`,`Stoichiometric Atom Balances`,`Mole Conservation`],generateSvg:()=>`
      <svg id="stage-svg" viewBox="0 0 800 480" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#090d16;">
        <rect width="800" height="480" fill="#090d16"/>
        <text x="400" y="42" fill="#f8fafc" font-size="22" font-weight="900" text-anchor="middle">
          PhET Distilled: Balancing Chemical Equations
        </text>
        <text x="400" y="68" fill="#94a3b8" font-size="13" text-anchor="middle">
          Conservation of Mass: 2 H₂ + O₂ &rarr; 2 H₂O
        </text>

        <!-- Left Pan (Reactants) -->
        <g transform="translate(120, 160)">
          <rect width="240" height="160" rx="12" fill="#1e293b" stroke="#3b82f6" stroke-width="2"/>
          <text x="120" y="30" fill="#93c5fd" font-size="14" font-weight="800" text-anchor="middle">REACTANTS</text>
          <text x="120" y="75" fill="#f8fafc" font-size="22" font-weight="900" text-anchor="middle">2 H₂ + 1 O₂</text>
          <text x="120" y="115" fill="#60a5fa" font-size="13" font-weight="700" text-anchor="middle">4 Hydrogen &bull; 2 Oxygen</text>
        </g>

        <!-- Equal / Yield Arrow -->
        <g transform="translate(380, 220)">
          <path d="M 0 10 L 30 10 L 30 0 L 50 15 L 30 30 L 30 20 L 0 20 Z" fill="#22c55e"/>
          <text x="25" y="55" fill="#4ade80" font-size="11" font-weight="800" text-anchor="middle">BALANCED</text>
        </g>

        <!-- Right Pan (Products) -->
        <g transform="translate(440, 160)">
          <rect width="240" height="160" rx="12" fill="#1e293b" stroke="#22c55e" stroke-width="2"/>
          <text x="120" y="30" fill="#86efac" font-size="14" font-weight="800" text-anchor="middle">PRODUCTS</text>
          <text x="120" y="75" fill="#f8fafc" font-size="22" font-weight="900" text-anchor="middle">2 H₂O</text>
          <text x="120" y="115" fill="#4ade80" font-size="13" font-weight="700" text-anchor="middle">4 Hydrogen &bull; 2 Oxygen</text>
        </g>

        <rect x="200" y="380" width="400" height="45" rx="8" fill="#0f172a" stroke="#22c55e" stroke-width="1.5"/>
        <text x="400" y="408" fill="#4ade80" font-size="15" font-weight="800" text-anchor="middle">
          Law of Conservation: Total Reactant Atoms = Total Product Atoms
        </text>
      </svg>
    `,generateAst:()=>`
      (:scene :id "phet-balancing-chemical" :title "PhET Chemical Equations Distillation" :stage "KS3/KS4 CHEMISTRY" :duration 12.0
        (:static (
          (:element :target "#stage-svg text" :cache true)
        ))
        (:actors (
          (:actor :target "#stage-svg" :kinematic true)
        ))
        (:subtitles (
          (:start 0.00 :end 4.00 :en "Matter can neither be created nor destroyed in a chemical reaction." :es "La materia no se crea ni se destruye en una reacción química.")
          (:start 4.00 :end 8.00 :en "We adjust stoichiometric coefficients so that the number of atoms on each side matches." :es "Ajustamos los coeficientes para que el número de átomos en cada lado coincida.")
          (:start 8.00 :end 12.00 :en "Two molecules of hydrogen gas combine with one oxygen molecule to yield two water molecules." :es "Dos moléculas de hidrógeno se combinan con una de oxígeno para dar dos moléculas de agua.")
        ))
        (:keyframes (
          (:t 0.00 :title "Unbalanced State" :rule "H2 + O2 -> H2O (Oxygen atom deficit on right)")
          (:t 0.50 :title "Coefficient Increment" :rule "2 H2 + O2 -> 2 H2O stoichiometric balancing")
          (:t 1.00 :title "Conservation Verified" :rule "Mass preserved exactly: 4H + 2O = 4H + 2O")
        ))
        (:bindings (
          (:target "#stage-svg" :attr "opacity" :expr "0.95 + 0.05 * Math.sin(t * Math.PI)")
        ))
      )
    `}};function y(e){let t=[],n=new Set,r=/([a-zA-Z0-9_]+Property)\s*[:=]\s*new\s+(?:NumberProperty|Property)\(\s*([\d\.\-]+)\s*(?:,\s*\{[^}]*range:\s*new\s+Range\(\s*([\d\.\-]+)\s*,\s*([\d\.\-]+)\s*\))?/g,i;for(;(i=r.exec(e))!==null&&t.length<5;){let e=i[1].replace(/Property$/,``);if(!n.has(e)){n.add(e);let r=parseFloat(i[2]),a=i[3]===void 0?0:parseFloat(i[3]),o=i[4]===void 0?100:parseFloat(i[4]);t.push({name:e,label:e.replace(/([A-Z])/g,` $1`).replace(/^./,e=>e.toUpperCase()),defaultValue:isNaN(r)?(a+o)/2:r,min:isNaN(a)?0:a,max:isNaN(o)?100:o,step:Number(((o-a)/20).toFixed(2))||1,unit:``})}}if(t.length===0){let r=/([a-zA-Z0-9_]+)\s*[:=]\s*(?:new\s+Range\(\s*([\d\.\-]+)\s*,\s*([\d\.\-]+)\s*\)|\{\s*min:\s*([\d\.\-]+)\s*,\s*max:\s*([\d\.\-]+)\s*\})/g;for(;(i=r.exec(e))!==null&&t.length<4;){let e=i[1];if(!n.has(e)&&![`screenView`,`bounds`,`viewBounds`,`dimension`,`stageBounds`].includes(e.toLowerCase())){n.add(e);let r=parseFloat(i[2]||i[4]),a=parseFloat(i[3]||i[5]);!isNaN(r)&&!isNaN(a)&&a>r&&t.push({name:e,label:e.replace(/([A-Z])/g,` $1`).replace(/^./,e=>e.toUpperCase()),defaultValue:Number(((r+a)/2).toFixed(2)),min:r,max:a,step:Number(((a-r)/20).toFixed(2))||1,unit:``})}}}return t}function b(e,t,n){let r=n.simName.replace(/[^a-z0-9_-]/gi,`-`).toLowerCase()||`phet-simulation`,i=n.title===`PhET Simulation`?r.split(`-`).map(e=>e.charAt(0).toUpperCase()+e.slice(1)).join(` `):n.title,a=(e.slice(0,1e5)+` `+t+` `+i).toLowerCase(),o=a.includes(`wave`)||a.includes(`light`)||a.includes(`optics`)||a.includes(`sound`)||a.includes(`laser`)||a.includes(`refract`),s=a.includes(`projectile`)||a.includes(`gravity`)||a.includes(`force`)||a.includes(`skate`)||a.includes(`friction`)||a.includes(`collision`)||a.includes(`velocity`),c=a.includes(`gas`)||a.includes(`pressure`)||a.includes(`temperature`)||a.includes(`thermal`)||a.includes(`heat`)||a.includes(`molecule`)||a.includes(`diffusion`),l=a.includes(`molarity`)||a.includes(`concentration`)||a.includes(`acid`)||a.includes(`reaction`)||a.includes(`solution`)||a.includes(`beer`),u=a.includes(`circuit`)||a.includes(`charge`)||a.includes(`electric`)||a.includes(`capacitor`)||a.includes(`voltage`),d=`Physics`,f=[`Physical Conservation Law`,`Deterministic Mathematical Formulation`],p=`Control Parameter`,m=`intensity`,h=1,g=10,_=5;o?(d=`Wave & Optical Physics`,f=[`Wave Equation: v = f × λ`,`Superposition Principle`,`Harmonic Phase Continuity`],p=`Wave Frequency (f)`,m=`frequency`,h=.5,g=4,_=1.5):s?(d=`Newtonian Mechanics`,f=[`Newton's Second Law: ΣF = m × a`,`Conservation of Momentum`,`Gravitational Acceleration`],p=`Velocity / Acceleration`,m=`velocity`,h=5,g=50,_=20):c?(d=`Thermodynamics & Kinetic Theory`,f=[`Ideal Gas Law: PV = nRT`,`Maxwell-Boltzmann Distribution`,`Thermal Equilibrium`],p=`Chamber Temperature (K)`,m=`temperature`,h=100,g=800,_=300):l?(d=`Chemical Equilibria`,f=[`Beer-Lambert Law: A = ε × b × c`,`Le Chatelier Principle`,`Molar Stoichiometry`],p=`Solution Concentration (M)`,m=`concentration`,h=.1,g=2,_=.75):u&&(d=`Electromagnetism & Circuitry`,f=[`Kirchhoff's Circuit Laws`,`Ohm's Law: V = I × R`,`Capacitive Time Constant`],p=`Potential Difference (V)`,m=`potential`,h=1,g=24,_=12);let v=y(e),b=v.length>0?v.slice(0,3):[{name:m,label:p,defaultValue:_,min:h,max:g,step:Number(((g-h)/20).toFixed(2)),unit:``}],x=`
<svg id="stage-svg" viewBox="0 0 800 480" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="background:#090d16;">
  <defs>
    <linearGradient id="phet-grad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#3b82f6"/>
    </linearGradient>
    <filter id="phet-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <!-- Static Stage Background & Card Layout -->
  <rect id="phet-stage-bg" width="800" height="480" fill="#090d16" />
  <g id="phet-apparatus-frame">
    <rect x="20" y="20" width="760" height="440" rx="16" fill="#0f172a" stroke="#1e293b" stroke-width="1.5" />
    <text x="40" y="58" fill="#f8fafc" font-size="20" font-weight="900" font-family="system-ui, sans-serif">
      ${i}
    </text>
    <rect x="40" y="70" width="140" height="22" rx="4" fill="rgba(56, 189, 248, 0.15)" stroke="#38bdf8" stroke-width="1" />
    <text x="110" y="85" fill="#38bdf8" font-size="11" font-weight="700" text-anchor="middle">
      ${d.toUpperCase()}
    </text>
    <text x="760" y="56" fill="#64748b" font-size="12" text-anchor="end" font-family="monospace">
      PhET Invariant Transpiled
    </text>

    <!-- Lab Grid Coordinate System -->
    <g id="grid-axes" opacity="0.25">
      <line x1="60" y1="260" x2="740" y2="260" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4 4" />
      <line x1="400" y1="110" x2="400" y2="390" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4 4" />
      <rect x="60" y="110" width="680" height="280" rx="10" fill="none" stroke="#334155" stroke-width="1" />
    </g>

    <!-- Digital Sensor Readout Bezel -->
    <g id="telemetry-bezel" transform="translate(520, 125)">
      <rect width="200" height="70" rx="10" fill="#0b0f19" stroke="#38bdf8" stroke-width="1.5"/>
      <text x="100" y="24" fill="#94a3b8" font-size="10" font-weight="800" text-anchor="middle" letter-spacing="1">SIMULATION SENSOR</text>
      <text id="sensor-val" x="100" y="52" fill="#38bdf8" font-size="18" font-weight="900" text-anchor="middle" font-family="monospace">
        &Sigma; = 1.000
      </text>
    </g>
  </g>

  <!-- Dynamic Kinematic Actors & Visual Invariants -->
  <g id="phet-actors-root">
    <!-- Active Wave or Trajectory Vector -->
    <path id="primary-path" d="M 80,260 Q 240,160 400,260 T 720,260" fill="none" stroke="url(#phet-grad)" stroke-width="5" stroke-linecap="round" filter="url(#phet-glow)"/>
    
    <!-- Central Interactive Dynamic Probe -->
    <circle id="probe-pin" cx="400" cy="260" r="16" fill="#10b981" stroke="#34d399" stroke-width="3" filter="url(#phet-glow)"/>
    <circle id="orbital-probe" cx="400" cy="180" r="10" fill="#f59e0b" stroke="#fbbf24" stroke-width="2"/>
    <line id="probe-vector" x1="400" y1="260" x2="400" y2="180" stroke="#f59e0b" stroke-width="2.5" stroke-dasharray="3 3"/>
  </g>
</svg>
`.trim(),S=b.map(e=>`    (:var :name "${e.name}" :val ${e.defaultValue} :min ${e.min} :max ${e.max} :step ${e.step} :label "${e.label}")`).join(`
`),C=b.map(e=>`    (:slider :var "${e.name}" :label "${e.label}" :min ${e.min} :max ${e.max} :step ${e.step})`).join(`
`),w=b[0];return{svgMarkup:x,astSource:`(:scene :id "${r}" :title "${i}" :stage "${d.toUpperCase()}" :duration 12.0
  (:static (
    (:element :target "#phet-apparatus-frame" :cache true)
    (:element :target "#grid-axes" :cache true)
    (:element :target "#telemetry-bezel" :cache true)
  ))

  (:actors (
    (:actor :target "#primary-path" :kinematic true :will-change true)
    (:actor :target "#probe-pin" :kinematic true :will-change true)
    (:actor :target "#orbital-probe" :kinematic true :will-change true)
    (:actor :target "#probe-vector" :kinematic true :will-change true)
    (:actor :target "#sensor-val" :kinematic true)
  ))

  (:vars (
${S}
  ))

  (:inputs (
${C}
  ))

  (:subtitles (
    (:start 0.00 :end 4.00 :en "Transpiled from PhET interactive model '${i}' into declarative zero-cloud vector AST." :es "Transpilado del modelo PhET '${i}' a AST vectorial declarativo de cero nube.")
    (:start 4.00 :end 8.00 :en "Observe how continuous physical variables conserve invariant quantities across time." :es "Observa cómo las variables físicas continuas conservan cantidades invariantes a lo largo del tiempo.")
    (:start 8.00 :end 12.00 :en "Adjusting live input sliders patches the hardware-promoted vector layer directly at 60 FPS." :es "Ajustar los controles deslizantes actualiza directamente la capa vectorial acelerada por GPU a 60 FPS.")
  ))

  (:keyframes (
    (:t 0.00 :title "Baseline State" :rule "${f[0]||`Initial physical equilibrium`}")
    (:t 0.50 :title "Dynamic Shift" :rule "${f[1]||`Invariant parameter transformation`}")
    (:t 1.00 :title "Harmonic Steady-State" :rule "Conservation principles verified mathematically")
  ))

  (:interactive false)

  (:bindings (
    (:target "#primary-path" :attr "d" :expr "'M 80,260 Q 240,' + (260 - Math.sin(t * Math.PI * 2) * (vars.${w.name} || ${w.defaultValue}) * 4) + ' 400,260 T 720,260'")
    (:target "#probe-pin" :attr "cy" :expr "260 - Math.sin(t * Math.PI * 2) * (vars.${w.name} || ${w.defaultValue}) * 2")
    (:target "#orbital-probe" :attr "cx" :expr "400 + Math.cos(t * Math.PI * 2) * 60")
    (:target "#orbital-probe" :attr "cy" :expr "(260 - Math.sin(t * Math.PI * 2) * (vars.${w.name} || ${w.defaultValue}) * 2) + Math.sin(t * Math.PI * 2) * 60")
    (:target "#probe-vector" :attr "x2" :expr "400 + Math.cos(t * Math.PI * 2) * 60")
    (:target "#probe-vector" :attr "y2" :expr "(260 - Math.sin(t * Math.PI * 2) * (vars.${w.name} || ${w.defaultValue}) * 2) + Math.sin(t * Math.PI * 2) * 60")
    (:target "#probe-vector" :attr "y1" :expr "260 - Math.sin(t * Math.PI * 2) * (vars.${w.name} || ${w.defaultValue}) * 2")
    (:target "#sensor-val" :attr "textContent" :expr "'\\u03A3 = ' + (Math.abs(Math.sin(t * Math.PI * 2)) * (vars.${w.name} || ${w.defaultValue})).toFixed(3)")
  ))
)`.trim(),invariants:f}}async function x(e,t=`phet-simulation.html`){let n=new Blob([e]).size,r=_(e,t),i=(r.simName+` `+r.title+` `+t).toLowerCase(),a=null;i.includes(`faraday`)||i.includes(`magnet`)||i.includes(`induct`)?a=`faraday`:i.includes(`acid`)||/\bph\b/i.test(i)||i.includes(`base-solution`)||i.includes(`titrat`)?a=`acid-base`:i.includes(`pendulum`)||i.includes(`harmonic`)?a=`pendulum`:i.includes(`chemical`)||i.includes(`balanc`)||i.includes(`equation`)||i.includes(`stoich`)?a=`balancing-chemical`:(i.includes(`ohm`)||i.includes(`circuit`)||i.includes(`resistor`))&&(a=`ohms-law`);let o=``,s=``,c=[],l=r.title;if(a&&v[a]){let e=v[a];o=e.generateSvg().trim(),s=e.generateAst().trim(),c=e.invariants,l=e.title}else{let n=b(e,t,r);o=n.svgMarkup,s=n.astSource,c=n.invariants}let u=new Blob([o+s]).size,d=h.computeCompressionRatio(n,u),f=(d>0?d:(n-u)/Math.max(1,n)*100).toFixed(1);return{success:!0,metadata:{simName:r.simName,title:l,version:r.version,originalSizeBytes:n,distilledSizeBytes:u,compressionRatio:`${f}% reduction`,detectedInvariants:c,localesFound:r.locales},svgMarkup:o,astSource:s}}async function S(e){let t=new TextEncoder().encode(e);if(typeof CompressionStream<`u`)try{let e=new Blob([t]).stream().pipeThrough(new CompressionStream(`gzip`)),n=await(await new Response(e).blob()).arrayBuffer();return new Uint8Array(n)}catch(e){console.warn(`[cartridgeCompression] CompressionStream failed, falling back to raw bytes:`,e)}return t}async function C(e){if(typeof DecompressionStream<`u`)try{let t=new Blob([e]).stream().pipeThrough(new DecompressionStream(`gzip`));return await(await new Response(t).blob()).text()}catch{return new TextDecoder().decode(e)}return new TextDecoder().decode(e)}function w(e){let t=``,n=e.byteLength;for(let r=0;r<n;r++)t+=String.fromCharCode(e[r]);return btoa(t)}function T(e){let t=atob(e),n=t.length,r=new Uint8Array(n);for(let e=0;e<n;e++)r[e]=t.charCodeAt(e);return r}async function E(e){let t=JSON.stringify(e),n=new TextEncoder().encode(t).byteLength,r=await S(t),i=r.byteLength,a=n>0?Math.round((n-i)/n*100):0,o={id:e.id,title:e.title,originalBytes:n,compressedBytes:i,savingsPercent:a,timestamp:Date.now()};return{compressedBytes:r,base64:w(r),metadata:o}}async function D(e){let t;t=typeof e==`string`?T(e):e instanceof ArrayBuffer?new Uint8Array(e):e;let n=await C(t),r=JSON.parse(n);if(!r||typeof r!=`object`||!r.id)throw Error(`Decompressed data is not a valid CartridgeDefinition`);return r}var O=`stj_custom_cartridges_v1`,k={pythagorus:`pythagoras`,pythagoras:`pythagoras`,"pythagoras-theorem":`pythagoras`,"pythagoras-proof":`pythagoras`,"ohms-law":`electric-circuits`,"phet-ohms-law":`electric-circuits`,circuits:`electric-circuits`,circuit:`electric-circuits`,gas:`kinetic-gas`,"boyles-law":`kinetic-gas`,curves:`calculus-curves`,calculus:`calculus-curves`,aquarium:`fish-tank`,fish:`fish-tank`,fishing:`math-fishing`,mountain:`mountain-elevation`,climber:`mountain-elevation`,photosynth:`photosynthesis`,leaf:`photosynthesis`,stars:`solar-system`,space:`solar-system`,balance:`algebra-balance`,atom:`atom`,"atomic-structure":`atom`,bohr:`atom`,"periodic-table":`atom`,elements:`atom`,spelling:`spelling-bee`,"spelling-bee":`spelling-bee`,bee:`spelling-bee`,spell:`spelling-bee`,stations:`stations-of-the-cross`,"stations-of-the-cross":`stations-of-the-cross`,"stations-cross":`stations-of-the-cross`,"via-crucis":`stations-of-the-cross`,"way-of-the-cross":`stations-of-the-cross`,passion:`stations-of-the-cross`,altar:`altar-anatomy`,"altar-anatomy":`altar-anatomy`,"altar-stone":`altar-anatomy`,mensa:`altar-anatomy`,"holy-oils":`holy-oils`,oils:`holy-oils`,chrism:`holy-oils`,ambry:`holy-oils`,"olea-sancta":`holy-oils`,triduum:`triduum-easter`,"triduum-easter":`triduum-easter`,easter:`triduum-easter`,"easter-vigil":`triduum-easter`,"lumen-christi":`triduum-easter`,"paschal-triduum":`triduum-easter`,"holy-water":`holy-water-thurifer`,"holy-water-thurifer":`holy-water-thurifer`,thurifer:`holy-water-thurifer`,thurible:`holy-water-thurifer`,incense:`holy-water-thurifer`,asperges:`holy-water-thurifer`,"liturgy-of-the-hours":`liturgy-of-the-hours`,"divine-office":`liturgy-of-the-hours`,breviary:`liturgy-of-the-hours`,"canonical-hours":`liturgy-of-the-hours`,lauds:`liturgy-of-the-hours`,vespers:`liturgy-of-the-hours`,"seven-sacraments":`seven-sacraments`,sacraments:`seven-sacraments`,sacrament:`seven-sacraments`,baptism:`seven-sacraments`,confirmation:`seven-sacraments`,eucharist:`seven-sacraments`,"liturgical-calendar":`liturgical-calendar`,calendar:`liturgical-calendar`,seasons:`liturgical-calendar`,advent:`liturgical-calendar`,lent:`liturgical-calendar`,"liturgical-postures":`liturgical-postures`,postures:`liturgical-postures`,genuflection:`liturgical-postures`,kneeling:`liturgical-postures`,bow:`liturgical-postures`,"catholic-rites":`catholic-rites`,rites:`catholic-rites`,"eastern-churches":`catholic-rites`,byzantine:`catholic-rites`,maronite:`catholic-rites`,"cst-virtues":`cst-virtues`,cst:`cst-virtues`,virtues:`cst-virtues`,"social-teaching":`cst-virtues`,"latin-mass-prayers":`latin-mass-prayers`,"latin-prayers":`latin-mass-prayers`,latin:`latin-mass-prayers`,"gregorian-chant":`latin-mass-prayers`,"pater-noster":`latin-mass-prayers`,"nicene-creed":`nicene-creed`,creed:`nicene-creed`,credo:`nicene-creed`,"apostles-creed":`nicene-creed`,"ten-commandments":`ten-commandments`,commandments:`ten-commandments`,decalogue:`ten-commandments`,sinai:`ten-commandments`,"order-of-the-mass":`order-of-the-mass`,mass:`order-of-the-mass`,"holy-mass":`order-of-the-mass`,"eucharistic-liturgy":`order-of-the-mass`,"sacred-objects":`sacred-objects`,"sacred-vessels":`sacred-objects`,vestments:`sacred-objects`,"first-communion":`first-communion`,"holy-communion":`first-communion`,"eucharistic-adoration":`first-communion`},A=[{id:`pythagoras`,type:`Sim`,title:`Pythagoras' Theorem (a² + b² = c²)`,stage:`KS3 GEOMETRY`,category:`Mathematics`,desc:`Interactive right-triangle manipulative demonstrating area conservation: square a² (emerald) plus square b² (sapphire) equals square c² (amber).`,icon:`📐`,source:`builtin`,svgFile:`scenes/pythagoras.svg`,astFile:`scenes/pythagoras.ast`,version:`2.6.0`,invariants:[`Pythagorean Theorem`,`Area Conservation`,`Euclidean Metric`]},{id:`kinetic-gas`,type:`Sim`,title:`Kinetic Gas Theory & Boyle's Law (PV = nRT)`,stage:`KS3/KS4 PHYSICS & CHEMISTRY`,category:`Science`,desc:`Real-time particle kinematics in a compression cylinder with temperature heater, pressure gauge, and Maxwell-Boltzmann velocity distribution.`,icon:`🌡️`,source:`builtin`,svgFile:`scenes/kinetic-gas.svg`,astFile:`scenes/kinetic-gas.ast`,version:`2.6.0`,invariants:[`Boyle's Law`,`Ideal Gas Law`,`Kinetic Theory of Gases`]},{id:`electric-circuits`,type:`Sim`,title:`Electrical Circuits & Ohm's Law (V = I × R)`,stage:`KS2/KS3 PHYSICS`,category:`Science`,desc:`Live closed-loop circuit with electron charge kinematics, battery electromotive force, resistance dissipation, and lightbulb filament luminance.`,icon:`💡`,source:`builtin`,svgFile:`scenes/electric-circuits.svg`,astFile:`scenes/electric-circuits.ast`,version:`2.6.0`,invariants:[`Ohm's Law`,`Kirchhoff Voltage Loop`,`Electron Drift Velocity`]},{id:`calculus-curves`,type:`Sim`,title:`Calculus: Tangent Slopes (dy/dx) & Definite Integrals (∫)`,stage:`GCSE & A-LEVEL MATHS`,category:`Mathematics`,desc:`Interactive tangent probe gliding over quadratic & cubic curves with real-time derivative secant limit and Riemann sum area accumulation.`,icon:`📈`,source:`builtin`,svgFile:`scenes/calculus-curves.svg`,astFile:`scenes/calculus-curves.ast`,version:`2.6.0`,invariants:[`First Derivative Tangent Limit`,`Riemann Integral Sum`,`Continuity`]},{id:`algebra-balance`,type:`Sim`,title:`Algebraic Balance Scale: Preserving Equality (2x + 5 = 15)`,stage:`KS2/KS3 MATHS`,category:`Mathematics`,desc:`Physical 2-pan balance scale demystifying linear equations. Whatever operation you apply to one side, you must apply to the other to preserve equilibrium.`,icon:`⚖️`,source:`builtin`,svgFile:`scenes/algebra-balance.svg`,astFile:`scenes/algebra-balance.ast`,version:`2.6.0`,invariants:[`Conservation of Mass`,`Additive Invariance`,`Multiplicative Invariance`]},{id:`bodmas`,type:`Slide`,title:`BODMAS / BIDMAS: Forcefield & Magnetic Clamping`,stage:`KS2/KS3 MATHS`,category:`Mathematics`,desc:`Interactive operator physics: titanium bracket shields, magnetic multiplication clamps, and concrete Area Model showing why 5 + 3 × 4 ≠ 32.`,icon:`🧮`,source:`builtin`,svgFile:`scenes/bodmas.svg`,astFile:`scenes/bodmas.ast`,version:`2.6.0`,invariants:[`Order of Operations`,`Distributive Property`]},{id:`times-tables`,type:`Sim`,title:`Times Tables Arrays & Distributive Splitter (12×12)`,stage:`KS1/KS2 MATHS`,category:`Mathematics`,desc:`Visual 2D arrays, 90° commutative rotation, and mental arithmetic decomposition: 7 × 8 = (7 × 5) + (7 × 3) = 56.`,icon:`📐`,source:`builtin`,svgFile:`scenes/times-tables.svg`,astFile:`scenes/times-tables.ast`,version:`2.6.0`,invariants:[`Commutative Property`,`Distributive Property`]},{id:`fractions`,type:`Slide`,title:`Fractions & Proportions`,stage:`KS2 MATHS`,category:`Mathematics`,desc:`Visual slice partitioning, equivalent denominators, and geometric whole unit assembly.`,icon:`🥧`,source:`builtin`,svgFile:`scenes/fractions.svg`,astFile:`scenes/fractions.ast`,version:`2.6.0`,invariants:[`Common Denominator Equivalence`,`Whole Conservation`]},{id:`fish-tank`,type:`App`,title:`Aquarium Living Ecosystem & Boids Flocking Benchmark`,stage:`BENCHMARK & STRESS LAB`,category:`Diagnostics & Games`,desc:`Autonomous multi-species boids flocking simulation with acoustic glass-tap scatter, stage tap feeding, and frame render budget monitoring.`,icon:`🐠`,source:`builtin`,svgFile:`scenes/fish-tank.svg`,astFile:`scenes/fish-tank.ast`,version:`2.6.0`,invariants:[`Craig Reynolds Boid Flocking`,`Continuous Velocity Verlet`]},{id:`solar-system`,type:`Sim`,title:`Solar System Planetary Orbits`,stage:`KS3 SCIENCE`,category:`Science`,desc:`3D Heliocentric orbital velocities, Keplerian mechanics, and scale celestial dynamics.`,icon:`🪐`,source:`builtin`,svgFile:`scenes/solar-system.svg`,astFile:`scenes/solar-system.ast`,version:`2.6.0`,invariants:[`Kepler's Laws of Planetary Motion`,`Gravitational Central Force`]},{id:`photosynthesis`,type:`Slide`,title:`Photosynthesis & Leaf Anatomy`,stage:`KS3 BIOLOGY`,category:`Science`,desc:`Light-dependent chloroplast reactions, stomata gas exchange, and glucose synthesis rate limiter.`,icon:`🍃`,source:`builtin`,svgFile:`scenes/photosynthesis.svg`,astFile:`scenes/photosynthesis.ast`,version:`2.6.0`,invariants:[`Conservation of Carbon & Oxygen Atoms`,`Blackman Limiting Factors`]},{id:`atom`,type:`Sim`,title:`Atomic Structure: Bohr Electron Shells`,stage:`KS3 CHEMISTRY`,category:`Science`,desc:`Quantized electron orbits (2, 8, 8), proton/neutron nucleus binding, and valence energy states.`,icon:`⚛️`,source:`builtin`,svgFile:`scenes/atom.svg`,astFile:`scenes/atom.ast`,version:`2.6.0`,invariants:[`Bohr Angular Momentum Quantization`,`Nuclear Charge Balance`]},{id:`velocity`,type:`Sim`,title:`Velocity Vectors & Kinematics`,stage:`KS3 PHYSICS`,category:`Science`,desc:`Continuous motion physics, displacement vectors, velocity-time graph area accumulation, and acceleration mechanics.`,icon:`🏎️`,source:`builtin`,svgFile:`scenes/velocity.svg`,astFile:`scenes/velocity.ast`,version:`2.6.0`,invariants:[`Newtonian Kinematics`,`Displacement Calculus`]},{id:`mountain-elevation`,type:`Sim`,title:`Mountain Altitude: Climber Game & Trigonometry`,stage:`KS2/KS3 MATHS & GEOGRAPHY`,category:`Games & Simulations`,desc:`Interactive hill climber game contrasting vertical altitude against slope distance, right-angle hypotenuse, and atmospheric lapse rate.`,icon:`🧗`,source:`builtin`,svgFile:`scenes/mountain-elevation.svg`,astFile:`scenes/mountain-elevation.ast`,version:`2.6.0`,invariants:[`Trigonometric Ratios (sin, cos, tan)`,`Atmospheric Lapse Rate`]},{id:`math-fishing`,type:`App`,title:`Math Pond: Number Bonds Fishing Game`,stage:`KS1/KS2 MATHS`,category:`Games & Simulations`,desc:`Interactive vector pond fishing adventure: hook swimming fish to solve number bonds to 10 & 20, doubles, and mental arithmetic.`,icon:`🎣`,source:`builtin`,svgFile:`scenes/math-fishing.svg`,astFile:`scenes/math-fishing.ast`,version:`2.6.0`,invariants:[`Additive Part-Whole Number Bonds`,`Combinatorics`]},{id:`dna-helix`,type:`Sim`,title:`DNA Double Helix & Base Pairs`,stage:`KS3 GENETICS`,category:`Science`,desc:`Antiparallel sugar-phosphate backbone and hydrogen-bonded A-T / C-G base pairing.`,icon:`🧬`,source:`builtin`,svgFile:`scenes/dna-helix.svg`,astFile:`scenes/dna-helix.ast`,version:`2.6.0`,invariants:[`Watson-Crick Complementary Base Pairing`,`Double Helix Pitch`]},{id:`phonics-lab`,type:`App`,title:`Early Phonics: Sound Buttons & Blending Mat`,stage:`EYFS/KS1 PHONICS`,category:`Early Literacy & Phonics`,desc:`Synthetic phonics soundboard, interactive sound button blending mat, tricky words, and Alien Words Screening Check.`,icon:`🔤`,source:`builtin`,svgFile:`scenes/phonics-lab.svg`,astFile:`scenes/phonics-lab.ast`,version:`2.6.0`,invariants:[`Phoneme-Grapheme Correspondence`,`Synthetic Blending`]},{id:`spelling-bee`,type:`App`,title:`Spelling Bee Championship: KS1 to KS3 Orthography`,stage:`KS1/KS2/KS3 ENGLISH`,category:`English & Literacy`,desc:`UK National Curriculum statutory spelling lists, Web Speech API auditory synthesis, interactive touch letter tiles, phonics breakdown, and streak multipliers.`,icon:`🐝`,source:`builtin`,svgFile:`scenes/spelling-bee.svg`,astFile:`scenes/spelling-bee.ast`,version:`2.6.0`,invariants:[`National Curriculum Statutory Spellings`,`Auditory Memory & Phonics`]},{id:`church-tour`,type:`Slide`,title:`Catholic Church Sanctuary Tour`,stage:`CATHOLIC LIFE`,category:`Catholic Faith`,desc:`Latin cross basilica architecture, Nave, High Altar, golden Tabernacle, and Marian Chapel.`,icon:`⛪`,source:`builtin`,svgFile:`scenes/church-tour.svg`,astFile:`scenes/church-tour.ast`,version:`2.6.0`,invariants:[`Sacred Architecture`,`Latin Cross Basilica Proportions`]},{id:`stations-of-the-cross`,type:`Slide`,title:`The Stations of the Cross (Via Crucis)`,stage:`CATHOLIC LIFE`,category:`Catholic Faith`,desc:`The 14 sacred stations of the Via Dolorosa, Golgotha Calvary hill, Roman praetorium, Holy Sepulchre tomb, and glorious Easter Resurrection.`,icon:`✝️`,source:`builtin`,svgFile:`scenes/stations-of-the-cross.svg`,astFile:`scenes/stations-of-the-cross.ast`,version:`2.6.0`,invariants:[`14 Traditional Stations of the Cross`,`Via Dolorosa Sacred Pilgrimage`,`Scriptural Passion`]},{id:`altar-anatomy`,type:`Slide`,title:`The Catholic Altar: Sacred Anatomy & Types`,stage:`CATHOLIC LIFE`,category:`Catholic Faith`,desc:`The Mensa, Altar Stone with martyr relics, seasonal Antependium, Crucifix, and beeswax altar candles.`,icon:`✝️`,source:`builtin`,svgFile:`scenes/altar-anatomy.svg`,astFile:`scenes/altar-anatomy.ast`,version:`2.6.0`,invariants:[`Consecrated Mensa`,`Sepulchrum Martyr Relics`,`Altar Linens & Liturgical Colors`]},{id:`holy-oils`,type:`Slide`,title:`The Three Holy Oils & Sacred Ambry (Olea Sancta)`,stage:`CATHOLIC LIFE`,category:`Catholic Faith`,desc:`Oleum Infirmorum (O.I.), Oleum Catechumenorum (O.C.), Sanctum Chrisma (S.C.), and the sanctuary ambry niche.`,icon:`🏺`,source:`builtin`,svgFile:`scenes/holy-oils.svg`,astFile:`scenes/holy-oils.ast`,version:`2.6.0`,invariants:[`Olea Sancta`,`Chrism Mass Balsam & Olive Oil`,`Indelible Sacramental Character`]},{id:`triduum-easter`,type:`Sim`,title:`The Sacred Paschal Triduum & Easter Glory`,stage:`CATHOLIC LIFE`,category:`Catholic Faith`,desc:`From the Upper Room Mandatum and Calvary Cross to the New Fire, Lumen Christi 3 elevations, Exsultet, and 50-day Paschal Resurrection.`,icon:`🔥`,source:`builtin`,svgFile:`scenes/triduum-easter.svg`,astFile:`scenes/triduum-easter.ast`,version:`2.6.0`,invariants:[`Sacrum Triduum Paschale`,`Lumen Christi 3 Elevations`,`Exsultet & Paschal Candle`,`Resurrectio Domini`]},{id:`holy-water-thurifer`,type:`Sim`,title:`Holy Water, Asperges & The Thurible (Thuribulum)`,stage:`CATHOLIC LIFE`,category:`Catholic Faith`,desc:`Aqua Benedicta sacramental stoup, Sunday Asperges Me sprinkling, 3-chain thurible swing dynamics, incense boat, and 7 Mass incensations.`,icon:`💨`,source:`builtin`,svgFile:`scenes/holy-water-thurifer.svg`,astFile:`scenes/holy-water-thurifer.ast`,version:`2.6.0`,invariants:[`Aqua Benedicta Sacramental`,`Asperges Me & Vidi Aquam`,`Thurible Dynamics & Rising Incense`]},{id:`liturgy-of-the-hours`,type:`Sim`,title:`The Liturgy of the Hours (Divine Office)`,stage:`CATHOLIC LIFE`,category:`Catholic Faith`,desc:`The seven canonical hours sanctifying the cycle of day and night: Matins, Lauds (Benedictus), Daytime Hours, Vespers (Magnificat), and Compline (Nunc Dimittis).`,icon:`🕰️`,source:`builtin`,svgFile:`scenes/liturgy-of-the-hours.svg`,astFile:`scenes/liturgy-of-the-hours.ast`,version:`2.6.0`,invariants:[`Liturgia Horarum`,`Seven Canonical Hours`,`Canticles of Zechariah, Mary & Simeon`]},{id:`seven-sacraments`,type:`Sim`,title:`The Seven Holy Sacraments (Septem Sacramenta)`,stage:`CATHOLIC LIFE`,category:`Catholic Faith`,desc:`Visible signs of invisible grace: Sacraments of Initiation (Baptism, Confirmation, Eucharist), Healing (Penance, Anointing), and Service of Communion (Orders, Matrimony).`,icon:`✨`,source:`builtin`,svgFile:`scenes/seven-sacraments.svg`,astFile:`scenes/seven-sacraments.ast`,version:`2.6.0`,invariants:[`Septem Sacramenta`,`Threefold Indelible Character`,`Ex Opere Operato`]},{id:`liturgical-calendar`,type:`Sim`,title:`The Catholic Liturgical Year (Annus Liturgicus)`,stage:`CATHOLIC LIFE`,category:`Catholic Faith`,desc:`The 360-degree seasonal year wheel: Advent (Violet), Christmas (Gold), Ordinary Time (Green), Lent (Purple), Easter (Gold), Pentecost (Red), and Christ the King.`,icon:`📅`,source:`builtin`,svgFile:`scenes/liturgical-calendar.svg`,astFile:`scenes/liturgical-calendar.ast`,version:`2.6.0`,invariants:[`Liturgical Cycle & Colors`,`Sunday Lectionary Cycles A/B/C`,`50-Day Easter Season`]},{id:`liturgical-postures`,type:`Sim`,title:`Sacred Postures & Gestures (Gestus Sacri)`,stage:`CATHOLIC LIFE`,category:`Catholic Faith`,desc:`Praying with mind, soul, and body: Standing (dignity & readiness), Kneeling (adoration), Genuflecting to the Tabernacle, Bowing, and the Sign of the Cross.`,icon:`🙇`,source:`builtin`,svgFile:`scenes/liturgical-postures.svg`,astFile:`scenes/liturgical-postures.ast`,version:`2.6.0`,invariants:[`Sacred Postures`,`Right-Knee Genuflection`,`Profound Bow at Creed`,`Trinitarian Sign of Cross`]},{id:`catholic-rites`,type:`Sim`,title:`The 24 Catholic Rites & Churches (Omnes Gentes)`,stage:`CATHOLIC LIFE`,category:`Catholic Faith`,desc:`The universal communion of 24 autonomous (sui iuris) Catholic Churches across East and West: Latin, Byzantine, Alexandrian, Antiochian, Chaldean, and Armenian traditions.`,icon:`🌍`,source:`builtin`,svgFile:`scenes/catholic-rites.svg`,astFile:`scenes/catholic-rites.ast`,version:`2.6.0`,invariants:[`24 Sui Iuris Catholic Churches`,`Communion with Peter`,`Eastern & Western Liturgical Rites`]},{id:`cst-virtues`,type:`Sim`,title:`Catholic Social Teaching (CST) & School Virtues`,stage:`CATHOLIC LIFE`,category:`Catholic Faith`,desc:`The 7 pillars of Catholic Social Teaching: Human Dignity (Imago Dei), Common Good, Solidarity, Subsidiarity, Option for the Poor, Dignity of Work, and Care for Creation (Laudato Si).`,icon:`🤝`,source:`builtin`,svgFile:`scenes/cst-virtues.svg`,astFile:`scenes/cst-virtues.ast`,version:`2.6.0`,invariants:[`7 Pillars of CST`,`Imago Dei Human Dignity`,`Laudato Si Care for Creation`]},{id:`latin-mass-prayers`,type:`Sim`,title:`Latin Prayers & Gregorian Chant (Vox Ecclesiae)`,stage:`CATHOLIC LIFE`,category:`Catholic Faith`,desc:`The ancient mother tongue and sacred music of the Western Church: Pater Noster, Ave Maria, Sanctus, Agnus Dei, and 4-line Gregorian square neume notation.`,icon:`📜`,source:`builtin`,svgFile:`scenes/latin-mass-prayers.svg`,astFile:`scenes/latin-mass-prayers.ast`,version:`2.6.0`,invariants:[`Pater Noster & Ave Maria`,`4-Line Gregorian Neume Notation`,`Latin Universal Liturgical Heritage`]},{id:`nicene-creed`,type:`Sim`,title:`The Nicene & Apostles' Creed (Credo in Deum)`,stage:`CATHOLIC LIFE`,category:`Catholic Faith`,desc:`The foundational profession of apostolic faith: The Father & Creation, The Son & Redemption, The Holy Spirit & The Church, and the Four Marks of the Church.`,icon:`✝️`,source:`builtin`,svgFile:`scenes/nicene-creed.svg`,astFile:`scenes/nicene-creed.ast`,version:`2.6.0`,invariants:[`Trinitarian Creed Structure`,`Four Marks of Church`,`Incarnation & Resurrection`]},{id:`ten-commandments`,type:`Sim`,title:`The Ten Commandments (The Decalogue & Mt Sinai)`,stage:`CATHOLIC LIFE`,category:`Catholic Faith`,desc:`The moral law of God given on Mount Sinai: Tablet I (Love of God, Commandments 1-3) and Tablet II (Love of Neighbour, Commandments 4-10) fulfilled in Christ.`,icon:`📜`,source:`builtin`,svgFile:`scenes/ten-commandments.svg`,astFile:`scenes/ten-commandments.ast`,version:`2.6.0`,invariants:[`Two Tablets of Sinai`,`Decalogue Categorization`,`Two Great Commandments of Love`]},{id:`order-of-the-mass`,type:`Sim`,title:`The Order of the Holy Mass (Ordo Missae)`,stage:`CATHOLIC LIFE`,category:`Catholic Faith`,desc:`The sacred liturgy through 4 movements: Introductory Rites, Liturgy of the Word, Liturgy of the Eucharist (Transubstantiation & Elevation), and Concluding Rites.`,icon:`🍷`,source:`builtin`,svgFile:`scenes/order-of-the-mass.svg`,astFile:`scenes/order-of-the-mass.ast`,version:`2.6.0`,invariants:[`4 Movements of the Mass`,`Consecration & Elevation`,`Real Presence in Tabernacle`]},{id:`sacred-objects`,type:`Sim`,title:`Sacred Vessels, Linens & Vestments`,stage:`CATHOLIC LIFE`,category:`Catholic Faith`,desc:`Interactive examination of sacred vessels (Chalice, Paten, Ciborium), linens (Corporal, Purificator, Pall), and priestly vestments.`,icon:`🏺`,source:`builtin`,svgFile:`scenes/sacred-objects.svg`,astFile:`scenes/sacred-objects.ast`,version:`2.6.0`,invariants:[`Vessels of Gold Reverence`,`Corporal Particle Protection`,`Alb Baptismal Innocence`]},{id:`first-communion`,type:`Sim`,title:`First Holy Communion & Eucharistic Adoration`,stage:`CATHOLIC LIFE`,category:`Catholic Faith`,desc:`Preparation steps for receiving Jesus: First Confession, Eucharistic Fast, Reverent Reception with Amen, and Thanksgiving before the Monstrance.`,icon:`🍞`,source:`builtin`,svgFile:`scenes/first-communion.svg`,astFile:`scenes/first-communion.ast`,version:`2.6.0`,invariants:[`Amen Real Presence Oath`,`1-Hour Eucharistic Fast`,`Reverent Reception Posture`]},{id:`water-cycle`,type:`Slide`,title:`Water Cycle: Continuous Earth Cycle`,stage:`KS2 GEOGRAPHY`,category:`Geography & Science`,desc:`Solar evaporation, condensation cloud formation, precipitation, and groundwater runoff loop.`,icon:`💧`,source:`builtin`,svgFile:`scenes/water-cycle.svg`,astFile:`scenes/water-cycle.ast`,version:`2.6.0`,invariants:[`Hydrological Mass Conservation`,`Phase Change Thermodynamics`]},{id:`languages`,type:`App`,title:`MFL & Polyglot Studio: Spanish, French & Latin`,stage:`KS2/KS3 MFL`,category:`Modern & Classical Languages`,desc:`Spanish, French & Latin phonics soundboard, regular verb conjugation wheels, and vocabulary recall sprints.`,icon:`🌍`,source:`builtin`,svgFile:`scenes/languages.svg`,astFile:`scenes/languages.ast`,version:`2.6.0`,invariants:[`Grammar Agreement`,`Phoneme Articulation`,`Vocabulary Association`]},{id:`shakespeare`,type:`Slide`,title:`The Globe Theatre: Shakespeare & Iambic Pentameter`,stage:`KS3/KS4 ENGLISH LITERATURE`,category:`English Literature`,desc:`Wooden O 3D stage geometry, rhythm meter visualizer for unstressed/stressed beats, and Elizabethan theatrical staging.`,icon:`🎭`,source:`builtin`,svgFile:`scenes/shakespeare.svg`,astFile:`scenes/shakespeare.ast`,version:`2.6.0`,invariants:[`Iambic Pentameter Metre`,`Elizabethan Theatrical Proportions`]},{id:`bsl-fingerspelling`,type:`Sim`,title:`BSL: 3D British Sign Language Two-Handed Fingerspelling`,stage:`ACCESSIBILITY & LANGUAGES`,category:`Modern & Classical Languages`,desc:`3D rotatable two-handed BSL manual alphabet rig, A-E-I-O-U vowel fingertip tap positions, Signer POV vs Receiver POV camera orbit, and speed slider.`,icon:`🖐️`,source:`builtin`,svgFile:`scenes/bsl-fingerspelling.svg`,astFile:`scenes/bsl-fingerspelling.ast`,version:`2.6.0`,invariants:[`BSL Manual Alphabet`,`Two-Handed Signing Anatomy`,`3D Spatial Orientation`]},{id:`phonics-screening`,type:`Sim`,title:`Year 1 Phonics Screening Check & Alien Words`,stage:`EYFS/KS1 PHONICS`,category:`Early Literacy & Phonics`,desc:`Official statutory 40-word screening check simulator with monster alien cards, tactile sound button dots & dashes, animated sweep bar, and pass diagnostics.`,icon:`👾`,source:`builtin`,svgFile:`scenes/phonics-screening.svg`,astFile:`scenes/phonics-screening.ast`,version:`2.6.0`,invariants:[`DfE Statutory Screening Check`,`Pseudo-Word Phonetic Decoding`,`Sound Buttons`]},{id:`shakespeare-macbeth`,type:`Slide`,title:`Macbeth: 5-Act Dramatic Soliloquy & Moral Fall`,stage:`KS3/KS4 ENGLISH LITERATURE`,category:`English Literature`,desc:`5-Act play-through on the 1599 Globe stage: blasted heath prophecy, floating bloody dagger, Banquo ghost feast, and Dunsinane catastrophe.`,icon:`👑`,source:`builtin`,svgFile:`scenes/shakespeare-macbeth.svg`,astFile:`scenes/shakespeare-macbeth.ast`,version:`2.6.0`,invariants:[`Shakespearean Tragedy`,`Iambic Pentameter Blank Verse`,`Canon vs What-If Drama`]},{id:`rosary-mysteries`,type:`Sim`,title:`The Holy Rosary: 3D Beads & 20 Scriptural Mysteries`,stage:`CATHOLIC LIFE`,category:`Catholic Faith`,desc:`Contemplative 3D chaplet ring with Our Father and Hail Mary beads, depth-fog lighting, 4 mystery cycles (Joyful, Luminous, Sorrowful, Glorious), and Latin prayers.`,icon:`📿`,source:`builtin`,svgFile:`scenes/rosary-mysteries.svg`,astFile:`scenes/rosary-mysteries.ast`,version:`2.6.0`,invariants:[`Scriptural Contemplation`,`Marian Devotion`,`Ecclesiastical Latin Prayers`]}],j={pythagoras:{svg:`<svg viewBox="0 0 800 480" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background Blueprint Vignette -->
    <radialGradient id="pyth-bg-glow" cx="50%" cy="50%" r="75%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="60%" stop-color="#090d16" />
      <stop offset="100%" stop-color="#020617" />
    </radialGradient>

    <!-- Blueprint Grid Pattern (28px unit grid matching simulation scale) -->
    <pattern id="pyth-blueprint-grid" width="28" height="28" patternUnits="userSpaceOnUse">
      <path d="M 28 0 L 0 0 0 28" fill="none" stroke="#1e293b" stroke-width="0.75" stroke-opacity="0.6" />
      <circle cx="28" cy="28" r="1" fill="#334155" fill-opacity="0.8" />
    </pattern>

    <!-- Precision Drop Shadows and Neon Halos -->
    <filter id="pyth-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3.5" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <filter id="pyth-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.65" />
    </filter>

    <!-- Color Gradients -->
    <!-- Leg a: Emerald -->
    <linearGradient id="pyth-grad-a" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#34d399" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#059669" stop-opacity="0.75" />
    </linearGradient>

    <!-- Leg b: Sapphire -->
    <linearGradient id="pyth-grad-b" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#60a5fa" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#1d4ed8" stop-opacity="0.75" />
    </linearGradient>

    <!-- Hypotenuse c: Amber / Gold -->
    <linearGradient id="pyth-grad-c" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fbbf24" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#d97706" stop-opacity="0.75" />
    </linearGradient>

    <!-- HUD Glass Gradient -->
    <linearGradient id="pyth-hud-glass" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#0f172a" stop-opacity="0.95" />
      <stop offset="50%" stop-color="#1e293b" stop-opacity="0.90" />
      <stop offset="100%" stop-color="#0f172a" stop-opacity="0.95" />
    </linearGradient>
  </defs>

  <!-- Stage Background & Engineering Grid -->
  <rect width="800" height="480" fill="url(#pyth-bg-glow)" />
  <rect width="800" height="480" fill="url(#pyth-blueprint-grid)" />

  <!-- Technical Axis Origin Guides -->
  <g opacity="0.35">
    <line x1="40" y1="280" x2="760" y2="280" stroke="#38bdf8" stroke-width="1" stroke-dasharray="3 3" />
    <line x1="360" y1="40" x2="360" y2="440" stroke="#38bdf8" stroke-width="1" stroke-dasharray="3 3" />
  </g>

  <!-- Interactive Precision Formula Header HUD -->
  <g id="pyth-hud-banner" transform="translate(130, 16)" filter="url(#pyth-shadow)">
    <rect width="540" height="52" rx="14" fill="url(#pyth-hud-glass)" stroke="#38bdf8" stroke-width="1.5" stroke-opacity="0.8" />
    <!-- Subtle Top Rim Highlight -->
    <path d="M 14 1 L 526 1" stroke="#ffffff" stroke-width="1" stroke-opacity="0.25" />
    
    <text x="270" y="33" fill="#f8fafc" font-size="16" font-weight="900" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif">
      <tspan fill="#34d399">a² (9)</tspan> + <tspan fill="#60a5fa">b² (16)</tspan> = <tspan fill="#fbbf24">c² (25)</tspan> ➔ 3² + 4² = 5²
    </text>
  </g>

  <!-- Square a² (Emerald Leg A) -->
  <g id="pyth-group-a">
    <rect id="pyth-rect-a" x="276" y="196" width="84" height="84" rx="6" fill="url(#pyth-grad-a)" stroke="#10b981" stroke-width="2.5" filter="url(#pyth-shadow)" data-draggable="pyth-handle-a" style="cursor:ns-resize;" />
    <!-- Pre-rendered 3x3 Unit Tiles for immediate cold-start pedagogical proof -->
    <g id="pyth-grid-a" opacity="0.5" stroke="#ffffff" stroke-width="1" pointer-events="none">
      <line x1="304" y1="196" x2="304" y2="280" />
      <line x1="332" y1="196" x2="332" y2="280" />
      <line x1="276" y1="224" x2="360" y2="224" />
      <line x1="276" y1="252" x2="360" y2="252" />
    </g>
    <!-- Square Area Badge -->
    <rect id="pyth-badge-a" x="286" y="226" width="64" height="26" rx="6" fill="#064e3b" fill-opacity="0.9" stroke="#34d399" stroke-width="1.5" pointer-events="none" />
    <text id="pyth-txt-a" x="318" y="244" fill="#ffffff" font-size="14" font-weight="900" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" text-rendering="geometricPrecision" pointer-events="none">a² = 9</text>
  </g>

  <!-- Square b² (Sapphire Leg B) -->
  <g id="pyth-group-b">
    <rect id="pyth-rect-b" x="360" y="280" width="112" height="112" rx="6" fill="url(#pyth-grad-b)" stroke="#3b82f6" stroke-width="2.5" filter="url(#pyth-shadow)" data-draggable="pyth-handle-b" style="cursor:ew-resize;" />
    <!-- Pre-rendered 4x4 Unit Tiles for immediate cold-start pedagogical proof -->
    <g id="pyth-grid-b" opacity="0.5" stroke="#ffffff" stroke-width="1" pointer-events="none">
      <line x1="388" y1="280" x2="388" y2="392" />
      <line x1="416" y1="280" x2="416" y2="392" />
      <line x1="444" y1="280" x2="444" y2="392" />
      <line x1="360" y1="308" x2="472" y2="308" />
      <line x1="360" y1="336" x2="472" y2="336" />
      <line x1="360" y1="364" x2="472" y2="364" />
    </g>
    <!-- Square Area Badge -->
    <rect id="pyth-badge-b" x="382" y="323" width="68" height="26" rx="6" fill="#1e3a8a" fill-opacity="0.9" stroke="#60a5fa" stroke-width="1.5" pointer-events="none" />
    <text id="pyth-txt-b" x="416" y="341" fill="#ffffff" font-size="14" font-weight="900" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" text-rendering="geometricPrecision" pointer-events="none">b² = 16</text>
  </g>

  <!-- Square c² (Amber Hypotenuse C) -->
  <g id="pyth-group-c" transform="translate(360, 196) rotate(36.87)">
    <g id="pyth-rot-c">
      <rect id="pyth-rect-c" x="0" y="-140" width="140" height="140" rx="6" fill="url(#pyth-grad-c)" stroke="#f59e0b" stroke-width="2.5" filter="url(#pyth-shadow)" />
      <!-- Pre-rendered 5x5 Unit Tiles for immediate cold-start pedagogical proof -->
      <g id="pyth-grid-c" opacity="0.5" stroke="#ffffff" stroke-width="1" pointer-events="none">
        <line x1="28" y1="-140" x2="28" y2="0" />
        <line x1="56" y1="-140" x2="56" y2="0" />
        <line x1="84" y1="-140" x2="84" y2="0" />
        <line x1="112" y1="-140" x2="112" y2="0" />
        <line x1="0" y1="-112" x2="140" y2="-112" />
        <line x1="0" y1="-84" x2="140" y2="-84" />
        <line x1="0" y1="-56" x2="140" y2="-56" />
        <line x1="0" y1="-28" x2="140" y2="-28" />
      </g>
      <!-- Square Area Badge -->
      <rect id="pyth-badge-c" x="15" y="-83" width="110" height="28" rx="6" fill="#78350f" fill-opacity="0.9" stroke="#fbbf24" stroke-width="1.5" pointer-events="none" />
      <text id="pyth-txt-c" x="70" y="-64" fill="#ffffff" font-size="14" font-weight="900" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" text-rendering="geometricPrecision" pointer-events="none">c² = 25 (c = 5)</text>
    </g>
  </g>

  <!-- Central Euclidean Right Triangle -->
  <polygon id="pyth-triangle" points="360,280 472,280 360,196" fill="#0e7490" fill-opacity="0.25" stroke="#38bdf8" stroke-width="3.5" stroke-linejoin="round" filter="url(#pyth-glow)" />

  <!-- Precision Drafting Right-Angle Symbol -->
  <g id="pyth-right-angle-group">
    <rect id="pyth-right-angle" x="360" y="262" width="18" height="18" fill="none" stroke="#94a3b8" stroke-width="2" />
    <circle cx="369" cy="271" r="2" fill="#38bdf8" />
  </g>

  <!-- Side Dimension Badges -->
  <g id="pyth-labels-group" pointer-events="none" font-family="system-ui, -apple-system, sans-serif">
    <!-- Leg a Label -->
    <rect x="365" y="226" width="46" height="22" rx="4" fill="#0f172a" fill-opacity="0.8" stroke="#10b981" stroke-width="1" />
    <text id="pyth-label-a" x="388" y="242" fill="#34d399" font-size="12" font-weight="900" text-anchor="middle">a = 3</text>

    <!-- Leg b Label -->
    <rect x="400" y="252" width="46" height="22" rx="4" fill="#0f172a" fill-opacity="0.8" stroke="#3b82f6" stroke-width="1" />
    <text id="pyth-label-b" x="423" y="268" fill="#60a5fa" font-size="12" font-weight="900" text-anchor="middle">b = 4</text>

    <!-- Hypotenuse c Label -->
    <rect x="425" y="218" width="56" height="22" rx="4" fill="#0f172a" fill-opacity="0.8" stroke="#f59e0b" stroke-width="1" />
    <text id="pyth-label-c" x="453" y="234" fill="#fbbf24" font-size="12" font-weight="900" text-anchor="middle">c = 5.00</text>
  </g>

  <!-- Manipulator Handle A (Top Vertex / Leg a Controller) -->
  <g id="pyth-handle-a" transform="translate(360, 196)" data-draggable="pyth-handle-a" style="cursor:ns-resize;">
    <!-- Pulse Ring -->
    <circle cx="0" cy="0" r="22" fill="#10b981" fill-opacity="0.2" stroke="#10b981" stroke-width="1" stroke-dasharray="3 3" />
    <!-- Tactile Handle Bead -->
    <circle cx="0" cy="0" r="15" fill="#10b981" stroke="#ffffff" stroke-width="2.5" filter="url(#pyth-glow)" />
    <!-- Vertical Drag Icon & Label -->
    <text x="0" y="5" fill="#ffffff" font-size="12" font-weight="900" text-anchor="middle" pointer-events="none">↕</text>
  </g>

  <!-- Manipulator Handle B (Right Vertex / Leg b Controller) -->
  <g id="pyth-handle-b" transform="translate(472, 280)" data-draggable="pyth-handle-b" style="cursor:ew-resize;">
    <!-- Pulse Ring -->
    <circle cx="0" cy="0" r="22" fill="#3b82f6" fill-opacity="0.2" stroke="#3b82f6" stroke-width="1" stroke-dasharray="3 3" />
    <!-- Tactile Handle Bead -->
    <circle cx="0" cy="0" r="15" fill="#3b82f6" stroke="#ffffff" stroke-width="2.5" filter="url(#pyth-glow)" />
    <!-- Horizontal Drag Icon & Label -->
    <text x="0" y="5" fill="#ffffff" font-size="12" font-weight="900" text-anchor="middle" pointer-events="none">↔</text>
  </g>
</svg>`,ast:`(:scene :id "pythagoras" :type "Sim" :title "Pythagoras' Theorem (a² + b² = c²)" :stage "KS3 GEOMETRY" :duration 11.0
  (:vars (
    (:var :name "sideA" :val 3 :min 1 :max 8 :step 1 :unit "units" :label "Leg a")
    (:var :name "sideB" :val 4 :min 1 :max 8 :step 1 :unit "units" :label "Leg b")
  ))
  (:inputs (
    (:number :var "sideA" :label "Triangle Leg a" :min 1 :max 10 :step 1)
    (:number :var "sideB" :label "Triangle Leg b" :min 1 :max 10 :step 1)
  ))
  (:computed (
    (:name "hypotenuse" :expr "Math.sqrt(vars.sideA * vars.sideA + vars.sideB * vars.sideB).toFixed(2)")
    (:name "areaA" :expr "vars.sideA * vars.sideA")
    (:name "areaB" :expr "vars.sideB * vars.sideB")
    (:name "areaC" :expr "vars.sideA * vars.sideA + vars.sideB * vars.sideB")
  ))
  (:gestures (
    (:draggable :target "#pyth-handle-a" :axis "y" :min 100 :max 250)
    (:draggable :target "#pyth-handle-b" :axis "x" :min 380 :max 640)
    (:draggable :target "#pyth-rect-a" :axis "y" :min 100 :max 250)
    (:draggable :target "#pyth-rect-b" :axis "x" :min 380 :max 640)
  ))
  (:subtitles (
    (:start 0.00 :end 0.35 :en "Drag the handles, pans, or type your own figures for leg a and leg b." :es "Arrastra los controles o introduce tus propios números para los catetos a y b.")
    (:start 0.35 :end 0.70 :en "Observe area conservation: square a² (emerald) plus square b² (sapphire) always equals square c² (amber)." :es "Observa la conservación de área: el cuadrado a² más el cuadrado b² siempre es igual a c².")
    (:start 0.70 :end 1.00 :en "a² + b² = c². The total number of unit tiles is strictly conserved for all right triangles." :es "a² + b² = c². El número total de baldosas unitarias se conserva estrictamente.")
  ))
  (:keyframes (
    (:t 0.00 :title "Interactive Manipulative" :rule "Drag handles or enter custom figures to test Pythagorean triples")
    (:t 0.35 :title "Area Conservation" :rule "Square of side a has area a²; square of side b has area b²")
    (:t 0.70 :title "Vector Area Sum" :rule "Total square units: a² + b² = c²")
    (:t 1.00 :title "Hypotenuse Square c²" :rule "c = √(a² + b²) preserved across continuous geometry")
  ))
  (:interactive false)
  (:questions false)
  (:bindings (
    (:target "#pyth-txt-a" :attr "opacity" :expr "1")
    (:target "#pyth-txt-b" :attr "opacity" :expr "1")
    (:target "#pyth-txt-c" :attr "opacity" :expr "1")
  ))
)`}},M=null,N=!1,P=null;async function F(){if(!N)return P||(P=(async()=>{try{let e=await t(),n=[];if(typeof window<`u`)try{let e=localStorage.getItem(O);e&&(n=JSON.parse(e))}catch{}let i=new Map;e.forEach(e=>i.set(e.id,e));for(let e of n)i.has(e.id)||(i.set(e.id,e),await r(e));for(let[e,t]of Object.entries(j))if(!i.has(e)){let n={id:e,title:e.charAt(0).toUpperCase()+e.slice(1),stage:`CURRICULUM`,category:`STEM`,desc:`Pre-expanded offline core vector simulation.`,icon:`📐`,source:`builtin`,svgMarkup:t.svg,astSource:t.ast,updatedAt:Date.now()};i.set(e,n),await r(n)}if(M=Array.from(i.values()),typeof window<`u`){let e=window;if(e.ASTSceneRegistry&&typeof e.ASTSceneRegistry.register==`function`)for(let t of M)t.svgMarkup&&t.astSource&&e.ASTSceneRegistry.register(t.id,{id:t.id,title:t.title,stage:t.stage,svgMarkup:t.svgMarkup,astSource:t.astSource})}N=!0}catch(e){console.warn(`[cartridgeStore] Failed to initialize cartridge vault:`,e)}})(),P)}typeof window<`u`&&F().catch(()=>{});function I(){if(typeof window>`u`)return[];if(M!==null)return M;N||F().catch(()=>{});try{let e=localStorage.getItem(O);if(!e)return[];let t=JSON.parse(e),n=Array.isArray(t)?t:[];return M=n,n}catch(e){return console.warn(`[cartridgeStore] Failed to read custom cartridges:`,e),[]}}function L(e){if(!e||typeof e!=`string`)return``;let t=e.toLowerCase().trim().replace(/^(demo-|scene-|preset-)/,``).replace(/\.(ast|svg|json|html|phet)$/,``);return k[t]||t}function R(){let e=I(),t=new Map;e.forEach(e=>t.set(e.id,e));let n=[],r=new Set;return e.forEach(e=>{let t=e.isCore??e.source===`builtin`,i=e.tier||(e.source===`builtin`?`core`:e.source);n.push({...e,isCore:t,tier:i,mount:e.mount||z(e.id),section:e.section||B(e.id,e.category)}),r.add(e.id)}),A.forEach(e=>{r.has(e.id)||(n.push({...e,isCore:!0,tier:`core`,mount:e.mount||z(e.id),section:e.section||B(e.id,e.category)}),r.add(e.id))}),n}function z(e){return{pythagoras:`/curriculum/maths/geometry/pythagoras`,"kinetic-gas":`/curriculum/science/physics/kinetic-gas`,"electric-circuits":`/curriculum/science/physics/electric-circuits`,"church-tour":`/curriculum/catholic-life/church-tour`,"altar-anatomy":`/curriculum/catholic-life/altar-anatomy`,"holy-oils":`/curriculum/catholic-life/holy-oils`,"rosary-mysteries":`/curriculum/catholic-life/rosary-mysteries`,"phonics-lab":`/curriculum/english/phonics/phonics-lab`,"phonics-screening":`/curriculum/english/phonics/screening-check`,"spelling-bee":`/curriculum/english/spelling/spelling-bee`,shakespeare:`/curriculum/english/theatre/globe`,"shakespeare-macbeth":`/curriculum/english/theatre/macbeth`,languages:`/curriculum/languages/mfl-polyglot`,"bsl-fingerspelling":`/curriculum/languages/bsl-fingerspelling`,bodmas:`/curriculum/maths/algebra/bodmas`,"times-tables":`/curriculum/maths/arithmetic/times-tables`,"math-fishing":`/curriculum/maths/arithmetic/number-bonds`,fractions:`/curriculum/maths/arithmetic/fractions`,"calculus-curves":`/curriculum/maths/calculus/tangent-slopes`,"algebra-balance":`/curriculum/maths/algebra/balance-scale`,atom:`/curriculum/science/chemistry/atomic-structure`,photosynthesis:`/curriculum/science/biology/photosynthesis`,"dna-helix":`/curriculum/science/biology/dna-helix`,"solar-system":`/curriculum/science/physics/solar-system`,velocity:`/curriculum/science/physics/velocity-vectors`,"water-cycle":`/curriculum/geography/water-cycle`,"mountain-elevation":`/curriculum/geography/mountain-elevation`,"fish-tank":`/curriculum/computing/stress-benchmark`}[e]||`/curriculum/${e}`}function B(e,t){return e.includes(`church`)||e.includes(`altar`)||e.includes(`holy`)||e.includes(`rosary`)||t===`Catholic Faith`?`Catholic Life & Faith Formation`:e.includes(`math`)||e.includes(`pythagoras`)||e.includes(`algebra`)||e.includes(`calculus`)||e.includes(`fractions`)||e.includes(`bodmas`)||e.includes(`times`)||t===`Mathematics`?`Mathematics & Geometry`:e.includes(`gas`)||e.includes(`circuit`)||e.includes(`atom`)||e.includes(`photo`)||e.includes(`dna`)||e.includes(`solar`)||e.includes(`velocity`)||t===`Science`?`Natural Sciences & Physics`:e.includes(`phonics`)||e.includes(`spelling`)||e.includes(`shakespeare`)||t===`English Literature`?`English Literature & Phonics`:e.includes(`language`)||e.includes(`bsl`)||t===`Modern & Classical Languages`?`Languages & Inclusion`:`Curriculum Cartridges`}function V(e){if(!e)return null;let t=e.toLowerCase().trim().replace(/\/+$/,``),n=R().find(e=>e.mount&&e.mount.toLowerCase().replace(/\/+$/,``)===t);if(n)return n;let r=t.split(`/`).filter(Boolean),i=r[r.length-1];if(i){let e=U(i);if(e)return e}return null}function H(){let e=R(),t=new Map;return e.forEach(e=>{let n=e.section||B(e.id,e.category);if(!t.has(n)){let e=`📚`;n.includes(`Catholic`)?e=`⛪`:n.includes(`Mathematics`)?e=`📐`:n.includes(`Sciences`)?e=`🔬`:n.includes(`English`)?e=`🎭`:n.includes(`Languages`)&&(e=`🌍`),t.set(n,{section:n,icon:e,cartridges:[]})}t.get(n).cartridges.push(e)}),Array.from(t.values())}function U(e){if(!e)return null;let t=L(e),n=R().find(n=>n.id===t||n.id===e);if(n)return!n.svgMarkup&&j[t]&&(n.svgMarkup=j[t].svg,n.astSource=j[t].ast),n;if(j[t])return{id:t,title:t.charAt(0).toUpperCase()+t.slice(1),stage:`CURRICULUM`,category:`STEM`,desc:`Built-in curriculum vector simulation.`,icon:`📐`,source:`builtin`,svgMarkup:j[t].svg,astSource:j[t].ast};if(t&&/^[a-z0-9_-]+$/i.test(t)){let e=t.replace(/[-_]/g,` `).replace(/\b\w/g,e=>e.toUpperCase());return{id:t,title:e,stage:`CURRICULUM`,category:`STEM`,desc:`Interactive curriculum vector laboratory cartridge for ${e}.`,icon:`⚡`,source:`builtin`,svgFile:`scenes/${t}.svg`,astFile:`scenes/${t}.ast`,version:`2.6.0`}}return null}function W(e){if(typeof window>`u`)return;let t=I().filter(t=>t.id!==e.id),n={...e,updatedAt:Date.now()},i=[n,...t];M=i,r(n).catch(e=>{console.warn(`[cartridgeStore] IndexedDB vault save error:`,e)});try{localStorage.setItem(O,JSON.stringify(i))}catch{}let a=window;a.ASTSceneRegistry&&typeof a.ASTSceneRegistry.register==`function`&&a.ASTSceneRegistry.register(e.id,{id:e.id,title:e.title,stage:e.stage,svgMarkup:e.svgMarkup,astSource:e.astSource}),window.dispatchEvent(new Event(`cartridges_updated`)),window.dispatchEvent(new Event(`storage`))}function G(e){if(typeof window>`u`)return;let t=L(e),n=I().filter(n=>n.id!==t&&n.id!==e);M=n,i(t).catch(e=>{console.warn(`[cartridgeStore] IndexedDB vault delete error:`,e)});try{localStorage.setItem(O,JSON.stringify(n))}catch(e){console.error(`[cartridgeStore] Failed to delete cartridge from localStorage:`,e)}window.dispatchEvent(new Event(`cartridges_updated`)),window.dispatchEvent(new Event(`storage`))}async function K(e){let t=await D(e);return W(t),t}async function q(e){let t=U(e);if(!t)throw Error(`Cartridge [${e}] not found in store`);return{cartridge:t,...await E(t)}}async function J(){let e=await n(),t=M?M.length:0;return{isInitialized:N,vaultCount:e,memoryCount:t}}async function Y(e){let t=e.name.toLowerCase();if(t.endsWith(`.swf`)){let t=await e.arrayBuffer(),n=e.name.replace(/\.swf$/i,``).replace(/[^a-z0-9_-]/gi,`-`).toLowerCase(),r=await p(t,n);if(!r.success)throw Error(r.error||`Failed to transpile legacy Flash SWF file.`);let i={id:n,title:`Flash: ${n.replace(/[-_]/g,` `).replace(/\b\w/g,e=>e.toUpperCase())}`,stage:`FLASH TRANSLATED`,category:`Imported Flash`,desc:`Transpiled from legacy Adobe Flash SWF with 60 FPS deterministic vector recreation.`,icon:`⚡`,source:`imported`,svgMarkup:r.svgMarkup,astSource:r.astSource,author:`Flash Archive`,version:`Flash v${r.metadata?.version||9}`,invariants:[`Legacy Vector Timeline`,`ActionScript Translation`],createdAt:Date.now(),updatedAt:Date.now()};return W(i),i}let n=await e.text();if(g(n)||t.endsWith(`.phet`)||t.includes(`phet`)){let t=await x(n,e.name);if(!t.success)throw Error(t.error||`Failed to transpile PhET simulation.`);let r=(t.metadata?.simName||e.name).replace(/\.(html|json|phet)$/i,``).replace(/[^a-z0-9_-]/gi,`-`).toLowerCase(),i={id:r,title:t.metadata?.title||`PhET: ${r}`,stage:`PhET INTERACTIVE APPARATUS`,category:`Science`,desc:`Distilled from ${((t.metadata?.originalSizeBytes||1e6)/1024/1024).toFixed(1)} MB PhET bundle down to clean AST vector physics with zero cloud leakage.`,icon:`🧪`,source:`phet`,svgMarkup:t.svgMarkup,astSource:t.astSource,author:`University of Colorado Boulder (PhET)`,version:t.metadata?.version||`1.0.0`,invariants:t.metadata?.detectedInvariants||[`Physical Conservation Law`],createdAt:Date.now(),updatedAt:Date.now()};return W(i),i}if(t.endsWith(`.json`))try{let e=JSON.parse(n);if(e&&e.id&&(e.svgMarkup||e.astSource)){let t={id:e.id,title:e.title||e.id,stage:e.stage||`CUSTOM CARTRIDGE`,category:e.category||`General`,desc:e.desc||`Imported decentralized cartridge package.`,icon:e.icon||`📦`,source:e.source||`user`,svgMarkup:e.svgMarkup||``,astSource:e.astSource||``,author:e.author||`Educator`,version:e.version||`1.0.0`,invariants:e.invariants||[],createdAt:Date.now(),updatedAt:Date.now()};return W(t),t}}catch{}if(t.endsWith(`.svg`)||t.endsWith(`.ast.svg`)){let t=n.match(/<title[^>]*>([^<]+)<\/title>/i),r=n.match(/<metadata[^>]*data-ast=["']([\s\S]*?)["']/i)||n.match(/\(:scene[\s\S]*?\)/),i=e.name.replace(/\.(ast\.)?svg$/i,``).replace(/[^a-z0-9_-]/gi,`-`).toLowerCase(),a={id:i,title:t?t[1]:i,stage:`VECTOR CAPSULE`,category:`Mathematics`,desc:`Imported living vector cartridge capsule.`,icon:`🎨`,source:`imported`,svgMarkup:n,astSource:r?r[1]?decodeURIComponent(r[1]):r[0]:`(:scene :id "${i}" :title "${i}")`,createdAt:Date.now(),updatedAt:Date.now()};return W(a),a}if(t.endsWith(`.ast`)||n.trim().startsWith(`(:scene`)||n.trim().startsWith(`(`)){let t=e.name.replace(/\.ast$/i,``).replace(/[^a-z0-9_-]/gi,`-`).toLowerCase(),r=n.match(/:title\s+"([^"]+)"/i),i=n.match(/:stage\s+"([^"]+)"/i),a={id:t,title:r?r[1]:t,stage:i?i[1]:`CURRICULUM`,category:`Mathematics`,desc:`Imported declarative AST vector logic cartridge.`,icon:`📜`,source:`imported`,svgMarkup:`<svg viewBox="0 0 800 480" xmlns="http://www.w3.org/2000/svg"><rect width="800" height="480" fill="#090d16"/><text x="400" y="240" fill="#38bdf8" font-size="20" font-weight="800" text-anchor="middle">${t}</text></svg>`,astSource:n,createdAt:Date.now(),updatedAt:Date.now()};return W(a),a}throw Error(`Unsupported cartridge file format: ${e.name}. Expected .html (PhET), .swf, .json, .ast, or .svg.`)}function X(e){let t=e.title.toLowerCase().replace(/[^a-z0-9_-]+/g,`-`).replace(/^-|-$/g,``)||`cartridge-${Date.now().toString(36)}`,n=`<svg viewBox="0 0 800 480" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="custom-glow" cx="50%" cy="50%" r="60%">
      <stop offset="0%" stop-color="#1e293b" />
      <stop offset="100%" stop-color="#090d16" />
    </radialGradient>
  </defs>
  <rect width="800" height="480" fill="url(#custom-glow)" />
  <g id="apparatus-root">
    <text x="400" y="60" fill="#38bdf8" font-size="22" font-weight="900" text-anchor="middle">${e.title}</text>
    <circle id="probe" cx="400" cy="240" r="40" fill="#3b82f6" stroke="#60a5fa" stroke-width="4" />
    <text id="probe-label" x="400" y="246" fill="#ffffff" font-size="16" font-weight="800" text-anchor="middle">Interactive</text>
  </g>
</svg>`,r=`(:scene :id "${t}" :title "${e.title}" :stage "${e.stage}" :duration 12.0
  (:vars (
    (:var :name "magnitude" :val 5 :min 1 :max 10 :step 1 :label "Magnitude")
  ))
  (:inputs (
    (:slider :var "magnitude" :label "Magnitude" :min 1 :max 10 :step 1)
  ))
  (:subtitles (
    (:start 0.00 :end 6.00 :en "Welcome to this interactive decentralized cartridge." :es "Bienvenido a este cartucho interactivo descentralizado.")
    (:start 6.00 :end 12.00 :en "Observe real-time vector transformations and physical invariants." :es "Observa las transformaciones vectoriales y los invariantes físicos.")
  ))
  (:keyframes (
    (:t 0.00 :title "Apparatus Init" :rule "Deterministic zero-cloud vector loop initialized.")
    (:t 0.50 :title "Conservation State" :rule "Reactive bindings execute at 60 FPS.")
  ))
  (:bindings (
    (:target "#probe" :attr "r" :expr "30 + vars.magnitude * 3")
  ))
)`,i={id:t,title:e.title,stage:e.stage||`CUSTOM APPARATUS`,category:e.category||`General`,desc:e.desc||`Custom authored decentralized vector cartridge.`,icon:e.icon||`📐`,source:`user`,svgMarkup:e.svgMarkup||n,astSource:e.astSource||r,author:`Classroom Educator`,version:`1.0.0`,createdAt:Date.now(),updatedAt:Date.now()};return W(i),i}export{q as a,V as c,Y as d,L as f,p as g,x as h,K as i,H as l,v as m,X as n,R as o,W as p,G as r,U as s,j as t,J as u};