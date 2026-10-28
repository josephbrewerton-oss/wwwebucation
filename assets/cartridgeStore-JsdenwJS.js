const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/__vite-browser-external-BDfy7Drd.js","assets/rolldown-runtime-XKyaHtl9.js"])))=>i.map(i=>d[i]);
import{r as e}from"./rolldown-runtime-XKyaHtl9.js";import{a as t,m as n,n as r,r as i}from"./dbStore-DAtjFTXS.js";import{u as a}from"./aicaller-BnKf1ac0.js";import{i as o,t as s}from"./astQuestionExtractor-pZXRB2j9.js";var c=`AGFzbQEAAAABGgRgAn9/AX9gA39/fwF/YAN/f38AYAJ/fwF9AwYFAAECAAMFAwEAEAd9BgZtZW1vcnkCABFkZWNvZGVfc3dmX2hlYWRlcgAADXNjYW5fc3dmX3RhZ3MAAR1iYXRjaF9jb252ZXJ0X3R3aXBzX3RvX3BpeGVscwACEHNjYW5fcGhldF9zdHJlYW0AAxljb21wdXRlX2NvbXByZXNzaW9uX3JhdGlvAAQKiggFtAIDB38DfQd/IAFBFUgEQEEADwsgAC0AACEFIABBAWotAAAhBiAAQQJqLQAAIQdBACECIAZB1wBGIAdB0wBGcQRAIAVBxgBGBEBBASECBSAFQcMARgRAQQIhAgUgBUHaAEYEQEEDIQILCwsLIAJBAEYEQEEADwsgAEEDai0AACEDIABBBGooAgAhBEEAIAI2AgBBBCADNgIAQQggBDYCACAAQQhqLQAAIQ0gDUEDdiEIIAhBBGxBBWohDiAOQQdqQQhuIQ5DAABIRCEJQwAA8EMhCiAAQQhqIA5qIQ0gDUEBai0AALMhCyALQwAAgD9dBEBDAADAQSELCyANQQJqLwEAIQwgDEEBSARAQQEhDAtBDCAJOAIAQRAgCjgCAEEUIAs4AgBBGCAMNgIAQSwgDjYCAEEBC78CAQt/IAAgAWohAyAAIAJqIQRBACEIQQAhCUEAIQpBACELQQAhDEGWmiQhDQJAA0AgA0ECaiAESw0BIAMvAQAhBSAFQQZ2IQYgBUE/cSEHIANBAmohAyAHQT9GBEAgA0EEaiAESw0CIAMoAgAhByADQQRqIQMLIAxBAWohDCAGQQBGDQEgBkEBRgRAIAtBAWohCwsgBkECRiAGQRZGciAGQSBGciAGQdMARnIEQCAIQQFqIQgLIAZBLkYgBkHUAEZyBEAgCUEBaiEJCyAGQQxGIAZBO0ZyBEAgCkEBaiEKCyAGQQlGBEAgAyAESQRAIAMtAABBEHQgA0EBai0AAEEIdHIgA0ECai0AAHIhDQsLIAMgB2ohAwwACwtBHCAINgIAQSAgCTYCAEEkIAo2AgBBKCANNgIAQSwgDDYCACAMC0kCA38BfUEAIQMCQANAIAMgAk8NASAAIANBBGxqIQQgASADQQRsaiEFIAQoAgCyQ83MTD2UIQYgBSAGOAIAIANBAWohAwwACwsLmAIBBX8gACECIAAgAWohA0EAIQRBACEFAkADQCACIANPDQEgAi0AACEGIAZB7wBGIAZBzwBGcgRAIAJBAmogA0kEQCACQQFqLQAAQegARiACQQJqLQAAQe0ARnEEQCAEQQFyIQQLCwsgBkH3AEYgBkHXAEZyBEAgAkEDaiADSQRAIAJBAWotAABB4QBGIAJBAmotAABB9gBGIAJBA2otAABB5QBGcXEEQCAEQQJyIQQLCwsgBkHwAEYgBkHQAEZyBEAgAkEHaiADSQRAIAJBAWotAABB8gBGIAJBAmotAABB7wBGIAJBA2otAABB8ABGcXEEQCAFQQFqIQULCwsgAkEBaiECDAALC0EwIAQ2AgBBNCAFNgIAIAQLLQEBfSAAQQFIBEBDAAAAAA8LQwAAyEIgACABa7MgALOVlCECQTggAjgCACACCw==`,l=class e{static instance=null;isReady=!1;exports=null;memory=null;u8View=null;i32View=null;f32View=null;STREAM_BUFFER_PTR=65536;constructor(){this.init().catch(e=>console.warn(`[Transpiler WASM React Bridge] Init notice:`,e))}static getInstance(){return e.instance||(e.instance=new e,typeof window<`u`&&(window.ASTTranspilerWasmBridge=e.instance)),e.instance}async init(){if(this.isReady)return!0;try{let e=null;if(typeof fetch==`function`&&typeof window<`u`&&window.location?.protocol!==`file:`)try{let t=await fetch(`/player/wasm/ast-transpiler-engine.wasm`);if(t.ok){let n=await t.arrayBuffer();e=new Uint8Array(n)}}catch{}if(!e||e.length===0){if(typeof atob==`function`){let t=atob(c),n=t.length;e=new Uint8Array(n);for(let r=0;r<n;r++)e[r]=t.charCodeAt(r)}else typeof Buffer<`u`&&(e=Buffer.from(c,`base64`))}let t=await WebAssembly.instantiate(e),n=t.instance||t;return this.exports=n.exports,this.memory=this.exports.memory,this.u8View=new Uint8Array(this.memory.buffer),this.i32View=new Int32Array(this.memory.buffer),this.f32View=new Float32Array(this.memory.buffer),this.isReady=!0,typeof window<`u`&&(window.ASTTranspilerWasmBridge=this),!0}catch(e){return console.warn(`WASM Transpiler React initialization notice, falling back to JS:`,e),this.isReady=!1,!1}}decodeSwfHeader(e){if(!this.isReady||!this.exports||!this.memory)return null;let t=e instanceof Uint8Array?e:new Uint8Array(e);if(t.length<21)return null;let n=this.STREAM_BUFFER_PTR+t.length;if(this.memory.buffer.byteLength<n){let e=Math.ceil((n-this.memory.buffer.byteLength)/65536);this.memory.grow(e),this.u8View=new Uint8Array(this.memory.buffer),this.i32View=new Int32Array(this.memory.buffer),this.f32View=new Float32Array(this.memory.buffer)}if(this.u8View.set(t,this.STREAM_BUFFER_PTR),!this.exports.decode_swf_header(this.STREAM_BUFFER_PTR,t.length))return null;let r=this.i32View[0];return{signature:r===1?`FWS`:r===2?`CWS`:r===3?`ZWS`:`UNKNOWN`,version:this.i32View[1],fileLength:this.i32View[2],width:this.f32View[3],height:this.f32View[4],frameRate:this.f32View[5],frameCount:this.i32View[6],headerLength:8+this.i32View[11]+4}}scanSwfTags(e,t=21){if(!this.isReady||!this.exports||!this.memory)return null;let n=e instanceof Uint8Array?e:new Uint8Array(e),r=this.STREAM_BUFFER_PTR+n.length;if(this.memory.buffer.byteLength<r){let e=Math.ceil((r-this.memory.buffer.byteLength)/65536);this.memory.grow(e),this.u8View=new Uint8Array(this.memory.buffer),this.i32View=new Int32Array(this.memory.buffer),this.f32View=new Float32Array(this.memory.buffer)}return this.u8View.set(n,this.STREAM_BUFFER_PTR),{tagCount:this.exports.scan_swf_tags(this.STREAM_BUFFER_PTR,t,n.length),shapeCount:this.i32View[7],morphCount:this.i32View[8],actionCount:this.i32View[9],bgColor:`#`+(this.i32View[10]&16777215).toString(16).padStart(6,`0`)}}scanPhetStream(e){if(!this.isReady||!this.exports||!this.memory)return null;let t=typeof e==`string`?new TextEncoder().encode(e):e instanceof Uint8Array?e:new Uint8Array(e),n=this.STREAM_BUFFER_PTR+t.length;if(this.memory.buffer.byteLength<n){let e=Math.ceil((n-this.memory.buffer.byteLength)/65536);this.memory.grow(e),this.u8View=new Uint8Array(this.memory.buffer),this.i32View=new Int32Array(this.memory.buffer),this.f32View=new Float32Array(this.memory.buffer)}this.u8View.set(t,this.STREAM_BUFFER_PTR);let r=this.exports.scan_phet_stream(this.STREAM_BUFFER_PTR,t.length),i=this.i32View[13];return{mask:r,isCircuit:!!(r&1),isWave:!!(r&2),propertyCount:i}}computeCompressionRatio(e,t){return this.isReady&&this.exports?this.exports.compute_compression_ratio(e,t):e<=0?0:(e-t)/e*100}}.getInstance();function u(e){return!e||typeof e!=`string`?!1:e.includes(`phet.chipper`)||e.includes(`phetio`)||e.includes(`phetsims`)||e.includes(`phet-io`)||e.includes(`PhET Interactive Simulations`)}function d(e,t=`simulation.html`){let n=`PhET Simulation`,r=t.replace(/_all\.html|\.html|\.json/gi,``).toLowerCase(),i=`1.0.0`,a=[`en`],o=e.match(/<title[^>]*>([^<]+)<\/title>/i);o&&o[1]&&(n=o[1].trim());let s=e.match(/["']name["']\s*:\s*["']([^"']+)["']/);s&&s[1]&&(r=s[1]);let c=e.match(/["']version["']\s*:\s*["']([^"']+)["']/);c&&c[1]&&(i=c[1]);let l=e.matchAll(/["']([a-z]{2}(?:_[A-Z]{2})?)["']\s*:\s*\{[^}]*["']value["']/g);for(let e of l)e[1]&&!a.includes(e[1])&&a.push(e[1]);return{title:n,simName:r,version:i,locales:a}}var f={"ohms-law":{title:`PhET Ohm's Law (V = I × R)`,subject:`Physics`,stage:`KS3/KS4 PHYSICS`,invariants:[`Ohm's Law: I = V / R`,`Electron Drift Velocity`,`Thermal Joule Dissipation`],generateSvg:()=>`
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
    `}};function p(e){let t=[],n=new Set,r=/([a-zA-Z0-9_]+Property)\s*[:=]\s*new\s+(?:NumberProperty|Property)\(\s*([\d\.\-]+)\s*(?:,\s*\{[^}]*range:\s*new\s+Range\(\s*([\d\.\-]+)\s*,\s*([\d\.\-]+)\s*\))?/g,i;for(;(i=r.exec(e))!==null&&t.length<5;){let e=i[1].replace(/Property$/,``);if(!n.has(e)){n.add(e);let r=parseFloat(i[2]),a=i[3]===void 0?0:parseFloat(i[3]),o=i[4]===void 0?100:parseFloat(i[4]);t.push({name:e,label:e.replace(/([A-Z])/g,` $1`).replace(/^./,e=>e.toUpperCase()),defaultValue:isNaN(r)?(a+o)/2:r,min:isNaN(a)?0:a,max:isNaN(o)?100:o,step:Number(((o-a)/20).toFixed(2))||1,unit:``})}}if(t.length===0){let r=/([a-zA-Z0-9_]+)\s*[:=]\s*(?:new\s+Range\(\s*([\d\.\-]+)\s*,\s*([\d\.\-]+)\s*\)|\{\s*min:\s*([\d\.\-]+)\s*,\s*max:\s*([\d\.\-]+)\s*\})/g;for(;(i=r.exec(e))!==null&&t.length<4;){let e=i[1];if(!n.has(e)&&![`screenView`,`bounds`,`viewBounds`,`dimension`,`stageBounds`].includes(e.toLowerCase())){n.add(e);let r=parseFloat(i[2]||i[4]),a=parseFloat(i[3]||i[5]);!isNaN(r)&&!isNaN(a)&&a>r&&t.push({name:e,label:e.replace(/([A-Z])/g,` $1`).replace(/^./,e=>e.toUpperCase()),defaultValue:Number(((r+a)/2).toFixed(2)),min:r,max:a,step:Number(((a-r)/20).toFixed(2))||1,unit:``})}}}return t}function m(e,t,n){let r=n.simName.replace(/[^a-z0-9_-]/gi,`-`).toLowerCase()||`phet-simulation`,i=n.title===`PhET Simulation`?r.split(`-`).map(e=>e.charAt(0).toUpperCase()+e.slice(1)).join(` `):n.title,a=(e.slice(0,1e5)+` `+t+` `+i).toLowerCase(),o=a.includes(`wave`)||a.includes(`light`)||a.includes(`optics`)||a.includes(`sound`)||a.includes(`laser`)||a.includes(`refract`),s=a.includes(`projectile`)||a.includes(`gravity`)||a.includes(`force`)||a.includes(`skate`)||a.includes(`friction`)||a.includes(`collision`)||a.includes(`velocity`),c=a.includes(`gas`)||a.includes(`pressure`)||a.includes(`temperature`)||a.includes(`thermal`)||a.includes(`heat`)||a.includes(`molecule`)||a.includes(`diffusion`),l=a.includes(`molarity`)||a.includes(`concentration`)||a.includes(`acid`)||a.includes(`reaction`)||a.includes(`solution`)||a.includes(`beer`),u=a.includes(`circuit`)||a.includes(`charge`)||a.includes(`electric`)||a.includes(`capacitor`)||a.includes(`voltage`),d=`Physics`,f=[`Physical Conservation Law`,`Deterministic Mathematical Formulation`],m=`Control Parameter`,h=`intensity`,g=1,_=10,v=5;o?(d=`Wave & Optical Physics`,f=[`Wave Equation: v = f × λ`,`Superposition Principle`,`Harmonic Phase Continuity`],m=`Wave Frequency (f)`,h=`frequency`,g=.5,_=4,v=1.5):s?(d=`Newtonian Mechanics`,f=[`Newton's Second Law: ΣF = m × a`,`Conservation of Momentum`,`Gravitational Acceleration`],m=`Velocity / Acceleration`,h=`velocity`,g=5,_=50,v=20):c?(d=`Thermodynamics & Kinetic Theory`,f=[`Ideal Gas Law: PV = nRT`,`Maxwell-Boltzmann Distribution`,`Thermal Equilibrium`],m=`Chamber Temperature (K)`,h=`temperature`,g=100,_=800,v=300):l?(d=`Chemical Equilibria`,f=[`Beer-Lambert Law: A = ε × b × c`,`Le Chatelier Principle`,`Molar Stoichiometry`],m=`Solution Concentration (M)`,h=`concentration`,g=.1,_=2,v=.75):u&&(d=`Electromagnetism & Circuitry`,f=[`Kirchhoff's Circuit Laws`,`Ohm's Law: V = I × R`,`Capacitive Time Constant`],m=`Potential Difference (V)`,h=`potential`,g=1,_=24,v=12);let y=p(e),b=y.length>0?y.slice(0,3):[{name:h,label:m,defaultValue:v,min:g,max:_,step:Number(((_-g)/20).toFixed(2)),unit:``}],x=`
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
)`.trim(),invariants:f}}async function h(e,t=`phet-simulation.html`){let n=new Blob([e]).size,r=d(e,t),i=(r.simName+` `+r.title+` `+t).toLowerCase(),a=null;i.includes(`faraday`)||i.includes(`magnet`)||i.includes(`induct`)?a=`faraday`:i.includes(`acid`)||/\bph\b/i.test(i)||i.includes(`base-solution`)||i.includes(`titrat`)?a=`acid-base`:i.includes(`pendulum`)||i.includes(`harmonic`)?a=`pendulum`:i.includes(`chemical`)||i.includes(`balanc`)||i.includes(`equation`)||i.includes(`stoich`)?a=`balancing-chemical`:(i.includes(`ohm`)||i.includes(`circuit`)||i.includes(`resistor`))&&(a=`ohms-law`);let o=``,s=``,c=[],u=r.title;if(a&&f[a]){let e=f[a];o=e.generateSvg().trim(),s=e.generateAst().trim(),c=e.invariants,u=e.title}else{let n=m(e,t,r);o=n.svgMarkup,s=n.astSource,c=n.invariants}let p=new Blob([o+s]).size,h=l.computeCompressionRatio(n,p),g=(h>0?h:(n-p)/Math.max(1,n)*100).toFixed(1);return{success:!0,metadata:{simName:r.simName,title:u,version:r.version,originalSizeBytes:n,distilledSizeBytes:p,compressionRatio:`${g}% reduction`,detectedInvariants:c,localesFound:r.locales},svgMarkup:o,astSource:s}}var g=class{buffer;bytePos=0;bitPos=0;constructor(e,t=0){this.buffer=e,this.bytePos=t,this.bitPos=0}get length(){return this.buffer.length}get offset(){return this.bytePos}set offset(e){this.bytePos=e,this.bitPos=0}readUI8(){return this.syncBits(),this.bytePos>=this.buffer.length?0:this.buffer[this.bytePos++]}readUI16(){if(this.syncBits(),this.bytePos+1>=this.buffer.length)return 0;let e=this.buffer[this.bytePos]|this.buffer[this.bytePos+1]<<8;return this.bytePos+=2,e}readSI16(){let e=this.readUI16();return e&32768?e-65536:e}readUI32(){if(this.syncBits(),this.bytePos+3>=this.buffer.length)return 0;let e=(this.buffer[this.bytePos]|this.buffer[this.bytePos+1]<<8|this.buffer[this.bytePos+2]<<16|this.buffer[this.bytePos+3]<<24)>>>0;return this.bytePos+=4,e}readString(){this.syncBits();let e=``;for(;this.bytePos<this.buffer.length;){let t=this.buffer[this.bytePos++];if(t===0)break;e+=String.fromCharCode(t)}return e}readBytes(e){this.syncBits();let t=Math.min(this.bytePos+e,this.buffer.length),n=this.buffer.slice(this.bytePos,t);return this.bytePos=t,n}syncBits(){this.bitPos>0&&(this.bytePos++,this.bitPos=0)}readUBits(e){if(e===0)return 0;let t=0;for(let n=0;n<e;n++){if(this.bytePos>=this.buffer.length)return t;let e=this.buffer[this.bytePos]>>7-this.bitPos&1;t=t<<1|e,this.bitPos++,this.bitPos===8&&(this.bitPos=0,this.bytePos++)}return t}readSBits(e){if(e===0)return 0;let t=this.readUBits(e),n=1<<e-1;return t&n&&(t-=1<<e),t}readRect(){this.syncBits();let e=this.readUBits(5),t=this.readSBits(e)/20,n=this.readSBits(e)/20,r=this.readSBits(e)/20,i=this.readSBits(e)/20;return this.syncBits(),{xMin:t,xMax:n,yMin:r,yMax:i,width:Math.abs(n-t),height:Math.abs(i-r)}}readMatrix(){this.syncBits();let e=1,t=1;if(this.readUBits(1)===1){let n=this.readUBits(5);e=this.readSBits(n)/65536,t=this.readSBits(n)/65536}let n=0,r=0;if(this.readUBits(1)===1){let e=this.readUBits(5);n=this.readSBits(e)/65536,r=this.readSBits(e)/65536}let i=this.readUBits(5),a=this.readSBits(i)/20,o=this.readSBits(i)/20;return this.syncBits(),{scaleX:e,scaleY:t,rotateSkew0:n,rotateSkew1:r,transX:a,transY:o}}readRGBA(e=!0){this.syncBits();let t=this.readUI8(),n=this.readUI8(),r=this.readUI8(),i=e?this.readUI8()/255:1;return i<1?`rgba(${t}, ${n}, ${r}, ${i.toFixed(2)})`:`#${((1<<24)+(t<<16)+(n<<8)+r).toString(16).slice(1)}`}};async function _(t){if(typeof process<`u`&&process.versions&&process.versions.node)try{let n=await a(()=>import(`./__vite-browser-external-BDfy7Drd.js`).then(t=>e(t.default,1)),__vite__mapDeps([0,1])),r=n.default||n,i=Buffer.from(t);try{let e=r.inflateSync(i);return new Uint8Array(e.buffer,e.byteOffset,e.byteLength)}catch{let e=i.subarray(2,i.length-4),t=r.inflateRawSync(e);return new Uint8Array(t.buffer,t.byteOffset,t.byteLength)}}catch{}if(typeof DecompressionStream<`u`)try{let e=new ReadableStream({start(e){e.enqueue(t),e.close()}}).pipeThrough(new DecompressionStream(`deflate`)),n=await new Response(e).arrayBuffer();return new Uint8Array(n)}catch{try{let e=t.slice(2,t.length-4),n=new ReadableStream({start(t){t.enqueue(e),t.close()}}).pipeThrough(new DecompressionStream(`deflate-raw`)),r=await new Response(n).arrayBuffer();return new Uint8Array(r)}catch(e){console.warn(`[SWF-Parser] DecompressionStream error, trying fallback:`,e)}}throw Error(`Could not decompress zlib-encoded SWF binary in this environment.`)}function v(e,t,n){let r=e.readRect();n===4&&(e.readRect(),e.readUI8()),e.syncBits();let i=e.readUI8();i===255&&n>=2&&(i=e.readUI16());let a=[`none`];for(let t=0;t<i;t++){let t=e.readUI8();if(t===0)a.push(e.readRGBA(n>=3));else if(t===16||t===18){e.readMatrix();let t=e.readUI8()&15,r=`#38bdf8`;for(let i=0;i<t;i++){e.readUI8();let t=e.readRGBA(n>=3);i===0&&(r=t)}a.push(r)}else e.readUI16(),e.readMatrix(),a.push(`#6366f1`)}let o=e.readUI8();o===255&&n>=2&&(o=e.readUI16());let s=[{width:0,color:`none`}];for(let t=0;t<o;t++){let t=e.readUI16()/20,r=e.readRGBA(n>=3);s.push({width:Math.max(1,t),color:r})}e.syncBits();let c=y(e,e.readUBits(4),e.readUBits(4));e.syncBits();let l=`<path id="swf-shape-${t}" d="${c.pathCommands.join(` `)||`M ${r.xMin.toFixed(1)} ${r.yMin.toFixed(1)} h ${r.width.toFixed(1)} v ${r.height.toFixed(1)} h -${r.width.toFixed(1)} Z`}" fill="${a[c.curFill0]||(a.length>1?a[1]:`#38bdf8`)}" stroke="${s[c.curLine]?.color||`none`}" stroke-width="${s[c.curLine]?.width||1}" />`;return{id:`swf-shape-${t}`,svg:l,bbox:{x:r.xMin,y:r.yMin,w:r.width,h:r.height}}}function y(e,t,n,r=0,i=0){let a=r,o=i,s=[],c=0,l=0;for(;e.offset<e.length;)if(e.readUBits(1)===0){let r=e.readUBits(5);if(r===0)break;if(r&1){let t=e.readUBits(5);a=e.readSBits(t)/20,o=e.readSBits(t)/20,s.push(`M ${a.toFixed(1)} ${o.toFixed(1)}`)}if(r&2&&(c=e.readUBits(t)),r&4&&e.readUBits(t),r&8&&(l=e.readUBits(n)),r&16)break}else{let t=e.readUBits(1),n=e.readUBits(4)+2;if(t===1){let t=e.readUBits(1),r=0,i=0;t===1?(r=e.readSBits(n)/20,i=e.readSBits(n)/20):e.readUBits(1)===1?i=e.readSBits(n)/20:r=e.readSBits(n)/20,a+=r,o+=i,s.push(`L ${a.toFixed(1)} ${o.toFixed(1)}`)}else{let t=a+e.readSBits(n)/20,r=o+e.readSBits(n)/20,i=t+e.readSBits(n)/20,c=r+e.readSBits(n)/20;a=i,o=c,s.push(`Q ${t.toFixed(1)} ${r.toFixed(1)} ${i.toFixed(1)} ${c.toFixed(1)}`)}}return{pathCommands:s,curFill0:c,curLine:l}}function b(e,t,n){let r=e.readRect(),i=e.readRect();n===2&&(e.readRect(),e.readRect(),e.readUI8());let a=e.readUI32(),o=e.offset,s=e.readUI8();s===255&&(s=e.readUI16());let c=[`none`],l=[`none`];for(let t=0;t<s;t++){let t=e.readUI8();if(t===0)c.push(e.readRGBA(!0)),l.push(e.readRGBA(!0));else if(t===16||t===18){e.readMatrix(),e.readMatrix();let t=e.readUI8()&15,n=`#38bdf8`,r=`#818cf8`;for(let i=0;i<t;i++){e.readUI8();let t=e.readRGBA(!0);e.readUI8();let a=e.readRGBA(!0);i===0&&(n=t,r=a)}c.push(n),l.push(r)}else e.readUI16(),e.readMatrix(),e.readMatrix(),c.push(`#6366f1`),l.push(`#a855f7`)}let u=e.readUI8();u===255&&(u=e.readUI16());let d=[{width:0,color:`none`}],f=[{width:0,color:`none`}];for(let t=0;t<u;t++){let t=e.readUI16()/20,r=e.readUI16()/20;n===2&&e.readUI16();let i=e.readRGBA(!0),a=e.readRGBA(!0);d.push({width:Math.max(1,t),color:i}),f.push({width:Math.max(1,r),color:a})}e.syncBits();let p=y(e,e.readUBits(4),e.readUBits(4));e.offset=o+a,e.syncBits();let m=y(e,e.readUBits(4),e.readUBits(4));e.syncBits();let h=p.pathCommands.join(` `)||`M ${r.xMin.toFixed(1)} ${r.yMin.toFixed(1)} h ${r.width.toFixed(1)} v ${r.height.toFixed(1)} h -${r.width.toFixed(1)} Z`,g=m.pathCommands.join(` `)||`M ${i.xMin.toFixed(1)} ${i.yMin.toFixed(1)} h ${i.width.toFixed(1)} v ${i.height.toFixed(1)} h -${i.width.toFixed(1)} Z`,_=c[p.curFill0]||(c.length>1?c[1]:`#38bdf8`),v=l[m.curFill0]||(l.length>1?l[1]:`#818cf8`),b=d[p.curLine]?.color||`none`,x=d[p.curLine]?.width||1,S=`<path id="swf-morph-${t}" d="${h}" fill="${_}" stroke="${b}" stroke-width="${x}" data-morph-end="${g}" />`;return{id:`swf-morph-${t}`,shapeId:t,startD:h,endD:g,startFill:_,endFill:v,stroke:b,strokeWidth:x,svg:S,bbox:{x:Math.min(r.xMin,i.xMin),y:Math.min(r.yMin,i.yMin),w:Math.max(r.width,i.width),h:Math.max(r.height,i.height)}}}function x(e,t,n){let r={frame:n,gotoFrames:[],gotoLabels:[],setVariables:[],branches:[]},i=[],a=[];for(;e.offset<t;){let n=e.readUI8();if(n===0)break;let o=0;n>=128&&(o=e.readUI16());let s=Math.min(t,e.offset+o);if(n===7)r.stops=!0;else if(n===6)r.plays=!0;else if(n===129){let t=e.readUI16();r.gotoFrames.push(t+1)}else if(n===159){let t=e.readString();t&&r.gotoLabels.push(t)}else if(n===136){let t=e.readUI16();a.length=0;for(let n=0;n<t&&e.offset<s;n++)a.push(e.readString())}else if(n===150)for(;e.offset<s;){let t=e.readUI8();if(t===0)i.push(e.readString());else if(t===1){let t=e.readUI8(),n=e.readUI8(),r=e.readUI8(),a=e.readUI8(),o=new ArrayBuffer(4);new Uint8Array(o).set([t,n,r,a]),i.push(new Float32Array(o)[0])}else if(t===2)i.push(null);else if(t===3)i.push(void 0);else if(t===5)i.push(e.readUI8()!==0);else if(t===7)i.push(e.readUI32());else if(t===8){let t=e.readUI8();i.push(a[t]??`str_${t}`)}else if(t===9){let t=e.readUI16();i.push(a[t]??`str_${t}`)}else break}else if(n===29){let e=i.pop(),t=i.pop();typeof t==`string`&&t&&r.setVariables.push({name:t,value:e===void 0?0:e})}else if(n===155){let e=i.pop(),t=i.pop(),n=[];for(let e=0;e<(t||0);e++)n.push(i.pop());if(e===`gotoAndPlay`||e===`gotoAndStop`){let e=n[0];typeof e==`string`?r.gotoLabels.push(e):typeof e==`number`&&r.gotoFrames.push(e)}}else if(n===153){let t=e.readSI16(),n=i.pop();r.branches.push({condition:typeof n==`string`?n:`stateCond == true`,target:t})}e.offset=s}return r}function S(e,t,n){let r={frame:n,gotoFrames:[],gotoLabels:[],setVariables:[],branches:[]};try{e.readUI32(),e.readString();let n=e.readBytes(Math.max(0,t-e.offset)),i=``,a=[];for(let e=0;e<n.length;e++){let t=n[e];t>=32&&t<=126?i+=String.fromCharCode(t):(i.length>=2&&a.push(i),i=``)}i.length>=2&&a.push(i);let o=[`start`,`intro`,`step1`,`step2`,`step3`,`quiz`,`result`,`win`,`reset`,`game`,`play`];for(let e of a)o.includes(e.toLowerCase())?r.gotoLabels.push(e):[`score`,`level`,`count`,`energy`,`velocity`,`temp`,`time`].includes(e.toLowerCase())&&r.setVariables.push({name:e,value:0});for(let e=0;e<n.length;e++)if(n[e]===18){r.stops=!0;break}}catch{}return r}async function C(e,t=`imported-swf`){try{let n=e instanceof Uint8Array?e:new Uint8Array(e);if(n.length<8)return{success:!1,error:`File is too short to be a valid SWF binary (min 8 bytes required).`,svgMarkup:``,astSource:``};let r=String.fromCharCode(n[0],n[1],n[2]);if(r!==`FWS`&&r!==`CWS`)return{success:!1,error:`Unsupported SWF signature: "${r}". Only standard FWS or CWS Flash files are supported.`,svgMarkup:``,astSource:``};let i=n[3],a=(n[4]|n[5]<<8|n[6]<<16|n[7]<<24)>>>0,o;if(r===`CWS`){let e=await _(n.slice(8));o=new Uint8Array(8+e.length),o.set(n.subarray(0,8),0),o.set(e,8)}else o=n;let s=new g(o,8),c=s.readRect(),l=s.readUI16()/256,u=s.readUI16(),d=`#0f172a`,f=[],p=[],m=[],h=[],y=[],C=[],w=1;for(;s.offset<o.length;){let e=s.readUI16(),t=e>>6,n=e&63;n===63&&(n=s.readUI32());let r=s.offset+n;if(t===0)break;if(t===9)d=s.readRGBA(!1);else if(t===2||t===22||t===32||t===83){let e=s.readUI16(),n=t===2?1:t===22?2:t===32?3:4;try{let t=v(s,e,n);f.push(t)}catch{f.push({id:`swf-shape-${e}`,svg:`<rect id="swf-shape-${e}" x="20" y="20" width="120" height="80" rx="8" fill="#38bdf8" opacity="0.85" />`,bbox:{x:20,y:20,w:120,h:80}})}}else if(t===46||t===84){let e=s.readUI16(),n=t===46?1:2;try{let t=b(s,e,n);p.push(t)}catch{p.push({id:`swf-morph-${e}`,shapeId:e,startD:`M 40.0 40.0 L 140.0 40.0 L 140.0 100.0 L 40.0 100.0 Z`,endD:`M 60.0 20.0 L 180.0 60.0 L 120.0 120.0 L 20.0 80.0 Z`,startFill:`#38bdf8`,endFill:`#818cf8`,stroke:`none`,strokeWidth:1,svg:`<path id="swf-morph-${e}" d="M 40.0 40.0 L 140.0 40.0 L 140.0 100.0 L 40.0 100.0 Z" fill="#38bdf8" stroke="none" data-morph-end="M 60.0 20.0 L 180.0 60.0 L 120.0 120.0 L 20.0 80.0 Z" />`,bbox:{x:40,y:40,w:100,h:60}})}}else if(t===12||t===59)try{let e=x(s,r,w);m.push(e)}catch{}else if(t===82)try{let e=S(s,r,w);m.push(e)}catch{}else if(t===4||t===26||t===70){if(t===26||t===70){let e=s.readUI8(),t=s.readUI16(),n=0;e&2&&(n=s.readUI16());let r=null;e&4&&(r=s.readMatrix()),C.push({frame:w,depth:t,characterId:n,matrix:r});let i=y.findIndex(e=>e.depth===t);i>=0?(n&&(y[i].characterId=n),r&&(y[i].matrix=r)):n&&y.push({depth:t,characterId:n,matrix:r})}}else if(t===1)w++;else if(t===43){let e=s.readString();h.push({frame:w,name:e})}else if(t===37)try{let e=s.readUI16(),t=s.readRect();s.syncBits();let n=s.readUI8(),r=s.readUI8(),i=!!(n&1),a=!!(n&2),o=!!(n&4),c=!!(n&128),l=!!(r&32);i&&(s.readUI16(),s.readUI16());let u=`#ffffff`;if(o&&(u=s.readRGBA(!0)),a&&s.readUI16(),l&&(s.readUI8(),s.readUI16(),s.readUI16(),s.readUI16(),s.readSI16()),s.readString(),c){let n=s.readString();if(n&&n.trim()){let r=`<text id="swf-text-${e}" x="${t.xMin.toFixed(1)}" y="${(t.yMin+Math.max(14,t.height*.75)).toFixed(1)}" fill="${u}" font-size="14" font-family="system-ui, sans-serif" font-weight="600">${n.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`)}</text>`;f.push({id:`swf-text-${e}`,svg:r,bbox:{x:t.xMin,y:t.yMin,w:t.width,h:t.height}})}}}catch{}s.offset=r}let T=Math.max(320,Math.round(c.width||800)),E=Math.max(240,Math.round(c.height||480)),ee=Math.max(3,Math.round((u||w)/(l||24))),D=[...f.map(e=>e.svg),...p.map(e=>e.svg)].join(`
    `);D.trim()||(D=`
    <!-- Imported SWF Visual Content -->
    <g id="swf-content" transform="translate(40, 40)">
      <rect id="swf-bg-card" width="${T-80}" height="${E-80}" rx="16" fill="#1e293b" stroke="#38bdf8" stroke-width="2" />
      <text id="swf-title" x="${(T-80)/2}" y="80" text-anchor="middle" fill="#ffffff" font-size="20" font-family="system-ui" font-weight="bold">Imported Flash Asset: ${t}</text>
      <circle id="swf-orbiter" cx="${(T-80)/2}" cy="${(E-80)/2+30}" r="32" fill="#6366f1" />
      <text id="swf-caption" x="${(T-80)/2}" y="${E-120}" text-anchor="middle" fill="#94a3b8" font-size="13">Converted from legacy ${r} v${i} &bull; ${u} Frames &bull; ${l.toFixed(0)} FPS</text>
    </g>`);let te=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${T} ${E}" width="100%" height="100%">
  <rect id="bg" width="${T}" height="${E}" fill="${d}" />
  <g id="scene-root">
    ${D}
  </g>
</svg>`,O=p[0]?.id||f[0]?.id||`swf-orbiter`,k=[...f.map(e=>`#${e.id}`),...p.map(e=>`#${e.id}`)],A=k.length>0?k.slice(0,8).map(e=>`    (:actor :target "${e}" :kinematic true :will-change true)`).join(`
`):`    (:actor :target "#${O}" :kinematic true :will-change true)`,j=[];p.forEach(e=>{j.push(`    (:target "#${e.id}" :attr "d" :expr "astMorphPath('${e.startD}', '${e.endD}', t)")`),e.startFill!==e.endFill&&j.push(`    (:target "#${e.id}" :attr "fill" :expr "astMorphColor('${e.startFill}', '${e.endFill}', t)")`)});let M=``;M=j.length>0?`  :bindings (\n${j.join(`
`)}\n  )`:`  :bindings (\n    (:target "#${O}" :attr "transform" :expr "'translate(' + (Math.sin(t * Math.PI * 2) * 40) + ', 0)'")\n  )`;let N=new Map;m.forEach(e=>{(e.setVariables||[]).forEach(e=>{N.has(e.name)||N.set(e.name,e.value)})});let P=``;if(N.size>0){let e=[];N.forEach((t,n)=>{let r=typeof t==`number`;e.push(`    (:var :name "${n}" :val ${r?t:`"${t}"`} ${r?`:min 0 :max 100`:``})`)}),P=`\n  (:vars (\n${e.join(`
`)}\n  ))\n`}let F=``,I,L=[];if(h.length>=2?h.forEach(e=>{L.push({name:e.name.toLowerCase().replace(/[^a-z0-9_-]/g,`_`),title:e.name,frame:e.frame})}):m.some(e=>e.stops||e.gotoLabels&&e.gotoLabels.length>0||e.gotoFrames&&e.gotoFrames.length>0)&&(L.push({name:`intro`,title:`Intro Phase`,frame:1}),m.forEach(e=>{(e.stops||e.gotoLabels&&e.gotoLabels.length>0)&&L.push({name:`stage_${e.frame}`,title:`Stage at Frame ${e.frame}`,frame:e.frame})}),L.push({name:`conclusion`,title:`Conclusion Phase`,frame:u||w})),L.length>=2&&m.length>0){let e=L[0].name,t=L.map(e=>`        (:state :name "${e.name}" (:attr :target "#swf-title" :attr "textContent" :val "${e.title}"))`).join(`
`),n=[];for(let e=0;e<L.length-1;e++){let t=L[e],r=L[e+1],i=`true`;for(let e of m)if(e.frame===t.frame&&e.branches&&e.branches.length>0){i=e.branches[0].condition;break}n.push(`        (:transition :from "${t.name}" :to "${r.name}" :trigger "${i}" :duration 0.4 :dwell 0.25)`)}n.push(`        (:transition :from "${L[L.length-1].name}" :to "${L[0].name}" :trigger "true" :duration 0.4 :dwell 0.25)`),F=`\n  (:state-machines (\n    (:state-machine :id "swf-state-machine" :initial "${e}" :dwell 0.25\n      (:states (\n${t}\n      ))\n      (:transitions (\n${n.join(`
`)}\n      ))\n    )\n  ))\n`,I=[{id:`swf-state-machine`,initial:e,states:L.map(e=>e.name),transitionsCount:n.length}]}let R=h.length>0?h.map(e=>`    (:t ${Math.min(1,Number(((e.frame-1)/Math.max(1,u)).toFixed(2)))} :title "${e.name}" :rule "Keyframe step at frame ${e.frame}")`).join(`
`):`    (:t 0.0 :title "Intro" :rule "SWF Timeline Inception")
    (:t 0.5 :title "Midpoint" :rule "Active Simulation Phase")
    (:t 1.0 :title "Conclusion" :rule "Loop Reset")`,z=`(:scene
  :id "${t}"
  :title "Imported Flash (${t})"
  :subject "Transpiled Legacy SWF"
  :duration ${ee}
  :fps ${Math.round(l)||24}
  :stageWidth ${T}
  :stageHeight ${E}
${P}
  (:static (
    (:element :target "#bg" :cache true)
    (:element :target "#swf-bg-card" :cache true)
    (:element :target "#swf-title" :cache true)
    (:element :target "#swf-caption" :cache true)
  ))

  (:actors (
${A}
  ))
${F}
${M}

  :keyframes (
${R}
  )

  :interactive (
    (:checkpoints (
      (:id "chk-swf-1" :t 0.50 :type "multiple-choice" :question "What principle is demonstrated in this legacy Flash animation?"
        :options ("Conservation of Energy" "Kinetic Motion" "Vector Quantities" "Gravitational Force") :correct 1
        :hint "Observe the animated position over normalized time t.")
    ))
  )
)`;return{success:!0,metadata:{signature:r,version:i,fileLength:a,width:T,height:E,frameRate:l,frameCount:u,backgroundColor:d,shapeCount:f.length,morphShapeCount:p.length,actionCount:m.length,labels:h,stateMachines:I,variables:Array.from(N.entries()).map(([e,t])=>({name:e,value:t}))},svgMarkup:te,astSource:z}}catch(e){return{success:!1,error:`SWF parsing exception: ${e?.message||String(e)}`,svgMarkup:``,astSource:``}}}async function w(e){let t=new TextEncoder().encode(e);if(typeof CompressionStream<`u`)try{let e=new Blob([t]).stream().pipeThrough(new CompressionStream(`gzip`)),n=await(await new Response(e).blob()).arrayBuffer();return new Uint8Array(n)}catch(e){console.warn(`[cartridgeCompression] CompressionStream failed, falling back to raw bytes:`,e)}return t}async function T(e){if(typeof DecompressionStream<`u`)try{let t=new Blob([e]).stream().pipeThrough(new DecompressionStream(`gzip`));return await(await new Response(t).blob()).text()}catch{return new TextDecoder().decode(e)}return new TextDecoder().decode(e)}function E(e){let t=``,n=e.byteLength;for(let r=0;r<n;r++)t+=String.fromCharCode(e[r]);return btoa(t)}function ee(e){let t=atob(e),n=t.length,r=new Uint8Array(n);for(let e=0;e<n;e++)r[e]=t.charCodeAt(e);return r}async function D(e){let t=JSON.stringify(e),n=new TextEncoder().encode(t).byteLength,r=await w(t),i=r.byteLength,a=n>0?Math.round((n-i)/n*100):0,o={id:e.id,title:e.title,originalBytes:n,compressedBytes:i,savingsPercent:a,timestamp:Date.now()};return{compressedBytes:r,base64:E(r),metadata:o}}async function te(e){let t;t=typeof e==`string`?ee(e):e instanceof ArrayBuffer?new Uint8Array(e):e;let n=await T(t),r=JSON.parse(n);if(!r||typeof r!=`object`||!r.id)throw Error(`Decompressed data is not a valid CartridgeDefinition`);return r}var O=[{id:`welcome`,type:`Sim`,label:`Welcome to AST Vector Player & Educational Simulator`,stage:`PORTAL APPARATUS & SIMULATOR`,oakId:`OAK-PORTAL-000`,oakUnit:`portal-apparatus-showcase`,subject:`Educational Technology`,isCore:!0,tier:`core`,mount:`/player`,section:`Portal Showcase & Apparatus`,hasCheckpoints:!0,checkpointCount:1},{id:`church-tour`,type:`Slide`,label:`Tour of a Catholic Church: Sacred Architecture & Sacred Spaces`,stage:`CATHOLIC LIFE`,oakId:`OAK-KS2-RE-001`,oakUnit:`ks2-re-catholic-sacred-architecture`,subject:`Religious Education`,isCore:!0,tier:`core`,mount:`/curriculum/catholic-life/church-tour`,section:`Catholic Life & Faith Formation`,hasCheckpoints:!0,checkpointCount:3},{id:`altar-anatomy`,type:`Slide`,label:`The Catholic Altar: Sacred Anatomy, Types & Appointments`,stage:`CATHOLIC LIFE`,oakId:`OAK-KS2-RE-002`,oakUnit:`ks2-re-catholic-altar-mensa-relics`,subject:`Religious Education`,isCore:!0,tier:`core`,mount:`/curriculum/catholic-life/altar-anatomy`,section:`Catholic Life & Faith Formation`,hasCheckpoints:!0,checkpointCount:2},{id:`holy-oils`,type:`Slide`,label:`The Three Holy Oils & The Sacred Ambry (Olea Sancta)`,stage:`CATHOLIC LIFE`,oakId:`OAK-KS2-RE-003`,oakUnit:`ks2-re-catholic-holy-oils-ambry`,subject:`Religious Education`,isCore:!0,tier:`core`,mount:`/curriculum/catholic-life/holy-oils`,section:`Catholic Life & Faith Formation`,hasCheckpoints:!0,checkpointCount:1},{id:`holy-water-thurifer`,type:`Sim`,label:`Holy Water & The Thurible: Asperges, Incense & Sacramental Purification`,stage:`CATHOLIC LIFE`,oakId:`OAK-KS2-RE-004`,oakUnit:`ks2-re-catholic-asperges-incensations`,subject:`Religious Education`,isCore:!0,tier:`core`,mount:`/curriculum/catholic-life/holy-water-thurifer`,section:`Catholic Life & Faith Formation`,hasCheckpoints:!0,checkpointCount:3},{id:`first-communion`,type:`Sim`,label:`First Holy Communion & Eucharistic Adoration: Receiving Jesus with Reverence & Love`,stage:`CATHOLIC LIFE`,oakId:`OAK-KS2-RE-005`,oakUnit:`ks2-re-catholic-first-holy-communion`,subject:`Religious Education`,isCore:!0,tier:`core`,mount:`/curriculum/catholic-life/first-communion`,section:`Catholic Life & Faith Formation`,hasCheckpoints:!0,checkpointCount:2},{id:`triduum-easter`,type:`Sim`,label:`The Sacred Paschal Triduum & Easter: Upper Room, Cross & Lumen Christi`,stage:`CATHOLIC LIFE`,oakId:`OAK-KS2-RE-006`,oakUnit:`ks2-re-catholic-paschal-triduum`,subject:`Religious Education`,isCore:!0,tier:`core`,mount:`/curriculum/catholic-life/triduum-easter`,section:`Catholic Life & Faith Formation`,hasCheckpoints:!0,checkpointCount:3},{id:`seven-sacraments`,type:`Sim`,label:`The Seven Holy Sacraments: Visible Signs of Invisible Grace`,stage:`CATHOLIC LIFE`,oakId:`OAK-KS2-RE-008`,oakUnit:`ks2-re-catholic-seven-sacraments`,subject:`Religious Education`,isCore:!0,tier:`core`,mount:`/curriculum/catholic-life/seven-sacraments`,section:`Catholic Life & Faith Formation`,hasCheckpoints:!0,checkpointCount:3},{id:`liturgical-calendar`,type:`Sim`,label:`The Catholic Liturgical Year: Sacred Seasons & Colors`,stage:`CATHOLIC LIFE`,oakId:`OAK-KS2-RE-009`,oakUnit:`ks2-re-catholic-liturgical-seasons`,subject:`Religious Education`,isCore:!0,tier:`core`,mount:`/curriculum/catholic-life/liturgical-calendar`,section:`Catholic Life & Faith Formation`,hasCheckpoints:!0,checkpointCount:3},{id:`liturgical-postures`,type:`Sim`,label:`Sacred Postures & Gestures: Praying with Mind, Heart & Body`,stage:`CATHOLIC LIFE`,oakId:`OAK-KS2-RE-010`,oakUnit:`ks2-re-catholic-liturgical-postures-prayer`,subject:`Religious Education`,isCore:!0,tier:`core`,mount:`/curriculum/catholic-life/liturgical-postures`,section:`Catholic Life & Faith Formation`,hasCheckpoints:!0,checkpointCount:3},{id:`ten-commandments`,type:`Slide`,label:`The Ten Commandments & Moral Law: The Two Tablets of Sinai`,stage:`CATHOLIC LIFE`,oakId:`OAK-KS2-RE-015`,oakUnit:`ks2-re-catholic-decalogue-moral-law`,subject:`Religious Education`,isCore:!0,tier:`core`,mount:`/curriculum/catholic-life/commandments`,section:`Catholic Life & Faith Formation`,hasCheckpoints:!0,checkpointCount:2},{id:`order-of-the-mass`,type:`Sim`,label:`The Order of the Holy Mass: Source & Summit of Catholic Life`,stage:`CATHOLIC LIFE`,oakId:`OAK-KS2-RE-016`,oakUnit:`ks2-re-catholic-order-of-mass`,subject:`Religious Education`,isCore:!0,tier:`core`,mount:`/curriculum/catholic-life/mass`,section:`Catholic Life & Faith Formation`,hasCheckpoints:!0,checkpointCount:2},{id:`sacred-objects`,type:`Slide`,label:`Sacred Vessels, Linens, Sanctuary Appointments & Vestments of the Catholic Church`,stage:`CATHOLIC LIFE`,oakId:`OAK-KS2-RE-017`,oakUnit:`ks2-re-catholic-sacred-vessels-vestments`,subject:`Religious Education`,isCore:!0,tier:`core`,mount:`/curriculum/catholic-life/sacred-objects`,section:`Catholic Life & Faith Formation`,hasCheckpoints:!0,checkpointCount:2},{id:`eucharistic-procession-film`,type:`Film`,label:`Solemn Eucharistic Procession: Liturgical Film & Sacred Vectors`,stage:`CATHOLIC LIFE`,oakId:`OAK-KS2-RE-018`,oakUnit:`ks2-re-catholic-eucharistic-procession`,subject:`Religious Education`,isCore:!0,tier:`core`,mount:`/curriculum/catholic-life/film`,section:`Catholic Life & Faith Formation`,hasCheckpoints:!0,checkpointCount:2},{id:`rosary-mysteries`,type:`Sim`,label:`The Holy Rosary: 3D Beads & 20 Scriptural Mysteries`,stage:`CATHOLIC LIFE & RE`,oakId:`OAK-KS2-RE-019`,oakUnit:`ks2-re-catholic-rosary-twenty-mysteries`,subject:`Religious Education`,isCore:!0,tier:`core`,mount:`/curriculum/catholic-life/rosary-mysteries`,section:`Catholic Life & Faith Formation`,hasCheckpoints:!1,checkpointCount:0},{id:`stations-of-the-cross`,type:`Slide`,label:`The Stations of the Cross: Via Crucis & Sacred Passion`,stage:`CATHOLIC LIFE`,oakId:`OAK-KS2-RE-020`,oakUnit:`ks2-re-catholic-via-crucis-stations`,subject:`Religious Education`,isCore:!0,tier:`core`,mount:`/curriculum/catholic-life/stations-of-the-cross`,section:`Catholic Life & Faith Formation`,hasCheckpoints:!0,checkpointCount:3},{id:`liturgy-of-the-hours`,type:`Sim`,label:`The Liturgy of the Hours: Sanctifying Time Through the Divine Office`,stage:`CATHOLIC LIFE`,oakId:`OAK-KS3-RE-007`,oakUnit:`ks3-re-catholic-divine-office-psalms`,subject:`Religious Education`,isCore:!0,tier:`core`,mount:`/curriculum/catholic-life/liturgy-of-the-hours`,section:`Catholic Life & Faith Formation`,hasCheckpoints:!0,checkpointCount:3},{id:`catholic-rites`,type:`Slide`,label:`The 24 Catholic Rites & Churches: Unity in Diversity Across East & West`,stage:`CATHOLIC LIFE`,oakId:`OAK-KS3-RE-011`,oakUnit:`ks3-re-catholic-sacramental-rites`,subject:`Religious Education`,isCore:!0,tier:`core`,mount:`/curriculum/catholic-life/rites`,section:`Catholic Life & Faith Formation`,hasCheckpoints:!0,checkpointCount:2},{id:`cst-virtues`,type:`Sim`,label:`Catholic Social Teaching & Virtues: Gospel Love in Daily Action`,stage:`CATHOLIC LIFE`,oakId:`OAK-KS3-RE-012`,oakUnit:`ks3-re-catholic-social-teaching-virtues`,subject:`Religious Education`,isCore:!0,tier:`core`,mount:`/curriculum/catholic-life/cst-virtues`,section:`Catholic Life & Faith Formation`,hasCheckpoints:!0,checkpointCount:2},{id:`latin-mass-prayers`,type:`Slide`,label:`Latin Prayers & Gregorian Chant: The Universal Voice of the Catholic Church`,stage:`CATHOLIC LIFE`,oakId:`OAK-KS3-RE-013`,oakUnit:`ks3-re-catholic-traditional-latin-prayers`,subject:`Religious Education`,isCore:!0,tier:`core`,mount:`/curriculum/catholic-life/prayers-latin`,section:`Catholic Life & Faith Formation`,hasCheckpoints:!0,checkpointCount:2},{id:`nicene-creed`,type:`Slide`,label:`The Nicene & Apostles' Creed: Credo in Unum Deum`,stage:`CATHOLIC LIFE`,oakId:`OAK-KS3-RE-014`,oakUnit:`ks3-re-catholic-creed-profession-faith`,subject:`Religious Education`,isCore:!0,tier:`core`,mount:`/curriculum/catholic-life/creed`,section:`Catholic Life & Faith Formation`,hasCheckpoints:!0,checkpointCount:2},{id:`times-tables`,type:`Sim`,label:`Times Tables: 1× to 12× Standard School Multiplication Chart & Grid`,stage:`KS1/KS2 MATHS`,oakId:`OAK-KS1-MAT-006`,oakUnit:`ks1-maths-arithmetic-multiplication-arrays`,subject:`Mathematics`,isCore:!0,tier:`core`,mount:`/curriculum/maths/arithmetic/times-tables`,section:`Mathematics & Geometry`,hasCheckpoints:!1,checkpointCount:0},{id:`math-fishing`,type:`App`,label:`Math Pond: Number Bonds Fishing Game`,stage:`KS1/KS2 MATHS`,oakId:`OAK-KS1-MAT-007`,oakUnit:`ks1-maths-arithmetic-number-bonds`,subject:`Mathematics`,isCore:!0,tier:`core`,mount:`/curriculum/maths/arithmetic/number-bonds`,section:`Mathematics & Geometry`,hasCheckpoints:!1,checkpointCount:0},{id:`bodmas`,type:`Slide`,label:`BODMAS / BIDMAS: Forcefield Clamping & Area Physics`,stage:`KS2/KS3 MATHS`,oakId:`OAK-KS2-MAT-004`,oakUnit:`ks2-maths-arithmetic-order-operations`,subject:`Mathematics`,isCore:!0,tier:`core`,mount:`/curriculum/maths/algebra/bodmas`,section:`Mathematics & Geometry`,hasCheckpoints:!0,checkpointCount:1},{id:`fractions`,type:`Slide`,label:`Fractions: Why Common Denominators Rule`,stage:`KS2 MATHS`,oakId:`OAK-KS2-MAT-005`,oakUnit:`ks2-maths-arithmetic-common-denominators`,subject:`Mathematics`,isCore:!0,tier:`core`,mount:`/curriculum/maths/arithmetic/fractions`,section:`Mathematics & Geometry`,hasCheckpoints:!0,checkpointCount:1},{id:`pythagoras`,type:`Sim`,label:`Pythagoras' Theorem (a² + b² = c²)`,stage:`KS3 GEOMETRY`,oakId:`OAK-KS3-MAT-001`,oakUnit:`units`,subject:`Mathematics`,isCore:!0,tier:`core`,mount:`/curriculum/maths/geometry/pythagoras`,section:`Mathematics & Geometry`,hasCheckpoints:!1,checkpointCount:0},{id:`algebra-balance`,type:`Sim`,label:`⚖️ Algebraic Balance Scale: Preserving Equality (2x + 5 = 15)`,stage:`KS2/KS3 MATHS`,oakId:`OAK-KS3-MAT-003`,oakUnit:`ks3-maths-algebra-linear-equations`,subject:`Mathematics`,isCore:!0,tier:`core`,mount:`/curriculum/maths/algebra/balance-scale`,section:`Mathematics & Geometry`,hasCheckpoints:!0,checkpointCount:2},{id:`calculus-curves`,type:`Sim`,label:`Calculus: Tangent Slopes & Definite Integrals`,stage:`GCSE & A-LEVEL MATHS`,oakId:`OAK-KS4-MAT-002`,oakUnit:`ks4-maths-calculus-tangents`,subject:`Mathematics`,isCore:!0,tier:`core`,mount:`/curriculum/maths/calculus/tangent-slopes`,section:`Mathematics & Geometry`,hasCheckpoints:!0,checkpointCount:1},{id:`kinetic-gas`,type:`Sim`,label:`Kinetic Gas Theory & Boyle's Law`,stage:`KS3/KS4 PHYSICS & CHEMISTRY`,oakId:`OAK-KS3-SCI-001`,oakUnit:`m³`,subject:`Science`,isCore:!0,tier:`core`,mount:`/curriculum/science/physics/kinetic-gas`,section:`Natural Sciences & Physics`,hasCheckpoints:!0,checkpointCount:1},{id:`electric-circuits`,type:`Sim`,label:`💡 Electrical Circuits & Ohm's Law (V = I × R)`,stage:`KS2/KS3 PHYSICS`,oakId:`OAK-KS3-SCI-002`,oakUnit:`ks3-physics-electricity-circuits-ohms-law`,subject:`Science`,isCore:!0,tier:`core`,mount:`/curriculum/science/physics/electric-circuits`,section:`Natural Sciences & Physics`,hasCheckpoints:!0,checkpointCount:2},{id:`atom`,type:`Sim`,label:`Atomic Structure: Bohr Electron Shells`,stage:`KS3 CHEMISTRY`,oakId:`OAK-KS3-SCI-003`,oakUnit:`protons`,subject:`Science`,isCore:!0,tier:`core`,mount:`/curriculum/science/chemistry/atomic-structure`,section:`Natural Sciences & Physics`,hasCheckpoints:!0,checkpointCount:1},{id:`photosynthesis`,type:`Slide`,label:`Photosynthesis: The Green Solar Engine`,stage:`KS3 BIOLOGY`,oakId:`OAK-KS3-SCI-004`,oakUnit:`%`,subject:`Science`,isCore:!0,tier:`core`,mount:`/curriculum/science/biology/photosynthesis`,section:`Natural Sciences & Physics`,hasCheckpoints:!0,checkpointCount:1},{id:`dna-helix`,type:`Sim`,label:`Genetics: DNA Base Pairing & Transcription`,stage:`KS3 GENETICS`,oakId:`OAK-KS3-SCI-005`,oakUnit:`ks3-biology-genetics-dna-transcription`,subject:`Science`,isCore:!0,tier:`core`,mount:`/curriculum/science/biology/dna-helix`,section:`Natural Sciences & Physics`,hasCheckpoints:!0,checkpointCount:1},{id:`solar-system`,type:`Sim`,label:`Solar System: Heliocentric Planetary Motion`,stage:`KS3 SCIENCE`,oakId:`OAK-KS3-SCI-006`,oakUnit:`ks3-physics-space-solar-system-gravity`,subject:`Science`,isCore:!0,tier:`core`,mount:`/curriculum/science/physics/solar-system`,section:`Natural Sciences & Physics`,hasCheckpoints:!0,checkpointCount:1},{id:`velocity`,type:`Sim`,label:`Kinematics: Velocity & Distance-Time Vectors`,stage:`KS3 PHYSICS`,oakId:`OAK-KS3-SCI-007`,oakUnit:`m/s`,subject:`Science`,isCore:!0,tier:`core`,mount:`/curriculum/science/physics/velocity-vectors`,section:`Natural Sciences & Physics`,hasCheckpoints:!0,checkpointCount:1},{id:`phonics-lab`,type:`App`,label:`Early Phonics: Sound Buttons & Blending Mat`,stage:`EYFS/KS1 ENGLISH`,oakId:`OAK-KS1-ENG-001`,oakUnit:`ks1-english-reading-phonics-sound-buttons`,subject:`English`,isCore:!0,tier:`core`,mount:`/curriculum/english/phonics/phonics-lab`,section:`English Literature & Phonics`,hasCheckpoints:!1,checkpointCount:0},{id:`phonics-screening`,type:`Sim`,label:`Year 1 Phonics Screening Check & Alien Words`,stage:`EARLY YEARS & KS1 PHONICS`,oakId:`OAK-KS1-ENG-002`,oakUnit:`ks1-english-reading-phonics-alien-words`,subject:`English`,isCore:!0,tier:`core`,mount:`/curriculum/english/phonics/screening-check`,section:`English Literature & Phonics`,hasCheckpoints:!1,checkpointCount:0},{id:`spelling-bee`,type:`App`,label:`Spelling Bee Championship: KS1 to KS3 Orthography`,stage:`KS1/KS2/KS3 ENGLISH`,oakId:`OAK-KS2-ENG-003`,oakUnit:`ks2-english-writing-orthography-spelling`,subject:`English`,isCore:!0,tier:`core`,mount:`/curriculum/english/spelling/spelling-bee`,section:`English Literature & Phonics`,hasCheckpoints:!1,checkpointCount:0},{id:`shakespeare`,type:`Slide`,label:`The Globe Theatre: Shakespeare & Iambic Pentameter`,stage:`KS3/KS4 ENGLISH LITERATURE`,oakId:`OAK-KS3-ENG-004`,oakUnit:`BPM`,subject:`English`,isCore:!0,tier:`core`,mount:`/curriculum/english/theatre/globe`,section:`English Literature & Phonics`,hasCheckpoints:!0,checkpointCount:2},{id:`shakespeare-macbeth`,type:`Slide`,label:`Macbeth: 5-Act Dramatic Soliloquy & Moral Fall`,stage:`KS3/KS4 ENGLISH LITERATURE`,oakId:`OAK-KS4-ENG-005`,oakUnit:`BPM`,subject:`English`,isCore:!0,tier:`core`,mount:`/curriculum/english/theatre/macbeth`,section:`English Literature & Phonics`,hasCheckpoints:!0,checkpointCount:2},{id:`water-cycle`,type:`Slide`,label:`Water Cycle: Continuous Earth Cycle`,stage:`KS2 GEOGRAPHY`,oakId:`OAK-KS2-GEO-001`,oakUnit:`°C`,subject:`Geography`,isCore:!0,tier:`core`,mount:`/curriculum/geography/water-cycle`,section:`Geography & Earth Sciences`,hasCheckpoints:!0,checkpointCount:1},{id:`mountain-elevation`,type:`Sim`,label:`Mountain Altitude: Elevation, Hypotenuse & Atmospheric Science`,stage:`KS2/KS3 MATHS & GEOGRAPHY`,oakId:`OAK-KS2-GEO-002`,oakUnit:`°C`,subject:`Geography`,isCore:!0,tier:`core`,mount:`/curriculum/geography/mountain-elevation`,section:`Geography & Earth Sciences`,hasCheckpoints:!0,checkpointCount:1},{id:`languages`,type:`App`,label:`MFL & Polyglot Studio: Spanish, French & Latin`,stage:`KS2/KS3 MFL`,oakId:`OAK-KS2-MFL-001`,oakUnit:`ks2-languages-mfl-polyglot-studio`,subject:`Languages`,isCore:!0,tier:`core`,mount:`/curriculum/languages/mfl-polyglot`,section:`Languages & Inclusion`,hasCheckpoints:!1,checkpointCount:0},{id:`bsl-fingerspelling`,type:`Sim`,label:`BSL: 3D British Sign Language Two-Handed Fingerspelling`,stage:`ACCESSIBILITY & LANGUAGES`,oakId:`OAK-KS2-INC-001`,oakUnit:`x`,subject:`Inclusion & Languages`,isCore:!0,tier:`core`,mount:`/curriculum/languages/bsl-fingerspelling`,section:`Languages & Inclusion`,hasCheckpoints:!1,checkpointCount:0},{id:`bbc-model-b`,type:`Sim`,label:`BBC Micro Model B: 6502 Computing & BBC BASIC`,stage:`KS2 & KS3 COMPUTING`,oakId:`OAK-KS2-COM-012`,oakUnit:`ks2-computing-history-algorithms-bbc-micro`,subject:`Computing`,isCore:!0,tier:`core`,mount:`/curriculum/computing/bbc-model-b`,section:`Computing & Technology`,hasCheckpoints:!0,checkpointCount:2},{id:`fish-tank`,type:`App`,label:`Aquarium Stress Benchmark: Vector Point & FPS Limiter`,stage:`BENCHMARK & STRESS LAB`,oakId:`OAK-KS3-COM-001`,oakUnit:`ks3-computing-systems-stress-benchmarks`,subject:`Computing`,isCore:!0,tier:`core`,mount:`/curriculum/computing/stress-benchmark`,section:`Computing & Technology`,hasCheckpoints:!1,checkpointCount:0},{id:`oak-data-algorithms-sequencing`,type:`App`,label:`Algorithms, Sequencing & Logic`,stage:`Key Stage 2`,oakId:`OAK-KS3-GEN-OAKDATAA`,oakUnit:`Algorithms and Sequencing`,subject:`Computing`,isCore:!1,tier:`recall`,mount:`/curriculum/general/oak-data-algorithms-sequencing`,section:`Curriculum Cartridges`,hasCheckpoints:!1,checkpointCount:0},{id:`oak-data-angles-triangles`,type:`App`,label:`Angles, Triangles & Geometry`,stage:`Key Stage 2`,oakId:`OAK-KS3-GEN-OAKDATAA`,oakUnit:`Angles and Triangles`,subject:`Mathematics`,isCore:!1,tier:`recall`,mount:`/curriculum/general/oak-data-angles-triangles`,section:`Curriculum Cartridges`,hasCheckpoints:!1,checkpointCount:0},{id:`oak-data-cell-biology`,type:`App`,label:`Cell Biology & Organelles`,stage:`Key Stage 3`,oakId:`OAK-KS3-GEN-OAKDATAC`,oakUnit:`Cell Biology`,subject:`Science`,isCore:!1,tier:`recall`,mount:`/curriculum/general/oak-data-cell-biology`,section:`Curriculum Cartridges`,hasCheckpoints:!1,checkpointCount:0},{id:`oak-data-electric-circuits`,type:`App`,label:`Electric Circuits & Conductors`,stage:`Key Stage 2`,oakId:`OAK-KS3-SCI-OAKDATAE`,oakUnit:`Circuits and Conductors`,subject:`Science`,isCore:!1,tier:`recall`,mount:`/curriculum/science/oak-data-electric-circuits`,section:`Natural Sciences & Physics`,hasCheckpoints:!1,checkpointCount:0},{id:`oak-data-fractions-decimals`,type:`App`,label:`Fractions, Decimals & Percentages`,stage:`Key Stage 2`,oakId:`OAK-KS3-MAT-OAKDATAF`,oakUnit:`Fractions and Decimals`,subject:`Mathematics`,isCore:!1,tier:`recall`,mount:`/curriculum/mathematics/oak-data-fractions-decimals`,section:`Mathematics & Geometry`,hasCheckpoints:!1,checkpointCount:0},{id:`oak-data-phonics-screening`,type:`App`,label:`Phonics, Digraphs & Alien Words`,stage:`Key Stage 1`,oakId:`OAK-KS3-ENG-OAKDATAP`,oakUnit:`Phonics & Simple Sentences`,subject:`English`,isCore:!1,tier:`recall`,mount:`/curriculum/english/oak-data-phonics-screening`,section:`English Literature & Phonics`,hasCheckpoints:!1,checkpointCount:0},{id:`oak-data-re-nicene-creed`,type:`App`,label:`The Nicene Creed & Trinity`,stage:`Key Stage 2`,oakId:`OAK-KS3-RE-OAKDATAR`,oakUnit:`The Nicene Creed & Trinity`,subject:`Religious Education (Catholic)`,isCore:!1,tier:`recall`,mount:`/curriculum/religious/oak-data-re-nicene-creed`,section:`Catholic Life & Faith Formation`,hasCheckpoints:!1,checkpointCount:0},{id:`oak-data-re-sacraments`,type:`App`,label:`The Seven Sacraments & Holy Eucharist`,stage:`Key Stage 2`,oakId:`OAK-KS3-RE-OAKDATAR`,oakUnit:`The Holy Eucharist & Sacraments`,subject:`Religious Education (Catholic)`,isCore:!1,tier:`recall`,mount:`/curriculum/religious/oak-data-re-sacraments`,section:`Catholic Life & Faith Formation`,hasCheckpoints:!1,checkpointCount:0},{id:`oak-data-seasonal-changes`,type:`App`,label:`Seasonal Changes & Earth Cycles`,stage:`Key Stage 1`,oakId:`OAK-KS3-GEN-OAKDATAS`,oakUnit:`Seasonal Changes`,subject:`Science`,isCore:!1,tier:`recall`,mount:`/curriculum/general/oak-data-seasonal-changes`,section:`Curriculum Cartridges`,hasCheckpoints:!1,checkpointCount:0},{id:`oak-data-spanish-foundations`,type:`App`,label:`Spanish Greetings & Verbs`,stage:`Key Stage 2`,oakId:`OAK-KS3-GEN-OAKDATAS`,oakUnit:`Spanish Greetings & Introductions`,subject:`Spanish`,isCore:!1,tier:`recall`,mount:`/curriculum/general/oak-data-spanish-foundations`,section:`Curriculum Cartridges`,hasCheckpoints:!1,checkpointCount:0},{id:`oak-data-states-of-matter`,type:`App`,label:`States of Matter & Particle Theory`,stage:`Key Stage 2`,oakId:`OAK-KS3-GEN-OAKDATAS`,oakUnit:`States of Matter`,subject:`Science`,isCore:!1,tier:`application`,mount:`/curriculum/general/oak-data-states-of-matter`,section:`Curriculum Cartridges`,hasCheckpoints:!1,checkpointCount:0},{id:`pipeline-sample`,type:`App`,label:`Sample Physics Knowledge Nodes`,stage:`KS3`,oakId:`OAK-DEV-001`,oakUnit:`dev-apparatus-pipeline-sample`,subject:`Educational Technology`,isCore:!0,tier:`core`,mount:`/curriculum/dev/pipeline-sample`,section:`Development & Test Apparatus`,hasCheckpoints:!1,checkpointCount:0}];function k(e,t,n,r,i){return`<svg viewBox="0 0 800 480" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="data-bg-${r}" cx="50%" cy="40%" r="65%">
      <stop offset="0%" stop-color="#1e293b" />
      <stop offset="100%" stop-color="#090d16" />
    </radialGradient>
    <linearGradient id="data-accent-${r}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#06b6d4" />
      <stop offset="100%" stop-color="#3b82f6" />
    </linearGradient>
  </defs>
  <rect width="800" height="480" fill="url(#data-bg-${r})" rx="16" />
  <rect x="40" y="40" width="720" height="400" rx="12" fill="#0f172a" fill-opacity="0.85" stroke="#0284c7" stroke-width="2" stroke-dasharray="6,4" />
  <circle cx="400" cy="140" r="50" fill="#0284c7" fill-opacity="0.2" stroke="#38bdf8" stroke-width="3" />
  <text x="400" y="156" font-size="42" text-anchor="middle">${i}</text>
  <text x="400" y="235" fill="#f8fafc" font-size="22" font-weight="900" text-anchor="middle">${e}</text>
  <text x="400" y="270" fill="#38bdf8" font-size="13" font-weight="800" text-anchor="middle" letter-spacing="2">${t.toUpperCase()} • ${n.toUpperCase()}</text>
  <rect x="260" y="300" width="280" height="38" rx="19" fill="url(#data-accent-${r})" />
  <text x="400" y="324" fill="#ffffff" font-size="13" font-weight="900" text-anchor="middle" letter-spacing="1">📊 ${r} DIAGNOSTIC QUESTIONS</text>
  <text x="400" y="375" fill="#94a3b8" font-size="12" font-weight="600" text-anchor="middle">⚡ Zero-Latency Modular Data Deck • Mounts Instantly in Practice Lab</text>
</svg>`}var A={stage:`Key Stage 2`,subject:`Science`,unit:`States of Matter`,axiom:`Matter consists of particles in continuous motion; thermal energy transfers alter physical state without changing chemical identity.`,trap:`Believing that gases have zero mass, or confusing boiling with smoke.`,socraticPivot:`What happens to the spacing and speed of particles when thermal energy is transferred to a solid?`,hook:`Why does an ice lolly melt in the summer sun, but puddle water disappears without boiling?`,guidedStep:`Trace particle kinetic velocity and intermolecular bonding across solid, liquid, and gas phases.`,questions:[{id:`som-1`,prompt:`Why does liquid water take the shape of its container, whereas ice retains a rigid fixed shape?`,options:[`Water particles can slide past each other, while ice particles are fixed in a vibrating lattice`,`Ice particles are completely motionless with zero kinetic energy`,`Water molecules are physically smaller and lighter than ice molecules`,`Ice particles are held together by gravitational pull rather than chemical bonds`],answer:0,hint:`Think about whether the particles are locked in place or free to move around one another.`,explanation:`In a solid (ice), particles vibrate in fixed positions within a rigid lattice. In a liquid (water), particles have enough kinetic energy to slide past each other while remaining in contact.`,tier:`application`,misconceptions:[`Correct! Fluidity emerges from particles being able to slide past one another.`,`Misconception: Solid particles continuously vibrate at all temperatures above absolute zero (-273.15°C).`,`Misconception: Ice and liquid water consist of identical H2O molecules with the same mass.`,`Misconception: Intermolecular forces, not gravity, hold microscopic particles together.`]},{id:`som-2`,prompt:`When water boils at 100°C in an open kettle, what happens to the bubbles that rise to the surface?`,options:[`They are gaseous water vapor (steam) produced by liquid water changing state`,`They are trapped air bubbles that were dissolved in the cold water`,`They are pure heat energy that has separated from the water`,`They are pockets of hydrogen and oxygen gas broken into separate elements`],answer:0,hint:`A physical phase change does not split the water molecule into separate chemicals.`,explanation:`Boiling is a bulk phase transition. The bubbles consist of gaseous water (steam) formed when liquid water turns into gas throughout the liquid.`,tier:`analysis`,misconceptions:[`Correct! Steam is water in its gaseous state.`,`Misconception: Dissolved air leaves during early heating; rapid continuous boiling bubbles are 100% water vapor.`,`Misconception: Heat is energy transfer, not a physical substance that forms bubbles.`,`Misconception: Boiling is a physical change, not chemical electrolysis.`]},{id:`som-3`,prompt:`If you place 100 grams of solid ice into a sealed, airtight container and allow it to melt completely into water, what will the total mass be?`,options:[`Exactly 100 grams, because mass is conserved during physical phase changes`,`Less than 100 grams, because liquid water is denser than ice`,`More than 100 grams, because the container warms up and adds thermal weight`,`Zero grams, because solids lose all mass when they transition to liquid`],answer:0,hint:`Recall the Law of Conservation of Mass in a closed system.`,explanation:`In any closed system, the total mass remains constant during a physical change. The number of water particles remains identical.`,tier:`recall`,misconceptions:[`Correct! The Law of Conservation of Mass applies across all phase changes.`,`Misconception: Density affects volume, not mass. 100g of ice becomes 100g of liquid water.`,`Misconception: Thermal energy does not add measurable mass in chemical or physical systems.`,`Misconception: Matter never loses mass simply by changing state.`]},{id:`som-4`,prompt:`Which process describes water vapor in the atmosphere turning directly into tiny liquid water droplets that form clouds?`,options:[`Condensation, where gas particles lose thermal energy and move closer together`,`Evaporation, where liquid particles gain energy and escape into the air`,`Precipitation, where water falls from clouds due to gravity`,`Transpiration, where plants release water vapor through their stomata`],answer:0,hint:`Think about the phase transition from gas back to liquid when cooling occurs.`,explanation:`Condensation occurs when water vapor cools down, loses kinetic energy, and transitions into tiny liquid droplets that suspend in air as clouds.`,tier:`recall`,misconceptions:[`Correct! Cooling causes water vapor to condense into liquid cloud droplets.`,`Misconception: Evaporation is the opposite phase change (liquid turning into gas).`,`Misconception: Precipitation is the subsequent falling of rain, snow, or hail to the ground.`,`Misconception: Transpiration is biological release of vapor from plant leaves.`]},{id:`som-5`,prompt:`Why does an inflated balloon expand when placed in a warm room and shrink when placed in a cold freezer?`,options:[`Gas particles move faster and collide with greater force against the balloon walls when heated`,`New gas particles are created inside the balloon by the ambient heat`,`The rubber elastic naturally stretches more when cooled down`,`Cold air destroys gas particles, reducing the internal particle count`],answer:0,hint:`Think about kinetic particle theory and how temperature relates to particle speed and collisions.`,explanation:`According to kinetic gas theory, temperature is a measure of average particle kinetic energy. Heating causes gas particles to move faster and collide harder, exerting outward pressure.`,tier:`application`,misconceptions:[`Correct! Increased particle kinetic velocity generates higher internal pressure, expanding the balloon.`,`Misconception: Thermal energy cannot create matter or generate new particles in a sealed balloon.`,`Misconception: Rubber contracts slightly when cooled, but the primary driver is internal gas pressure change.`,`Misconception: Particles are never destroyed by cooling; they merely slow down.`]},{id:`som-6`,prompt:`What happens to the temperature of pure water while it is actively boiling at standard atmospheric pressure?`,options:[`The temperature remains constant at 100°C until all liquid has vaporized`,`The temperature rapidly rises to 150°C to push the steam out`,`The temperature drops to 50°C because boiling releases all trapped heat`,`The temperature fluctuates wildly between 0°C and 200°C every few seconds`],answer:0,hint:`During a phase transition, additional thermal energy is used to break intermolecular bonds rather than increase kinetic speed.`,explanation:`During a phase change (latent heat of vaporization), added thermal energy breaks intermolecular forces rather than increasing particle temperature. The temperature stays constant at 100°C until boiling finishes.`,tier:`analysis`,misconceptions:[`Correct! Latent heat of vaporization keeps the temperature flat at 100°C throughout the boiling transition.`,`Misconception: Liquid water under normal pressure cannot exceed 100°C; extra heat accelerates vaporization.`,`Misconception: Boiling requires continuous energy input and does not drop in temperature.`,`Misconception: Pure substances have fixed, deterministic boiling points under steady pressure.`]}]},j={stage:`Key Stage 2`,subject:`Mathematics`,unit:`Fractions and Decimals`,axiom:`A fraction represents equal parts of a whole; multiplying or dividing both numerator and denominator by the same non-zero number produces an equivalent fraction.`,trap:`Adding denominators together when adding fractions (e.g. 1/3 + 1/3 = 2/6), or thinking 0.45 is larger than 0.5 because 45 > 5.`,socraticPivot:`If you cut a pizza into 4 slices and eat 2, is that the same amount as cutting it into 8 slices and eating 4?`,hook:`Sharing chocolate bars fairly among friends without leaving crumb remainders.`,guidedStep:`Align denominators using lowest common multiples before attempting addition or subtraction.`,questions:[{id:`fd-1`,prompt:`Which fraction is equivalent to 3/4?`,options:[`9/12`,`6/10`,`4/5`,`7/8`],answer:0,hint:`Multiply both the numerator (3) and the denominator (4) by the same integer.`,explanation:`Multiplying top and bottom by 3 yields (3 × 3) / (4 × 3) = 9/12. Both express the exact same mathematical value (0.75).`,tier:`recall`,misconceptions:[`Correct! Multiplying numerator and denominator by 3 gives 9/12.`,`Misconception: 6/10 simplifies to 3/5, not 3/4.`,`Misconception: Adding 1 to numerator and denominator changes the fraction value (3/4 = 0.75, 4/5 = 0.8).`,`Misconception: Adding 4 to both numbers changes the proportion (7/8 = 0.875).`]},{id:`fd-2`,prompt:`What is 2/5 + 1/10 expressed in its simplest form?`,options:[`1/2`,`3/15`,`3/10`,`3/5`],answer:0,hint:`Convert 2/5 to tenths first so both fractions have a common denominator.`,explanation:`2/5 = 4/10. Adding 4/10 + 1/10 gives 5/10, which simplifies by dividing top and bottom by 5 to equal 1/2.`,tier:`application`,misconceptions:[`Correct! 4/10 + 1/10 = 5/10 = 1/2.`,`Misconception: You must never add denominators together (2+1)/(5+10) = 3/15 is mathematically invalid.`,`Misconception: 2/5 was forgotten or treated as 2/10 instead of converting to 4/10.`,`Misconception: 1/10 was overlooked during common denominator alignment.`]},{id:`fd-3`,prompt:`Which decimal represents the exact value of the fraction 7/100?`,options:[`0.07`,`0.7`,`0.70`,`7.0`],answer:0,hint:`Seven hundredths occupies the second digit after the decimal point.`,explanation:`The first place after the decimal point is tenths; the second is hundredths. 7 hundredths is written as 0.07.`,tier:`recall`,misconceptions:[`Correct! 7 hundredths is 0.07.`,`Misconception: 0.7 is 7 tenths (7/10), which is 10 times larger than 7/100.`,`Misconception: 0.70 is also 7 tenths (70/100 = 7/10).`,`Misconception: 7.0 is seven whole units.`]},{id:`fd-4`,prompt:`Which comparison statement between 0.45 and 0.5 is correct?`,options:[`0.5 is greater than 0.45 because 0.5 is equal to 0.50 (50 hundredths > 45 hundredths)`,`0.45 is greater than 0.5 because 45 is a larger number than 5`,`They are equal because 0.5 and 0.45 both round to 0`,`0.45 is greater because it has more digits after the decimal point`],answer:0,hint:`Pad 0.5 with a zero to make it 0.50, then compare the hundredths.`,explanation:`Looking at place value: 0.5 has 5 tenths (0.50 = 50 hundredths), whereas 0.45 only has 4 tenths and 5 hundredths (45 hundredths). Therefore, 0.5 > 0.45.`,tier:`analysis`,misconceptions:[`Correct! Comparing digits by place value shows 5 tenths exceeds 4 tenths.`,`Misconception: Whole-number thinking trap (believing longer decimals are automatically larger numbers).`,`Misconception: Decimal values are continuous numbers, not rounded approximations.`,`Misconception: Number of digits indicates precision, not magnitude.`]},{id:`fd-5`,prompt:`What is 3/8 of 48?`,options:[`18`,`16`,`24`,`6`],answer:0,hint:`Divide 48 by the denominator (8) to find 1/8, then multiply by the numerator (3).`,explanation:`First find one eighth: 48 ÷ 8 = 6. Then multiply by three: 6 × 3 = 18.`,tier:`application`,misconceptions:[`Correct! (48 ÷ 8) × 3 = 6 × 3 = 18.`,`Misconception: 48 ÷ 3 = 16, which calculates 1/3 of 48 instead of 3/8.`,`Misconception: 24 is half of 48 (4/8).`,`Misconception: 6 is only 1/8 of 48; you still need to multiply by 3.`]},{id:`fd-6`,prompt:`A shirt originally costing £40 is discounted by 25%. What is the sale price?`,options:[`£30`,`£35`,`£10`,`£25`],answer:0,hint:`25% is equivalent to 1/4. Find 1/4 of £40, then subtract it from £40.`,explanation:`25% = 1/4. One quarter of £40 is £10. Subtracting the discount (£40 - £10) gives the sale price of £30.`,tier:`application`,misconceptions:[`Correct! £40 - (25% of £40) = £40 - £10 = £30.`,`Misconception: Subtracting £5 rather than 25%.`,`Misconception: £10 is the amount of the discount, not the final price.`,`Misconception: Confusing the percentage value with the price amount.`]}]},M={stage:`Key Stage 1`,subject:`Science`,unit:`Seasonal Changes`,axiom:`Earth experiences four continuous seasons (Spring, Summer, Autumn, Winter) caused by its tilted orbit around the Sun, altering daylight hours and weather.`,trap:`Thinking summer is warmer because Earth is physically closer to the Sun, or that trees die in winter rather than entering dormancy.`,socraticPivot:`Why do we wear warm woollen coats and see the sun set earlier in winter than in summer?`,hook:`Noticing shadows growing long and leaves turning crimson gold in Autumn.`,guidedStep:`Observe changes in daylight duration, temperature, and tree foliage across the yearly cycle.`,questions:[{id:`sc-1`,prompt:`Which season has the longest daylight hours and the warmest average weather in the United Kingdom?`,options:[`Summer`,`Winter`,`Spring`,`Autumn`],answer:0,hint:`Think about the season when schools have the long holiday and bedtime is still light outside.`,explanation:`In Summer, the UK is tilted towards the Sun, giving us long daylight hours and more direct sunlight, making it the warmest season.`,tier:`recall`,misconceptions:[`Correct! Summer brings the longest days and highest temperatures.`,`Misconception: Winter has the shortest daylight hours and coldest temperatures.`,`Misconception: Spring is warming up, but daylight is still shorter than Summer.`,`Misconception: Autumn daylight hours are decreasing.`]},{id:`sc-2`,prompt:`What happens to deciduous trees during Autumn in the UK?`,options:[`Their leaves change colour to red, orange, and brown before falling off`,`They grow bright new green leaves and colourful flower blossoms`,`They produce juicy ripe strawberries on their branches`,`Their tree trunks shrink into the ground until springtime`],answer:0,hint:`Think about kicking piles of crunchy leaves in the park in October.`,explanation:`Deciduous trees lose their leaves in Autumn to conserve water and protect themselves against cold winter frost and storms.`,tier:`recall`,misconceptions:[`Correct! Deciduous leaves change colour and fall in Autumn.`,`Misconception: Growing new leaves and blossoms happens in Spring.`,`Misconception: Strawberries are summer fruit that grow on small ground plants.`,`Misconception: Tree trunks remain standing tall throughout the year.`]},{id:`sc-3`,prompt:`How do daylight hours change as we move from Autumn into Winter?`,options:[`Daylight hours become shorter, so it gets dark earlier in the afternoon`,`Daylight hours stay exactly 12 hours long every single day`,`Daylight hours get longer, with bright sun shining until 9 o’clock at night`,`The Sun stops rising completely for three whole months in England`],answer:0,hint:`Think about when streetlights turn on when walking home from school in December.`,explanation:`As Winter approaches, the Northern Hemisphere tilts away from the Sun, making daylight hours steadily shorter and nights longer.`,tier:`application`,misconceptions:[`Correct! Days get shorter and nights get longer in Winter.`,`Misconception: Day length only balances at 12 hours during the Equinoxes in Spring and Autumn.`,`Misconception: Long evenings until 9pm happen in mid-Summer (around the Summer Solstice).`,`Misconception: The Sun still rises every day in the UK in winter, although day length is short.`]},{id:`sc-4`,prompt:`What type of tree keeps its green needles all through the cold winter months?`,options:[`Evergreen tree`,`Deciduous tree`,`Dead tree`,`Desert palm tree`],answer:0,hint:`Think of a Christmas pine tree that stays green all year round.`,explanation:`Evergreen trees (like pines and firs) have tough, waxy needles that survive freezing weather and stay green all year round.`,tier:`recall`,misconceptions:[`Correct! Evergreen trees stay green through all four seasons.`,`Misconception: Deciduous trees shed their leaves completely in Autumn.`,`Misconception: Dormant winter trees are alive, not dead.`,`Misconception: Palm trees thrive in warm tropical climates.`]},{id:`sc-5`,prompt:`Which weather pattern is most typical of a British Winter?`,options:[`Cold temperatures, frost, snow, and icy morning puddles`,`Hot sunny heatwaves with beach weather every day`,`Warm gentle breezes with cherry blossom petals falling`,`Tropical monsoon thunderstorms with humid 35°C heat`],answer:0,hint:`Think of scraping frost off car windscreens and wearing gloves.`,explanation:`Winter in the UK brings cold temperatures, freezing frost on grass, icy roads, and occasional snowfall due to low solar heating.`,tier:`recall`,misconceptions:[`Correct! Cold temperatures, frost, and ice characterise British winter.`,`Misconception: Heatwaves occur during Summer.`,`Misconception: Cherry blossoms bloom in early Spring.`,`Misconception: Tropical monsoons happen in equatorial climates.`]}]},N={stage:`Key Stage 2`,subject:`Religious Education (Catholic)`,unit:`The Holy Eucharist & Sacraments`,axiom:`A Sacrament is an outward, visible sign of inward grace instituted by Christ to confer divine life upon the soul.`,trap:`Confusing the Holy Eucharist with a mere symbolic cracker, or believing sacraments are only human rituals without divine efficacy.`,socraticPivot:`Why did Jesus say at the Last Supper "This IS my Body", and how does the priest act in persona Christi at Mass?`,hook:`Stepping into church and seeing the red sanctuary lamp flickering beside the Tabernacle.`,guidedStep:`Identify the three categories of Sacraments: Christian Initiation, Healing, and Service of Communion.`,questions:[{id:`re-1`,prompt:`What is the doctrinal Catholic definition of a Sacrament?`,options:[`An outward and visible sign of invisible divine grace instituted by Jesus Christ`,`A human tradition invented by medieval monks for church recordkeeping`,`A graduation certificate awarded to students who pass Sunday school exams`,`A personal opinion about morality that changes from year to year`],answer:0,hint:`Recall the classic Catechism definition: an outward sign instituted by Christ to give grace.`,explanation:`The Catholic Church teaches that Sacraments are efficacious signs of grace, instituted by Christ and entrusted to the Church, by which divine life is dispensed to us (CCC 1131).`,tier:`recall`,misconceptions:[`Correct! A Sacrament is an outward sign of inward grace instituted by Christ.`,`Misconception: Sacraments were instituted by Jesus Christ Himself in the Gospels.`,`Misconception: Sacraments are encounters with God’s grace, not academic tests.`,`Misconception: Sacraments convey objective divine grace through the Holy Spirit.`]},{id:`re-2`,prompt:`Which three sacraments make up the Sacraments of Christian Initiation, laying the foundation of Christian life?`,options:[`Baptism, Confirmation, and the Holy Eucharist`,`Reconciliation, Anointing of the Sick, and Holy Orders`,`Matrimony, Holy Orders, and Confession`,`Baptism, Funerals, and Sunday Collection`],answer:0,hint:`Think of the three sacraments by which a believer is reborn, strengthened by the Holy Spirit, and nourished by Christ’s Body and Blood.`,explanation:`The Sacraments of Christian Initiation are Baptism (new birth in Christ), Confirmation (strengthening with the Holy Spirit), and the Holy Eucharist (nourishment with the Bread of Life).`,tier:`recall`,misconceptions:[`Correct! Baptism, Confirmation, and Eucharist are the three Sacraments of Initiation.`,`Misconception: Reconciliation and Anointing are the two Sacraments of Healing.`,`Misconception: Holy Orders and Matrimony are the Sacraments at the Service of Communion.`,`Misconception: Funerals are liturgical rites, not one of the Seven Sacraments.`]},{id:`re-3`,prompt:`What does the Catholic Church teach occurs during the Eucharistic Consecration at Mass (Transubstantiation)?`,options:[`The substance of bread and wine becomes truly and substantially the Body, Blood, Soul, and Divinity of Jesus Christ`,`The bread and wine remain ordinary food but serve as a mental reminder or metaphor`,`The bread turns into breadcrumbs with holy water sprinkled over it`,`The priest performs a magic trick where the host disappears into thin air`],answer:0,hint:`Consider the doctrine of Real Presence affirmed by the Council of Trent and the words of Christ.`,explanation:`Catholic doctrine teaches the Real Presence through Transubstantiation: while the physical appearances (accidents) of bread and wine remain, their underlying substance becomes truly the Body and Blood of Christ.`,tier:`analysis`,misconceptions:[`Correct! Transubstantiation affirms the Real Presence of Christ in the Eucharist.`,`Misconception: Catholic doctrine explicitly rejects the view that the Eucharist is merely a symbol or metaphor.`,`Misconception: Holy water is a sacramental, not part of Eucharistic consecration.`,`Misconception: The Eucharist is a divine mystery of faith, not an optical illusion.`]},{id:`re-4`,prompt:`What essential physical matter and words (form) are required for a valid Christian Baptism?`,options:[`Pouring of water while saying "I baptise you in the name of the Father, and of the Son, and of the Holy Spirit"`,`Sprinkling salt while reciting the Ten Commandments in English`,`Lighting seven candles while waving incense three times`,`Writing the baby’s name in the parish registry without any prayer`],answer:0,hint:`Jesus commanded in Matthew 28:19: "Baptise them in the name of the Father, and of the Son, and of the Holy Spirit."`,explanation:`The essential matter of Baptism is true water (by immersion or pouring), and the essential form is the Trinitarian formula commanded by Christ: "I baptise you in the name of the Father, and of the Son, and of the Holy Spirit."`,tier:`application`,misconceptions:[`Correct! Water and the Trinitarian formula are strictly required for valid baptism.`,`Misconception: Salt was historically an optional baptismal rite, but never the essential sacramental matter.`,`Misconception: Candles and incense are liturgical symbols, not the essential matter of baptism.`,`Misconception: Civil or parish registration cannot substitute for sacramental washing with water.`]},{id:`re-5`,prompt:`Which sacrament gives spiritual healing, forgiveness of sins committed after baptism, and reconciliation with God and the Church?`,options:[`The Sacrament of Reconciliation (Penance / Confession)`,`The Sacrament of Confirmation`,`The Sacrament of Holy Orders`,`The Sacrament of Matrimony`],answer:0,hint:`Jesus breathed on the apostles and said: "Receive the Holy Spirit; whose sins you forgive are forgiven them" (John 20:23).`,explanation:`In the Sacrament of Reconciliation, Christ’s mercy is mediated through the priest, granting absolution for sins to those who are contrite and confess.`,tier:`recall`,misconceptions:[`Correct! Reconciliation provides forgiveness, healing, and peace of conscience.`,`Misconception: Confirmation imparts the fullness of the Holy Spirit for Christian witness.`,`Misconception: Holy Orders ordains deacons, priests, and bishops to sacred ministry.`,`Misconception: Matrimony sanctifies the marital covenant between husband and wife.`]},{id:`re-6`,prompt:`What is the purpose of the one-hour Eucharistic fast before receiving Holy Communion at Mass?`,options:[`To prepare our minds, bodies, and hearts with reverence and spiritual hunger for the Blessed Sacrament`,`To save food money for the parish heating fund`,`Because eating food is sinful on Sundays`,`To make sure people feel faint and tired during the homily`],answer:0,hint:`Think about spiritual reverence and bodily discipline when preparing to receive Christ.`,explanation:`Canon law asks Catholics to abstain from food and drink (except water and medicine) for at least one hour before Communion as an act of bodily preparation and reverence for the Lord.`,tier:`analysis`,misconceptions:[`Correct! The Eucharistic fast fosters spiritual reverence and physical readiness.`,`Misconception: The fast is a spiritual discipline, not a financial measure.`,`Misconception: Food is a good gift from God; fasting is a temporary exercise in spiritual preparation.`,`Misconception: Fasting is intended to promote prayerful attentiveness, not fatigue.`]}]},P={stage:`Key Stage 2`,subject:`Computing`,unit:`Algorithms and Sequencing`,axiom:`An algorithm is an unambiguous, finite sequence of precise instructions designed to solve a problem or accomplish a specific task.`,trap:`Assuming a computer knows what you mean without explicit instructions, or thinking bugs are hardware defects rather than logic errors.`,socraticPivot:`If you tell a robot "make a jam sandwich", why will it fail unless you specify "pick up the knife with your right hand"?`,hook:`Programming a rover robot to navigate a volcanic obstacle course on Mars.`,guidedStep:`Decompose complex tasks into linear steps, condition checks (selection), and loops (iteration).`,questions:[{id:`comp-1`,prompt:`What is the computer science definition of an algorithm?`,options:[`A precise, step-by-step set of instructions to solve a problem or complete a task`,`The physical glass screen of a tablet computer`,`A computer virus that steals passwords from websites`,`A keyboard shortcut used to delete a whole paragraph`],answer:0,hint:`Think of a recipe in cooking or a Lego construction manual.`,explanation:`An algorithm is an ordered, unambiguous set of rules or steps that takes an input and reliably produces the desired output.`,tier:`recall`,misconceptions:[`Correct! An algorithm is a precise, ordered sequence of instructions.`,`Misconception: A tablet screen is physical display hardware.`,`Misconception: A virus is malicious software, not the definition of an algorithm.`,`Misconception: A keyboard shortcut is an input event, not an algorithm.`]},{id:`comp-2`,prompt:`In computer programming, what does the process of "debugging" mean?`,options:[`Finding and fixing errors or logical mistakes in program code`,`Cleaning dust and crumbs out of a computer keyboard`,`Downloading free games from an internet browser`,`Unplugging the power cable while the computer is saving a file`],answer:0,hint:`When a code script doesn’t behave as expected, programmers trace the error step-by-step.`,explanation:`Debugging is the systematic process of finding, tracing, and resolving bugs (errors or unintended behaviors) in computer software code.`,tier:`recall`,misconceptions:[`Correct! Debugging is finding and resolving software code defects.`,`Misconception: Physical cleaning is hardware maintenance, not code debugging.`,`Misconception: Downloading software is file transfer.`,`Misconception: Abruptly unplugging power can corrupt data files.`]},{id:`comp-3`,prompt:`Which programming construct allows a set of instructions to be repeated multiple times without writing them out again?`,options:[`A loop (iteration)`,`An IF statement (selection)`,`A variable assignment`,`A print statement`],answer:0,hint:`Think of "repeat 4 times [move forward 10 steps, turn right 90 degrees]" to draw a square.`,explanation:`Iteration (loops, such as "repeat 10 times" or "while condition is true") executes a block of code repeatedly, keeping algorithms efficient and concise.`,tier:`application`,misconceptions:[`Correct! Loops and iteration handle repeated code execution.`,`Misconception: Selection (IF-THEN-ELSE) branches execution based on a condition rather than repeating.`,`Misconception: Variables store values in memory.`,`Misconception: Print statements output text to the screen.`]},{id:`comp-4`,prompt:`Why is the exact sequence (order) of commands critical in an algorithm?`,options:[`Executing commands in the wrong order produces incorrect results or complete failure`,`Computers shuffle commands randomly to make execution faster`,`Order only matters in human languages, not in binary code`,`Commands always execute from bottom to top automatically`],answer:0,hint:`What happens if you put your shoes on before your socks?`,explanation:`Computers execute instructions sequentially. Changing the order (e.g. putting shoes on before socks, or moving forward before checking for a wall) breaks the logic.`,tier:`analysis`,misconceptions:[`Correct! Sequential order is fundamental to deterministic algorithm execution.`,`Misconception: Computers execute code strictly in program counter sequence, never randomly.`,`Misconception: Order is even more rigorous in code than natural languages.`,`Misconception: Standard code executes sequentially from top to bottom.`]},{id:`comp-5`,prompt:`A smart thermostat has the rule: "IF room temperature < 18°C, THEN turn heating ON; ELSE turn heating OFF." What computational concept is this?`,options:[`Selection (conditional branching based on a test condition)`,`An infinite loop`,`A hardware memory crash`,`Data encryption`],answer:0,hint:`The program decides which path to follow depending on whether the temperature is below 18°C.`,explanation:`Selection allows a computer program to make decisions and execute different paths based on whether a condition evaluates to TRUE or FALSE.`,tier:`application`,misconceptions:[`Correct! Selection uses IF/ELSE conditional logic to branch behavior.`,`Misconception: An infinite loop repeats endlessly without a termination condition.`,`Misconception: A memory crash occurs when resources are exhausted.`,`Misconception: Encryption scrambles data for cybersecurity.`]}]},F={stage:`Key Stage 1`,subject:`English`,unit:`Phonics & Simple Sentences`,axiom:`Spoken English words are constructed from individual sound units (phonemes) represented by letters or letter groups (graphemes) decoded through synthetic blending.`,trap:`Guessing whole words from initial letters or shapes rather than decoding grapheme-phoneme correspondences sequentially.`,socraticPivot:`Can you sound out each phoneme button individually before blending them into the whole word?`,hook:`Helping friendly alien monsters decode alien words before launching their spaceship.`,guidedStep:`Identify single letters, digraphs, and trigraphs, press the sound buttons, then blend left to right.`,questions:[{id:`ph-1`,prompt:`In the word "ship", how many distinct phonemes (speech sounds) can you hear when sounding it out?`,options:[`3 phonemes: /sh/ - /i/ - /p/`,`4 phonemes: /s/ - /h/ - /i/ - /p/`,`2 phonemes: /shi/ - /p/`,`1 phoneme: /ship/`],answer:0,hint:`The letters "s" and "h" combine into a consonant digraph making one single sound.`,explanation:`"sh" is a digraph representing one single phoneme /sh/. Together with /i/ and /p/, "ship" contains exactly 3 phonemes: /sh/-/i/-/p/.`,tier:`recall`,misconceptions:[`Correct! "sh" forms a single digraph phoneme, giving 3 sounds in total.`,`Misconception: Counting individual letters rather than phonemes (sounds). "sh" is two letters but one sound.`,`Misconception: Grouping /sh/ and /i/ together instead of separating the vowel.`,`Misconception: Hearing the whole word without segmenting into individual phonemes.`]},{id:`ph-2`,prompt:`Which of the following is a pseudo-word ("alien word") used to test pure phonetic decoding without sight memory?`,options:[`plog`,`frog`,`flag`,`plug`],answer:0,hint:`An alien word follows real English phonics rules but has no real meaning in the dictionary.`,explanation:`"plog" is a valid decodable non-word (/p/-/l/-/o/-/g/). It tests whether a child can apply grapheme-phoneme correspondences without relying on memorised vocabulary.`,tier:`application`,misconceptions:[`Correct! "plog" is a pseudo-word used in the Year 1 Phonics Screening Check.`,`Misconception: "frog" is a real English noun for an amphibian.`,`Misconception: "flag" is a real English noun.`,`Misconception: "plug" is a real English word.`]},{id:`ph-3`,prompt:`Which vowel digraph correctly completes the word "r _ _ n" for water falling from clouds?`,options:[`ai (rain)`,`ee (reen)`,`oa (roan)`,`oo (roon)`],answer:0,hint:`Think of the /eɪ/ sound found in snail, train, and paint.`,explanation:`The vowel sound /eɪ/ in the middle of words is commonly spelled with the digraph "ai", spelling "rain".`,tier:`recall`,misconceptions:[`Correct! "ai" produces the long /eɪ/ vowel sound in "rain".`,`Misconception: "ee" produces the long /iː/ vowel sound (as in tree).`,`Misconception: "oa" produces the /oʊ/ sound (as in boat).`,`Misconception: "oo" produces /uː/ or /ʊ/ (as in moon or book).`]},{id:`ph-4`,prompt:`What type of grapheme is "igh" in the word "night"?`,options:[`A trigraph (three letters making one sound)`,`A split digraph`,`A consonant cluster`,`A silent letter`],answer:0,hint:`Count how many letters work together to create the single /aɪ/ vowel sound.`,explanation:`A trigraph is a group of three letters that represent a single phoneme. In "night", the letters i-g-h represent the single vowel phoneme /aɪ/.`,tier:`recall`,misconceptions:[`Correct! "igh" is a trigraph because three letters produce one vowel sound.`,`Misconception: A split digraph has a consonant separating the vowels (e.g. "a-e" in cake).`,`Misconception: "igh" contains vowels and consonants forming a vowel phoneme, not a consonant cluster.`,`Misconception: The letters "gh" are part of the trigraph, not an isolated silent artifact.`]},{id:`ph-5`,prompt:`When blending the split digraph in the word "b-i-k-e", which sound does the "i-e" make?`,options:[`Long /aɪ/ sound (like in "pie" or "time")`,`Short /ɪ/ sound (like in "pin" or "sit")`,`Long /iː/ sound (like in "bee")`,`Short /e/ sound (like in "bed")`],answer:0,hint:`The magic "e" at the end tells the preceding vowel to say its name.`,explanation:`The split digraph "i-e" modifies the vowel so it produces the long vowel sound /aɪ/, making /b/-/aɪ/-/k/ ("bike").`,tier:`application`,misconceptions:[`Correct! The split digraph "i-e" produces the long /aɪ/ phoneme.`,`Misconception: Without the final "e", the word would be "bik" with a short /ɪ/ sound.`,`Misconception: /iː/ is spelled with "ee" or "ea".`,`Misconception: /e/ is spelled with "e" as in "bed".`]}]},I={stage:`Key Stage 2`,subject:`Science`,unit:`Circuits and Conductors`,axiom:`An electric current requires a continuous unbroken loop of conducting material driven by a voltage source (cell) for electrons to flow.`,trap:`Believing electricity "gets used up" by a component, or confusing an open switch with a working connection.`,socraticPivot:`If you remove one bulb from a simple series circuit, why do all the other bulbs immediately go dark?`,hook:`Why does flipping a single plastic knife switch instantly illuminate every bulb on the runway?`,guidedStep:`Trace the unbroken conductive pathway from the positive cell terminal, through switches and loads, to the negative terminal.`,questions:[{id:`circ-1`,prompt:`Why must an electrical circuit form a complete, unbroken loop for a lightbulb to shine?`,options:[`Electric current requires a continuous closed pathway for electrical charge to flow from one terminal of the cell to the other`,`Bulbs need air pressure inside the wire to push the light out`,`Electricity gathers in open gaps and evaporates into the air`,`Wires only work when tied in circular knots`],answer:0,hint:`Consider what happens to the flow of electrons when there is a break or gap in the wire.`,explanation:`Electric current is the continuous drift of charged particles (electrons). If there is any break in the loop (an open switch or loose wire), charge cannot circulate and current drops to zero.`,tier:`recall`,misconceptions:[`Correct! An unbroken closed circuit is required for charge to circulate.`,`Misconception: Electricity is moving electrical charge, not pneumatic air pressure.`,`Misconception: Charge does not evaporate; an open circuit simply prevents current from starting.`,`Misconception: Physical geometry does not require knots; it requires conductive continuity.`]},{id:`circ-2`,prompt:`Which of the following materials is an electrical conductor that will allow current to flow when inserted into a circuit gap?`,options:[`A copper coin`,`A wooden ruler`,`A plastic drinking straw`,`A glass marble`],answer:0,hint:`Metals generally contain free, delocalised electrons that allow electrical charge to move easily.`,explanation:`Metals such as copper, iron, and aluminium have free electrons that easily move, making them excellent electrical conductors. Wood, plastic, and glass are electrical insulators.`,tier:`application`,misconceptions:[`Correct! Copper is a metal with free electrons, making it a good conductor.`,`Misconception: Wood is an electrical insulator because its electrons are tightly bound in chemical bonds.`,`Misconception: Plastic is an insulator used to coat cables safely.`,`Misconception: Glass is an electrical insulator.`]},{id:`circ-3`,prompt:`What happens to the brightness of two identical bulbs in a series circuit when you add a second identical 1.5V cell?`,options:[`Both bulbs glow noticeably brighter because the total voltage and current increase`,`Both bulbs become much dimmer because the second cell absorbs electrical energy`,`The first bulb glows brighter but the second bulb turns completely off`,`Nothing changes because bulb brightness is fixed at the factory`],answer:0,hint:`Think about how adding more electromotive force (volts) pushes more current through the resistive filaments.`,explanation:`Connecting cells in series adds their voltages together (1.5V + 1.5V = 3.0V). The higher voltage pushes greater current through the bulbs, increasing power and brightness.`,tier:`analysis`,misconceptions:[`Correct! Doubling voltage in a simple series circuit increases current and filament brightness.`,`Misconception: Cells supply electrical energy; they do not absorb it.`,`Misconception: In a series circuit, identical current flows through every component equally.`,`Misconception: Brightness is governed by voltage and current, not fixed factory settings.`]},{id:`circ-4`,prompt:`In standard electrical circuit diagrams, what does a straight line with a break where a slanted line is lifted up represent?`,options:[`An open switch`,`A burnt-out battery`,`A solar panel`,`A buzzer`],answer:0,hint:`When a bridge is lifted, cars cannot cross. When a switch is open, current cannot cross.`,explanation:`A slanted line lifted away from a contact represents an open switch. When open, it creates a physical gap that halts the current flow.`,tier:`recall`,misconceptions:[`Correct! The lifted line symbolises an open switch breaking the circuit.`,`Misconception: A battery is represented by parallel long and short lines.`,`Misconception: A buzzer has a semi-circular umbrella symbol.`,`Misconception: A solar panel or cell has distinct plate lines.`]},{id:`circ-5`,prompt:`Why are household electrical appliance cords coated with flexible plastic or rubber?`,options:[`Plastic and rubber are electrical insulators that prevent electric shocks by blocking current leakage`,`Plastic makes the wires heavier so they don't blow away in the wind`,`Plastic speeds up the electricity flowing inside the copper wire`,`Plastic cools down the room like a tiny refrigerator`],answer:0,hint:`Think about electrical safety and touching live cables.`,explanation:`Plastic and rubber have extremely high electrical resistance, acting as insulators. They prevent electrical current from flowing into our hands, protecting against hazardous electric shocks.`,tier:`application`,misconceptions:[`Correct! Electrical insulators prevent hazardous shocks and short-circuits.`,`Misconception: Insulation is for electrical safety, not structural ballast.`,`Misconception: Current speed is determined by material resistivity and electric fields, not outer plastic.`,`Misconception: Plastic does not act as a refrigeration unit.`]}]},L={stage:`Key Stage 2`,subject:`Mathematics`,unit:`Angles and Triangles`,axiom:`The interior angles of any planar triangle always sum to exactly 180 degrees (a straight line angle).`,trap:`Confusing obtuse angles (> 90°) with reflex angles (> 180°), or assuming longer triangle sides must contain larger total interior angles.`,socraticPivot:`If you tear the three corners off any paper triangle and line them up side-by-side, why do they always form a perfectly straight line?`,hook:`Roof truss carpenters and navigation compass bearings rely on fixed angle sums.`,guidedStep:`Identify right angles (90°), acute angles (< 90°), and obtuse angles (90°–180°), and subtract known angles from 180° to find missing angles.`,questions:[{id:`ang-1`,prompt:`What is the sum of the three interior angles inside ANY triangle on a flat plane?`,options:[`Exactly 180°`,`Exactly 360°`,`Exactly 90°`,`It depends on whether the triangle is big or small`],answer:0,hint:`Tearing the three vertices of any triangle and putting them together creates a straight line.`,explanation:`In Euclidean geometry, the interior angles of every triangle always add up to exactly 180°, regardless of the size or shape of the triangle.`,tier:`recall`,misconceptions:[`Correct! The interior angles of all planar triangles sum to 180°.`,`Misconception: 360° is the angle sum of a four-sided quadrilateral (or a full turn).`,`Misconception: 90° is a single right angle.`,`Misconception: Angle sum is an invariant property of Euclidean triangles, independent of physical scale.`]},{id:`ang-2`,prompt:`A right-angled triangle has one angle measuring 90° and another measuring 35°. What is the measure of the third angle?`,options:[`55°`,`45°`,`65°`,`90°`],answer:0,hint:`Subtract the two known angles (90° and 35°) from the total triangle angle sum of 180°.`,explanation:`180° - 90° - 35° = 55°. In any right triangle, the two non-right angles are complementary and always add to 90° (90° - 35° = 55°).`,tier:`application`,misconceptions:[`Correct! 180° - (90° + 35°) = 55°.`,`Misconception: 90° - 45° = 45° assumes both acute angles are equal (an isosceles right triangle).`,`Misconception: Calculation error adding 10° too much.`,`Misconception: A triangle cannot have two 90° interior angles on a flat plane (that would already total 180°).`]},{id:`ang-3`,prompt:`What classification is given to an angle that measures 135°?`,options:[`An obtuse angle (between 90° and 180°)`,`An acute angle (less than 90°)`,`A right angle (exactly 90°)`,`A reflex angle (greater than 180°)`],answer:0,hint:`It is wider than an "L" shaped corner (90°) but smaller than a straight line (180°).`,explanation:`An obtuse angle is strictly greater than 90° and less than 180°. 135° falls squarely into this range.`,tier:`recall`,misconceptions:[`Correct! 135° is between 90° and 180°, making it obtuse.`,`Misconception: Acute angles are strictly less than 90°.`,`Misconception: Right angles measure exactly 90°.`,`Misconception: Reflex angles are strictly greater than 180° and less than 360°.`]},{id:`ang-4`,prompt:`An equilateral triangle has three sides of equal length. What is the size of each of its three interior angles?`,options:[`60° each`,`90° each`,`45° each`,`120° each`],answer:0,hint:`Because all three sides are equal, all three angles must be equal: divide 180° by 3.`,explanation:`An equilateral triangle has three congruent angles. Dividing 180° equally among the 3 angles gives 180° ÷ 3 = 60° for each angle.`,tier:`application`,misconceptions:[`Correct! 180° ÷ 3 = 60° per angle.`,`Misconception: 90° × 3 = 270°, which is impossible in a triangle.`,`Misconception: 45° × 3 = 135°, which does not equal 180°.`,`Misconception: 120° is the exterior angle of an equilateral triangle, not the interior angle.`]},{id:`ang-5`,prompt:`How many degrees are in a complete full turn (rotation)?`,options:[`360°`,`180°`,`270°`,`100°`],answer:0,hint:`A straight line is a half-turn (180°). Double that for a full turn.`,explanation:`A full circle rotation consists of 4 right angles or 2 straight lines, totalling exactly 360°.`,tier:`recall`,misconceptions:[`Correct! A full circular turn measures 360°.`,`Misconception: 180° is a half-turn (straight line).`,`Misconception: 270° is a three-quarter turn.`,`Misconception: Metric 100 is not used for angular degrees in standard geometry.`]}]},R={stage:`Key Stage 3`,subject:`Science`,unit:`Cell Biology`,axiom:`Cells are the fundamental structural and functional units of all living organisms; eukaryotic plant and animal cells share organelles but plant cells possess unique rigid walls, chloroplasts, and permanent vacuoles.`,trap:`Confusing cell walls with cell membranes, or believing animal cells have chloroplasts.`,socraticPivot:`Why does a plant stem stand upright without a bony skeleton, whereas an animal cell will burst if placed in pure water?`,hook:`Viewing cheek cells under 400x magnification reveals tiny nucleus command centres.`,guidedStep:`Compare organelle structures: nucleus (DNA), mitochondria (aerobic respiration), ribosomes (protein synthesis), and chloroplasts (photosynthesis).`,questions:[{id:`cell-1`,prompt:`Which three structures are present in typical plant cells but absent in animal cells?`,options:[`Cellulose cell wall, permanent large vacuole, and chloroplasts`,`Nucleus, cytoplasm, and cell membrane`,`Mitochondria, ribosomes, and endoplasmic reticulum`,`Red blood cells, white blood cells, and platelets`],answer:0,hint:`Think about what gives plants their green colour, rigid upright posture, and cell turgor.`,explanation:`Plant cells uniquely have a rigid cellulose cell wall for structural support, a large permanent sap vacuole for turgor, and chloroplasts containing chlorophyll for photosynthesis. Animal cells have none of these three.`,tier:`recall`,misconceptions:[`Correct! Cell wall, chloroplasts, and permanent vacuole are unique to plant cells.`,`Misconception: Nucleus, cytoplasm, and cell membrane are present in both plant and animal cells.`,`Misconception: Mitochondria and ribosomes are universal eukaryotic organelles found in both.`,`Misconception: Blood cells are specialized animal tissue cells.`]},{id:`cell-2`,prompt:`What is the primary function of the cell membrane in both plant and animal cells?`,options:[`Controlling which substances enter and leave the cell (selective permeability)`,`Storing the entire genetic code inside chromosomes`,`Releasing energy through aerobic cellular respiration`,`Producing glucose using light energy from the Sun`],answer:0,hint:`The membrane acts like a security gate controlling traffic in and out of the cell.`,explanation:`The cell membrane is a partially permeable lipid bilayer that regulates the transport of nutrients, water, ions, and waste products into and out of the cell.`,tier:`recall`,misconceptions:[`Correct! The cell membrane controls selective substance movement.`,`Misconception: Storing genetic code is the function of the cell nucleus.`,`Misconception: Releasing energy via aerobic respiration is the function of mitochondria.`,`Misconception: Producing glucose via photosynthesis is the function of chloroplasts.`]},{id:`cell-3`,prompt:`Why are mitochondria often described as the "powerhouses" of eukaryotic cells?`,options:[`They carry out aerobic respiration, transferring chemical energy from glucose into ATP`,`They generate high-voltage electrical sparks to jump-start the cell`,`They absorb direct sunlight to pump water out of the cell`,`They digest toxic waste like miniature garbage disposal units`],answer:0,hint:`Mitochondria combine glucose with oxygen to release usable chemical energy for cellular work.`,explanation:`Mitochondria are the site of aerobic cellular respiration, where glucose is oxidised to transfer energy into adenosine triphosphate (ATP), powering cellular functions.`,tier:`analysis`,misconceptions:[`Correct! Mitochondria carry out aerobic respiration, supplying ATP energy.`,`Misconception: Cellular respiration is chemical metabolism, not high-voltage electricity.`,`Misconception: Sunlight absorption is performed by chloroplasts in plant cells.`,`Misconception: Lysosomes perform digestive waste degradation.`]},{id:`cell-4`,prompt:`If a light microscope has a 10× eyepiece lens and a 40× objective lens, what is the total magnification of the specimen?`,options:[`400×`,`50×`,`4×`,`4,000×`],answer:0,hint:`Multiply the magnification of the eyepiece lens by the magnification of the objective lens.`,explanation:`Total magnification = Eyepiece magnification × Objective magnification. 10 × 40 = 400× magnification.`,tier:`application`,misconceptions:[`Correct! 10 × 40 = 400× total magnification.`,`Misconception: Adding 10 + 40 = 50 is a common mistake; optical lenses multiply magnification.`,`Misconception: Dividing 40 ÷ 10 = 4 is incorrect.`,`Misconception: 4,000× is an accidental extra zero.`]}]},z={stage:`Key Stage 2`,subject:`Religious Education (Catholic)`,unit:`The Nicene Creed & Trinity`,axiom:`The central Christian mystery is the Most Holy Trinity: one God in three distinct Divine Persons (Father, Son, and Holy Spirit), co-equal, co-eternal, and of one substance (consubstantial).`,trap:`Modalism (believing God merely wears 3 different masks), or Tritheism (believing in 3 separate gods).`,socraticPivot:`Why does the Nicene Creed say Jesus is "consubstantial with the Father" (of the same divine essence)?`,hook:`Standing every Sunday at Mass to recite the ancient 1,700-year-old Creed formulated at the Council of Nicaea (AD 325).`,guidedStep:`Trace the four marks of the Church (One, Holy, Catholic, and Apostolic) and the Trinitarian confession of faith.`,questions:[{id:`creed-1`,prompt:`What does the Catholic dogma of the Holy Trinity profess?`,options:[`There is one God in three co-equal Divine Persons: Father, Son, and Holy Spirit`,`There are three separate gods who take turns ruling the universe`,`God is one person who transforms into three different characters over time`,`The Father created the Son as an angel, who then created the Holy Spirit`],answer:0,hint:`We baptise in the singular "name" of the Father, and of the Son, and of the Holy Spirit.`,explanation:`The Catholic Church professes monotheism: one divine nature subsisting in three distinct persons—the Father, the Son, and the Holy Spirit—who are co-eternal and co-equal (CCC 253-255).`,tier:`recall`,misconceptions:[`Correct! The Holy Trinity is One God in Three Divine Persons.`,`Misconception: Polytheism / Tritheism contradicts Christian monotheism.`,`Misconception: Modalism (Sabellianism) falsely claims God is one person wearing different masks.`,`Misconception: Arianism falsely claimed the Son was a created being rather than God.`]},{id:`creed-2`,prompt:`In the Nicene Creed, what does the Greek theological term "consubstantial" (homoousios) mean regarding Jesus Christ and the Father?`,options:[`Jesus is of the exact same divine substance and essence as God the Father`,`Jesus was a very good human teacher who became God as a reward`,`Jesus and the Father have completely opposite wills and desires`,`Jesus is an illusion that merely appeared human`],answer:0,hint:`The Council of Nicaea in AD 325 affirmed "God from God, Light from Light, true God from true God, consubstantial with the Father".`,explanation:`"Consubstantial" (Latin: consubstantialis; Greek: homoousios) means of the same being or substance. Jesus is fully and truly God, possessing the identical divine nature as the Father.`,tier:`analysis`,misconceptions:[`Correct! Consubstantial means sharing the identical divine essence with the Father.`,`Misconception: Adoptionism falsely claimed Jesus was an ordinary man adopted by God.`,`Misconception: The Trinity possesses one united divine will and nature.`,`Misconception: Docetism falsely claimed Christ's humanity was merely an optical illusion.`]},{id:`creed-3`,prompt:`What are the four essential marks of the Church professed in the Nicene Creed?`,options:[`One, Holy, Catholic, and Apostolic`,`Rich, Powerful, Famous, and Ancient`,`English, Latin, Greek, and Hebrew`,`Baptised, Confirmed, Married, and Ordained`],answer:0,hint:`"I believe in one, holy, catholic and apostolic Church..."`,explanation:`The four marks of the Church are One (unity in Christ), Holy (sanctified by the Holy Spirit), Catholic (universal and complete across all nations), and Apostolic (founded on the apostles and their successors).`,tier:`recall`,misconceptions:[`Correct! The four marks are One, Holy, Catholic, and Apostolic.`,`Misconception: Material power and wealth are worldly qualities, not marks of the Church.`,`Misconception: These are liturgical and historical languages, not marks of the Church.`,`Misconception: These are sacraments, not marks of the Church.`]}]},ne={stage:`Key Stage 2`,subject:`Spanish`,unit:`Spanish Greetings & Introductions`,axiom:`In Spanish, noun gender (masculine/feminine) dictates article and adjective agreement, while verb inflection encodes subject person without requiring explicit pronouns.`,trap:`Assuming Spanish word order mirrors English literally, or forgetting agreement with feminine nouns ending in "-a".`,socraticPivot:`Why can you say "Tengo diez años" without using the word "yo" (I)?`,hook:`Greeting a pen-pal in Madrid with natural native fluency and correct formal/informal courtesy.`,guidedStep:`Select greetings based on time of day (días, tardes, noches), ask names with "¿Cómo te llamas?", and apply gendered adjectives.`,questions:[{id:`es-1`,prompt:`How do you say "Good afternoon" or "Good evening" (before dark) in Spanish?`,options:[`Buenas tardes`,`Buenos días`,`Buenas noches`,`Hola amigo`],answer:0,hint:`"Días" is masculine plural used in the morning, while "tardes" is feminine plural used in the afternoon.`,explanation:`"Buenas tardes" is used from midday until nightfall. "Buenos días" is used in the morning, and "Buenas noches" is used at night.`,tier:`recall`,misconceptions:[`Correct! "Buenas tardes" means Good afternoon / early evening.`,`Misconception: "Buenos días" means Good morning.`,`Misconception: "Buenas noches" means Good night / late evening.`,`Misconception: "Hola amigo" means Hello friend.`]},{id:`es-2`,prompt:`When someone asks you "¿Cómo te llamas?" in Spanish, how do you correctly answer "My name is Carlos"?`,options:[`Me llamo Carlos`,`Tengo Carlos`,`Soy llamo Carlos`,`Mi Carlos es`],answer:0,hint:`"Me llamo" literally translates to "I call myself".`,explanation:`In Spanish, the reflexive verb phrase "Me llamo..." (literally "I call myself...") is the standard natural way to state your name.`,tier:`application`,misconceptions:[`Correct! "Me llamo Carlos" is the natural Spanish idiom.`,`Misconception: "Tengo" means "I have", used for age (e.g. Tengo 10 años).`,`Misconception: "Soy llamo" incorrectly combines two verbs (I am I call).`,`Misconception: "Mi Carlos es" is an incorrect literal English word-for-word word order.`]},{id:`es-3`,prompt:`In Spanish, why does the sentence "Vivo en Londres" NOT require the pronoun "Yo" (I) at the front?`,options:[`The verb ending "-o" already indicates that the subject is first person singular ("I")`,`Pronouns are forbidden by the Spanish Royal Academy`,`Spanish only allows questions to have subject pronouns`,`"Vivo" is an adjective that describes London`],answer:0,hint:`Spanish is a "pro-drop" (null-subject) language where conjugated verb endings reveal who is performing the action.`,explanation:`Spanish is a pro-drop language: verb conjugation endings (such as "-o" in "vivo") clearly signal the subject ("I"), so subject pronouns like "yo" are omitted unless used for emphasis.`,tier:`analysis`,misconceptions:[`Correct! The conjugated verb ending "-o" specifies the first-person subject.`,`Misconception: Pronouns are permitted for emphasis or contrast, never forbidden.`,`Misconception: Pronoun rules apply equally across statements and questions.`,`Misconception: "Vivo" is a conjugated verb (from vivir, to live), not an adjective.`]}]},re=[{id:`oak-data-states-of-matter`,title:`States of Matter & Particle Theory (Data Deck)`,stage:`Key Stage 2`,subject:`Science`,oakId:`SCI-KS2-MAT-01`,oakUnit:`States of Matter`,category:`Science`,icon:`🧊`,desc:`Decentralized Oak curriculum question deck for KS2 States of Matter: solid, liquid, gas, heating curves, and kinetic theory.`,dataPayload:A,svgMarkup:k(`States of Matter & Particle Theory`,`Key Stage 2`,`Science`,6,`🧊`),astSource:o(A,`oak-data-states-of-matter`,`States of Matter & Particle Theory`)},{id:`oak-data-fractions-decimals`,title:`Fractions, Decimals & Percentages (Data Deck)`,stage:`Key Stage 2`,subject:`Mathematics`,oakId:`MAT-KS2-FRAC-02`,oakUnit:`Fractions and Decimals`,category:`Mathematics`,icon:`🍰`,desc:`Decentralized Oak curriculum question deck for KS2 Fractions & Decimals: equivalence, common denominators, and decimal conversions.`,dataPayload:j,svgMarkup:k(`Fractions, Decimals & Percentages`,`Key Stage 2`,`Mathematics`,6,`🍰`),astSource:o(j,`oak-data-fractions-decimals`,`Fractions, Decimals & Percentages`)},{id:`oak-data-seasonal-changes`,title:`Seasonal Changes & Earth Rhythms (Data Deck)`,stage:`Key Stage 1`,subject:`Science`,oakId:`SCI-KS1-SEAS-01`,oakUnit:`Seasonal Changes`,category:`Science`,icon:`🍂`,desc:`Decentralized Oak curriculum question deck for KS1 Seasonal Changes: four seasons, daylight patterns, and plant adaptation.`,dataPayload:M,svgMarkup:k(`Seasonal Changes & Earth Cycles`,`Key Stage 1`,`Science`,5,`🍂`),astSource:o(M,`oak-data-seasonal-changes`,`Seasonal Changes & Earth Cycles`)},{id:`oak-data-re-sacraments`,title:`The Seven Sacraments & Holy Eucharist (Data Deck)`,stage:`Key Stage 2`,subject:`Religious Education (Catholic)`,oakId:`RE-KS2-SACR-01`,oakUnit:`The Holy Eucharist & Sacraments`,category:`Catholic Faith`,icon:`🍞`,desc:`Decentralized Oak & Diocesan question deck for Catholic Sacraments: Real Presence, Initiation, Healing, and Grace.`,dataPayload:N,svgMarkup:k(`The Seven Sacraments & Holy Eucharist`,`Key Stage 2`,`Religious Education`,6,`🍞`),astSource:o(N,`oak-data-re-sacraments`,`The Seven Sacraments & Holy Eucharist`)},{id:`oak-data-algorithms-sequencing`,title:`Algorithms, Sequencing & Logic (Data Deck)`,stage:`Key Stage 2`,subject:`Computing`,oakId:`COMP-KS2-ALGO-01`,oakUnit:`Algorithms and Sequencing`,category:`Computing`,icon:`💻`,desc:`Decentralized Oak curriculum question deck for KS2 Computing: step-by-step algorithms, debugging traps, loops, and conditionals.`,dataPayload:P,svgMarkup:k(`Algorithms, Sequencing & Logic`,`Key Stage 2`,`Computing`,5,`💻`),astSource:o(P,`oak-data-algorithms-sequencing`,`Algorithms, Sequencing & Logic`)},{id:`oak-data-phonics-screening`,title:`Phonics, Digraphs & Alien Words (Data Deck)`,stage:`Key Stage 1`,subject:`English`,oakId:`ENG-KS1-PHON-01`,oakUnit:`Phonics & Simple Sentences`,category:`English Literature & Phonics`,icon:`🔤`,desc:`Decentralized Oak curriculum question deck for KS1 Phonics: phoneme segmenting, digraphs, trigraphs, and alien pseudo-words.`,dataPayload:F,svgMarkup:k(`Phonics, Digraphs & Alien Words`,`Key Stage 1`,`English`,5,`🔤`),astSource:o(F,`oak-data-phonics-screening`,`Phonics, Digraphs & Alien Words`)},{id:`oak-data-electric-circuits`,title:`Electric Circuits & Conductors (Data Deck)`,stage:`Key Stage 2`,subject:`Science`,oakId:`SCI-KS2-CIRC-02`,oakUnit:`Circuits and Conductors`,category:`Science`,icon:`💡`,desc:`Decentralized Oak curriculum question deck for KS2 Electric Circuits: complete loops, conductors vs insulators, and series voltage.`,dataPayload:I,svgMarkup:k(`Electric Circuits & Conductors`,`Key Stage 2`,`Science`,5,`💡`),astSource:o(I,`oak-data-electric-circuits`,`Electric Circuits & Conductors`)},{id:`oak-data-angles-triangles`,title:`Angles, Triangles & Geometry (Data Deck)`,stage:`Key Stage 2`,subject:`Mathematics`,oakId:`MAT-KS2-GEOM-03`,oakUnit:`Angles and Triangles`,category:`Mathematics`,icon:`📐`,desc:`Decentralized Oak curriculum question deck for KS2 Angles: 180° triangle sum, acute/obtuse/reflex, and right angles.`,dataPayload:L,svgMarkup:k(`Angles, Triangles & Geometry`,`Key Stage 2`,`Mathematics`,5,`📐`),astSource:o(L,`oak-data-angles-triangles`,`Angles, Triangles & Geometry`)},{id:`oak-data-cell-biology`,title:`Cell Biology & Organelles (Data Deck)`,stage:`Key Stage 3`,subject:`Science`,oakId:`SCI-KS3-CELL-01`,oakUnit:`Cell Biology`,category:`Science`,icon:`🔬`,desc:`Decentralized Oak curriculum question deck for KS3 Cell Biology: plant vs animal cells, organelles, and microscope magnification.`,dataPayload:R,svgMarkup:k(`Cell Biology & Organelles`,`Key Stage 3`,`Science`,4,`🔬`),astSource:o(R,`oak-data-cell-biology`,`Cell Biology & Organelles`)},{id:`oak-data-re-nicene-creed`,title:`The Nicene Creed & Trinity (Data Deck)`,stage:`Key Stage 2`,subject:`Religious Education (Catholic)`,oakId:`RE-KS2-CREED-01`,oakUnit:`The Nicene Creed & Trinity`,category:`Catholic Faith`,icon:`📜`,desc:`Decentralized Oak & Diocesan question deck for Catholic Creed: Trinity, consubstantial nature, and four marks of the Church.`,dataPayload:z,svgMarkup:k(`The Nicene Creed & Trinity`,`Key Stage 2`,`Religious Education`,3,`📜`),astSource:o(z,`oak-data-re-nicene-creed`,`The Nicene Creed & Trinity`)},{id:`oak-data-spanish-foundations`,title:`Spanish Greetings & Verbs (Data Deck)`,stage:`Key Stage 2`,subject:`Spanish`,oakId:`MFL-KS2-SPAN-01`,oakUnit:`Spanish Greetings & Introductions`,category:`Modern & Classical Languages`,icon:`🇪🇸`,desc:`Decentralized Oak curriculum question deck for KS2/KS3 Spanish: greetings, pro-drop verbs, and conversational introductions.`,dataPayload:ne,svgMarkup:k(`Spanish Greetings & Verbs`,`Key Stage 2`,`Spanish`,3,`🇪🇸`),astSource:o(ne,`oak-data-spanish-foundations`,`Spanish Greetings & Verbs`)}],B={pythagoras:{svg:`<svg viewBox="0 0 800 480" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
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
)`},"church-tour":{svg:`<svg viewBox="0 0 800 480" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="3.5" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
    <linearGradient id="gold-grad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="50%" stop-color="#eab308" />
      <stop offset="100%" stop-color="#a16207" />
    </linearGradient>
    <linearGradient id="rose-grad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#38bdf8" />
      <stop offset="50%" stop-color="#818cf8" />
      <stop offset="100%" stop-color="#c084fc" />
    </linearGradient>
    <radialGradient id="sanctuary-glow" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="rgba(250, 204, 21, 0.22)" />
      <stop offset="60%" stop-color="rgba(15, 23, 42, 0.08)" />
      <stop offset="100%" stop-color="transparent" />
    </radialGradient>
  </defs>

  <!-- Deep Sacred Interior Atmosphere Backdrop -->
  <rect x="0" y="0" width="800" height="480" fill="#0a0f1d" />
  <circle cx="400" cy="200" r="340" fill="url(#sanctuary-glow)" />

  <!-- 1. Deep Sacred Basilica Floor Architecture (Luminous Limestone Stone & Blue Drafting Contour) -->
  <path d="M 310 440 L 310 240 L 160 240 L 160 160 L 310 160 L 310 50 Q 400 30, 490 50 L 490 160 L 640 160 L 640 240 L 490 240 L 490 440 Z" fill="#111827" stroke="#38bdf8" stroke-width="3" filter="url(#glow)" />
  <path d="M 310 390 L 490 390 M 310 340 L 490 340 M 310 290 L 490 290 M 310 240 L 490 240" stroke="#334155" stroke-width="1.5" stroke-dasharray="3 4" />

  <!-- 2. Nave Central Royal Carpet & Pews (Vibrant Crimson with Gold Boundary Ribbons) -->
  <g class="ast-hotspot" data-target-t="0.20" data-label="2. The Nave &amp; Central Aisle" data-pedagogical="church-nave" style="cursor: pointer;">
    <rect x="375" y="180" width="50" height="260" fill="#991b1b" stroke="#f59e0b" stroke-width="1.5" rx="3" />
    <line x1="375" y1="180" x2="375" y2="440" stroke="#fbbf24" stroke-width="2" />
    <line x1="425" y1="180" x2="425" y2="440" stroke="#fbbf24" stroke-width="2" />
    <!-- 10 Detailed Wooden Pews with Warm Timber Grain -->
    <rect x="320" y="250" width="46" height="18" rx="3" fill="#78350f" stroke="#b45309" stroke-width="1.5" />
    <line x1="324" y1="254" x2="362" y2="254" stroke="#fde68a" stroke-width="1" />
    <rect x="434" y="250" width="46" height="18" rx="3" fill="#78350f" stroke="#b45309" stroke-width="1.5" />
    <line x1="438" y1="254" x2="476" y2="254" stroke="#fde68a" stroke-width="1" />

    <rect x="320" y="286" width="46" height="18" rx="3" fill="#78350f" stroke="#b45309" stroke-width="1.5" />
    <line x1="324" y1="290" x2="362" y2="290" stroke="#fde68a" stroke-width="1" />
    <rect x="434" y="286" width="46" height="18" rx="3" fill="#78350f" stroke="#b45309" stroke-width="1.5" />
    <line x1="438" y1="290" x2="476" y2="290" stroke="#fde68a" stroke-width="1" />

    <rect x="320" y="322" width="46" height="18" rx="3" fill="#78350f" stroke="#b45309" stroke-width="1.5" />
    <line x1="324" y1="326" x2="362" y2="326" stroke="#fde68a" stroke-width="1" />
    <rect x="434" y="322" width="46" height="18" rx="3" fill="#78350f" stroke="#b45309" stroke-width="1.5" />
    <line x1="438" y1="326" x2="476" y2="326" stroke="#fde68a" stroke-width="1" />

    <rect x="320" y="358" width="46" height="18" rx="3" fill="#78350f" stroke="#b45309" stroke-width="1.5" />
    <line x1="324" y1="362" x2="362" y2="362" stroke="#fde68a" stroke-width="1" />
    <rect x="434" y="358" width="46" height="18" rx="3" fill="#78350f" stroke="#b45309" stroke-width="1.5" />
    <line x1="438" y1="362" x2="476" y2="362" stroke="#fde68a" stroke-width="1" />

    <rect x="320" y="394" width="46" height="18" rx="3" fill="#78350f" stroke="#b45309" stroke-width="1.5" />
    <line x1="324" y1="398" x2="362" y2="398" stroke="#fde68a" stroke-width="1" />
    <rect x="434" y="394" width="46" height="18" rx="3" fill="#78350f" stroke="#b45309" stroke-width="1.5" />
    <line x1="438" y1="398" x2="476" y2="398" stroke="#fde68a" stroke-width="1" />
  </g>

  <!-- 3. Elevated Sanctuary Platform &amp; Altar of Sacrifice -->
  <path d="M 310 180 L 490 180 L 490 60 Q 400 45, 310 60 Z" fill="#1e293b" stroke="#475569" stroke-width="2" />
  <path d="M 325 170 L 475 170 L 475 70 Q 400 58, 325 70 Z" fill="#0f172a" stroke="#64748b" stroke-width="1.5" />
  <g class="ast-hotspot" data-target-t="0.60" data-label="4. The Altar of Sacrifice" data-pedagogical="church-altar" style="cursor: pointer;">
    <rect x="360" y="115" width="80" height="34" rx="4" fill="#e2e8f0" stroke="#f8fafc" stroke-width="2" />
    <rect x="366" y="119" width="68" height="26" rx="2" fill="#cbd5e1" />
    <circle cx="372" cy="128" r="3.5" fill="#facc15" filter="url(#glow)" />
    <circle cx="428" cy="128" r="3.5" fill="#facc15" filter="url(#glow)" />
    <line x1="400" y1="110" x2="400" y2="124" stroke="#eab308" stroke-width="2.5" />
    <line x1="394" y1="115" x2="406" y2="115" stroke="#eab308" stroke-width="2" />
    <text x="400" y="138" fill="#0f172a" font-size="9" font-weight="900" text-anchor="middle">ALTAR</text>
  </g>

  <!-- 4. Tabernacle of the Blessed Sacrament &amp; Red Sanctuary Lamp -->
  <g class="ast-hotspot" data-target-t="0.80" data-label="5. The Tabernacle &amp; Sanctuary Lamp" data-pedagogical="church-tabernacle" style="cursor: pointer;">
    <rect x="382" y="58" width="36" height="28" rx="3" fill="#eab308" stroke="#fef08a" stroke-width="2" filter="url(#glow)" />
    <line x1="400" y1="62" x2="400" y2="76" stroke="#78350f" stroke-width="2" />
    <line x1="392" y1="68" x2="408" y2="68" stroke="#78350f" stroke-width="1.5" />
    <text x="400" y="82" fill="#78350f" font-size="7" font-weight="900" text-anchor="middle">IHS</text>
    <circle id="church-lamp" cx="432" cy="72" r="7.5" fill="#ef4444" filter="url(#glow)" data-pedagogical="church-lamp" />
    <circle cx="432" cy="72" r="4" fill="#fee2e2" />
    <line x1="432" y1="52" x2="432" y2="66" stroke="#94a3b8" stroke-width="1" />
  </g>

  <!-- 5. Ambo (Table of the Word) -->
  <g class="ast-hotspot" data-target-t="0.40" data-label="3. The Ambo (Lectern)" data-pedagogical="church-ambo" style="cursor: pointer;">
    <rect x="330" y="125" width="22" height="24" rx="2" fill="#2563eb" stroke="#60a5fa" stroke-width="1.5" />
    <path d="M 333 130 L 341 127 L 349 130" stroke="#ffffff" stroke-width="1.5" fill="none" />
    <text x="341" y="145" fill="#ffffff" font-size="7" font-weight="800" text-anchor="middle">AMBO</text>
  </g>

  <!-- 6. Lady Chapel Devotional Shrine (North Transept) -->
  <g class="ast-hotspot" data-target-t="0.94" data-label="6A. Lady Chapel" data-pedagogical="church-lady-chapel" style="cursor: pointer;">
    <rect x="175" y="175" width="120" height="50" rx="4" fill="#172554" stroke="#2563eb" stroke-width="1.5" />
    <circle cx="205" cy="200" r="10" fill="#38bdf8" filter="url(#glow)" />
    <text x="205" y="204" fill="#ffffff" font-size="11" font-weight="bold" text-anchor="middle">★</text>
    <text x="245" y="196" fill="#93c5fd" font-size="9" font-weight="bold">LADY CHAPEL</text>
    <text x="245" y="208" fill="#bfdbfe" font-size="8">Devotional Prayer</text>
  </g>

  <!-- 7. Baptismal Font (South Transept) -->
  <g class="ast-hotspot" data-target-t="1.00" data-label="6B. Baptismal Font" data-pedagogical="church-font" style="cursor: pointer;">
    <rect x="505" y="175" width="120" height="50" rx="4" fill="#14532d" stroke="#16a34a" stroke-width="1.5" />
    <polygon points="535,190 545,190 552,197 552,205 545,212 535,212 528,205 528,197" fill="#0284c7" stroke="#38bdf8" stroke-width="2" filter="url(#glow)" />
    <circle cx="540" cy="201" r="4" fill="#e0f2fe" />
    <text x="562" y="196" fill="#86efac" font-size="9" font-weight="bold">BAPTISMAL FONT</text>
    <text x="562" y="208" fill="#bbf7d0" font-size="8">Sacrament of Initiation</text>
  </g>

  <!-- 8. Narthex &amp; Holy Water Stoup (Entrance) -->
  <g class="ast-hotspot" data-target-t="0.00" data-label="1. Narthex &amp; Holy Water Stoup" data-pedagogical="church-narthex" style="cursor: pointer;">
    <rect x="310" y="415" width="180" height="30" rx="3" fill="#1e293b" stroke="#475569" stroke-width="1.5" />
    <circle cx="330" cy="430" r="6" fill="#0284c7" stroke="#38bdf8" stroke-width="1.5" />
    <circle cx="470" cy="430" r="6" fill="#0284c7" stroke="#38bdf8" stroke-width="1.5" />
    <text x="400" y="434" fill="#cbd5e1" font-size="10" font-weight="bold" text-anchor="middle">NARTHEX • ENTRANCE</text>
  </g>

  <!-- 9. Moving Pilgrim Spotlight &amp; Avatar -->
  <g id="spot-avatar" data-pedagogical="church-pilgrim" style="cursor: grab;">
    <circle id="spot-halo" cx="400" cy="430" r="38" fill="rgba(56, 189, 248, 0.14)" stroke="#38bdf8" stroke-width="2" stroke-dasharray="4 3" filter="url(#glow)" />
    <circle id="spot-dot" cx="400" cy="430" r="8" fill="#38bdf8" filter="url(#glow)" />
    <circle id="spot-core" cx="400" cy="430" r="4" fill="#ffffff" />
  </g>

  <!-- 10. Architectural Sacred Space HUD Banner -->
  <rect x="110" y="12" width="580" height="42" rx="8" fill="#090d16" stroke="#38bdf8" stroke-width="1.5" />
  <text id="church-hud-title" x="130" y="29" fill="#38bdf8" font-size="12" font-weight="800">1. NARTHEX &amp; HOLY WATER STOUP</text>
  <text id="church-hud-desc" x="130" y="44" fill="#94a3b8" font-size="10">Vestibulum &amp; Aqua Benedicta • Blessing ourselves with Holy Water...</text>
  <circle cx="664" cy="33" r="11" fill="#2563eb" />
  <text x="664" y="37" fill="#ffffff" font-size="11" font-weight="900" text-anchor="middle">⛪</text>
</svg>
`,ast:`(:scene :id "church-tour" :type "Slide" :oak-id "OAK-KS2-RE-001" :oak-unit "ks2-re-catholic-sacred-architecture" :title "Tour of a Catholic Church: Sacred Architecture & Sacred Spaces" :stage "CATHOLIC LIFE" :duration 16.0
  (:vars (
    (:var :name "candleGlow" :val 1.0 :min 0.2 :max 1.5 :step 0.1 :label "Sanctuary Lamp Flame")
    (:var :name "pilgrimSpeed" :val 1.0 :min 0.5 :max 2.0 :step 0.25 :label "Tour Progression Pace")
  ))
  (:inputs (
    (:slider :var "candleGlow" :label "Sanctuary Lamp Flame" :min 0.2 :max 1.5 :step 0.1)
    (:slider :var "pilgrimSpeed" :label "Pilgrim Walk Pace" :min 0.5 :max 2.0 :step 0.25)
  ))
  (:gestures (
    (:draggable :target "#spot-dot" :axis "xy" :min 80 :max 440)
  ))
  (:subtitles (
    (:start 0.00 :end 0.20 :en "We enter through the Narthex, blessing ourselves with Holy Water in the Name of the Father, Son, and Holy Spirit." :es "Entramos por el Nártex, bendiciéndonos con Agua Bendita en el Nombre del Padre, del Hijo y del Espíritu Santo." :la "In nomine Patris, et Filii, et Spiritus Sancti. Aqua benedicta ad memoriam baptismi.")
    (:start 0.20 :end 0.40 :en "Walking up the central aisle of the Nave, we genuflect on our right knee toward the Tabernacle before entering our pew." :es "Por el pasillo de la Nave, hacemos una genuflexión con la rodilla derecha hacia el Sagrario antes de sentarnos." :la "Ad Tabernaculum flectamus genua, Christum Dominum verum Deum adorantes.")
    (:start 0.40 :end 0.60 :en "The Ambo is the Table of the Word, where the Holy Gospel and readings of Sacred Scripture are proclaimed." :es "El Ambón es la Mesa de la Palabra, donde se proclaman las lecturas de la Sagrada Escritura y el Evangelio." :la "Ambo est mensa Verbi Dei, unde Sanctum Evangelium fidelibus annuntiatur.")
    (:start 0.60 :end 0.80 :en "The Altar is the sacred center representing Christ Himself, where the bread and wine become His Body and Blood." :es "El Altar es el centro sagrado que representa a Cristo, donde el pan y el vino se convierten en Su Cuerpo y Sangre." :la "Altare est Christus: hic sacrificium eucharisticum in remissionem peccatorum offertur.")
    (:start 0.80 :end 0.92 :en "The golden Tabernacle holds the Real Presence of Christ in the Eucharist, watched over by the burning red Sanctuary Lamp." :es "El Sagrario dorado guarda la Presencia Real de Jesús en la Eucaristía, acompañado por la lámpara roja del Santuario." :la "In Tabernaculo Christus vere et substantialiter praesens permanet.")
    (:start 0.92 :end 1.00 :en "We visit the Lady Chapel for quiet prayer with Our Lady, and contemplate the Baptismal Font where eternal life begins." :es "Visitamos la Capilla de la Virgen para la oración, y contemplamos la Pila Bautismal donde comienza la vida eterna." :la "Fons baptismatis et sacellum beatae Mariae Virginis.")
  ))
  (:keyframes (
    (:t 0.00 :title "1. Narthex & Holy Water Stoup" :rule "Vestibulum: We bless ourselves with Holy Water to recall our Baptism.")
    (:t 0.20 :title "2. Nave & Central Aisle" :rule "Navis: The Pilgrim People of God; we genuflect towards the Tabernacle before entering our pew.")
    (:t 0.40 :title "3. Ambo (Lectern)" :rule "Mensa Verbi: The Table of the Word from which the Holy Gospel is proclaimed.")
    (:t 0.60 :title "4. High Altar of Sacrifice" :rule "Altare Christi: Represents Christ Himself and the Holy Sacrifice of the Mass.")
    (:t 0.80 :title "5. Tabernacle & Sanctuary Lamp" :rule "Tabernaculum: Houses the Blessed Sacrament; red lamp indicates Christ's Real Presence.")
    (:t 0.92 :title "6. Lady Chapel & Baptismal Font" :rule "Fons & Sacellum: Devotional side chapel of Our Lady and the waters of new birth.")
  ))
  (:interactive (
    (:checkpoint :t 0.20
      :prompt "Why do Catholics genuflect on the right knee toward the Tabernacle when entering the Nave?"
      :options ("To adore Jesus Christ truly and substantially present in the Blessed Sacrament" "As a greeting to the choir in the loft" "To test the church kneeler alignment" "To stretch before long liturgies")
      :answer 0
      :explanation "Genuflecting on our right knee is a sacred act of adoration directed specifically to Jesus Christ physically and divinely present in the consecrated Eucharist within the Tabernacle.")
    (:checkpoint :t 0.60
      :prompt "What does the High Altar represent in Catholic sacred architecture?"
      :options ("Christ Himself, the living stone and center of the Eucharistic Sacrifice" "A podium for secular parish announcements" "A storage table exclusively for liturgical books" "A commemorative plaque to ancient benefactors")
      :answer 0
      :explanation "The altar represents Christ Himself, who is Priest, Altar, and Lamb of Sacrifice. The General Instruction of the Roman Missal emphasizes that the altar is the center of the thanksgiving accomplished through the Eucharist.")
    (:checkpoint :t 0.81
      :prompt "Why does a red Sanctuary Lamp burn day and night beside the Catholic Tabernacle?"
      :options ("To signify the Real Presence of Jesus Christ in the Blessed Sacrament" "To provide night illumination for the sacristan" "To mark where incense is stored" "As an architectural fire exit indicator")
      :answer 0
      :explanation "Canon Law specifies that a special lamp or candle must shine continuously beside the Tabernacle to honor and signify the Eucharistic Real Presence of Christ.")
  ))
  (:bindings (
    (:target "#church-lamp" :attr "opacity" :expr "(0.70 + Math.sin(t * Math.PI * 8) * 0.30) * (vars.candleGlow || 1.0)")
    (:target "#spot-dot" :attr "cx" :expr "t < 0.20 ? 400 : (t < 0.40 ? 400 : (t < 0.60 ? 400 - ((t - 0.40)/0.20)*59 : (t < 0.80 ? 341 + ((t - 0.60)/0.20)*59 : (t < 0.92 ? 400 : 400 - Math.cos(((t - 0.92)/0.08)*Math.PI)*180))))")
    (:target "#spot-dot" :attr "cy" :expr "t < 0.20 ? 435 - (t/0.20)*35 : (t < 0.40 ? 400 - ((t - 0.20)/0.20)*120 : (t < 0.60 ? 280 - ((t - 0.40)/0.20)*140 : (t < 0.80 ? 140 - ((t - 0.60)/0.20)*12 : (t < 0.92 ? 128 - ((t - 0.80)/0.12)*56 : 190))))")
    (:target "#spot-halo" :attr "cx" :expr "t < 0.20 ? 400 : (t < 0.40 ? 400 : (t < 0.60 ? 400 - ((t - 0.40)/0.20)*59 : (t < 0.80 ? 341 + ((t - 0.60)/0.20)*59 : (t < 0.92 ? 400 : 400 - Math.cos(((t - 0.92)/0.08)*Math.PI)*180))))")
    (:target "#spot-halo" :attr "cy" :expr "t < 0.20 ? 435 - (t/0.20)*35 : (t < 0.40 ? 400 - ((t - 0.20)/0.20)*120 : (t < 0.60 ? 280 - ((t - 0.40)/0.20)*140 : (t < 0.80 ? 140 - ((t - 0.60)/0.20)*12 : (t < 0.92 ? 128 - ((t - 0.80)/0.12)*56 : 190))))")
    (:target "#spot-core" :attr "cx" :expr "t < 0.20 ? 400 : (t < 0.40 ? 400 : (t < 0.60 ? 400 - ((t - 0.40)/0.20)*59 : (t < 0.80 ? 341 + ((t - 0.60)/0.20)*59 : (t < 0.92 ? 400 : 400 - Math.cos(((t - 0.92)/0.08)*Math.PI)*180))))")
    (:target "#spot-core" :attr "cy" :expr "t < 0.20 ? 435 - (t/0.20)*35 : (t < 0.40 ? 400 - ((t - 0.20)/0.20)*120 : (t < 0.60 ? 280 - ((t - 0.40)/0.20)*140 : (t < 0.80 ? 140 - ((t - 0.60)/0.20)*12 : (t < 0.92 ? 128 - ((t - 0.80)/0.12)*56 : 190))))")
    (:target "#church-hud-title" :attr "textContent" :expr "t < 0.20 ? '1. NARTHEX & HOLY WATER STOUP' : (t < 0.40 ? '2. THE NAVE & PEWS' : (t < 0.60 ? '3. THE AMBO (LECTERN)' : (t < 0.80 ? '4. THE HIGH ALTAR OF SACRIFICE' : (t < 0.92 ? '5. THE TABERNACLE & SANCTUARY LAMP' : '6. LADY CHAPEL & BAPTISMAL FONT'))))")
    (:target "#church-hud-desc" :attr "textContent" :expr "t < 0.20 ? 'Vestibulum & Aqua Benedicta • Blessing ourselves with Holy Water...' : (t < 0.40 ? 'Navis Ecclesiae • The Pilgrim People of God genuflect to Tabernacle...' : (t < 0.60 ? 'Mensa Verbi Dei • Proclaiming Sacred Scriptures & Holy Gospel...' : (t < 0.80 ? 'Altare Christi • Holy Sacrifice of the Mass & Eucharist...' : (t < 0.92 ? 'Tabernaculum Domini • Real Presence watched by burning red lamp...' : 'Sacellum Marianum & Fons • Devotional prayer & new birth...'))))")
  ))
)
`},"catholic-rites":{svg:`<svg viewBox="0 0 800 480" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Sacred Ambience & Gradients -->
    <radialGradient id="communion-sky" cx="50%" cy="35%" r="70%">
      <stop offset="0%" stop-color="#1e1b4b" />
      <stop offset="45%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#020617" />
    </radialGradient>

    <radialGradient id="gold-halo-grad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="rgba(250, 204, 21, 0.95)" />
      <stop offset="60%" stop-color="rgba(217, 119, 6, 0.5)" />
      <stop offset="100%" stop-color="rgba(180, 83, 9, 0)" />
    </radialGradient>

    <linearGradient id="gold-cross-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a" />
      <stop offset="40%" stop-color="#eab308" />
      <stop offset="100%" stop-color="#ca8a04" />
    </linearGradient>

    <linearGradient id="byzantine-mosaic-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#3b82f6" />
      <stop offset="50%" stop-color="#1d4ed8" />
      <stop offset="100%" stop-color="#1e3a8a" />
    </linearGradient>

    <linearGradient id="alexandrian-coptic-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#059669" />
      <stop offset="60%" stop-color="#047857" />
      <stop offset="100%" stop-color="#064e3b" />
    </linearGradient>

    <linearGradient id="antioch-cedar-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#dc2626" />
      <stop offset="60%" stop-color="#b91c1c" />
      <stop offset="100%" stop-color="#7f1d1d" />
    </linearGradient>

    <linearGradient id="chaldean-lotus-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#7c3aed" />
      <stop offset="60%" stop-color="#6d28d9" />
      <stop offset="100%" stop-color="#4c1d95" />
    </linearGradient>

    <linearGradient id="armenian-stone-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ea580c" />
      <stop offset="60%" stop-color="#c2410c" />
      <stop offset="100%" stop-color="#7c2d12" />
    </linearGradient>

    <linearGradient id="pedestal-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#334155" />
      <stop offset="50%" stop-color="#475569" />
      <stop offset="100%" stop-color="#1e293b" />
    </linearGradient>

    <filter id="soft-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="4" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>

    <!-- Clip path to keep scrolling pavilions within stage bounds -->
    <clipPath id="stage-viewport-clip">
      <rect x="0" y="55" width="800" height="345" />
    </clipPath>
  </defs>

  <!-- Background Canvas -->
  <rect width="800" height="480" fill="url(#communion-sky)" />

  <!-- Architectural Background: Roman Basilica Arches & Byzantine Domes -->
  <g opacity="0.22">
    <path d="M 40,400 L 40,220 C 40,160 180,160 180,220 L 180,400 Z" fill="none" stroke="#64748b" stroke-width="2.5" />
    <path d="M 60,400 L 60,230 C 60,180 160,180 160,230 L 160,400 Z" fill="none" stroke="#475569" stroke-width="1.5" />
    <path d="M 620,400 L 620,240 C 620,180 670,140 700,90 C 730,140 780,180 780,240 L 780,400 Z" fill="none" stroke="#ca8a04" stroke-width="2" />
    <line x1="700" y1="90" x2="700" y2="55" stroke="#facc15" stroke-width="2.5" />
    <line x1="690" y1="70" x2="710" y2="70" stroke="#facc15" stroke-width="2.5" />
  </g>

  <!-- TOP SHOWCASE MARQUEE: Active Liturgical Tradition Display -->
  <g id="rite-showcase-panel" transform="translate(400, 26)">
    <rect x="-310" y="-16" width="620" height="36" rx="18" fill="rgba(15, 23, 42, 0.92)" stroke="#334155" stroke-width="1.5" filter="url(#soft-glow)" />
    <!-- Active Rite Title -->
    <text id="active-rite-title" x="0" y="0" text-anchor="middle" fill="#facc15" font-size="12" font-weight="900" font-family="sans-serif">
      1. Western Latin Rite (Roman, Ambrosian, Mozarabic)
    </text>
    <!-- Active Rite Subtitle / Heartland -->
    <text id="active-rite-desc" x="0" y="13" text-anchor="middle" fill="#cbd5e1" font-size="9" font-family="sans-serif">
      1 Western Church (&gt;1.3B) &bull; Unleavened Host (Hostia Pura) &bull; Statues &amp; Gregorian Chant
    </text>
  </g>

  <!-- CENTER: The Holy See Cathedra & Communion Beacon (Unity with Peter) -->
  <g id="communion-beacon-group" transform="translate(400, 92)">
    <!-- Expanding Halo Pulse -->
    <circle id="beacon-halo" cx="0" cy="0" r="30" fill="url(#gold-halo-grad)" opacity="0.8" filter="url(#soft-glow)" />
    <circle id="beacon-pulse" cx="0" cy="0" r="48" fill="none" stroke="#facc15" stroke-width="1.2" opacity="0.5" />

    <!-- Communion Ray straight down to the center-stage shrine -->
    <line id="beacon-ray-down" x1="0" y1="18" x2="0" y2="90" stroke="#facc15" stroke-width="2" stroke-dasharray="3 3" opacity="0.85" />

    <!-- Keys of Saint Peter (Decussate) -->
    <g id="communion-beacon-core" cursor="grab" filter="url(#soft-glow)">
      <!-- Golden Key -->
      <path d="M -12,-12 L 12,12 M 9,9 L 14,4 M 6,12 L 11,7" stroke="#facc15" stroke-width="2.5" stroke-linecap="round" />
      <circle cx="-14" cy="-14" r="4.5" fill="none" stroke="#facc15" stroke-width="2.5" />

      <!-- Silver Key -->
      <path d="M 12,-12 L -12,12 M -9,9 L -14,4 M -6,12 L -11,7" stroke="#e2e8f0" stroke-width="2.5" stroke-linecap="round" />
      <circle cx="14" cy="-14" r="4.5" fill="none" stroke="#e2e8f0" stroke-width="2.5" />

      <!-- Papal Tiara / Mitre Accent -->
      <path d="M -9,-20 Q 0,-28 9,-20 L 6,-14 Q 0,-17 -6,-14 Z" fill="#eab308" stroke="#ca8a04" stroke-width="1" />
    </g>

    <text x="0" y="26" text-anchor="middle" fill="#fef08a" font-size="9" font-weight="bold" font-family="sans-serif">
      CATHEDRA PETRI &bull; 24 CHURCHES IN COMMUNION
    </text>
  </g>

  <!-- ===================================================================== -->
  <!-- HORIZONTAL SCROLLING PANORAMA: 6 Dedicated Liturgical Pavilions       -->
  <!-- Translates along X (-0, -800, -1600, -2400, -3200, -4000)             -->
  <!-- ===================================================================== -->
  <g id="panoramic-rites-viewport" clip-path="url(#stage-viewport-clip)">
    <g id="panoramic-rites-strip" transform="translate(0, 0)">

      <!-- ================================================================= -->
      <!-- STATION 1: Western Latin Rite (Centered at X = 400)               -->
      <!-- ================================================================= -->
      <g id="shrine-station-1" transform="translate(400, 255)">
        <!-- Basilica Arch Architecture -->
        <path d="M -170,120 L -170,-20 C -170,-80 170,-80 170,-20 L 170,120 Z" fill="rgba(30, 41, 59, 0.45)" stroke="#3b82f6" stroke-width="2" />
        <path d="M -150,120 L -150,-15 C -150,-65 150,-65 150,-15 L 150,120 Z" fill="none" stroke="#1d4ed8" stroke-width="1" stroke-dasharray="4 4" />

        <!-- Altar Stone Table -->
        <rect x="-140" y="32" width="280" height="85" rx="8" fill="url(#pedestal-grad)" stroke="#475569" stroke-width="2" />
        <rect x="-130" y="36" width="260" height="7" fill="#e2e8f0" />

        <!-- Golden Roman Chalice -->
        <path d="M -36,32 Q -36,-4 -18,-4 Q 0,-4 0,32 Z" fill="url(#gold-cross-grad)" stroke="#ca8a04" stroke-width="1.5" />
        <rect x="-21" y="18" width="6" height="14" fill="#ca8a04" />
        <ellipse cx="-18" cy="32" rx="14" ry="4" fill="#a16207" />

        <!-- Pure White Unleavened Host (Hostia Pura) with IHS -->
        <circle cx="22" cy="10" r="22" fill="#ffffff" stroke="#cbd5e1" stroke-width="2" filter="url(#soft-glow)" />
        <text x="22" y="15" text-anchor="middle" fill="#b45309" font-size="12" font-weight="900" font-family="serif">IHS</text>
        <circle cx="22" cy="10" r="20" fill="none" stroke="#f1f5f9" stroke-width="1" stroke-dasharray="2 2" />

        <!-- Tradition Info Header -->
        <text x="0" y="66" text-anchor="middle" fill="#93c5fd" font-size="13" font-weight="900" font-family="sans-serif">
          1. WESTERN LATIN TRADITION
        </text>
        <text x="0" y="82" text-anchor="middle" fill="#f8fafc" font-size="10" font-weight="700" font-family="sans-serif">
          Roman, Ambrosian (Milan) &amp; Mozarabic (Toledo) Rites
        </text>
        <text x="0" y="98" text-anchor="middle" fill="#cbd5e1" font-size="8.5" font-family="sans-serif">
          Unleavened Bread &bull; Gregorian Chant &bull; Statues &bull; 1.3 Billion Catholics
        </text>
      </g>

      <!-- ================================================================= -->
      <!-- STATION 2: Byzantine Tradition (Centered at X = 1200)             -->
      <!-- ================================================================= -->
      <g id="shrine-station-2" transform="translate(1200, 255)">
        <!-- Byzantine Onion Dome Arch -->
        <path d="M -170,120 L -170,0 C -170,-45 -90,-85 0,-105 C 90,-85 170,-45 170,0 L 170,120 Z" fill="rgba(30, 41, 59, 0.45)" stroke="#f59e0b" stroke-width="2" />
        <circle cx="0" cy="-105" r="5" fill="#facc15" />
        <line x1="0" y1="-105" x2="0" y2="-120" stroke="#facc15" stroke-width="2" />
        <line x1="-6" y1="-113" x2="6" y2="-113" stroke="#facc15" stroke-width="2" />

        <!-- Iconostasis Base Pedestal -->
        <rect x="-140" y="32" width="280" height="85" rx="8" fill="url(#pedestal-grad)" stroke="#b45309" stroke-width="2" />
        <rect x="-130" y="36" width="260" height="7" fill="#ca8a04" />

        <!-- Holy Icon of Christ Pantocrator -->
        <rect id="icon-gold-glow" x="-50" y="-8" width="42" height="50" rx="4" fill="#ca8a04" opacity="0.95" filter="url(#soft-glow)" />
        <rect x="-47" y="-5" width="36" height="44" rx="3" fill="url(#byzantine-mosaic-grad)" stroke="#facc15" stroke-width="1.5" />
        <circle cx="-29" cy="12" r="12" fill="#facc15" opacity="0.85" />
        <path d="M -34,12 C -34,4 -24,4 -24,12 C -24,18 -34,18 -34,12 Z" fill="#991b1b" />
        <text x="-29" y="3" text-anchor="middle" fill="#fef08a" font-size="7" font-weight="bold">IC XC</text>

        <!-- Leavened Prosphora Bread with Seal -->
        <circle cx="28" cy="12" r="23" fill="#fed7aa" stroke="#d97706" stroke-width="2" filter="url(#soft-glow)" />
        <rect x="16" y="0" width="24" height="24" fill="#ffedd5" stroke="#b45309" stroke-width="1" />
        <text x="28" y="10" text-anchor="middle" fill="#9a3412" font-size="7.5" font-weight="bold">IC XC</text>
        <text x="28" y="20" text-anchor="middle" fill="#9a3412" font-size="7.5" font-weight="bold">NI KA</text>

        <!-- Tradition Info Header -->
        <text x="0" y="66" text-anchor="middle" fill="#facc15" font-size="13" font-weight="900" font-family="sans-serif">
          2. BYZANTINE TRADITION
        </text>
        <text x="0" y="82" text-anchor="middle" fill="#fef08a" font-size="10" font-weight="700" font-family="sans-serif">
          14 Autonomous Eastern Catholic Churches
        </text>
        <text x="0" y="98" text-anchor="middle" fill="#cbd5e1" font-size="8.5" font-family="sans-serif">
          Sacred Icons &bull; Leavened Prosphora &bull; Liturgy of St. John Chrysostom
        </text>
      </g>

      <!-- ================================================================= -->
      <!-- STATION 3: Alexandrian Tradition (Centered at X = 2000)           -->
      <!-- ================================================================= -->
      <g id="shrine-station-3" transform="translate(2000, 255)">
        <!-- Coptic Triple Arch Architecture -->
        <path d="M -170,120 L -170,-10 C -170,-60 -50,-80 0,-80 C 50,-80 170,-60 170,-10 L 170,120 Z" fill="rgba(6, 78, 59, 0.45)" stroke="#10b981" stroke-width="2" />
        
        <!-- Altar Base Pedestal -->
        <rect x="-140" y="32" width="280" height="85" rx="8" fill="url(#pedestal-grad)" stroke="#047857" stroke-width="2" />
        <rect x="-130" y="36" width="260" height="7" fill="#10b981" />

        <!-- Coptic Cross with Radiant Sunburst Loop -->
        <g transform="translate(-25, 12)" filter="url(#soft-glow)">
          <circle cx="0" cy="-12" r="11" fill="none" stroke="#facc15" stroke-width="2.5" />
          <line x1="0" y1="-1" x2="0" y2="18" stroke="#facc15" stroke-width="3" />
          <line x1="-12" y1="6" x2="12" y2="6" stroke="#facc15" stroke-width="2.5" />
          <!-- Ray Flares -->
          <circle cx="-12" cy="6" r="2.5" fill="#facc15" />
          <circle cx="12" cy="6" r="2.5" fill="#facc15" />
          <circle cx="0" cy="18" r="2.5" fill="#facc15" />
        </g>

        <!-- Swinging Ethiopian Thurible with Bells -->
        <g transform="translate(30, 8)" filter="url(#soft-glow)">
          <path d="M -12,20 C -12,8 12,8 12,20 Z" fill="#ca8a04" stroke="#facc15" stroke-width="1.5" />
          <line x1="-10" y1="8" x2="0" y2="-12" stroke="#eab308" stroke-width="1.2" />
          <line x1="10" y1="8" x2="0" y2="-12" stroke="#eab308" stroke-width="1.2" />
          <line x1="0" y1="8" x2="0" y2="-12" stroke="#eab308" stroke-width="1.2" />
          <circle cx="0" cy="-12" r="3" fill="#facc15" />
          <!-- Fragrant Incense Clouds -->
          <circle cx="-6" cy="-18" r="4" fill="#e2e8f0" opacity="0.6" />
          <circle cx="4" cy="-24" r="5" fill="#e2e8f0" opacity="0.5" />
        </g>

        <!-- Tradition Info Header -->
        <text x="0" y="66" text-anchor="middle" fill="#6ee7b7" font-size="13" font-weight="900" font-family="sans-serif">
          3. ALEXANDRIAN TRADITION
        </text>
        <text x="0" y="82" text-anchor="middle" fill="#a7f3d0" font-size="10" font-weight="700" font-family="sans-serif">
          Coptic (Egypt), Ethiopian &amp; Eritrean Catholic Churches
        </text>
        <text x="0" y="98" text-anchor="middle" fill="#cbd5e1" font-size="8.5" font-family="sans-serif">
          Ge'ez &amp; Coptic Chant &bull; Liturgy of St. Mark &bull; Desert Monasticism
        </text>
      </g>

      <!-- ================================================================= -->
      <!-- STATION 4: Antiochian Tradition (Centered at X = 2800)            -->
      <!-- ================================================================= -->
      <g id="shrine-station-4" transform="translate(2800, 255)">
        <!-- Cedar of Lebanon Arch Profile -->
        <path d="M -170,120 L -170,-15 C -170,-70 170,-70 170,-15 L 170,120 Z" fill="rgba(127, 29, 29, 0.45)" stroke="#ef4444" stroke-width="2" />
        
        <!-- Altar Base Pedestal -->
        <rect x="-140" y="32" width="280" height="85" rx="8" fill="url(#pedestal-grad)" stroke="#991b1b" stroke-width="2" />
        <rect x="-130" y="36" width="260" height="7" fill="#ef4444" />

        <!-- Maronite Cedar of Lebanon Altar Cross -->
        <g transform="translate(-30, 10)" filter="url(#soft-glow)">
          <!-- Cedar Tree Silhouette behind cross -->
          <path d="M 0,-18 L -14,-4 L -4,-4 L -18,8 L 18,8 L 4,-4 L 14,-4 Z" fill="#047857" opacity="0.8" />
          <rect x="-2" y="8" width="4" height="6" fill="#78350f" />
          <!-- Golden Cross -->
          <line x1="0" y1="-20" x2="0" y2="16" stroke="#facc15" stroke-width="3" stroke-linecap="round" />
          <line x1="-12" y1="-8" x2="12" y2="-8" stroke="#facc15" stroke-width="2.5" stroke-linecap="round" />
        </g>

        <!-- Aramaic Words of Consecration Scroll -->
        <g transform="translate(30, 10)">
          <rect x="-35" y="-14" width="70" height="30" rx="4" fill="#fef08a" stroke="#ca8a04" stroke-width="1.5" />
          <text x="0" y="-1" text-anchor="middle" fill="#78350f" font-size="8" font-weight="900" font-family="serif">ܗܢܐ ܗܘ ܦܓܪܝ</text>
          <text x="0" y="10" text-anchor="middle" fill="#92400e" font-size="6.5" font-weight="bold" font-family="sans-serif">Hano haw phaghro dil</text>
        </g>

        <!-- Tradition Info Header -->
        <text x="0" y="66" text-anchor="middle" fill="#fca5a5" font-size="13" font-weight="900" font-family="sans-serif">
          4. ANTIOCHIAN TRADITION
        </text>
        <text x="0" y="82" text-anchor="middle" fill="#fecaca" font-size="10" font-weight="700" font-family="sans-serif">
          Maronite (Unbroken Communion), Syrian &amp; Malankara Churches
        </text>
        <text x="0" y="98" text-anchor="middle" fill="#cbd5e1" font-size="8.5" font-family="sans-serif">
          Aramaic Language of Christ &bull; Liturgy of St. James &bull; St. Ephrem the Syrian
        </text>
      </g>

      <!-- ================================================================= -->
      <!-- STATION 5: Chaldean Tradition (Centered at X = 3600)              -->
      <!-- ================================================================= -->
      <g id="shrine-station-5" transform="translate(3600, 255)">
        <!-- Mesopotamian & Indian Sanctuary Arch -->
        <path d="M -170,120 L -170,-15 C -170,-75 170,-75 170,-15 L 170,120 Z" fill="rgba(76, 29, 149, 0.45)" stroke="#8b5cf6" stroke-width="2" />
        
        <!-- Altar Base Pedestal -->
        <rect x="-140" y="32" width="280" height="85" rx="8" fill="url(#pedestal-grad)" stroke="#6d28d9" stroke-width="2" />
        <rect x="-130" y="36" width="260" height="7" fill="#8b5cf6" />

        <!-- Ancient Saint Thomas Nasrani Cross (Blooming Lotus Flower & Dove) -->
        <g transform="translate(0, 8)" filter="url(#soft-glow)">
          <!-- Lotus Petals at Base -->
          <path d="M -18,16 Q 0,8 18,16 Q 0,22 -18,16 Z" fill="#f472b6" stroke="#db2777" stroke-width="1.2" />
          <!-- The Four-Pointed Nasrani Cross -->
          <line x1="0" y1="-14" x2="0" y2="16" stroke="#facc15" stroke-width="3.5" stroke-linecap="round" />
          <line x1="-14" y1="-2" x2="14" y2="-2" stroke="#facc15" stroke-width="3" stroke-linecap="round" />
          <!-- Trefoil Buds on Cross Arms -->
          <circle cx="-14" cy="-2" r="2.5" fill="#fef08a" />
          <circle cx="14" cy="-2" r="2.5" fill="#fef08a" />
          <circle cx="0" cy="-14" r="2.5" fill="#fef08a" />
          <!-- Holy Spirit Dove Descending at Peak -->
          <path d="M 0,-24 L -5,-19 L 0,-17 L 5,-19 Z" fill="#ffffff" />
        </g>

        <!-- Tradition Info Header -->
        <text x="0" y="66" text-anchor="middle" fill="#c4b5fd" font-size="13" font-weight="900" font-family="sans-serif">
          5. CHALDEAN TRADITION
        </text>
        <text x="0" y="82" text-anchor="middle" fill="#ddd6fe" font-size="10" font-weight="700" font-family="sans-serif">
          Chaldean (Iraq) &amp; Syro-Malabar Catholic Church (India, AD 52)
        </text>
        <text x="0" y="98" text-anchor="middle" fill="#cbd5e1" font-size="8.5" font-family="sans-serif">
          St. Thomas Nasranis &bull; Anaphora of Addai &amp; Mari &bull; East Syriac Heritage
        </text>
      </g>

      <!-- ================================================================= -->
      <!-- STATION 6: Armenian Tradition (Centered at X = 4400)              -->
      <!-- ================================================================= -->
      <g id="shrine-station-6" transform="translate(4400, 255)">
        <!-- Armenian Stone Church Conical Dome Arch -->
        <path d="M -170,120 L -170,-10 L 0,-90 L 170,-10 L 170,120 Z" fill="rgba(124, 45, 18, 0.45)" stroke="#f97316" stroke-width="2" />
        
        <!-- Altar Base Pedestal -->
        <rect x="-140" y="32" width="280" height="85" rx="8" fill="url(#pedestal-grad)" stroke="#9a3412" stroke-width="2" />
        <rect x="-130" y="36" width="260" height="7" fill="#f97316" />

        <!-- Armenian Stone Khachkar (Intricately Carved Cross of Life) -->
        <g transform="translate(-25, 10)" filter="url(#soft-glow)">
          <rect x="-15" y="-22" width="30" height="42" rx="4" fill="#78350f" stroke="#ca8a04" stroke-width="1.5" />
          <!-- Carved Cross -->
          <line x1="0" y1="-18" x2="0" y2="14" stroke="#facc15" stroke-width="2.5" />
          <line x1="-10" y1="-8" x2="10" y2="-8" stroke="#facc15" stroke-width="2.5" />
          <!-- Grapevine and Rosette Motifs -->
          <circle cx="0" cy="12" r="3" fill="#fde047" />
          <circle cx="0" cy="-18" r="2.5" fill="#fde047" />
        </g>

        <!-- Consecrated Chalice of Unmixed Wine -->
        <g transform="translate(30, 10)" filter="url(#soft-glow)">
          <path d="M -12,18 Q -12,0 0,0 Q 12,0 12,18 Z" fill="#991b1b" stroke="#facc15" stroke-width="1.5" />
          <rect x="-2" y="10" width="4" height="8" fill="#ca8a04" />
          <ellipse cx="0" cy="18" rx="8" ry="3" fill="#ca8a04" />
        </g>

        <!-- Tradition Info Header -->
        <text x="0" y="66" text-anchor="middle" fill="#fdba74" font-size="13" font-weight="900" font-family="sans-serif">
          6. ARMENIAN TRADITION
        </text>
        <text x="0" y="82" text-anchor="middle" fill="#fed7aa" font-size="10" font-weight="700" font-family="sans-serif">
          Armenian Catholic Church (Holy See of Cilicia)
        </text>
        <text x="0" y="98" text-anchor="middle" fill="#cbd5e1" font-size="8.5" font-family="sans-serif">
          First Christian Nation (AD 301) &bull; Stone Khachkars &bull; Unmixed Wine
        </text>
      </g>

    </g>
  </g>

  <!-- Sanctuary Floor Perspective Grid -->
  <path d="M 0,395 L 800,395 M 0,425 L 800,425 M 0,455 L 800,455" stroke="#1e293b" stroke-width="1" />
  <path d="M 100,395 L 40,480 M 250,395 L 210,480 M 400,395 L 400,480 M 550,395 L 590,480 M 700,395 L 760,480" stroke="#1e293b" stroke-width="1" opacity="0.6" />

  <!-- Interactive Rite Family Dial at Bottom (Stations: 140, 244, 348, 452, 556, 660) -->
  <g id="rite-selector-container" transform="translate(0, 412)">
    <!-- Header Marquee Label above track -->
    <text x="400" y="-3" text-anchor="middle" fill="#94a3b8" font-size="8.5" font-weight="700" letter-spacing="0.06em" font-family="sans-serif">
      HORIZONTAL SCROLLING TRADITION PANORAMA (DRAG SLIDER OR CLICK A RITE)
    </text>

    <!-- Selector Track -->
    <rect x="90" y="6" width="620" height="24" rx="12" fill="#0f172a" stroke="#334155" stroke-width="2" />
    
    <!-- Station 1: Roman (x=140) -->
    <g id="station-1-btn" cursor="pointer">
      <rect id="tick-1-pill" x="100" y="8" width="80" height="20" rx="10" fill="#2563eb" opacity="0.9" />
      <text id="tick-1-text" x="140" y="22" text-anchor="middle" fill="#fef08a" font-size="10" font-weight="bold" font-family="sans-serif">1. Roman</text>
    </g>

    <!-- Station 2: Byzantine (x=244) -->
    <g id="station-2-btn" cursor="pointer">
      <rect id="tick-2-pill" x="198" y="8" width="92" height="20" rx="10" fill="#d97706" opacity="0.0" />
      <text id="tick-2-text" x="244" y="22" text-anchor="middle" fill="#94a3b8" font-size="10" font-weight="bold" font-family="sans-serif">2. Byzantine</text>
    </g>

    <!-- Station 3: Alexandrian (x=348) -->
    <g id="station-3-btn" cursor="pointer">
      <rect id="tick-3-pill" x="300" y="8" width="96" height="20" rx="10" fill="#059669" opacity="0.0" />
      <text id="tick-3-text" x="348" y="22" text-anchor="middle" fill="#94a3b8" font-size="10" font-weight="bold" font-family="sans-serif">3. Alexandrian</text>
    </g>

    <!-- Station 4: Antiochian (x=452) -->
    <g id="station-4-btn" cursor="pointer">
      <rect id="tick-4-pill" x="406" y="8" width="92" height="20" rx="10" fill="#dc2626" opacity="0.0" />
      <text id="tick-4-text" x="452" y="22" text-anchor="middle" fill="#94a3b8" font-size="10" font-weight="bold" font-family="sans-serif">4. Antiochian</text>
    </g>

    <!-- Station 5: Chaldean (x=556) -->
    <g id="station-5-btn" cursor="pointer">
      <rect id="tick-5-pill" x="510" y="8" width="92" height="20" rx="10" fill="#7c3aed" opacity="0.0" />
      <text id="tick-5-text" x="556" y="22" text-anchor="middle" fill="#94a3b8" font-size="10" font-weight="bold" font-family="sans-serif">5. Chaldean</text>
    </g>

    <!-- Station 6: Armenian (x=660) -->
    <g id="station-6-btn" cursor="pointer">
      <rect id="tick-6-pill" x="614" y="8" width="92" height="20" rx="10" fill="#ea580c" opacity="0.0" />
      <text id="tick-6-text" x="660" y="22" text-anchor="middle" fill="#94a3b8" font-size="10" font-weight="bold" font-family="sans-serif">6. Armenian</text>
    </g>

    <!-- Draggable Knob (x starts at 140) -->
    <g id="rite-selector-knob" cursor="ew-resize" transform="translate(140, 18)">
      <circle cx="0" cy="0" r="15" fill="#facc15" stroke="#ca8a04" stroke-width="2.5" filter="url(#soft-glow)" />
      <circle cx="0" cy="0" r="6" fill="#1e1b4b" />
      <path d="M -3,0 L 3,0 M 0,-3 L 0,3" stroke="#facc15" stroke-width="1.5" />
    </g>
  </g>
</svg>
`,ast:`(:scene :id "catholic-rites" :type "Slide" :oak-id "OAK-KS3-RE-011" :oak-unit "ks3-re-catholic-sacramental-rites" :title "The 24 Catholic Rites & Churches: Unity in Diversity Across East & West" :stage "CATHOLIC LIFE" :duration 28.0
  (:vars (
    (:var :name "selectedRite" :val 1.0 :min 1.0 :max 6.0 :step 1.0 :label "Selected Liturgical Rite")
    (:var :name "communionGlow" :val 1.0 :min 0.2 :max 2.0 :step 0.1 :label "Communion with Holy See Beacon")
    (:var :name "iconShimmer" :val 0.8 :min 0.0 :max 1.5 :step 0.1 :label "Iconostasis & Mosaic Shimmer")
  ))

  (:inputs (
    (:slider :var "selectedRite" :label "Liturgical Tradition" :min 1.0 :max 6.0 :step 1.0)
    (:slider :var "communionGlow" :label "Peter's Beacon" :min 0.2 :max 2.0 :step 0.1)
    (:slider :var "iconShimmer" :label "Icon Shimmer" :min 0.0 :max 1.5 :step 0.1)
  ))

  (:gestures (
    (:draggable :target "#rite-selector-knob" :axis "x" :min 140 :max 660 :var "selectedRite")
  ))

  (:subtitles (
    (:start 0.00 :end 0.20 :en "The Catholic Church is a global communion of 24 autonomous (sui iuris) Churches united under the Bishop of Rome." :es "La Iglesia Católica es una comunión global de 24 Iglesias autónomas (sui iuris) unidas bajo el Obispo de Roma." :la "Ecclesia Catholica est communio viginti quattuor Ecclesiarum sui iuris sub Romano Pontifice.")
    (:start 0.20 :end 0.45 :en "The Latin (Western) Church shares full communion with 23 ancient Eastern Catholic Churches spanning 6 Liturgical Traditions." :es "La Iglesia Latina comparte plena comunión con 23 Iglesias Católicas Orientales a través de 6 Tradiciones Litúrgicas." :la "Una Ecclesia Occidentalis et viginti tres Ecclesiae Orientales sex traditiones liturgicas participant.")
    (:start 0.45 :end 0.70 :en "From the Byzantine Divine Liturgy with sacred icons to Alexandrian Ge'ez chant, Christ's Church breathes with two lungs: East and West." :es "Desde la Divina Liturgia bizantina con iconos hasta el canto ge'ez alejandrino, la Iglesia respira con dos pulmones." :la "Ecclesia duobus pulmonibus respirat: Oriente et Occidente in sacra liturgia et iconibus concordibus.")
    (:start 0.70 :end 0.88 :en "Ancient Eastern traditions use leavened prosphora bread symbolizing the Resurrection, alongside holy icons and fragrant incense." :es "Las tradiciones orientales usan pan leudado prosfora simbolizando la Resurrección, con iconos e incienso." :la "Panis fermentatus prosphora Resurrectionem Christi significat una cum thure et sanctis iconibus.")
    (:start 0.88 :end 1.00 :en "In all 24 Churches, the same true Sacraments, apostolic faith, and communion with the Successor of Peter are fully preserved." :es "En las 24 Iglesias se preservan los mismos verdaderos Sacramentos, la fe apostólica y la comunión con Pedro." :la "In omnibus viginti quattuor Ecclesiis eadem sacramenta et communio cum Successore Petri servantur.")
  ))

  (:keyframes (
    (:t 0.00 :title "1. The Universal Catholic Communion (24 Churches)" :rule "Una Ecclesia: 24 autonomous Churches (1 Western Latin + 23 Eastern Catholic) in one faith.")
    (:t 0.20 :title "2. The Six Liturgical Families" :rule "Traditiones: Latin, Byzantine, Alexandrian, Antiochene, Chaldean, and Armenian rites.")
    (:t 0.45 :title "3. Breathing with Two Lungs (East & West)" :rule "Duo Pulmones: Saint John Paul II taught the Church breathes with both East and West.")
    (:t 0.70 :title "4. Prosphora, Icons & Eastern Sacramental Rites" :rule "Mysterium: Leavened Eucharistic Prosphora and sacred Iconostasis reflecting heavenly liturgy.")
    (:t 0.88 :title "5. Unbroken Apostolic Unity with Peter" :rule "Cathedra Petri: Plenary communion with the Holy See preserving Catholic diversity in unity.")
  ))

  (:interactive (
    (:checkpoint :t 0.35
      :prompt "How many autonomous (sui iuris) Churches make up the one Universal Catholic Church in full communion with the Pope?"
      :options ("24 autonomous Churches across 6 Liturgical Traditions" "Only 1 (The Roman Church alone)" "6 regional dioceses" "Over 500 divided denominations")
      :answer 0
      :explanation "The Catholic Church is a magnificent communion of 24 autonomous Churches (1 Western Latin + 23 Eastern Catholic Churches) all united in one faith under the Pope.")
    (:checkpoint :t 0.75
      :prompt "Why do Byzantine and Eastern Catholic Churches use leavened bread (Prosphora) for the Holy Eucharist?"
      :options ("Because yeast represents the Risen Life of Christ and the Holy Spirit breathing life into creation" "Because unleavened bread was forbidden in ancient times" "Because flat wafers were invented only recently" "Only to make the bread softer for the priest")
      :answer 0
      :explanation "Leaven symbolizes Christ rising from the dead and the Holy Spirit breathing life into the bread! Both leavened and unleavened traditions are holy, ancient, and fully valid.")
  ))

  (:bindings (
    (:target "#beacon-pulse" :attr "opacity" :expr "0.3 + 0.4 * (vars.communionGlow || 1.0)")
    (:target "#beacon-halo" :attr "r" :expr "26 + 18 * (vars.communionGlow || 1.0)")
    (:target "#icon-gold-glow" :attr "opacity" :expr "0.4 + 0.5 * (vars.iconShimmer || 0.8)")
    (:target "#panoramic-rites-strip" :attr "transform" :expr "'translate(' + (-((vars.selectedRite ? (vars.selectedRite - 1) : Math.min(5, t / 0.18)) * 800)) + ', 0)'")
    (:target "#rite-selector-knob" :attr "transform" :expr "'translate(' + (vars.selectedRite ? (140 + (vars.selectedRite - 1) * 104) : (140 + Math.min(1.0, t / 0.90) * 520)) + ', 18)'")
    (:target "#active-rite-title" :attr "textContent" :expr "['1. Western Latin Rite (Roman, Ambrosian, Mozarabic)', '2. Byzantine Tradition (Constantinopolitan)', '3. Alexandrian Tradition (Coptic & Ge\\\\'ez)', '4. Antiochian Tradition (West Syriac & Maronite)', '5. Chaldean Tradition (East Syriac & St. Thomas)', '6. Armenian Tradition (Holy See of Cilicia)'][(vars.selectedRite ? Math.round(vars.selectedRite) : Math.min(6, 1 + Math.floor(t / 0.16))) - 1] || '1. Western Latin Rite'")
    (:target "#active-rite-desc" :attr "textContent" :expr "['1 Western Church (>1.3B) • Unleavened Host (Hostia Pura) • Statues & Gregorian Chant', '14 Eastern Catholic Churches • Sacred Icons • Leavened Prosphora • Divine Liturgy', '3 Eastern Churches: Coptic (Egypt), Ethiopian & Eritrean • Ancient Liturgy of St. Mark', '3 Eastern Churches: Maronite (Lebanon), Syriac, Syro-Malankara • West Syriac Aramaic', '2 Eastern Churches: Chaldean (Iraq) & Syro-Malabar (India, AD 52) • Addai & Mari', '1 Eastern Church: Armenian Catholic Church (Cilicia) • First Christian Nation (AD 301)'][(vars.selectedRite ? Math.round(vars.selectedRite) : Math.min(6, 1 + Math.floor(t / 0.16))) - 1] || ''")
    (:target "#tick-1-pill" :attr "opacity" :expr "(vars.selectedRite ? vars.selectedRite === 1 : t < 0.18) ? 0.9 : 0.0")
    (:target "#tick-2-pill" :attr "opacity" :expr "(vars.selectedRite ? vars.selectedRite === 2 : (t >= 0.18 && t < 0.36)) ? 0.9 : 0.0")
    (:target "#tick-3-pill" :attr "opacity" :expr "(vars.selectedRite ? vars.selectedRite === 3 : (t >= 0.36 && t < 0.54)) ? 0.9 : 0.0")
    (:target "#tick-4-pill" :attr "opacity" :expr "(vars.selectedRite ? vars.selectedRite === 4 : (t >= 0.54 && t < 0.72)) ? 0.9 : 0.0")
    (:target "#tick-5-pill" :attr "opacity" :expr "(vars.selectedRite ? vars.selectedRite === 5 : (t >= 0.72 && t < 0.88)) ? 0.9 : 0.0")
    (:target "#tick-6-pill" :attr "opacity" :expr "(vars.selectedRite ? vars.selectedRite === 6 : t >= 0.88) ? 0.9 : 0.0")
    (:target "#tick-1-text" :attr "fill" :expr "(vars.selectedRite ? vars.selectedRite === 1 : t < 0.18) ? '#fef08a' : '#94a3b8'")
    (:target "#tick-2-text" :attr "fill" :expr "(vars.selectedRite ? vars.selectedRite === 2 : (t >= 0.18 && t < 0.36)) ? '#fef08a' : '#94a3b8'")
    (:target "#tick-3-text" :attr "fill" :expr "(vars.selectedRite ? vars.selectedRite === 3 : (t >= 0.36 && t < 0.54)) ? '#fef08a' : '#94a3b8'")
    (:target "#tick-4-text" :attr "fill" :expr "(vars.selectedRite ? vars.selectedRite === 4 : (t >= 0.54 && t < 0.72)) ? '#fef08a' : '#94a3b8'")
    (:target "#tick-5-text" :attr "fill" :expr "(vars.selectedRite ? vars.selectedRite === 5 : (t >= 0.72 && t < 0.88)) ? '#fef08a' : '#94a3b8'")
    (:target "#tick-6-text" :attr "fill" :expr "(vars.selectedRite ? vars.selectedRite === 6 : t >= 0.88) ? '#fef08a' : '#94a3b8'")
  ))
)
`}},V=`stj_custom_cartridges_v1`,ie={"bbc-micro":`bbc-model-b`,"bbc-model-b":`bbc-model-b`,bbc:`bbc-model-b`,"bbc-basic":`bbc-model-b`,acorn:`bbc-model-b`,6502:`bbc-model-b`,pythagorus:`pythagoras`,pythagoras:`pythagoras`,"pythagoras-theorem":`pythagoras`,"pythagoras-proof":`pythagoras`,"ohms-law":`electric-circuits`,"phet-ohms-law":`electric-circuits`,circuits:`electric-circuits`,circuit:`electric-circuits`,gas:`kinetic-gas`,"boyles-law":`kinetic-gas`,curves:`calculus-curves`,calculus:`calculus-curves`,aquarium:`fish-tank`,fish:`fish-tank`,fishing:`math-fishing`,mountain:`mountain-elevation`,climber:`mountain-elevation`,photosynth:`photosynthesis`,leaf:`photosynthesis`,stars:`solar-system`,space:`solar-system`,balance:`algebra-balance`,atom:`atom`,"atomic-structure":`atom`,bohr:`atom`,"periodic-table":`atom`,elements:`atom`,spelling:`spelling-bee`,"spelling-bee":`spelling-bee`,bee:`spelling-bee`,spell:`spelling-bee`,stations:`stations-of-the-cross`,"stations-of-the-cross":`stations-of-the-cross`,"stations-cross":`stations-of-the-cross`,"via-crucis":`stations-of-the-cross`,"way-of-the-cross":`stations-of-the-cross`,passion:`stations-of-the-cross`,altar:`altar-anatomy`,"altar-anatomy":`altar-anatomy`,"altar-stone":`altar-anatomy`,mensa:`altar-anatomy`,"holy-oils":`holy-oils`,oils:`holy-oils`,chrism:`holy-oils`,ambry:`holy-oils`,"olea-sancta":`holy-oils`,triduum:`triduum-easter`,"triduum-easter":`triduum-easter`,easter:`triduum-easter`,"easter-vigil":`triduum-easter`,"lumen-christi":`triduum-easter`,"paschal-triduum":`triduum-easter`,"holy-water":`holy-water-thurifer`,"holy-water-thurifer":`holy-water-thurifer`,thurifer:`holy-water-thurifer`,thurible:`holy-water-thurifer`,incense:`holy-water-thurifer`,asperges:`holy-water-thurifer`,"liturgy-of-the-hours":`liturgy-of-the-hours`,"divine-office":`liturgy-of-the-hours`,breviary:`liturgy-of-the-hours`,"canonical-hours":`liturgy-of-the-hours`,lauds:`liturgy-of-the-hours`,vespers:`liturgy-of-the-hours`,"seven-sacraments":`seven-sacraments`,sacraments:`seven-sacraments`,sacrament:`seven-sacraments`,baptism:`seven-sacraments`,confirmation:`seven-sacraments`,eucharist:`seven-sacraments`,"liturgical-calendar":`liturgical-calendar`,calendar:`liturgical-calendar`,seasons:`liturgical-calendar`,advent:`liturgical-calendar`,lent:`liturgical-calendar`,"liturgical-postures":`liturgical-postures`,postures:`liturgical-postures`,genuflection:`liturgical-postures`,kneeling:`liturgical-postures`,bow:`liturgical-postures`,"catholic-rites":`catholic-rites`,rites:`catholic-rites`,"eastern-churches":`catholic-rites`,byzantine:`catholic-rites`,maronite:`catholic-rites`,"cst-virtues":`cst-virtues`,cst:`cst-virtues`,virtues:`cst-virtues`,"social-teaching":`cst-virtues`,"latin-mass-prayers":`latin-mass-prayers`,"latin-prayers":`latin-mass-prayers`,latin:`latin-mass-prayers`,"gregorian-chant":`latin-mass-prayers`,"pater-noster":`latin-mass-prayers`,"nicene-creed":`nicene-creed`,creed:`nicene-creed`,credo:`nicene-creed`,"apostles-creed":`nicene-creed`,"ten-commandments":`ten-commandments`,commandments:`ten-commandments`,decalogue:`ten-commandments`,sinai:`ten-commandments`,"order-of-the-mass":`order-of-the-mass`,mass:`order-of-the-mass`,"holy-mass":`order-of-the-mass`,"eucharistic-liturgy":`order-of-the-mass`,"sacred-objects":`sacred-objects`,"sacred-vessels":`sacred-objects`,vestments:`sacred-objects`,"first-communion":`first-communion`,"holy-communion":`first-communion`,"eucharistic-adoration":`first-communion`,"eucharistic-procession-film":`eucharistic-procession-film`,"procession-film":`eucharistic-procession-film`,"liturgical-film":`eucharistic-procession-film`,procession:`eucharistic-procession-film`,welcome:`welcome`,intro:`welcome`,start:`welcome`,onboarding:`welcome`,showcase:`welcome`,"data-states":`oak-data-states-of-matter`,"oak-data-states-of-matter":`oak-data-states-of-matter`,"states-of-matter-data":`oak-data-states-of-matter`,"data-fractions":`oak-data-fractions-decimals`,"oak-data-fractions-decimals":`oak-data-fractions-decimals`,"data-seasonal":`oak-data-seasonal-changes`,"oak-data-seasonal-changes":`oak-data-seasonal-changes`,"data-sacraments":`oak-data-re-sacraments`,"oak-data-re-sacraments":`oak-data-re-sacraments`,"data-algorithms":`oak-data-algorithms-sequencing`,"oak-data-algorithms-sequencing":`oak-data-algorithms-sequencing`,"data-phonics":`oak-data-phonics-screening`,"oak-data-phonics-screening":`oak-data-phonics-screening`,"data-circuits":`oak-data-electric-circuits`,"oak-data-electric-circuits":`oak-data-electric-circuits`,"data-angles":`oak-data-angles-triangles`,"oak-data-angles-triangles":`oak-data-angles-triangles`,"data-cells":`oak-data-cell-biology`,"oak-data-cell-biology":`oak-data-cell-biology`,"data-creed":`oak-data-re-nicene-creed`,"oak-data-re-nicene-creed":`oak-data-re-nicene-creed`,"data-spanish":`oak-data-spanish-foundations`,"oak-data-spanish-foundations":`oak-data-spanish-foundations`},ae=[{id:`welcome`,type:`Sim`,title:`Welcome to AST Vector Player & Educational Simulator`,stage:`PORTAL APPARATUS & SIMULATOR`,category:`Portal Showcase`,desc:`Interactive demonstration of the AST Vector Engine: 60 FPS sub-pixel kinematics, harmonic oscillations, smartboard stylus ink, and zero-cloud Gemini Nano tutoring.`,icon:`✨`,source:`builtin`,svgFile:`cartridges/welcome.svg`,astFile:`cartridges/welcome.ast`,version:`2.6.0`,invariants:[`Zero Bloat Runtime`,`Harmonic Resonance`,`Sub-15ms Cold Start`,`Direct Pointer Capture`]},{id:`pythagoras`,type:`Sim`,title:`Pythagoras' Theorem (a² + b² = c²)`,stage:`KS3 GEOMETRY`,category:`Mathematics`,desc:`Interactive right-triangle manipulative demonstrating area conservation: square a² (emerald) plus square b² (sapphire) equals square c² (amber).`,icon:`📐`,source:`builtin`,svgFile:`cartridges/pythagoras.svg`,astFile:`cartridges/pythagoras.ast`,version:`2.6.0`,invariants:[`Pythagorean Theorem`,`Area Conservation`,`Euclidean Metric`]},{id:`kinetic-gas`,type:`Sim`,title:`Kinetic Gas Theory & Boyle's Law (PV = nRT)`,stage:`KS3/KS4 PHYSICS & CHEMISTRY`,category:`Science`,desc:`Real-time particle kinematics in a compression cylinder with temperature heater, pressure gauge, and Maxwell-Boltzmann velocity distribution.`,icon:`🌡️`,source:`builtin`,svgFile:`cartridges/kinetic-gas.svg`,astFile:`cartridges/kinetic-gas.ast`,version:`2.6.0`,invariants:[`Boyle's Law`,`Ideal Gas Law`,`Kinetic Theory of Gases`]},{id:`electric-circuits`,type:`Sim`,title:`Electrical Circuits & Ohm's Law (V = I × R)`,stage:`KS2/KS3 PHYSICS`,category:`Science`,desc:`Live closed-loop circuit with electron charge kinematics, battery electromotive force, resistance dissipation, and lightbulb filament luminance.`,icon:`💡`,source:`builtin`,svgFile:`cartridges/electric-circuits.svg`,astFile:`cartridges/electric-circuits.ast`,version:`2.6.0`,invariants:[`Ohm's Law`,`Kirchhoff Voltage Loop`,`Electron Drift Velocity`]},{id:`calculus-curves`,type:`Sim`,title:`Calculus: Tangent Slopes (dy/dx) & Definite Integrals (∫)`,stage:`GCSE & A-LEVEL MATHS`,category:`Mathematics`,desc:`Interactive tangent probe gliding over quadratic & cubic curves with real-time derivative secant limit and Riemann sum area accumulation.`,icon:`📈`,source:`builtin`,svgFile:`cartridges/calculus-curves.svg`,astFile:`cartridges/calculus-curves.ast`,version:`2.6.0`,invariants:[`First Derivative Tangent Limit`,`Riemann Integral Sum`,`Continuity`]},{id:`algebra-balance`,type:`Sim`,title:`Algebraic Balance Scale: Preserving Equality (2x + 5 = 15)`,stage:`KS2/KS3 MATHS`,category:`Mathematics`,desc:`Physical 2-pan balance scale demystifying linear equations. Whatever operation you apply to one side, you must apply to the other to preserve equilibrium.`,icon:`⚖️`,source:`builtin`,svgFile:`cartridges/algebra-balance.svg`,astFile:`cartridges/algebra-balance.ast`,version:`2.6.0`,invariants:[`Conservation of Mass`,`Additive Invariance`,`Multiplicative Invariance`]},{id:`bodmas`,type:`Slide`,title:`BODMAS / BIDMAS: Forcefield & Magnetic Clamping`,stage:`KS2/KS3 MATHS`,category:`Mathematics`,desc:`Interactive operator physics: titanium bracket shields, magnetic multiplication clamps, and concrete Area Model showing why 5 + 3 × 4 ≠ 32.`,icon:`🧮`,source:`builtin`,svgFile:`cartridges/bodmas.svg`,astFile:`cartridges/bodmas.ast`,version:`2.6.0`,invariants:[`Order of Operations`,`Distributive Property`]},{id:`times-tables`,type:`Sim`,title:`Times Tables (1× to 12× Standard School Chart & Grid)`,stage:`KS1/KS2 MATHS`,category:`Mathematics`,desc:`Standard school 1 to 12 multiplication facts, 12×12 multiplication square, fact families, and commutative proofs.`,icon:`📐`,source:`builtin`,svgFile:`cartridges/times-tables.svg`,astFile:`cartridges/times-tables.ast`,version:`2.6.0`,invariants:[`Commutative Property`,`Distributive Property`]},{id:`fractions`,type:`Slide`,title:`Fractions & Proportions`,stage:`KS2 MATHS`,category:`Mathematics`,desc:`Visual slice partitioning, equivalent denominators, and geometric whole unit assembly.`,icon:`🥧`,source:`builtin`,svgFile:`cartridges/fractions.svg`,astFile:`cartridges/fractions.ast`,version:`2.6.0`,invariants:[`Common Denominator Equivalence`,`Whole Conservation`]},{id:`fish-tank`,type:`App`,title:`Aquarium Living Ecosystem & Boids Flocking Benchmark`,stage:`BENCHMARK & STRESS LAB`,category:`Diagnostics & Games`,desc:`Autonomous multi-species boids flocking simulation with acoustic glass-tap scatter, stage tap feeding, and frame render budget monitoring.`,icon:`🐠`,source:`builtin`,svgFile:`cartridges/fish-tank.svg`,astFile:`cartridges/fish-tank.ast`,version:`2.6.0`,invariants:[`Craig Reynolds Boid Flocking`,`Continuous Velocity Verlet`]},{id:`solar-system`,type:`Sim`,title:`Solar System Planetary Orbits`,stage:`KS3 SCIENCE`,category:`Science`,desc:`3D Heliocentric orbital velocities, Keplerian mechanics, and scale celestial dynamics.`,icon:`🪐`,source:`builtin`,svgFile:`cartridges/solar-system.svg`,astFile:`cartridges/solar-system.ast`,version:`2.6.0`,invariants:[`Kepler's Laws of Planetary Motion`,`Gravitational Central Force`]},{id:`photosynthesis`,type:`Slide`,title:`Photosynthesis & Leaf Anatomy`,stage:`KS3 BIOLOGY`,category:`Science`,desc:`Light-dependent chloroplast reactions, stomata gas exchange, and glucose synthesis rate limiter.`,icon:`🍃`,source:`builtin`,svgFile:`cartridges/photosynthesis.svg`,astFile:`cartridges/photosynthesis.ast`,version:`2.6.0`,invariants:[`Conservation of Carbon & Oxygen Atoms`,`Blackman Limiting Factors`]},{id:`atom`,type:`Sim`,title:`Atomic Structure: Bohr Electron Shells`,stage:`KS3 CHEMISTRY`,category:`Science`,desc:`Quantized electron orbits (2, 8, 8), proton/neutron nucleus binding, and valence energy states.`,icon:`⚛️`,source:`builtin`,svgFile:`cartridges/atom.svg`,astFile:`cartridges/atom.ast`,version:`2.6.0`,invariants:[`Bohr Angular Momentum Quantization`,`Nuclear Charge Balance`]},{id:`velocity`,type:`Sim`,title:`Velocity Vectors & Kinematics`,stage:`KS3 PHYSICS`,category:`Science`,desc:`Continuous motion physics, displacement vectors, velocity-time graph area accumulation, and acceleration mechanics.`,icon:`🏎️`,source:`builtin`,svgFile:`cartridges/velocity.svg`,astFile:`cartridges/velocity.ast`,version:`2.6.0`,invariants:[`Newtonian Kinematics`,`Displacement Calculus`]},{id:`mountain-elevation`,type:`Sim`,title:`Mountain Altitude: Climber Game & Trigonometry`,stage:`KS2/KS3 MATHS & GEOGRAPHY`,category:`Games & Simulations`,desc:`Interactive hill climber game contrasting vertical altitude against slope distance, right-angle hypotenuse, and atmospheric lapse rate.`,icon:`🧗`,source:`builtin`,svgFile:`cartridges/mountain-elevation.svg`,astFile:`cartridges/mountain-elevation.ast`,version:`2.6.0`,invariants:[`Trigonometric Ratios (sin, cos, tan)`,`Atmospheric Lapse Rate`]},{id:`math-fishing`,type:`App`,title:`Math Pond: Number Bonds Fishing Game`,stage:`KS1/KS2 MATHS`,category:`Games & Simulations`,desc:`Interactive vector pond fishing adventure: hook swimming fish to solve number bonds to 10 & 20, doubles, and mental arithmetic.`,icon:`🎣`,source:`builtin`,svgFile:`cartridges/math-fishing.svg`,astFile:`cartridges/math-fishing.ast`,version:`2.6.0`,invariants:[`Additive Part-Whole Number Bonds`,`Combinatorics`]},{id:`dna-helix`,type:`Sim`,title:`DNA Double Helix & Base Pairs`,stage:`KS3 GENETICS`,category:`Science`,desc:`Antiparallel sugar-phosphate backbone and hydrogen-bonded A-T / C-G base pairing.`,icon:`🧬`,source:`builtin`,svgFile:`cartridges/dna-helix.svg`,astFile:`cartridges/dna-helix.ast`,version:`2.6.0`,invariants:[`Watson-Crick Complementary Base Pairing`,`Double Helix Pitch`]},{id:`phonics-lab`,type:`App`,title:`Early Phonics: Sound Buttons & Blending Mat`,stage:`EYFS/KS1 PHONICS`,category:`Early Literacy & Phonics`,desc:`Synthetic phonics soundboard, interactive sound button blending mat, tricky words, and Alien Words Screening Check.`,icon:`🔤`,source:`builtin`,svgFile:`cartridges/phonics-lab.svg`,astFile:`cartridges/phonics-lab.ast`,version:`2.6.0`,invariants:[`Phoneme-Grapheme Correspondence`,`Synthetic Blending`]},{id:`spelling-bee`,type:`App`,title:`Spelling Bee Championship: KS1 to KS3 Orthography`,stage:`KS1/KS2/KS3 ENGLISH`,category:`English & Literacy`,desc:`UK National Curriculum statutory spelling lists, Web Speech API auditory synthesis, interactive touch letter tiles, phonics breakdown, and streak multipliers.`,icon:`🐝`,source:`builtin`,svgFile:`cartridges/spelling-bee.svg`,astFile:`cartridges/spelling-bee.ast`,version:`2.6.0`,invariants:[`National Curriculum Statutory Spellings`,`Auditory Memory & Phonics`]},{id:`church-tour`,type:`Slide`,title:`Catholic Church Sanctuary Tour`,stage:`CATHOLIC LIFE`,category:`Catholic Faith`,desc:`Latin cross basilica architecture, Nave, High Altar, golden Tabernacle, and Marian Chapel.`,icon:`⛪`,source:`builtin`,svgFile:`cartridges/church-tour.svg`,astFile:`cartridges/church-tour.ast`,version:`2.6.0`,invariants:[`Sacred Architecture`,`Latin Cross Basilica Proportions`]},{id:`stations-of-the-cross`,type:`Slide`,title:`The Stations of the Cross (Via Crucis)`,stage:`CATHOLIC LIFE`,category:`Catholic Faith`,desc:`The 14 sacred stations of the Via Dolorosa, Golgotha Calvary hill, Roman praetorium, Holy Sepulchre tomb, and glorious Easter Resurrection.`,icon:`✝️`,source:`builtin`,duration:28,oakId:`OAK-KS2-RE-020`,oakUnit:`ks2-re-catholic-via-crucis-stations`,mount:`/curriculum/catholic-life/stations-of-the-cross`,section:`Catholic Life & Faith Formation`,svgFile:`cartridges/stations-of-the-cross.svg`,astFile:`cartridges/stations-of-the-cross.ast`,version:`2.6.0`,invariants:[`14 Traditional Stations of the Cross`,`Via Dolorosa Sacred Pilgrimage`,`Scriptural Passion`,`Paschal Resurrection`]},{id:`altar-anatomy`,type:`Slide`,title:`The Catholic Altar: Sacred Anatomy & Types`,stage:`CATHOLIC LIFE`,category:`Catholic Faith`,desc:`The Mensa, Altar Stone with martyr relics, seasonal Antependium, Crucifix, and beeswax altar candles.`,icon:`✝️`,source:`builtin`,svgFile:`cartridges/altar-anatomy.svg`,astFile:`cartridges/altar-anatomy.ast`,version:`2.6.0`,invariants:[`Consecrated Mensa`,`Sepulchrum Martyr Relics`,`Altar Linens & Liturgical Colors`]},{id:`holy-oils`,type:`Slide`,title:`The Three Holy Oils & Sacred Ambry (Olea Sancta)`,stage:`CATHOLIC LIFE`,category:`Catholic Faith`,desc:`Oleum Infirmorum (O.I.), Oleum Catechumenorum (O.C.), Sanctum Chrisma (S.C.), and the sanctuary ambry niche.`,icon:`🏺`,source:`builtin`,svgFile:`cartridges/holy-oils.svg`,astFile:`cartridges/holy-oils.ast`,version:`2.6.0`,invariants:[`Olea Sancta`,`Chrism Mass Balsam & Olive Oil`,`Indelible Sacramental Character`]},{id:`triduum-easter`,type:`Sim`,title:`The Sacred Paschal Triduum & Easter Glory`,stage:`CATHOLIC LIFE`,category:`Catholic Faith`,desc:`From the Upper Room Mandatum and Calvary Cross to the New Fire, Lumen Christi 3 elevations, Exsultet, and 50-day Paschal Resurrection.`,icon:`🔥`,source:`builtin`,svgFile:`cartridges/triduum-easter.svg`,astFile:`cartridges/triduum-easter.ast`,version:`2.6.0`,invariants:[`Sacrum Triduum Paschale`,`Lumen Christi 3 Elevations`,`Exsultet & Paschal Candle`,`Resurrectio Domini`]},{id:`holy-water-thurifer`,type:`Sim`,title:`Holy Water, Asperges & The Thurible (Thuribulum)`,stage:`CATHOLIC LIFE`,category:`Catholic Faith`,desc:`Aqua Benedicta sacramental stoup, Sunday Asperges Me sprinkling, 3-chain thurible swing dynamics, incense boat, and 7 Mass incensations.`,icon:`💨`,source:`builtin`,svgFile:`cartridges/holy-water-thurifer.svg`,astFile:`cartridges/holy-water-thurifer.ast`,version:`2.6.0`,invariants:[`Aqua Benedicta Sacramental`,`Asperges Me & Vidi Aquam`,`Thurible Dynamics & Rising Incense`]},{id:`liturgy-of-the-hours`,type:`Sim`,title:`The Liturgy of the Hours (Divine Office)`,stage:`CATHOLIC LIFE`,category:`Catholic Faith`,desc:`The seven canonical hours sanctifying the cycle of day and night: Matins, Lauds (Benedictus), Daytime Hours, Vespers (Magnificat), and Compline (Nunc Dimittis).`,icon:`🕰️`,source:`builtin`,svgFile:`cartridges/liturgy-of-the-hours.svg`,astFile:`cartridges/liturgy-of-the-hours.ast`,version:`2.6.0`,invariants:[`Liturgia Horarum`,`Seven Canonical Hours`,`Canticles of Zechariah, Mary & Simeon`]},{id:`seven-sacraments`,type:`Sim`,title:`The Seven Holy Sacraments (Septem Sacramenta)`,stage:`CATHOLIC LIFE`,category:`Catholic Faith`,desc:`Visible signs of invisible grace: Sacraments of Initiation (Baptism, Confirmation, Eucharist), Healing (Penance, Anointing), and Service of Communion (Orders, Matrimony).`,icon:`✨`,source:`builtin`,svgFile:`cartridges/seven-sacraments.svg`,astFile:`cartridges/seven-sacraments.ast`,version:`2.6.0`,invariants:[`Septem Sacramenta`,`Threefold Indelible Character`,`Ex Opere Operato`]},{id:`liturgical-calendar`,type:`Sim`,title:`The Catholic Liturgical Year (Annus Liturgicus)`,stage:`CATHOLIC LIFE`,category:`Catholic Faith`,desc:`The 360-degree seasonal year wheel: Advent (Violet), Christmas (Gold), Ordinary Time (Green), Lent (Purple), Easter (Gold), Pentecost (Red), and Christ the King.`,icon:`📅`,source:`builtin`,svgFile:`cartridges/liturgical-calendar.svg`,astFile:`cartridges/liturgical-calendar.ast`,version:`2.6.0`,invariants:[`Liturgical Cycle & Colors`,`Sunday Lectionary Cycles A/B/C`,`50-Day Easter Season`]},{id:`liturgical-postures`,type:`Sim`,title:`Sacred Postures & Gestures (Gestus Sacri)`,stage:`CATHOLIC LIFE`,category:`Catholic Faith`,desc:`Praying with mind, soul, and body: Standing (dignity & readiness), Kneeling (adoration), Genuflecting to the Tabernacle, Bowing, and the Sign of the Cross.`,icon:`🙇`,source:`builtin`,svgFile:`cartridges/liturgical-postures.svg`,astFile:`cartridges/liturgical-postures.ast`,version:`2.6.0`,invariants:[`Sacred Postures`,`Right-Knee Genuflection`,`Profound Bow at Creed`,`Trinitarian Sign of Cross`]},{id:`catholic-rites`,type:`Sim`,title:`The 24 Catholic Rites & Churches (Omnes Gentes)`,stage:`CATHOLIC LIFE`,category:`Catholic Faith`,desc:`The universal communion of 24 autonomous (sui iuris) Catholic Churches across East and West: Latin, Byzantine, Alexandrian, Antiochian, Chaldean, and Armenian traditions.`,icon:`🌍`,source:`builtin`,svgFile:`cartridges/catholic-rites.svg`,astFile:`cartridges/catholic-rites.ast`,version:`2.6.0`,invariants:[`24 Sui Iuris Catholic Churches`,`Communion with Peter`,`Eastern & Western Liturgical Rites`]},{id:`cst-virtues`,type:`Sim`,title:`Catholic Social Teaching (CST) & School Virtues`,stage:`CATHOLIC LIFE`,category:`Catholic Faith`,desc:`The 7 pillars of Catholic Social Teaching: Human Dignity (Imago Dei), Common Good, Solidarity, Subsidiarity, Option for the Poor, Dignity of Work, and Care for Creation (Laudato Si).`,icon:`🤝`,source:`builtin`,svgFile:`cartridges/cst-virtues.svg`,astFile:`cartridges/cst-virtues.ast`,version:`2.6.0`,invariants:[`7 Pillars of CST`,`Imago Dei Human Dignity`,`Laudato Si Care for Creation`]},{id:`latin-mass-prayers`,type:`Sim`,title:`Latin Prayers & Gregorian Chant (Vox Ecclesiae)`,stage:`CATHOLIC LIFE`,category:`Catholic Faith`,desc:`The ancient mother tongue and sacred music of the Western Church: Pater Noster, Ave Maria, Sanctus, Agnus Dei, and 4-line Gregorian square neume notation.`,icon:`📜`,source:`builtin`,svgFile:`cartridges/latin-mass-prayers.svg`,astFile:`cartridges/latin-mass-prayers.ast`,version:`2.6.0`,invariants:[`Pater Noster & Ave Maria`,`4-Line Gregorian Neume Notation`,`Latin Universal Liturgical Heritage`]},{id:`nicene-creed`,type:`Sim`,title:`The Nicene & Apostles' Creed (Credo in Deum)`,stage:`CATHOLIC LIFE`,category:`Catholic Faith`,desc:`The foundational profession of apostolic faith: The Father & Creation, The Son & Redemption, The Holy Spirit & The Church, and the Four Marks of the Church.`,icon:`✝️`,source:`builtin`,svgFile:`cartridges/nicene-creed.svg`,astFile:`cartridges/nicene-creed.ast`,version:`2.6.0`,invariants:[`Trinitarian Creed Structure`,`Four Marks of Church`,`Incarnation & Resurrection`]},{id:`ten-commandments`,type:`Sim`,title:`The Ten Commandments (The Decalogue & Mt Sinai)`,stage:`CATHOLIC LIFE`,category:`Catholic Faith`,desc:`The moral law of God given on Mount Sinai: Tablet I (Love of God, Commandments 1-3) and Tablet II (Love of Neighbour, Commandments 4-10) fulfilled in Christ.`,icon:`📜`,source:`builtin`,svgFile:`cartridges/ten-commandments.svg`,astFile:`cartridges/ten-commandments.ast`,version:`2.6.0`,invariants:[`Two Tablets of Sinai`,`Decalogue Categorization`,`Two Great Commandments of Love`]},{id:`order-of-the-mass`,type:`Sim`,title:`The Order of the Holy Mass (Ordo Missae)`,stage:`CATHOLIC LIFE`,category:`Catholic Faith`,desc:`The sacred liturgy through 4 movements: Introductory Rites, Liturgy of the Word, Liturgy of the Eucharist (Transubstantiation & Elevation), and Concluding Rites.`,icon:`🍷`,source:`builtin`,svgFile:`cartridges/order-of-the-mass.svg`,astFile:`cartridges/order-of-the-mass.ast`,version:`2.6.0`,invariants:[`4 Movements of the Mass`,`Consecration & Elevation`,`Real Presence in Tabernacle`]},{id:`sacred-objects`,type:`Sim`,title:`Sacred Vessels, Linens & Vestments`,stage:`CATHOLIC LIFE`,category:`Catholic Faith`,desc:`Interactive examination of sacred vessels (Chalice, Paten, Ciborium), linens (Corporal, Purificator, Pall), and priestly vestments.`,icon:`🏺`,source:`builtin`,svgFile:`cartridges/sacred-objects.svg`,astFile:`cartridges/sacred-objects.ast`,version:`2.6.0`,invariants:[`Vessels of Gold Reverence`,`Corporal Particle Protection`,`Alb Baptismal Innocence`]},{id:`first-communion`,type:`Sim`,title:`First Holy Communion & Eucharistic Adoration`,stage:`CATHOLIC LIFE`,category:`Catholic Faith`,desc:`Preparation steps for receiving Jesus: First Confession, Eucharistic Fast, Reverent Reception with Amen, and Thanksgiving before the Monstrance.`,icon:`🍞`,source:`builtin`,svgFile:`cartridges/first-communion.svg`,astFile:`cartridges/first-communion.ast`,version:`2.6.0`,invariants:[`Amen Real Presence Oath`,`1-Hour Eucharistic Fast`,`Reverent Reception Posture`]},{id:`eucharistic-procession-film`,type:`Film`,video:`/media/eucharistic-procession.mp4`,videoFit:`contain`,title:`Solemn Eucharistic Procession (Educational Film & Vector HUD)`,stage:`CATHOLIC LIFE`,category:`Catholic Faith`,desc:`Synchronized liturgical film driving: Blessed Sacrament canopy, thurible incensation streams, Tantum Ergo hymns, and humeral veil blessing with interactive vector checkpoints.`,icon:`🎬`,source:`builtin`,svgFile:`cartridges/eucharistic-procession-film.svg`,astFile:`cartridges/eucharistic-procession-film.ast`,version:`2.6.0`,invariants:[`Film Synchronized Timeline`,`Sub-Frame Scrubbing`,`Over-Film Stylus Whiteboard`,`Checkpoints Pause Film`]},{id:`water-cycle`,type:`Slide`,title:`Water Cycle: Continuous Earth Cycle`,stage:`KS2 GEOGRAPHY`,category:`Geography & Science`,desc:`Solar evaporation, condensation cloud formation, precipitation, and groundwater runoff loop.`,icon:`💧`,source:`builtin`,svgFile:`cartridges/water-cycle.svg`,astFile:`cartridges/water-cycle.ast`,version:`2.6.0`,invariants:[`Hydrological Mass Conservation`,`Phase Change Thermodynamics`]},{id:`languages`,type:`App`,title:`MFL & Polyglot Studio: Spanish, French & Latin`,stage:`KS2/KS3 MFL`,category:`Modern & Classical Languages`,desc:`Spanish, French & Latin phonics soundboard, regular verb conjugation wheels, and vocabulary recall sprints.`,icon:`🌍`,source:`builtin`,svgFile:`cartridges/languages.svg`,astFile:`cartridges/languages.ast`,version:`2.6.0`,invariants:[`Grammar Agreement`,`Phoneme Articulation`,`Vocabulary Association`]},{id:`shakespeare`,type:`Slide`,title:`The Globe Theatre: Shakespeare & Iambic Pentameter`,stage:`KS3/KS4 ENGLISH LITERATURE`,category:`English Literature`,desc:`Wooden O 3D stage geometry, rhythm meter visualizer for unstressed/stressed beats, and Elizabethan theatrical staging.`,icon:`🎭`,source:`builtin`,svgFile:`cartridges/shakespeare.svg`,astFile:`cartridges/shakespeare.ast`,version:`2.6.0`,invariants:[`Iambic Pentameter Metre`,`Elizabethan Theatrical Proportions`]},{id:`bsl-fingerspelling`,type:`Sim`,title:`BSL: 3D British Sign Language Two-Handed Fingerspelling`,stage:`ACCESSIBILITY & LANGUAGES`,category:`Modern & Classical Languages`,desc:`3D rotatable two-handed BSL manual alphabet rig, A-E-I-O-U vowel fingertip tap positions, Signer POV vs Receiver POV camera orbit, and speed slider.`,icon:`🖐️`,source:`builtin`,svgFile:`cartridges/bsl-fingerspelling.svg`,astFile:`cartridges/bsl-fingerspelling.ast`,version:`2.6.0`,invariants:[`BSL Manual Alphabet`,`Two-Handed Signing Anatomy`,`3D Spatial Orientation`]},{id:`phonics-screening`,type:`Sim`,title:`Year 1 Phonics Screening Check & Alien Words`,stage:`EYFS/KS1 PHONICS`,category:`Early Literacy & Phonics`,desc:`Official statutory 40-word screening check simulator with monster alien cards, tactile sound button dots & dashes, animated sweep bar, and pass diagnostics.`,icon:`👾`,source:`builtin`,svgFile:`cartridges/phonics-screening.svg`,astFile:`cartridges/phonics-screening.ast`,version:`2.6.0`,invariants:[`DfE Statutory Screening Check`,`Pseudo-Word Phonetic Decoding`,`Sound Buttons`]},{id:`shakespeare-macbeth`,type:`Slide`,title:`Macbeth: 5-Act Dramatic Soliloquy & Moral Fall`,stage:`KS3/KS4 ENGLISH LITERATURE`,category:`English Literature`,desc:`5-Act play-through on the 1599 Globe stage: blasted heath prophecy, floating bloody dagger, Banquo ghost feast, and Dunsinane catastrophe.`,icon:`👑`,source:`builtin`,svgFile:`cartridges/shakespeare-macbeth.svg`,astFile:`cartridges/shakespeare-macbeth.ast`,version:`2.6.0`,invariants:[`Shakespearean Tragedy`,`Iambic Pentameter Blank Verse`,`Canon vs What-If Drama`]},{id:`rosary-mysteries`,type:`Sim`,title:`The Holy Rosary: 3D Beads & 20 Scriptural Mysteries`,stage:`CATHOLIC LIFE`,category:`Catholic Faith`,desc:`Contemplative 3D chaplet ring with Our Father and Hail Mary beads, depth-fog lighting, 4 mystery cycles (Joyful, Luminous, Sorrowful, Glorious), and Latin prayers.`,icon:`📿`,source:`builtin`,svgFile:`cartridges/rosary-mysteries.svg`,astFile:`cartridges/rosary-mysteries.ast`,version:`2.6.0`,invariants:[`Scriptural Contemplation`,`Marian Devotion`,`Ecclesiastical Latin Prayers`]},{id:`bbc-model-b`,type:`Sim`,title:`BBC Micro Model B: 6502 Computing & BBC BASIC`,stage:`KS2 & KS3 COMPUTING`,category:`Computing`,desc:`The iconic 1981 Acorn BBC Microcomputer Model B with 2 MHz MOS 6502 CPU, 32KB RAM, Teletext SAA5050 MODE 7 graphics, and BBC BASIC.`,icon:`💻`,source:`builtin`,duration:16,oakId:`OAK-KS2-COM-012`,oakUnit:`ks2-computing-history-algorithms-bbc-micro`,mount:`/curriculum/computing/history/bbc-model-b`,section:`Computing & Algorithmic Thinking`,svgFile:`cartridges/bbc-model-b.svg`,astFile:`cartridges/bbc-model-b.ast`,version:`2.6.0`,invariants:[`MOS 6502 Instruction Timing`,`BBC BASIC Line Number Ordering`,`Teletext SAA5050 40x25 Character Grid`]},...re.map(e=>({id:e.id,type:`Data`,title:e.title,stage:e.stage,subject:e.subject,oakId:e.oakId,oakUnit:e.oakUnit,category:e.category,desc:e.desc,icon:e.icon,source:`builtin`,svgMarkup:e.svgMarkup,astSource:e.astSource,dataPayload:e.dataPayload,isCore:!0,tier:`core`,version:`2.6.0`,invariants:[`Modular Decentralized Data Cartridge`,`Zero LLM Heap Overhead`,`Sub-1ms Retrieval`]}))],H=null,U=!1,W=null;async function G(){if(!U)return W||(W=(async()=>{try{let e=await t(),r=[];if(typeof window<`u`)try{let e=localStorage.getItem(V);e&&(r=JSON.parse(e))}catch{}let i=new Map;e.forEach(e=>i.set(e.id,e));for(let e of r)i.has(e.id)||(i.set(e.id,e),await n(e));for(let[e,t]of Object.entries(B)){let r=i.get(e);if(!r||!r.svgMarkup||!r.astSource){let a=e.includes(`church`)||e.includes(`rites`),o=e===`church-tour`?`Tour of a Catholic Church: Sacred Architecture & Sacred Spaces`:e===`catholic-rites`?`The 24 Catholic Rites & Churches: Unity in Diversity Across East & West`:e.charAt(0).toUpperCase()+e.slice(1),s={...r||{},id:e,title:r?.title||o,stage:r?.stage||(a?`CATHOLIC LIFE`:`CURRICULUM`),category:r?.category||(a?`Catholic Faith`:`STEM`),desc:r?.desc||`Pre-expanded offline core vector simulation.`,icon:r?.icon||(e.includes(`church`)?`⛪`:e.includes(`rites`)?`🌍`:`📐`),source:`builtin`,svgMarkup:t.svg,astSource:t.ast,updatedAt:Date.now()};i.set(e,s),await n(s)}}if(H=Array.from(i.values()),typeof window<`u`){let e=window;if(e.ASTSceneRegistry&&typeof e.ASTSceneRegistry.register==`function`)for(let t of H)t.svgMarkup&&t.astSource&&e.ASTSceneRegistry.register(t.id,{id:t.id,title:t.title,stage:t.stage,svgMarkup:t.svgMarkup,astSource:t.astSource})}U=!0}catch(e){console.warn(`[cartridgeStore] Failed to initialize cartridge vault:`,e)}})(),W)}typeof window<`u`&&G().catch(()=>{});function K(){if(typeof window>`u`)return[];if(H!==null)return H;U||G().catch(()=>{});try{let e=localStorage.getItem(V);if(!e)return[];let t=JSON.parse(e),n=Array.isArray(t)?t:[];return H=n,n}catch(e){return console.warn(`[cartridgeStore] Failed to read custom cartridges:`,e),[]}}function q(e){if(!e||typeof e!=`string`)return``;let t=e.toLowerCase().trim().replace(/^(demo-|scene-|preset-)/,``).replace(/\.(ast|svg|json|html|phet)$/,``);if(ie[t])return ie[t];let n=O.find(e=>e.oakId&&e.oakId.toLowerCase()===t||e.oakUnit&&e.oakUnit.toLowerCase()===t);return n?n.id:t}function J(){let e=K(),t=new Map;e.forEach(e=>t.set(e.id,e));let n=[],r=new Set;e.forEach(e=>{let t=e.isCore??e.source===`builtin`,i=e.tier||(e.source===`builtin`?`core`:e.source);n.push({...e,isCore:t,tier:i,mount:e.mount||Y(e.id),section:e.section||X(e.id,e.category)}),r.add(e.id)});let i=new Map(O.map(e=>[e.id,e]));return ae.forEach(e=>{if(!r.has(e.id)){let t=i.get(e.id);n.push({...e,oakId:e.oakId||t?.oakId,oakUnit:e.oakUnit||t?.oakUnit,subject:e.subject||t?.subject,isCore:!0,tier:`core`,mount:e.mount||t?.mount||Y(e.id),section:e.section||t?.section||X(e.id,e.category)}),r.add(e.id)}}),O.forEach(e=>{r.has(e.id)||(n.push({id:e.id,title:e.label,stage:e.stage,oakId:e.oakId,oakUnit:e.oakUnit,subject:e.subject,type:e.type,category:e.subject||`General Curriculum`,desc:`Oak National Curriculum aligned cartridge: ${e.oakId||e.stage}.`,icon:e.type===`Sim`?`🎮`:e.type===`Slide`?`📑`:`💻`,source:`builtin`,svgFile:`cartridges/${e.id}.svg`,astFile:`cartridges/${e.id}.ast`,isCore:e.isCore??!0,tier:e.tier||`core`,mount:e.mount||Y(e.id),section:e.section||X(e.id)}),r.add(e.id))}),n}function Y(e){return{pythagoras:`/curriculum/maths/geometry/pythagoras`,"kinetic-gas":`/curriculum/science/physics/kinetic-gas`,"electric-circuits":`/curriculum/science/physics/electric-circuits`,"church-tour":`/curriculum/catholic-life/church-tour`,"altar-anatomy":`/curriculum/catholic-life/altar-anatomy`,"stations-of-the-cross":`/curriculum/catholic-life/stations-of-the-cross`,"holy-oils":`/curriculum/catholic-life/holy-oils`,"rosary-mysteries":`/curriculum/catholic-life/rosary-mysteries`,"phonics-lab":`/curriculum/english/phonics/phonics-lab`,"phonics-screening":`/curriculum/english/phonics/screening-check`,"spelling-bee":`/curriculum/english/spelling/spelling-bee`,shakespeare:`/curriculum/english/theatre/globe`,"shakespeare-macbeth":`/curriculum/english/theatre/macbeth`,languages:`/curriculum/languages/mfl-polyglot`,"bsl-fingerspelling":`/curriculum/languages/bsl-fingerspelling`,bodmas:`/curriculum/maths/algebra/bodmas`,"times-tables":`/curriculum/maths/arithmetic/times-tables`,"math-fishing":`/curriculum/maths/arithmetic/number-bonds`,fractions:`/curriculum/maths/arithmetic/fractions`,"calculus-curves":`/curriculum/maths/calculus/tangent-slopes`,"algebra-balance":`/curriculum/maths/algebra/balance-scale`,atom:`/curriculum/science/chemistry/atomic-structure`,photosynthesis:`/curriculum/science/biology/photosynthesis`,"dna-helix":`/curriculum/science/biology/dna-helix`,"solar-system":`/curriculum/science/physics/solar-system`,velocity:`/curriculum/science/physics/velocity-vectors`,"water-cycle":`/curriculum/geography/water-cycle`,"mountain-elevation":`/curriculum/geography/mountain-elevation`,"fish-tank":`/curriculum/computing/stress-benchmark`,"bbc-model-b":`/curriculum/computing/history/bbc-model-b`}[e]||`/curriculum/${e}`}function X(e,t){return e.includes(`bbc`)||e.includes(`fish-tank`)||t===`Computing`?`Computing & Algorithmic Thinking`:e.includes(`church`)||e.includes(`altar`)||e.includes(`holy`)||e.includes(`rosary`)||t===`Catholic Faith`?`Catholic Life & Faith Formation`:e.includes(`math`)||e.includes(`pythagoras`)||e.includes(`algebra`)||e.includes(`calculus`)||e.includes(`fractions`)||e.includes(`bodmas`)||e.includes(`times`)||t===`Mathematics`?`Mathematics & Geometry`:e.includes(`gas`)||e.includes(`circuit`)||e.includes(`atom`)||e.includes(`photo`)||e.includes(`dna`)||e.includes(`solar`)||e.includes(`velocity`)||t===`Science`?`Natural Sciences & Physics`:e.includes(`phonics`)||e.includes(`spelling`)||e.includes(`shakespeare`)||t===`English Literature`?`English Literature & Phonics`:e.includes(`language`)||e.includes(`bsl`)||t===`Modern & Classical Languages`?`Languages & Inclusion`:`Curriculum Cartridges`}function oe(e){if(!e)return null;let t=e.toLowerCase().trim().replace(/\/+$/,``),n=J().find(e=>e.mount&&e.mount.toLowerCase().replace(/\/+$/,``)===t);if(n)return n;let r=t.split(`/`).filter(Boolean),i=r[r.length-1];if(i){let e=Z(i);if(e)return e}return null}function se(){let e=J(),t=new Map;return e.forEach(e=>{let n=e.section||X(e.id,e.category);if(!t.has(n)){let e=`📚`;n.includes(`Catholic`)?e=`⛪`:n.includes(`Mathematics`)?e=`📐`:n.includes(`Sciences`)?e=`🔬`:n.includes(`English`)?e=`🎭`:n.includes(`Languages`)&&(e=`🌍`),t.set(n,{section:n,icon:e,cartridges:[]})}t.get(n).cartridges.push(e)}),Array.from(t.values())}function Z(e){if(!e)return null;let t=q(e),n=J().find(n=>n.id===t||n.id===e||n.oakId&&n.oakId.toLowerCase()===e.toLowerCase()||n.oakUnit&&n.oakUnit.toLowerCase()===e.toLowerCase());if(n)return!n.svgMarkup&&B[t]&&(n.svgMarkup=B[t].svg,n.astSource=B[t].ast),n;if(B[t])return{id:t,title:t.charAt(0).toUpperCase()+t.slice(1),stage:`CURRICULUM`,category:`STEM`,desc:`Built-in curriculum vector simulation.`,icon:`📐`,source:`builtin`,svgMarkup:B[t].svg,astSource:B[t].ast};if(t&&/^[a-z0-9_-]+$/i.test(t)){let e=t.replace(/[-_]/g,` `).replace(/\b\w/g,e=>e.toUpperCase());return{id:t,title:e,stage:`CURRICULUM`,category:`STEM`,desc:`Interactive curriculum vector laboratory cartridge for ${e}.`,icon:`⚡`,source:`builtin`,svgFile:`cartridges/${t}.svg`,astFile:`cartridges/${t}.ast`,version:`2.6.0`}}return null}function Q(){return J().filter(e=>e.type===`Data`)}function ce(e){if(!e)return;let t=Z(e);if(t&&t.type===`Data`)return t;let n=e.toLowerCase().trim();return Q().find(e=>e.id.toLowerCase()===n||e.oakUnit&&e.oakUnit.toLowerCase()===n||e.dataPayload?.unit&&e.dataPayload.unit.toLowerCase()===n||e.title.toLowerCase().includes(n))}function le(e,t,n){if(!n&&!t)return;let r=(n||``).toLowerCase().trim(),i=(t||``).toLowerCase().trim(),a=Q(),o=a.find(t=>{let n=(t.dataPayload?.unit||t.oakUnit||``).toLowerCase(),i=t.title.toLowerCase();if(!(n===r||n.includes(r)||r.includes(n)||i.includes(r)))return!1;if(e&&t.stage&&t.stage.toLowerCase()!==e.toLowerCase()){let n=t.stage.match(/ks\s*([1-4])/i),r=e.match(/ks\s*([1-4])/i);if(n&&r&&n[1]!==r[1])return!1}return!0});if(o)return o;let s=new Set([`and`,`&`,`the`,`of`,`in`,`for`,`with`,`a`,`an`]),c=r.split(/[^a-z0-9]+/).filter(e=>e.length>=3&&!s.has(e));if(c.length>0){let e=a.find(e=>{let t=`${e.title} ${e.oakUnit||``} ${e.dataPayload?.unit||``} ${e.id}`.toLowerCase();return c.filter(e=>t.includes(e)).length>=Math.min(1,c.length)});if(e)return e}if(i)return a.find(e=>{let t=(e.subject||e.dataPayload?.subject||``).toLowerCase();return t===i||t.includes(i)||i.includes(t)})}function ue(e){let t=ce(e);return t?t.astSource?t.astSource:t.dataPayload?o(t.dataPayload,t.id,t.title):null:null}function $(e){if(typeof window>`u`)return;let t=K().filter(t=>t.id!==e.id),r={...e,updatedAt:Date.now()},i=[r,...t];H=i,n(r).catch(e=>{console.warn(`[cartridgeStore] IndexedDB vault save error:`,e)});try{localStorage.setItem(V,JSON.stringify(i))}catch{}let a=window;a.ASTSceneRegistry&&typeof a.ASTSceneRegistry.register==`function`&&a.ASTSceneRegistry.register(e.id,{id:e.id,title:e.title,stage:e.stage,svgMarkup:e.svgMarkup,astSource:e.astSource}),window.dispatchEvent(new Event(`cartridges_updated`)),window.dispatchEvent(new Event(`storage`))}function de(e){if(typeof window>`u`)return;let t=q(e),n=K().filter(n=>n.id!==t&&n.id!==e);H=n,i(t).catch(e=>{console.warn(`[cartridgeStore] IndexedDB vault delete error:`,e)});try{localStorage.setItem(V,JSON.stringify(n))}catch(e){console.error(`[cartridgeStore] Failed to delete cartridge from localStorage:`,e)}window.dispatchEvent(new Event(`cartridges_updated`)),window.dispatchEvent(new Event(`storage`))}async function fe(e){let t=await te(e);return $(t),t}async function pe(e){let t=Z(e);if(!t)throw Error(`Cartridge [${e}] not found in store`);return{cartridge:t,...await D(t)}}async function me(){let e=await r(),t=H?H.length:0;return{isInitialized:U,vaultCount:e,memoryCount:t}}async function he(e){let t=e.name.toLowerCase();if(t.endsWith(`.swf`)){let t=await e.arrayBuffer(),n=e.name.replace(/\.swf$/i,``).replace(/[^a-z0-9_-]/gi,`-`).toLowerCase(),r=await C(t,n);if(!r.success)throw Error(r.error||`Failed to transpile legacy Flash SWF file.`);let i={id:n,title:`Flash: ${n.replace(/[-_]/g,` `).replace(/\b\w/g,e=>e.toUpperCase())}`,stage:`FLASH TRANSLATED`,category:`Imported Flash`,desc:`Transpiled from legacy Adobe Flash SWF with 60 FPS deterministic vector recreation.`,icon:`⚡`,source:`imported`,svgMarkup:r.svgMarkup,astSource:r.astSource,author:`Flash Archive`,version:`Flash v${r.metadata?.version||9}`,invariants:[`Legacy Vector Timeline`,`ActionScript Translation`],createdAt:Date.now(),updatedAt:Date.now()};return $(i),i}let n=await e.text();if(u(n)||t.endsWith(`.phet`)||t.includes(`phet`)){let t=await h(n,e.name);if(!t.success)throw Error(t.error||`Failed to transpile PhET simulation.`);let r=(t.metadata?.simName||e.name).replace(/\.(html|json|phet)$/i,``).replace(/[^a-z0-9_-]/gi,`-`).toLowerCase(),i={id:r,title:t.metadata?.title||`PhET: ${r}`,stage:`PhET INTERACTIVE APPARATUS`,category:`Science`,desc:`Distilled from ${((t.metadata?.originalSizeBytes||1e6)/1024/1024).toFixed(1)} MB PhET bundle down to clean AST vector physics with zero cloud leakage.`,icon:`🧪`,source:`phet`,svgMarkup:t.svgMarkup,astSource:t.astSource,author:`University of Colorado Boulder (PhET)`,version:t.metadata?.version||`1.0.0`,invariants:t.metadata?.detectedInvariants||[`Physical Conservation Law`],createdAt:Date.now(),updatedAt:Date.now()};return $(i),i}if(t.endsWith(`.json`))try{let e=JSON.parse(n);if(e&&e.id&&(e.svgMarkup||e.astSource||e.dataPayload||Array.isArray(e.questions))){let t=e.type===`Data`||!!e.dataPayload||Array.isArray(e.questions),r=e.dataPayload||(Array.isArray(e.questions)?s(n):void 0),i=t?`Data`:e.type||`Sim`,a=r?.questions?.length||0,c=t?`<svg viewBox="0 0 800 480" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="data-imported-json" cx="50%" cy="40%" r="65%"><stop offset="0%" stop-color="#1e293b"/><stop offset="100%" stop-color="#090d16"/></radialGradient></defs><rect width="800" height="480" fill="url(#data-imported-json)" rx="16"/><rect x="40" y="40" width="720" height="400" rx="12" fill="#0f172a" fill-opacity="0.85" stroke="#0284c7" stroke-width="2" stroke-dasharray="6,4"/><circle cx="400" cy="140" r="50" fill="#0284c7" fill-opacity="0.2" stroke="#38bdf8" stroke-width="3"/><text x="400" y="156" font-size="42" text-anchor="middle">📊</text><text x="400" y="235" fill="#f8fafc" font-size="22" font-weight="900" text-anchor="middle">${e.title||e.id}</text><text x="400" y="270" fill="#38bdf8" font-size="13" font-weight="800" text-anchor="middle" letter-spacing="2">${(e.stage||`CURRICULUM`).toUpperCase()} • ${(e.subject||`DATA DECK`).toUpperCase()}</text><rect x="260" y="300" width="280" height="38" rx="19" fill="#0284c7"/><text x="400" y="324" fill="#ffffff" font-size="13" font-weight="900" text-anchor="middle" letter-spacing="1">📊 ${a} DIAGNOSTIC QUESTIONS</text><text x="400" y="375" fill="#94a3b8" font-size="12" font-weight="600" text-anchor="middle">⚡ Zero-Latency Modular Data Deck • Mounts Instantly in Practice Lab</text></svg>`:``,l={id:e.id,title:e.title||e.id,stage:e.stage||(t?`CURRICULUM DECK`:`CUSTOM CARTRIDGE`),subject:e.subject||r?.subject,category:e.category||(t?r?.subject||`Curriculum Data`:`General`),type:i,dataPayload:r||void 0,desc:e.desc||(t?`Decentralized question bank with ${a} questions.`:`Imported decentralized cartridge package.`),icon:e.icon||(t?`📊`:`📦`),source:e.source||`user`,svgMarkup:e.svgMarkup||c,astSource:e.astSource||(t&&r?o(r,e.id,e.title||e.id):``),author:e.author||`Educator`,version:e.version||`1.0.0`,invariants:e.invariants||(t?[`Modular Decentralized Data Cartridge`,`Zero LLM Heap Overhead`]:[]),createdAt:Date.now(),updatedAt:Date.now()};return $(l),l}}catch{}if(t.endsWith(`.svg`)||t.endsWith(`.ast.svg`)){let t=n.match(/<title[^>]*>([^<]+)<\/title>/i),r=n.match(/<metadata[^>]*data-ast=["']([\s\S]*?)["']/i)||n.match(/\(:scene[\s\S]*?\)/)||n.match(/\(:cartridge[\s\S]*?\)/),i=e.name.replace(/\.(ast\.)?svg$/i,``).replace(/[^a-z0-9_-]/gi,`-`).toLowerCase(),a=r?r[1]?decodeURIComponent(r[1]):r[0]:``,o=a.includes(`:type :data`)||a.includes(`:type "Data"`)||a.includes(`:questions`),c=o?s(a):void 0,l={id:i,title:t?t[1]:i,stage:`VECTOR CAPSULE`,type:o?`Data`:`Sim`,dataPayload:c||void 0,category:o?c?.subject||`Curriculum Data`:`Mathematics`,desc:o?`Imported living data capsule (${c?.questions.length||0} questions).`:`Imported living vector cartridge capsule.`,icon:o?`📊`:`🎨`,source:`imported`,svgMarkup:n,astSource:a||`(:scene :id "${i}" :title "${i}")`,createdAt:Date.now(),updatedAt:Date.now()};return $(l),l}if(t.endsWith(`.ast`)||n.trim().startsWith(`(:scene`)||n.trim().startsWith(`(:cartridge`)||n.trim().startsWith(`(`)){let t=e.name.replace(/\.ast$/i,``).replace(/[^a-z0-9_-]/gi,`-`).toLowerCase(),r=n.match(/:title\s+"([^"]+)"/i),i=n.match(/:stage\s+"([^"]+)"/i),a=n.match(/:subject\s+"([^"]+)"/i),o=n.match(/:type\s+("Sim"|"Slide"|"App"|"Film"|"Data"|:data|:sim|:slide|:app|:film)/i),c=n.match(/:video\s+"([^"]+)"/i)||n.match(/:film\s+"([^"]+)"/i),l=n.match(/:video-?fit\s+"([^"]+)"/i),u=o&&/data/i.test(o[1])||n.includes(`:questions`)||n.includes(`:type :data`),d=u?`Data`:o?.[1]||(c?`Film`:`Sim`),f=u?s(n):void 0,p=f?.questions?.length||0,m={id:t,title:r?r[1]:t,stage:i?i[1]:f?.stage||`CURRICULUM`,subject:a?a[1]:f?.subject,type:d,dataPayload:f||void 0,video:c?c[1]:void 0,videoFit:l?l[1]:`contain`,category:d===`Film`?`Educational Film`:u?f?.subject||`Curriculum Data`:`Mathematics`,desc:d===`Film`?`Synchronized educational film with interactive vector stage overlays.`:u?`Decentralized question bank cartridge with ${p} curriculum questions.`:`Imported declarative AST vector logic cartridge.`,icon:d===`Film`?`🎬`:u?`📊`:`📜`,source:`imported`,svgMarkup:u?`<svg viewBox="0 0 800 480" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="data-imported-ast" cx="50%" cy="40%" r="65%"><stop offset="0%" stop-color="#1e293b"/><stop offset="100%" stop-color="#090d16"/></radialGradient></defs><rect width="800" height="480" fill="url(#data-imported-ast)" rx="16"/><rect x="40" y="40" width="720" height="400" rx="12" fill="#0f172a" fill-opacity="0.85" stroke="#0284c7" stroke-width="2" stroke-dasharray="6,4"/><circle cx="400" cy="140" r="50" fill="#0284c7" fill-opacity="0.2" stroke="#38bdf8" stroke-width="3"/><text x="400" y="156" font-size="42" text-anchor="middle">📊</text><text x="400" y="235" fill="#f8fafc" font-size="22" font-weight="900" text-anchor="middle">${r?r[1]:t}</text><text x="400" y="270" fill="#38bdf8" font-size="13" font-weight="800" text-anchor="middle" letter-spacing="2">${(i?i[1]:f?.stage||`CURRICULUM`).toUpperCase()} • ${(a?a[1]:f?.subject||`DATA DECK`).toUpperCase()}</text><rect x="260" y="300" width="280" height="38" rx="19" fill="#0284c7"/><text x="400" y="324" fill="#ffffff" font-size="13" font-weight="900" text-anchor="middle" letter-spacing="1">📊 ${p} DIAGNOSTIC QUESTIONS</text><text x="400" y="375" fill="#94a3b8" font-size="12" font-weight="600" text-anchor="middle">⚡ Zero-Latency Modular Data Deck • Mounts Instantly in Practice Lab</text></svg>`:`<svg viewBox="0 0 800 480" xmlns="http://www.w3.org/2000/svg"><rect width="800" height="480" fill="#090d16" fill-opacity="${d===`Film`?`0`:`1`}"/><text x="400" y="240" fill="#38bdf8" font-size="20" font-weight="800" text-anchor="middle">${t}</text></svg>`,astSource:n,createdAt:Date.now(),updatedAt:Date.now()};return $(m),m}throw Error(`Unsupported cartridge file format: ${e.name}. Expected .html (PhET), .swf, .json, .ast, or .svg.`)}function ge(e){let t=e.title.toLowerCase().replace(/[^a-z0-9_-]+/g,`-`).replace(/^-|-$/g,``)||`cartridge-${Date.now().toString(36)}`,n=e.type===`Data`||!!e.dataPayload,r=n?`Data`:e.type||`Sim`,i=n?`<svg viewBox="0 0 800 480" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="data-custom" cx="50%" cy="40%" r="65%"><stop offset="0%" stop-color="#1e293b"/><stop offset="100%" stop-color="#090d16"/></radialGradient></defs><rect width="800" height="480" fill="url(#data-custom)" rx="16"/><text x="400" y="220" fill="#38bdf8" font-size="24" font-weight="900" text-anchor="middle">${e.title}</text><text x="400" y="260" fill="#f8fafc" font-size="14" font-weight="700" text-anchor="middle">📊 ${e.dataPayload?.questions.length||0} QUESTIONS</text></svg>`:`<svg viewBox="0 0 800 480" xmlns="http://www.w3.org/2000/svg">
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
</svg>`,a=n&&e.dataPayload?o(e.dataPayload,t,e.title):`(:scene :id "${t}" :title "${e.title}" :stage "${e.stage}" :duration 12.0
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
)`,s={id:t,title:e.title,stage:e.stage||`CUSTOM APPARATUS`,category:e.category||(n?`Curriculum Data`:`General`),type:r,dataPayload:e.dataPayload,desc:e.desc||(n?`Custom authored decentralized question bank cartridge.`:`Custom authored decentralized vector cartridge.`),icon:e.icon||(n?`📊`:`📐`),source:`user`,svgMarkup:e.svgMarkup||i,astSource:e.astSource||a,author:`Classroom Educator`,version:`1.0.0`,createdAt:Date.now(),updatedAt:Date.now()};return $(s),s}export{h as S,$ as _,ue as a,C as b,Z as c,ce as d,Q as f,q as g,G as h,pe as i,oe as l,he as m,de as n,le as o,me as p,fe as r,J as s,ge as t,se as u,B as v,f as x,O as y};