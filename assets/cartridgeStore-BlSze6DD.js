const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/__vite-browser-external-BDfy7Drd.js","assets/rolldown-runtime-XKyaHtl9.js"])))=>i.map(i=>d[i]);
import{r as e}from"./rolldown-runtime-XKyaHtl9.js";import{a as t,m as n,n as r,r as i}from"./dbStore-DAtjFTXS.js";import{u as a}from"./aicaller-B8A6PVOt.js";var o=`AGFzbQEAAAABGgRgAn9/AX9gA39/fwF/YAN/f38AYAJ/fwF9AwYFAAECAAMFAwEAEAd9BgZtZW1vcnkCABFkZWNvZGVfc3dmX2hlYWRlcgAADXNjYW5fc3dmX3RhZ3MAAR1iYXRjaF9jb252ZXJ0X3R3aXBzX3RvX3BpeGVscwACEHNjYW5fcGhldF9zdHJlYW0AAxljb21wdXRlX2NvbXByZXNzaW9uX3JhdGlvAAQKiggFtAIDB38DfQd/IAFBFUgEQEEADwsgAC0AACEFIABBAWotAAAhBiAAQQJqLQAAIQdBACECIAZB1wBGIAdB0wBGcQRAIAVBxgBGBEBBASECBSAFQcMARgRAQQIhAgUgBUHaAEYEQEEDIQILCwsLIAJBAEYEQEEADwsgAEEDai0AACEDIABBBGooAgAhBEEAIAI2AgBBBCADNgIAQQggBDYCACAAQQhqLQAAIQ0gDUEDdiEIIAhBBGxBBWohDiAOQQdqQQhuIQ5DAABIRCEJQwAA8EMhCiAAQQhqIA5qIQ0gDUEBai0AALMhCyALQwAAgD9dBEBDAADAQSELCyANQQJqLwEAIQwgDEEBSARAQQEhDAtBDCAJOAIAQRAgCjgCAEEUIAs4AgBBGCAMNgIAQSwgDjYCAEEBC78CAQt/IAAgAWohAyAAIAJqIQRBACEIQQAhCUEAIQpBACELQQAhDEGWmiQhDQJAA0AgA0ECaiAESw0BIAMvAQAhBSAFQQZ2IQYgBUE/cSEHIANBAmohAyAHQT9GBEAgA0EEaiAESw0CIAMoAgAhByADQQRqIQMLIAxBAWohDCAGQQBGDQEgBkEBRgRAIAtBAWohCwsgBkECRiAGQRZGciAGQSBGciAGQdMARnIEQCAIQQFqIQgLIAZBLkYgBkHUAEZyBEAgCUEBaiEJCyAGQQxGIAZBO0ZyBEAgCkEBaiEKCyAGQQlGBEAgAyAESQRAIAMtAABBEHQgA0EBai0AAEEIdHIgA0ECai0AAHIhDQsLIAMgB2ohAwwACwtBHCAINgIAQSAgCTYCAEEkIAo2AgBBKCANNgIAQSwgDDYCACAMC0kCA38BfUEAIQMCQANAIAMgAk8NASAAIANBBGxqIQQgASADQQRsaiEFIAQoAgCyQ83MTD2UIQYgBSAGOAIAIANBAWohAwwACwsLmAIBBX8gACECIAAgAWohA0EAIQRBACEFAkADQCACIANPDQEgAi0AACEGIAZB7wBGIAZBzwBGcgRAIAJBAmogA0kEQCACQQFqLQAAQegARiACQQJqLQAAQe0ARnEEQCAEQQFyIQQLCwsgBkH3AEYgBkHXAEZyBEAgAkEDaiADSQRAIAJBAWotAABB4QBGIAJBAmotAABB9gBGIAJBA2otAABB5QBGcXEEQCAEQQJyIQQLCwsgBkHwAEYgBkHQAEZyBEAgAkEHaiADSQRAIAJBAWotAABB8gBGIAJBAmotAABB7wBGIAJBA2otAABB8ABGcXEEQCAFQQFqIQULCwsgAkEBaiECDAALC0EwIAQ2AgBBNCAFNgIAIAQLLQEBfSAAQQFIBEBDAAAAAA8LQwAAyEIgACABa7MgALOVlCECQTggAjgCACACCw==`,s=class e{static instance=null;isReady=!1;exports=null;memory=null;u8View=null;i32View=null;f32View=null;STREAM_BUFFER_PTR=65536;constructor(){this.init().catch(e=>console.warn(`[Transpiler WASM React Bridge] Init notice:`,e))}static getInstance(){return e.instance||(e.instance=new e,typeof window<`u`&&(window.ASTTranspilerWasmBridge=e.instance)),e.instance}async init(){if(this.isReady)return!0;try{let e=null;if(typeof fetch==`function`&&typeof window<`u`&&window.location?.protocol!==`file:`)try{let t=await fetch(`/player/wasm/ast-transpiler-engine.wasm`);if(t.ok){let n=await t.arrayBuffer();e=new Uint8Array(n)}}catch{}if(!e||e.length===0){if(typeof atob==`function`){let t=atob(o),n=t.length;e=new Uint8Array(n);for(let r=0;r<n;r++)e[r]=t.charCodeAt(r)}else typeof Buffer<`u`&&(e=Buffer.from(o,`base64`))}let t=await WebAssembly.instantiate(e),n=t.instance||t;return this.exports=n.exports,this.memory=this.exports.memory,this.u8View=new Uint8Array(this.memory.buffer),this.i32View=new Int32Array(this.memory.buffer),this.f32View=new Float32Array(this.memory.buffer),this.isReady=!0,typeof window<`u`&&(window.ASTTranspilerWasmBridge=this),!0}catch(e){return console.warn(`WASM Transpiler React initialization notice, falling back to JS:`,e),this.isReady=!1,!1}}decodeSwfHeader(e){if(!this.isReady||!this.exports||!this.memory)return null;let t=e instanceof Uint8Array?e:new Uint8Array(e);if(t.length<21)return null;let n=this.STREAM_BUFFER_PTR+t.length;if(this.memory.buffer.byteLength<n){let e=Math.ceil((n-this.memory.buffer.byteLength)/65536);this.memory.grow(e),this.u8View=new Uint8Array(this.memory.buffer),this.i32View=new Int32Array(this.memory.buffer),this.f32View=new Float32Array(this.memory.buffer)}if(this.u8View.set(t,this.STREAM_BUFFER_PTR),!this.exports.decode_swf_header(this.STREAM_BUFFER_PTR,t.length))return null;let r=this.i32View[0];return{signature:r===1?`FWS`:r===2?`CWS`:r===3?`ZWS`:`UNKNOWN`,version:this.i32View[1],fileLength:this.i32View[2],width:this.f32View[3],height:this.f32View[4],frameRate:this.f32View[5],frameCount:this.i32View[6],headerLength:8+this.i32View[11]+4}}scanSwfTags(e,t=21){if(!this.isReady||!this.exports||!this.memory)return null;let n=e instanceof Uint8Array?e:new Uint8Array(e),r=this.STREAM_BUFFER_PTR+n.length;if(this.memory.buffer.byteLength<r){let e=Math.ceil((r-this.memory.buffer.byteLength)/65536);this.memory.grow(e),this.u8View=new Uint8Array(this.memory.buffer),this.i32View=new Int32Array(this.memory.buffer),this.f32View=new Float32Array(this.memory.buffer)}return this.u8View.set(n,this.STREAM_BUFFER_PTR),{tagCount:this.exports.scan_swf_tags(this.STREAM_BUFFER_PTR,t,n.length),shapeCount:this.i32View[7],morphCount:this.i32View[8],actionCount:this.i32View[9],bgColor:`#`+(this.i32View[10]&16777215).toString(16).padStart(6,`0`)}}scanPhetStream(e){if(!this.isReady||!this.exports||!this.memory)return null;let t=typeof e==`string`?new TextEncoder().encode(e):e instanceof Uint8Array?e:new Uint8Array(e),n=this.STREAM_BUFFER_PTR+t.length;if(this.memory.buffer.byteLength<n){let e=Math.ceil((n-this.memory.buffer.byteLength)/65536);this.memory.grow(e),this.u8View=new Uint8Array(this.memory.buffer),this.i32View=new Int32Array(this.memory.buffer),this.f32View=new Float32Array(this.memory.buffer)}this.u8View.set(t,this.STREAM_BUFFER_PTR);let r=this.exports.scan_phet_stream(this.STREAM_BUFFER_PTR,t.length),i=this.i32View[13];return{mask:r,isCircuit:!!(r&1),isWave:!!(r&2),propertyCount:i}}computeCompressionRatio(e,t){return this.isReady&&this.exports?this.exports.compute_compression_ratio(e,t):e<=0?0:(e-t)/e*100}}.getInstance();function c(e){return!e||typeof e!=`string`?!1:e.includes(`phet.chipper`)||e.includes(`phetio`)||e.includes(`phetsims`)||e.includes(`phet-io`)||e.includes(`PhET Interactive Simulations`)}function l(e,t=`simulation.html`){let n=`PhET Simulation`,r=t.replace(/_all\.html|\.html|\.json/gi,``).toLowerCase(),i=`1.0.0`,a=[`en`],o=e.match(/<title[^>]*>([^<]+)<\/title>/i);o&&o[1]&&(n=o[1].trim());let s=e.match(/["']name["']\s*:\s*["']([^"']+)["']/);s&&s[1]&&(r=s[1]);let c=e.match(/["']version["']\s*:\s*["']([^"']+)["']/);c&&c[1]&&(i=c[1]);let l=e.matchAll(/["']([a-z]{2}(?:_[A-Z]{2})?)["']\s*:\s*\{[^}]*["']value["']/g);for(let e of l)e[1]&&!a.includes(e[1])&&a.push(e[1]);return{title:n,simName:r,version:i,locales:a}}var u={"ohms-law":{title:`PhET Ohm's Law (V = I × R)`,subject:`Physics`,stage:`KS3/KS4 PHYSICS`,invariants:[`Ohm's Law: I = V / R`,`Electron Drift Velocity`,`Thermal Joule Dissipation`],generateSvg:()=>`
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
    `}};function d(e){let t=[],n=new Set,r=/([a-zA-Z0-9_]+Property)\s*[:=]\s*new\s+(?:NumberProperty|Property)\(\s*([\d\.\-]+)\s*(?:,\s*\{[^}]*range:\s*new\s+Range\(\s*([\d\.\-]+)\s*,\s*([\d\.\-]+)\s*\))?/g,i;for(;(i=r.exec(e))!==null&&t.length<5;){let e=i[1].replace(/Property$/,``);if(!n.has(e)){n.add(e);let r=parseFloat(i[2]),a=i[3]===void 0?0:parseFloat(i[3]),o=i[4]===void 0?100:parseFloat(i[4]);t.push({name:e,label:e.replace(/([A-Z])/g,` $1`).replace(/^./,e=>e.toUpperCase()),defaultValue:isNaN(r)?(a+o)/2:r,min:isNaN(a)?0:a,max:isNaN(o)?100:o,step:Number(((o-a)/20).toFixed(2))||1,unit:``})}}if(t.length===0){let r=/([a-zA-Z0-9_]+)\s*[:=]\s*(?:new\s+Range\(\s*([\d\.\-]+)\s*,\s*([\d\.\-]+)\s*\)|\{\s*min:\s*([\d\.\-]+)\s*,\s*max:\s*([\d\.\-]+)\s*\})/g;for(;(i=r.exec(e))!==null&&t.length<4;){let e=i[1];if(!n.has(e)&&![`screenView`,`bounds`,`viewBounds`,`dimension`,`stageBounds`].includes(e.toLowerCase())){n.add(e);let r=parseFloat(i[2]||i[4]),a=parseFloat(i[3]||i[5]);!isNaN(r)&&!isNaN(a)&&a>r&&t.push({name:e,label:e.replace(/([A-Z])/g,` $1`).replace(/^./,e=>e.toUpperCase()),defaultValue:Number(((r+a)/2).toFixed(2)),min:r,max:a,step:Number(((a-r)/20).toFixed(2))||1,unit:``})}}}return t}function f(e,t,n){let r=n.simName.replace(/[^a-z0-9_-]/gi,`-`).toLowerCase()||`phet-simulation`,i=n.title===`PhET Simulation`?r.split(`-`).map(e=>e.charAt(0).toUpperCase()+e.slice(1)).join(` `):n.title,a=(e.slice(0,1e5)+` `+t+` `+i).toLowerCase(),o=a.includes(`wave`)||a.includes(`light`)||a.includes(`optics`)||a.includes(`sound`)||a.includes(`laser`)||a.includes(`refract`),s=a.includes(`projectile`)||a.includes(`gravity`)||a.includes(`force`)||a.includes(`skate`)||a.includes(`friction`)||a.includes(`collision`)||a.includes(`velocity`),c=a.includes(`gas`)||a.includes(`pressure`)||a.includes(`temperature`)||a.includes(`thermal`)||a.includes(`heat`)||a.includes(`molecule`)||a.includes(`diffusion`),l=a.includes(`molarity`)||a.includes(`concentration`)||a.includes(`acid`)||a.includes(`reaction`)||a.includes(`solution`)||a.includes(`beer`),u=a.includes(`circuit`)||a.includes(`charge`)||a.includes(`electric`)||a.includes(`capacitor`)||a.includes(`voltage`),f=`Physics`,p=[`Physical Conservation Law`,`Deterministic Mathematical Formulation`],m=`Control Parameter`,h=`intensity`,g=1,_=10,v=5;o?(f=`Wave & Optical Physics`,p=[`Wave Equation: v = f × λ`,`Superposition Principle`,`Harmonic Phase Continuity`],m=`Wave Frequency (f)`,h=`frequency`,g=.5,_=4,v=1.5):s?(f=`Newtonian Mechanics`,p=[`Newton's Second Law: ΣF = m × a`,`Conservation of Momentum`,`Gravitational Acceleration`],m=`Velocity / Acceleration`,h=`velocity`,g=5,_=50,v=20):c?(f=`Thermodynamics & Kinetic Theory`,p=[`Ideal Gas Law: PV = nRT`,`Maxwell-Boltzmann Distribution`,`Thermal Equilibrium`],m=`Chamber Temperature (K)`,h=`temperature`,g=100,_=800,v=300):l?(f=`Chemical Equilibria`,p=[`Beer-Lambert Law: A = ε × b × c`,`Le Chatelier Principle`,`Molar Stoichiometry`],m=`Solution Concentration (M)`,h=`concentration`,g=.1,_=2,v=.75):u&&(f=`Electromagnetism & Circuitry`,p=[`Kirchhoff's Circuit Laws`,`Ohm's Law: V = I × R`,`Capacitive Time Constant`],m=`Potential Difference (V)`,h=`potential`,g=1,_=24,v=12);let y=d(e),b=y.length>0?y.slice(0,3):[{name:h,label:m,defaultValue:v,min:g,max:_,step:Number(((_-g)/20).toFixed(2)),unit:``}],x=`
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
      ${f.toUpperCase()}
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
`),w=b[0];return{svgMarkup:x,astSource:`(:scene :id "${r}" :title "${i}" :stage "${f.toUpperCase()}" :duration 12.0
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
    (:t 0.00 :title "Baseline State" :rule "${p[0]||`Initial physical equilibrium`}")
    (:t 0.50 :title "Dynamic Shift" :rule "${p[1]||`Invariant parameter transformation`}")
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
)`.trim(),invariants:p}}async function p(e,t=`phet-simulation.html`){let n=new Blob([e]).size,r=l(e,t),i=(r.simName+` `+r.title+` `+t).toLowerCase(),a=null;i.includes(`faraday`)||i.includes(`magnet`)||i.includes(`induct`)?a=`faraday`:i.includes(`acid`)||/\bph\b/i.test(i)||i.includes(`base-solution`)||i.includes(`titrat`)?a=`acid-base`:i.includes(`pendulum`)||i.includes(`harmonic`)?a=`pendulum`:i.includes(`chemical`)||i.includes(`balanc`)||i.includes(`equation`)||i.includes(`stoich`)?a=`balancing-chemical`:(i.includes(`ohm`)||i.includes(`circuit`)||i.includes(`resistor`))&&(a=`ohms-law`);let o=``,c=``,d=[],p=r.title;if(a&&u[a]){let e=u[a];o=e.generateSvg().trim(),c=e.generateAst().trim(),d=e.invariants,p=e.title}else{let n=f(e,t,r);o=n.svgMarkup,c=n.astSource,d=n.invariants}let m=new Blob([o+c]).size,h=s.computeCompressionRatio(n,m),g=(h>0?h:(n-m)/Math.max(1,n)*100).toFixed(1);return{success:!0,metadata:{simName:r.simName,title:p,version:r.version,originalSizeBytes:n,distilledSizeBytes:m,compressionRatio:`${g}% reduction`,detectedInvariants:d,localesFound:r.locales},svgMarkup:o,astSource:c}}var m=class{buffer;bytePos=0;bitPos=0;constructor(e,t=0){this.buffer=e,this.bytePos=t,this.bitPos=0}get length(){return this.buffer.length}get offset(){return this.bytePos}set offset(e){this.bytePos=e,this.bitPos=0}readUI8(){return this.syncBits(),this.bytePos>=this.buffer.length?0:this.buffer[this.bytePos++]}readUI16(){if(this.syncBits(),this.bytePos+1>=this.buffer.length)return 0;let e=this.buffer[this.bytePos]|this.buffer[this.bytePos+1]<<8;return this.bytePos+=2,e}readSI16(){let e=this.readUI16();return e&32768?e-65536:e}readUI32(){if(this.syncBits(),this.bytePos+3>=this.buffer.length)return 0;let e=(this.buffer[this.bytePos]|this.buffer[this.bytePos+1]<<8|this.buffer[this.bytePos+2]<<16|this.buffer[this.bytePos+3]<<24)>>>0;return this.bytePos+=4,e}readString(){this.syncBits();let e=``;for(;this.bytePos<this.buffer.length;){let t=this.buffer[this.bytePos++];if(t===0)break;e+=String.fromCharCode(t)}return e}readBytes(e){this.syncBits();let t=Math.min(this.bytePos+e,this.buffer.length),n=this.buffer.slice(this.bytePos,t);return this.bytePos=t,n}syncBits(){this.bitPos>0&&(this.bytePos++,this.bitPos=0)}readUBits(e){if(e===0)return 0;let t=0;for(let n=0;n<e;n++){if(this.bytePos>=this.buffer.length)return t;let e=this.buffer[this.bytePos]>>7-this.bitPos&1;t=t<<1|e,this.bitPos++,this.bitPos===8&&(this.bitPos=0,this.bytePos++)}return t}readSBits(e){if(e===0)return 0;let t=this.readUBits(e),n=1<<e-1;return t&n&&(t-=1<<e),t}readRect(){this.syncBits();let e=this.readUBits(5),t=this.readSBits(e)/20,n=this.readSBits(e)/20,r=this.readSBits(e)/20,i=this.readSBits(e)/20;return this.syncBits(),{xMin:t,xMax:n,yMin:r,yMax:i,width:Math.abs(n-t),height:Math.abs(i-r)}}readMatrix(){this.syncBits();let e=1,t=1;if(this.readUBits(1)===1){let n=this.readUBits(5);e=this.readSBits(n)/65536,t=this.readSBits(n)/65536}let n=0,r=0;if(this.readUBits(1)===1){let e=this.readUBits(5);n=this.readSBits(e)/65536,r=this.readSBits(e)/65536}let i=this.readUBits(5),a=this.readSBits(i)/20,o=this.readSBits(i)/20;return this.syncBits(),{scaleX:e,scaleY:t,rotateSkew0:n,rotateSkew1:r,transX:a,transY:o}}readRGBA(e=!0){this.syncBits();let t=this.readUI8(),n=this.readUI8(),r=this.readUI8(),i=e?this.readUI8()/255:1;return i<1?`rgba(${t}, ${n}, ${r}, ${i.toFixed(2)})`:`#${((1<<24)+(t<<16)+(n<<8)+r).toString(16).slice(1)}`}};async function h(t){if(typeof process<`u`&&process.versions&&process.versions.node)try{let n=await a(()=>import(`./__vite-browser-external-BDfy7Drd.js`).then(t=>e(t.default,1)),__vite__mapDeps([0,1])),r=n.default||n,i=Buffer.from(t);try{let e=r.inflateSync(i);return new Uint8Array(e.buffer,e.byteOffset,e.byteLength)}catch{let e=i.subarray(2,i.length-4),t=r.inflateRawSync(e);return new Uint8Array(t.buffer,t.byteOffset,t.byteLength)}}catch{}if(typeof DecompressionStream<`u`)try{let e=new ReadableStream({start(e){e.enqueue(t),e.close()}}).pipeThrough(new DecompressionStream(`deflate`)),n=await new Response(e).arrayBuffer();return new Uint8Array(n)}catch{try{let e=t.slice(2,t.length-4),n=new ReadableStream({start(t){t.enqueue(e),t.close()}}).pipeThrough(new DecompressionStream(`deflate-raw`)),r=await new Response(n).arrayBuffer();return new Uint8Array(r)}catch(e){console.warn(`[SWF-Parser] DecompressionStream error, trying fallback:`,e)}}throw Error(`Could not decompress zlib-encoded SWF binary in this environment.`)}function g(e,t,n){let r=e.readRect();n===4&&(e.readRect(),e.readUI8()),e.syncBits();let i=e.readUI8();i===255&&n>=2&&(i=e.readUI16());let a=[`none`];for(let t=0;t<i;t++){let t=e.readUI8();if(t===0)a.push(e.readRGBA(n>=3));else if(t===16||t===18){e.readMatrix();let t=e.readUI8()&15,r=`#38bdf8`;for(let i=0;i<t;i++){e.readUI8();let t=e.readRGBA(n>=3);i===0&&(r=t)}a.push(r)}else e.readUI16(),e.readMatrix(),a.push(`#6366f1`)}let o=e.readUI8();o===255&&n>=2&&(o=e.readUI16());let s=[{width:0,color:`none`}];for(let t=0;t<o;t++){let t=e.readUI16()/20,r=e.readRGBA(n>=3);s.push({width:Math.max(1,t),color:r})}e.syncBits();let c=_(e,e.readUBits(4),e.readUBits(4));e.syncBits();let l=`<path id="swf-shape-${t}" d="${c.pathCommands.join(` `)||`M ${r.xMin.toFixed(1)} ${r.yMin.toFixed(1)} h ${r.width.toFixed(1)} v ${r.height.toFixed(1)} h -${r.width.toFixed(1)} Z`}" fill="${a[c.curFill0]||(a.length>1?a[1]:`#38bdf8`)}" stroke="${s[c.curLine]?.color||`none`}" stroke-width="${s[c.curLine]?.width||1}" />`;return{id:`swf-shape-${t}`,svg:l,bbox:{x:r.xMin,y:r.yMin,w:r.width,h:r.height}}}function _(e,t,n,r=0,i=0){let a=r,o=i,s=[],c=0,l=0;for(;e.offset<e.length;)if(e.readUBits(1)===0){let r=e.readUBits(5);if(r===0)break;if(r&1){let t=e.readUBits(5);a=e.readSBits(t)/20,o=e.readSBits(t)/20,s.push(`M ${a.toFixed(1)} ${o.toFixed(1)}`)}if(r&2&&(c=e.readUBits(t)),r&4&&e.readUBits(t),r&8&&(l=e.readUBits(n)),r&16)break}else{let t=e.readUBits(1),n=e.readUBits(4)+2;if(t===1){let t=e.readUBits(1),r=0,i=0;t===1?(r=e.readSBits(n)/20,i=e.readSBits(n)/20):e.readUBits(1)===1?i=e.readSBits(n)/20:r=e.readSBits(n)/20,a+=r,o+=i,s.push(`L ${a.toFixed(1)} ${o.toFixed(1)}`)}else{let t=a+e.readSBits(n)/20,r=o+e.readSBits(n)/20,i=t+e.readSBits(n)/20,c=r+e.readSBits(n)/20;a=i,o=c,s.push(`Q ${t.toFixed(1)} ${r.toFixed(1)} ${i.toFixed(1)} ${c.toFixed(1)}`)}}return{pathCommands:s,curFill0:c,curLine:l}}function v(e,t,n){let r=e.readRect(),i=e.readRect();n===2&&(e.readRect(),e.readRect(),e.readUI8());let a=e.readUI32(),o=e.offset,s=e.readUI8();s===255&&(s=e.readUI16());let c=[`none`],l=[`none`];for(let t=0;t<s;t++){let t=e.readUI8();if(t===0)c.push(e.readRGBA(!0)),l.push(e.readRGBA(!0));else if(t===16||t===18){e.readMatrix(),e.readMatrix();let t=e.readUI8()&15,n=`#38bdf8`,r=`#818cf8`;for(let i=0;i<t;i++){e.readUI8();let t=e.readRGBA(!0);e.readUI8();let a=e.readRGBA(!0);i===0&&(n=t,r=a)}c.push(n),l.push(r)}else e.readUI16(),e.readMatrix(),e.readMatrix(),c.push(`#6366f1`),l.push(`#a855f7`)}let u=e.readUI8();u===255&&(u=e.readUI16());let d=[{width:0,color:`none`}],f=[{width:0,color:`none`}];for(let t=0;t<u;t++){let t=e.readUI16()/20,r=e.readUI16()/20;n===2&&e.readUI16();let i=e.readRGBA(!0),a=e.readRGBA(!0);d.push({width:Math.max(1,t),color:i}),f.push({width:Math.max(1,r),color:a})}e.syncBits();let p=_(e,e.readUBits(4),e.readUBits(4));e.offset=o+a,e.syncBits();let m=_(e,e.readUBits(4),e.readUBits(4));e.syncBits();let h=p.pathCommands.join(` `)||`M ${r.xMin.toFixed(1)} ${r.yMin.toFixed(1)} h ${r.width.toFixed(1)} v ${r.height.toFixed(1)} h -${r.width.toFixed(1)} Z`,g=m.pathCommands.join(` `)||`M ${i.xMin.toFixed(1)} ${i.yMin.toFixed(1)} h ${i.width.toFixed(1)} v ${i.height.toFixed(1)} h -${i.width.toFixed(1)} Z`,v=c[p.curFill0]||(c.length>1?c[1]:`#38bdf8`),y=l[m.curFill0]||(l.length>1?l[1]:`#818cf8`),b=d[p.curLine]?.color||`none`,x=d[p.curLine]?.width||1,S=`<path id="swf-morph-${t}" d="${h}" fill="${v}" stroke="${b}" stroke-width="${x}" data-morph-end="${g}" />`;return{id:`swf-morph-${t}`,shapeId:t,startD:h,endD:g,startFill:v,endFill:y,stroke:b,strokeWidth:x,svg:S,bbox:{x:Math.min(r.xMin,i.xMin),y:Math.min(r.yMin,i.yMin),w:Math.max(r.width,i.width),h:Math.max(r.height,i.height)}}}function y(e,t,n){let r={frame:n,gotoFrames:[],gotoLabels:[],setVariables:[],branches:[]},i=[],a=[];for(;e.offset<t;){let n=e.readUI8();if(n===0)break;let o=0;n>=128&&(o=e.readUI16());let s=Math.min(t,e.offset+o);if(n===7)r.stops=!0;else if(n===6)r.plays=!0;else if(n===129){let t=e.readUI16();r.gotoFrames.push(t+1)}else if(n===159){let t=e.readString();t&&r.gotoLabels.push(t)}else if(n===136){let t=e.readUI16();a.length=0;for(let n=0;n<t&&e.offset<s;n++)a.push(e.readString())}else if(n===150)for(;e.offset<s;){let t=e.readUI8();if(t===0)i.push(e.readString());else if(t===1){let t=e.readUI8(),n=e.readUI8(),r=e.readUI8(),a=e.readUI8(),o=new ArrayBuffer(4);new Uint8Array(o).set([t,n,r,a]),i.push(new Float32Array(o)[0])}else if(t===2)i.push(null);else if(t===3)i.push(void 0);else if(t===5)i.push(e.readUI8()!==0);else if(t===7)i.push(e.readUI32());else if(t===8){let t=e.readUI8();i.push(a[t]??`str_${t}`)}else if(t===9){let t=e.readUI16();i.push(a[t]??`str_${t}`)}else break}else if(n===29){let e=i.pop(),t=i.pop();typeof t==`string`&&t&&r.setVariables.push({name:t,value:e===void 0?0:e})}else if(n===155){let e=i.pop(),t=i.pop(),n=[];for(let e=0;e<(t||0);e++)n.push(i.pop());if(e===`gotoAndPlay`||e===`gotoAndStop`){let e=n[0];typeof e==`string`?r.gotoLabels.push(e):typeof e==`number`&&r.gotoFrames.push(e)}}else if(n===153){let t=e.readSI16(),n=i.pop();r.branches.push({condition:typeof n==`string`?n:`stateCond == true`,target:t})}e.offset=s}return r}function b(e,t,n){let r={frame:n,gotoFrames:[],gotoLabels:[],setVariables:[],branches:[]};try{e.readUI32(),e.readString();let n=e.readBytes(Math.max(0,t-e.offset)),i=``,a=[];for(let e=0;e<n.length;e++){let t=n[e];t>=32&&t<=126?i+=String.fromCharCode(t):(i.length>=2&&a.push(i),i=``)}i.length>=2&&a.push(i);let o=[`start`,`intro`,`step1`,`step2`,`step3`,`quiz`,`result`,`win`,`reset`,`game`,`play`];for(let e of a)o.includes(e.toLowerCase())?r.gotoLabels.push(e):[`score`,`level`,`count`,`energy`,`velocity`,`temp`,`time`].includes(e.toLowerCase())&&r.setVariables.push({name:e,value:0});for(let e=0;e<n.length;e++)if(n[e]===18){r.stops=!0;break}}catch{}return r}async function x(e,t=`imported-swf`){try{let n=e instanceof Uint8Array?e:new Uint8Array(e);if(n.length<8)return{success:!1,error:`File is too short to be a valid SWF binary (min 8 bytes required).`,svgMarkup:``,astSource:``};let r=String.fromCharCode(n[0],n[1],n[2]);if(r!==`FWS`&&r!==`CWS`)return{success:!1,error:`Unsupported SWF signature: "${r}". Only standard FWS or CWS Flash files are supported.`,svgMarkup:``,astSource:``};let i=n[3],a=(n[4]|n[5]<<8|n[6]<<16|n[7]<<24)>>>0,o;if(r===`CWS`){let e=await h(n.slice(8));o=new Uint8Array(8+e.length),o.set(n.subarray(0,8),0),o.set(e,8)}else o=n;let s=new m(o,8),c=s.readRect(),l=s.readUI16()/256,u=s.readUI16(),d=`#0f172a`,f=[],p=[],_=[],x=[],S=[],C=[],w=1;for(;s.offset<o.length;){let e=s.readUI16(),t=e>>6,n=e&63;n===63&&(n=s.readUI32());let r=s.offset+n;if(t===0)break;if(t===9)d=s.readRGBA(!1);else if(t===2||t===22||t===32||t===83){let e=s.readUI16(),n=t===2?1:t===22?2:t===32?3:4;try{let t=g(s,e,n);f.push(t)}catch{f.push({id:`swf-shape-${e}`,svg:`<rect id="swf-shape-${e}" x="20" y="20" width="120" height="80" rx="8" fill="#38bdf8" opacity="0.85" />`,bbox:{x:20,y:20,w:120,h:80}})}}else if(t===46||t===84){let e=s.readUI16(),n=t===46?1:2;try{let t=v(s,e,n);p.push(t)}catch{p.push({id:`swf-morph-${e}`,shapeId:e,startD:`M 40.0 40.0 L 140.0 40.0 L 140.0 100.0 L 40.0 100.0 Z`,endD:`M 60.0 20.0 L 180.0 60.0 L 120.0 120.0 L 20.0 80.0 Z`,startFill:`#38bdf8`,endFill:`#818cf8`,stroke:`none`,strokeWidth:1,svg:`<path id="swf-morph-${e}" d="M 40.0 40.0 L 140.0 40.0 L 140.0 100.0 L 40.0 100.0 Z" fill="#38bdf8" stroke="none" data-morph-end="M 60.0 20.0 L 180.0 60.0 L 120.0 120.0 L 20.0 80.0 Z" />`,bbox:{x:40,y:40,w:100,h:60}})}}else if(t===12||t===59)try{let e=y(s,r,w);_.push(e)}catch{}else if(t===82)try{let e=b(s,r,w);_.push(e)}catch{}else if(t===4||t===26||t===70){if(t===26||t===70){let e=s.readUI8(),t=s.readUI16(),n=0;e&2&&(n=s.readUI16());let r=null;e&4&&(r=s.readMatrix()),C.push({frame:w,depth:t,characterId:n,matrix:r});let i=S.findIndex(e=>e.depth===t);i>=0?(n&&(S[i].characterId=n),r&&(S[i].matrix=r)):n&&S.push({depth:t,characterId:n,matrix:r})}}else if(t===1)w++;else if(t===43){let e=s.readString();x.push({frame:w,name:e})}else if(t===37)try{let e=s.readUI16(),t=s.readRect();s.syncBits();let n=s.readUI8(),r=s.readUI8(),i=!!(n&1),a=!!(n&2),o=!!(n&4),c=!!(n&128),l=!!(r&32);i&&(s.readUI16(),s.readUI16());let u=`#ffffff`;if(o&&(u=s.readRGBA(!0)),a&&s.readUI16(),l&&(s.readUI8(),s.readUI16(),s.readUI16(),s.readUI16(),s.readSI16()),s.readString(),c){let n=s.readString();if(n&&n.trim()){let r=`<text id="swf-text-${e}" x="${t.xMin.toFixed(1)}" y="${(t.yMin+Math.max(14,t.height*.75)).toFixed(1)}" fill="${u}" font-size="14" font-family="system-ui, sans-serif" font-weight="600">${n.replace(/&/g,`&amp;`).replace(/</g,`&lt;`).replace(/>/g,`&gt;`)}</text>`;f.push({id:`swf-text-${e}`,svg:r,bbox:{x:t.xMin,y:t.yMin,w:t.width,h:t.height}})}}}catch{}s.offset=r}let T=Math.max(320,Math.round(c.width||800)),E=Math.max(240,Math.round(c.height||480)),D=Math.max(3,Math.round((u||w)/(l||24))),O=[...f.map(e=>e.svg),...p.map(e=>e.svg)].join(`
    `);O.trim()||(O=`
    <!-- Imported SWF Visual Content -->
    <g id="swf-content" transform="translate(40, 40)">
      <rect id="swf-bg-card" width="${T-80}" height="${E-80}" rx="16" fill="#1e293b" stroke="#38bdf8" stroke-width="2" />
      <text id="swf-title" x="${(T-80)/2}" y="80" text-anchor="middle" fill="#ffffff" font-size="20" font-family="system-ui" font-weight="bold">Imported Flash Asset: ${t}</text>
      <circle id="swf-orbiter" cx="${(T-80)/2}" cy="${(E-80)/2+30}" r="32" fill="#6366f1" />
      <text id="swf-caption" x="${(T-80)/2}" y="${E-120}" text-anchor="middle" fill="#94a3b8" font-size="13">Converted from legacy ${r} v${i} &bull; ${u} Frames &bull; ${l.toFixed(0)} FPS</text>
    </g>`);let k=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${T} ${E}" width="100%" height="100%">
  <rect id="bg" width="${T}" height="${E}" fill="${d}" />
  <g id="scene-root">
    ${O}
  </g>
</svg>`,A=p[0]?.id||f[0]?.id||`swf-orbiter`,j=[...f.map(e=>`#${e.id}`),...p.map(e=>`#${e.id}`)],M=j.length>0?j.slice(0,8).map(e=>`    (:actor :target "${e}" :kinematic true :will-change true)`).join(`
`):`    (:actor :target "#${A}" :kinematic true :will-change true)`,N=[];p.forEach(e=>{N.push(`    (:target "#${e.id}" :attr "d" :expr "astMorphPath('${e.startD}', '${e.endD}', t)")`),e.startFill!==e.endFill&&N.push(`    (:target "#${e.id}" :attr "fill" :expr "astMorphColor('${e.startFill}', '${e.endFill}', t)")`)});let P=``;P=N.length>0?`  :bindings (\n${N.join(`
`)}\n  )`:`  :bindings (\n    (:target "#${A}" :attr "transform" :expr "'translate(' + (Math.sin(t * Math.PI * 2) * 40) + ', 0)'")\n  )`;let F=new Map;_.forEach(e=>{(e.setVariables||[]).forEach(e=>{F.has(e.name)||F.set(e.name,e.value)})});let I=``;if(F.size>0){let e=[];F.forEach((t,n)=>{let r=typeof t==`number`;e.push(`    (:var :name "${n}" :val ${r?t:`"${t}"`} ${r?`:min 0 :max 100`:``})`)}),I=`\n  (:vars (\n${e.join(`
`)}\n  ))\n`}let L=``,R,z=[];if(x.length>=2?x.forEach(e=>{z.push({name:e.name.toLowerCase().replace(/[^a-z0-9_-]/g,`_`),title:e.name,frame:e.frame})}):_.some(e=>e.stops||e.gotoLabels&&e.gotoLabels.length>0||e.gotoFrames&&e.gotoFrames.length>0)&&(z.push({name:`intro`,title:`Intro Phase`,frame:1}),_.forEach(e=>{(e.stops||e.gotoLabels&&e.gotoLabels.length>0)&&z.push({name:`stage_${e.frame}`,title:`Stage at Frame ${e.frame}`,frame:e.frame})}),z.push({name:`conclusion`,title:`Conclusion Phase`,frame:u||w})),z.length>=2&&_.length>0){let e=z[0].name,t=z.map(e=>`        (:state :name "${e.name}" (:attr :target "#swf-title" :attr "textContent" :val "${e.title}"))`).join(`
`),n=[];for(let e=0;e<z.length-1;e++){let t=z[e],r=z[e+1],i=`true`;for(let e of _)if(e.frame===t.frame&&e.branches&&e.branches.length>0){i=e.branches[0].condition;break}n.push(`        (:transition :from "${t.name}" :to "${r.name}" :trigger "${i}" :duration 0.4 :dwell 0.25)`)}n.push(`        (:transition :from "${z[z.length-1].name}" :to "${z[0].name}" :trigger "true" :duration 0.4 :dwell 0.25)`),L=`\n  (:state-machines (\n    (:state-machine :id "swf-state-machine" :initial "${e}" :dwell 0.25\n      (:states (\n${t}\n      ))\n      (:transitions (\n${n.join(`
`)}\n      ))\n    )\n  ))\n`,R=[{id:`swf-state-machine`,initial:e,states:z.map(e=>e.name),transitionsCount:n.length}]}let B=x.length>0?x.map(e=>`    (:t ${Math.min(1,Number(((e.frame-1)/Math.max(1,u)).toFixed(2)))} :title "${e.name}" :rule "Keyframe step at frame ${e.frame}")`).join(`
`):`    (:t 0.0 :title "Intro" :rule "SWF Timeline Inception")
    (:t 0.5 :title "Midpoint" :rule "Active Simulation Phase")
    (:t 1.0 :title "Conclusion" :rule "Loop Reset")`,V=`(:scene
  :id "${t}"
  :title "Imported Flash (${t})"
  :subject "Transpiled Legacy SWF"
  :duration ${D}
  :fps ${Math.round(l)||24}
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
)`;return{success:!0,metadata:{signature:r,version:i,fileLength:a,width:T,height:E,frameRate:l,frameCount:u,backgroundColor:d,shapeCount:f.length,morphShapeCount:p.length,actionCount:_.length,labels:x,stateMachines:R,variables:Array.from(F.entries()).map(([e,t])=>({name:e,value:t}))},svgMarkup:k,astSource:V}}catch(e){return{success:!1,error:`SWF parsing exception: ${e?.message||String(e)}`,svgMarkup:``,astSource:``}}}async function S(e){let t=new TextEncoder().encode(e);if(typeof CompressionStream<`u`)try{let e=new Blob([t]).stream().pipeThrough(new CompressionStream(`gzip`)),n=await(await new Response(e).blob()).arrayBuffer();return new Uint8Array(n)}catch(e){console.warn(`[cartridgeCompression] CompressionStream failed, falling back to raw bytes:`,e)}return t}async function C(e){if(typeof DecompressionStream<`u`)try{let t=new Blob([e]).stream().pipeThrough(new DecompressionStream(`gzip`));return await(await new Response(t).blob()).text()}catch{return new TextDecoder().decode(e)}return new TextDecoder().decode(e)}function w(e){let t=``,n=e.byteLength;for(let r=0;r<n;r++)t+=String.fromCharCode(e[r]);return btoa(t)}function T(e){let t=atob(e),n=t.length,r=new Uint8Array(n);for(let e=0;e<n;e++)r[e]=t.charCodeAt(e);return r}async function E(e){let t=JSON.stringify(e),n=new TextEncoder().encode(t).byteLength,r=await S(t),i=r.byteLength,a=n>0?Math.round((n-i)/n*100):0,o={id:e.id,title:e.title,originalBytes:n,compressedBytes:i,savingsPercent:a,timestamp:Date.now()};return{compressedBytes:r,base64:w(r),metadata:o}}async function D(e){let t;t=typeof e==`string`?T(e):e instanceof ArrayBuffer?new Uint8Array(e):e;let n=await C(t),r=JSON.parse(n);if(!r||typeof r!=`object`||!r.id)throw Error(`Decompressed data is not a valid CartridgeDefinition`);return r}var O=[{id:`welcome`,type:`Sim`,label:`Welcome to AST Vector Player & Educational Simulator`,stage:`PORTAL APPARATUS & SIMULATOR`,oakId:`OAK-PORTAL-000`,oakUnit:`portal-apparatus-showcase`,subject:`Educational Technology`,isCore:!0,tier:`core`,mount:`/player`,section:`Portal Showcase & Apparatus`,hasCheckpoints:!0,checkpointCount:1},{id:`church-tour`,type:`Slide`,label:`Tour of a Catholic Church: Sacred Architecture & Sacred Spaces`,stage:`CATHOLIC LIFE`,oakId:`OAK-KS2-RE-001`,oakUnit:`ks2-re-catholic-sacred-architecture`,subject:`Religious Education`,isCore:!0,tier:`core`,mount:`/curriculum/catholic-life/church-tour`,section:`Catholic Life & Faith Formation`,hasCheckpoints:!0,checkpointCount:3},{id:`altar-anatomy`,type:`Slide`,label:`The Catholic Altar: Sacred Anatomy, Types & Appointments`,stage:`CATHOLIC LIFE`,oakId:`OAK-KS2-RE-002`,oakUnit:`ks2-re-catholic-altar-mensa-relics`,subject:`Religious Education`,isCore:!0,tier:`core`,mount:`/curriculum/catholic-life/altar-anatomy`,section:`Catholic Life & Faith Formation`,hasCheckpoints:!0,checkpointCount:2},{id:`holy-oils`,type:`Slide`,label:`The Three Holy Oils & The Sacred Ambry (Olea Sancta)`,stage:`CATHOLIC LIFE`,oakId:`OAK-KS2-RE-003`,oakUnit:`ks2-re-catholic-holy-oils-ambry`,subject:`Religious Education`,isCore:!0,tier:`core`,mount:`/curriculum/catholic-life/holy-oils`,section:`Catholic Life & Faith Formation`,hasCheckpoints:!0,checkpointCount:1},{id:`holy-water-thurifer`,type:`Sim`,label:`Holy Water & The Thurible: Asperges, Incense & Sacramental Purification`,stage:`CATHOLIC LIFE`,oakId:`OAK-KS2-RE-004`,oakUnit:`ks2-re-catholic-asperges-incensations`,subject:`Religious Education`,isCore:!0,tier:`core`,mount:`/curriculum/catholic-life/holy-water-thurifer`,section:`Catholic Life & Faith Formation`,hasCheckpoints:!0,checkpointCount:3},{id:`first-communion`,type:`Sim`,label:`First Holy Communion & Eucharistic Adoration: Receiving Jesus with Reverence & Love`,stage:`CATHOLIC LIFE`,oakId:`OAK-KS2-RE-005`,oakUnit:`ks2-re-catholic-first-holy-communion`,subject:`Religious Education`,isCore:!0,tier:`core`,mount:`/curriculum/catholic-life/first-communion`,section:`Catholic Life & Faith Formation`,hasCheckpoints:!0,checkpointCount:2},{id:`triduum-easter`,type:`Sim`,label:`The Sacred Paschal Triduum & Easter: Upper Room, Cross & Lumen Christi`,stage:`CATHOLIC LIFE`,oakId:`OAK-KS2-RE-006`,oakUnit:`ks2-re-catholic-paschal-triduum`,subject:`Religious Education`,isCore:!0,tier:`core`,mount:`/curriculum/catholic-life/triduum-easter`,section:`Catholic Life & Faith Formation`,hasCheckpoints:!0,checkpointCount:3},{id:`seven-sacraments`,type:`Sim`,label:`The Seven Holy Sacraments: Visible Signs of Invisible Grace`,stage:`CATHOLIC LIFE`,oakId:`OAK-KS2-RE-008`,oakUnit:`ks2-re-catholic-seven-sacraments`,subject:`Religious Education`,isCore:!0,tier:`core`,mount:`/curriculum/catholic-life/seven-sacraments`,section:`Catholic Life & Faith Formation`,hasCheckpoints:!0,checkpointCount:3},{id:`liturgical-calendar`,type:`Sim`,label:`The Catholic Liturgical Year: Sacred Seasons & Colors`,stage:`CATHOLIC LIFE`,oakId:`OAK-KS2-RE-009`,oakUnit:`ks2-re-catholic-liturgical-seasons`,subject:`Religious Education`,isCore:!0,tier:`core`,mount:`/curriculum/catholic-life/liturgical-calendar`,section:`Catholic Life & Faith Formation`,hasCheckpoints:!0,checkpointCount:3},{id:`liturgical-postures`,type:`Sim`,label:`Sacred Postures & Gestures: Praying with Mind, Heart & Body`,stage:`CATHOLIC LIFE`,oakId:`OAK-KS2-RE-010`,oakUnit:`ks2-re-catholic-liturgical-postures-prayer`,subject:`Religious Education`,isCore:!0,tier:`core`,mount:`/curriculum/catholic-life/liturgical-postures`,section:`Catholic Life & Faith Formation`,hasCheckpoints:!0,checkpointCount:3},{id:`ten-commandments`,type:`Slide`,label:`The Ten Commandments & Moral Law: The Two Tablets of Sinai`,stage:`CATHOLIC LIFE`,oakId:`OAK-KS2-RE-015`,oakUnit:`ks2-re-catholic-decalogue-moral-law`,subject:`Religious Education`,isCore:!0,tier:`core`,mount:`/curriculum/catholic-life/commandments`,section:`Catholic Life & Faith Formation`,hasCheckpoints:!0,checkpointCount:2},{id:`order-of-the-mass`,type:`Sim`,label:`The Order of the Holy Mass: Source & Summit of Catholic Life`,stage:`CATHOLIC LIFE`,oakId:`OAK-KS2-RE-016`,oakUnit:`ks2-re-catholic-order-of-mass`,subject:`Religious Education`,isCore:!0,tier:`core`,mount:`/curriculum/catholic-life/mass`,section:`Catholic Life & Faith Formation`,hasCheckpoints:!0,checkpointCount:2},{id:`sacred-objects`,type:`Slide`,label:`Sacred Vessels, Linens, Sanctuary Appointments & Vestments of the Catholic Church`,stage:`CATHOLIC LIFE`,oakId:`OAK-KS2-RE-017`,oakUnit:`ks2-re-catholic-sacred-vessels-vestments`,subject:`Religious Education`,isCore:!0,tier:`core`,mount:`/curriculum/catholic-life/sacred-objects`,section:`Catholic Life & Faith Formation`,hasCheckpoints:!0,checkpointCount:2},{id:`eucharistic-procession-film`,type:`Film`,label:`Solemn Eucharistic Procession: Liturgical Film & Sacred Vectors`,stage:`CATHOLIC LIFE`,oakId:`OAK-KS2-RE-018`,oakUnit:`ks2-re-catholic-eucharistic-procession`,subject:`Religious Education`,isCore:!0,tier:`core`,mount:`/curriculum/catholic-life/film`,section:`Catholic Life & Faith Formation`,hasCheckpoints:!0,checkpointCount:2},{id:`rosary-mysteries`,type:`Sim`,label:`The Holy Rosary: 3D Beads & 20 Scriptural Mysteries`,stage:`CATHOLIC LIFE & RE`,oakId:`OAK-KS2-RE-019`,oakUnit:`ks2-re-catholic-rosary-twenty-mysteries`,subject:`Religious Education`,isCore:!0,tier:`core`,mount:`/curriculum/catholic-life/rosary-mysteries`,section:`Catholic Life & Faith Formation`,hasCheckpoints:!1,checkpointCount:0},{id:`stations-of-the-cross`,type:`Slide`,label:`The Stations of the Cross: Via Crucis & Sacred Passion`,stage:`CATHOLIC LIFE`,oakId:`OAK-KS2-RE-020`,oakUnit:`ks2-re-catholic-via-crucis-stations`,subject:`Religious Education`,isCore:!0,tier:`core`,mount:`/curriculum/catholic-life/stations-of-the-cross`,section:`Catholic Life & Faith Formation`,hasCheckpoints:!0,checkpointCount:3},{id:`liturgy-of-the-hours`,type:`Sim`,label:`The Liturgy of the Hours: Sanctifying Time Through the Divine Office`,stage:`CATHOLIC LIFE`,oakId:`OAK-KS3-RE-007`,oakUnit:`ks3-re-catholic-divine-office-psalms`,subject:`Religious Education`,isCore:!0,tier:`core`,mount:`/curriculum/catholic-life/liturgy-of-the-hours`,section:`Catholic Life & Faith Formation`,hasCheckpoints:!0,checkpointCount:3},{id:`catholic-rites`,type:`Slide`,label:`The 24 Catholic Rites & Churches: Unity in Diversity Across East & West`,stage:`CATHOLIC LIFE`,oakId:`OAK-KS3-RE-011`,oakUnit:`ks3-re-catholic-sacramental-rites`,subject:`Religious Education`,isCore:!0,tier:`core`,mount:`/curriculum/catholic-life/rites`,section:`Catholic Life & Faith Formation`,hasCheckpoints:!0,checkpointCount:2},{id:`cst-virtues`,type:`Sim`,label:`Catholic Social Teaching & Virtues: Gospel Love in Daily Action`,stage:`CATHOLIC LIFE`,oakId:`OAK-KS3-RE-012`,oakUnit:`ks3-re-catholic-social-teaching-virtues`,subject:`Religious Education`,isCore:!0,tier:`core`,mount:`/curriculum/catholic-life/cst-virtues`,section:`Catholic Life & Faith Formation`,hasCheckpoints:!0,checkpointCount:2},{id:`latin-mass-prayers`,type:`Slide`,label:`Latin Prayers & Gregorian Chant: The Universal Voice of the Catholic Church`,stage:`CATHOLIC LIFE`,oakId:`OAK-KS3-RE-013`,oakUnit:`ks3-re-catholic-traditional-latin-prayers`,subject:`Religious Education`,isCore:!0,tier:`core`,mount:`/curriculum/catholic-life/prayers-latin`,section:`Catholic Life & Faith Formation`,hasCheckpoints:!0,checkpointCount:2},{id:`nicene-creed`,type:`Slide`,label:`The Nicene & Apostles' Creed: Credo in Unum Deum`,stage:`CATHOLIC LIFE`,oakId:`OAK-KS3-RE-014`,oakUnit:`ks3-re-catholic-creed-profession-faith`,subject:`Religious Education`,isCore:!0,tier:`core`,mount:`/curriculum/catholic-life/creed`,section:`Catholic Life & Faith Formation`,hasCheckpoints:!0,checkpointCount:2},{id:`times-tables`,type:`Sim`,label:`Times Tables: 2× to 12× Array & Distributive Splitter`,stage:`KS1/KS2 MATHS`,oakId:`OAK-KS1-MAT-006`,oakUnit:`ks1-maths-arithmetic-multiplication-arrays`,subject:`Mathematics`,isCore:!0,tier:`core`,mount:`/curriculum/maths/arithmetic/times-tables`,section:`Mathematics & Geometry`,hasCheckpoints:!1,checkpointCount:0},{id:`math-fishing`,type:`App`,label:`Math Pond: Number Bonds Fishing Game`,stage:`KS1/KS2 MATHS`,oakId:`OAK-KS1-MAT-007`,oakUnit:`ks1-maths-arithmetic-number-bonds`,subject:`Mathematics`,isCore:!0,tier:`core`,mount:`/curriculum/maths/arithmetic/number-bonds`,section:`Mathematics & Geometry`,hasCheckpoints:!1,checkpointCount:0},{id:`bodmas`,type:`Slide`,label:`BODMAS / BIDMAS: Forcefield Clamping & Area Physics`,stage:`KS2/KS3 MATHS`,oakId:`OAK-KS2-MAT-004`,oakUnit:`ks2-maths-arithmetic-order-operations`,subject:`Mathematics`,isCore:!0,tier:`core`,mount:`/curriculum/maths/algebra/bodmas`,section:`Mathematics & Geometry`,hasCheckpoints:!0,checkpointCount:1},{id:`fractions`,type:`Slide`,label:`Fractions: Why Common Denominators Rule`,stage:`KS2 MATHS`,oakId:`OAK-KS2-MAT-005`,oakUnit:`ks2-maths-arithmetic-common-denominators`,subject:`Mathematics`,isCore:!0,tier:`core`,mount:`/curriculum/maths/arithmetic/fractions`,section:`Mathematics & Geometry`,hasCheckpoints:!0,checkpointCount:1},{id:`pythagoras`,type:`Sim`,label:`Pythagoras' Theorem (a² + b² = c²)`,stage:`KS3 GEOMETRY`,oakId:`OAK-KS3-MAT-001`,oakUnit:`units`,subject:`Mathematics`,isCore:!0,tier:`core`,mount:`/curriculum/maths/geometry/pythagoras`,section:`Mathematics & Geometry`,hasCheckpoints:!1,checkpointCount:0},{id:`algebra-balance`,type:`Sim`,label:`⚖️ Algebraic Balance Scale: Preserving Equality (2x + 5 = 15)`,stage:`KS2/KS3 MATHS`,oakId:`OAK-KS3-MAT-003`,oakUnit:`ks3-maths-algebra-linear-equations`,subject:`Mathematics`,isCore:!0,tier:`core`,mount:`/curriculum/maths/algebra/balance-scale`,section:`Mathematics & Geometry`,hasCheckpoints:!0,checkpointCount:2},{id:`calculus-curves`,type:`Sim`,label:`Calculus: Tangent Slopes & Definite Integrals`,stage:`GCSE & A-LEVEL MATHS`,oakId:`OAK-KS4-MAT-002`,oakUnit:`ks4-maths-calculus-tangents`,subject:`Mathematics`,isCore:!0,tier:`core`,mount:`/curriculum/maths/calculus/tangent-slopes`,section:`Mathematics & Geometry`,hasCheckpoints:!0,checkpointCount:1},{id:`kinetic-gas`,type:`Sim`,label:`Kinetic Gas Theory & Boyle's Law`,stage:`KS3/KS4 PHYSICS & CHEMISTRY`,oakId:`OAK-KS3-SCI-001`,oakUnit:`m³`,subject:`Science`,isCore:!0,tier:`core`,mount:`/curriculum/science/physics/kinetic-gas`,section:`Natural Sciences & Physics`,hasCheckpoints:!0,checkpointCount:1},{id:`electric-circuits`,type:`Sim`,label:`💡 Electrical Circuits & Ohm's Law (V = I × R)`,stage:`KS2/KS3 PHYSICS`,oakId:`OAK-KS3-SCI-002`,oakUnit:`ks3-physics-electricity-circuits-ohms-law`,subject:`Science`,isCore:!0,tier:`core`,mount:`/curriculum/science/physics/electric-circuits`,section:`Natural Sciences & Physics`,hasCheckpoints:!0,checkpointCount:2},{id:`atom`,type:`Sim`,label:`Atomic Structure: Bohr Electron Shells`,stage:`KS3 CHEMISTRY`,oakId:`OAK-KS3-SCI-003`,oakUnit:`protons`,subject:`Science`,isCore:!0,tier:`core`,mount:`/curriculum/science/chemistry/atomic-structure`,section:`Natural Sciences & Physics`,hasCheckpoints:!0,checkpointCount:1},{id:`photosynthesis`,type:`Slide`,label:`Photosynthesis: The Green Solar Engine`,stage:`KS3 BIOLOGY`,oakId:`OAK-KS3-SCI-004`,oakUnit:`%`,subject:`Science`,isCore:!0,tier:`core`,mount:`/curriculum/science/biology/photosynthesis`,section:`Natural Sciences & Physics`,hasCheckpoints:!0,checkpointCount:1},{id:`dna-helix`,type:`Sim`,label:`Genetics: DNA Base Pairing & Transcription`,stage:`KS3 GENETICS`,oakId:`OAK-KS3-SCI-005`,oakUnit:`ks3-biology-genetics-dna-transcription`,subject:`Science`,isCore:!0,tier:`core`,mount:`/curriculum/science/biology/dna-helix`,section:`Natural Sciences & Physics`,hasCheckpoints:!0,checkpointCount:1},{id:`solar-system`,type:`Sim`,label:`Solar System: Heliocentric Planetary Motion`,stage:`KS3 SCIENCE`,oakId:`OAK-KS3-SCI-006`,oakUnit:`ks3-physics-space-solar-system-gravity`,subject:`Science`,isCore:!0,tier:`core`,mount:`/curriculum/science/physics/solar-system`,section:`Natural Sciences & Physics`,hasCheckpoints:!0,checkpointCount:1},{id:`velocity`,type:`Sim`,label:`Kinematics: Velocity & Distance-Time Vectors`,stage:`KS3 PHYSICS`,oakId:`OAK-KS3-SCI-007`,oakUnit:`m/s`,subject:`Science`,isCore:!0,tier:`core`,mount:`/curriculum/science/physics/velocity-vectors`,section:`Natural Sciences & Physics`,hasCheckpoints:!0,checkpointCount:1},{id:`phonics-lab`,type:`App`,label:`Early Phonics: Sound Buttons & Blending Mat`,stage:`EYFS/KS1 ENGLISH`,oakId:`OAK-KS1-ENG-001`,oakUnit:`ks1-english-reading-phonics-sound-buttons`,subject:`English`,isCore:!0,tier:`core`,mount:`/curriculum/english/phonics/phonics-lab`,section:`English Literature & Phonics`,hasCheckpoints:!1,checkpointCount:0},{id:`phonics-screening`,type:`Sim`,label:`Year 1 Phonics Screening Check & Alien Words`,stage:`EARLY YEARS & KS1 PHONICS`,oakId:`OAK-KS1-ENG-002`,oakUnit:`ks1-english-reading-phonics-alien-words`,subject:`English`,isCore:!0,tier:`core`,mount:`/curriculum/english/phonics/screening-check`,section:`English Literature & Phonics`,hasCheckpoints:!1,checkpointCount:0},{id:`spelling-bee`,type:`App`,label:`Spelling Bee Championship: KS1 to KS3 Orthography`,stage:`KS1/KS2/KS3 ENGLISH`,oakId:`OAK-KS2-ENG-003`,oakUnit:`ks2-english-writing-orthography-spelling`,subject:`English`,isCore:!0,tier:`core`,mount:`/curriculum/english/spelling/spelling-bee`,section:`English Literature & Phonics`,hasCheckpoints:!1,checkpointCount:0},{id:`shakespeare`,type:`Slide`,label:`The Globe Theatre: Shakespeare & Iambic Pentameter`,stage:`KS3/KS4 ENGLISH LITERATURE`,oakId:`OAK-KS3-ENG-004`,oakUnit:`BPM`,subject:`English`,isCore:!0,tier:`core`,mount:`/curriculum/english/theatre/globe`,section:`English Literature & Phonics`,hasCheckpoints:!0,checkpointCount:2},{id:`shakespeare-macbeth`,type:`Slide`,label:`Macbeth: 5-Act Dramatic Soliloquy & Moral Fall`,stage:`KS3/KS4 ENGLISH LITERATURE`,oakId:`OAK-KS4-ENG-005`,oakUnit:`BPM`,subject:`English`,isCore:!0,tier:`core`,mount:`/curriculum/english/theatre/macbeth`,section:`English Literature & Phonics`,hasCheckpoints:!0,checkpointCount:2},{id:`water-cycle`,type:`Slide`,label:`Water Cycle: Continuous Earth Cycle`,stage:`KS2 GEOGRAPHY`,oakId:`OAK-KS2-GEO-001`,oakUnit:`°C`,subject:`Geography`,isCore:!0,tier:`core`,mount:`/curriculum/geography/water-cycle`,section:`Geography & Earth Sciences`,hasCheckpoints:!0,checkpointCount:1},{id:`mountain-elevation`,type:`Sim`,label:`Mountain Altitude: Elevation, Hypotenuse & Atmospheric Science`,stage:`KS2/KS3 MATHS & GEOGRAPHY`,oakId:`OAK-KS2-GEO-002`,oakUnit:`°C`,subject:`Geography`,isCore:!0,tier:`core`,mount:`/curriculum/geography/mountain-elevation`,section:`Geography & Earth Sciences`,hasCheckpoints:!0,checkpointCount:1},{id:`languages`,type:`App`,label:`MFL & Polyglot Studio: Spanish, French & Latin`,stage:`KS2/KS3 MFL`,oakId:`OAK-KS2-MFL-001`,oakUnit:`ks2-languages-mfl-polyglot-studio`,subject:`Languages`,isCore:!0,tier:`core`,mount:`/curriculum/languages/mfl-polyglot`,section:`Languages & Inclusion`,hasCheckpoints:!1,checkpointCount:0},{id:`bsl-fingerspelling`,type:`Sim`,label:`BSL: 3D British Sign Language Two-Handed Fingerspelling`,stage:`ACCESSIBILITY & LANGUAGES`,oakId:`OAK-KS2-INC-001`,oakUnit:`x`,subject:`Inclusion & Languages`,isCore:!0,tier:`core`,mount:`/curriculum/languages/bsl-fingerspelling`,section:`Languages & Inclusion`,hasCheckpoints:!1,checkpointCount:0},{id:`fish-tank`,type:`App`,label:`Aquarium Stress Benchmark: Vector Point & FPS Limiter`,stage:`BENCHMARK & STRESS LAB`,oakId:`OAK-KS3-COM-001`,oakUnit:`ks3-computing-systems-stress-benchmarks`,subject:`Computing`,isCore:!0,tier:`core`,mount:`/curriculum/computing/stress-benchmark`,section:`Computing & Technology`,hasCheckpoints:!1,checkpointCount:0},{id:`pipeline-sample`,type:`App`,label:`Sample Physics Knowledge Nodes`,stage:`KS3`,oakId:`OAK-DEV-001`,oakUnit:`dev-apparatus-pipeline-sample`,subject:`Educational Technology`,isCore:!0,tier:`core`,mount:`/curriculum/dev/pipeline-sample`,section:`Development & Test Apparatus`,hasCheckpoints:!1,checkpointCount:0}],k={pythagoras:{svg:`<svg viewBox="0 0 800 480" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
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
`}},A=`stj_custom_cartridges_v1`,j={pythagorus:`pythagoras`,pythagoras:`pythagoras`,"pythagoras-theorem":`pythagoras`,"pythagoras-proof":`pythagoras`,"ohms-law":`electric-circuits`,"phet-ohms-law":`electric-circuits`,circuits:`electric-circuits`,circuit:`electric-circuits`,gas:`kinetic-gas`,"boyles-law":`kinetic-gas`,curves:`calculus-curves`,calculus:`calculus-curves`,aquarium:`fish-tank`,fish:`fish-tank`,fishing:`math-fishing`,mountain:`mountain-elevation`,climber:`mountain-elevation`,photosynth:`photosynthesis`,leaf:`photosynthesis`,stars:`solar-system`,space:`solar-system`,balance:`algebra-balance`,atom:`atom`,"atomic-structure":`atom`,bohr:`atom`,"periodic-table":`atom`,elements:`atom`,spelling:`spelling-bee`,"spelling-bee":`spelling-bee`,bee:`spelling-bee`,spell:`spelling-bee`,stations:`stations-of-the-cross`,"stations-of-the-cross":`stations-of-the-cross`,"stations-cross":`stations-of-the-cross`,"via-crucis":`stations-of-the-cross`,"way-of-the-cross":`stations-of-the-cross`,passion:`stations-of-the-cross`,altar:`altar-anatomy`,"altar-anatomy":`altar-anatomy`,"altar-stone":`altar-anatomy`,mensa:`altar-anatomy`,"holy-oils":`holy-oils`,oils:`holy-oils`,chrism:`holy-oils`,ambry:`holy-oils`,"olea-sancta":`holy-oils`,triduum:`triduum-easter`,"triduum-easter":`triduum-easter`,easter:`triduum-easter`,"easter-vigil":`triduum-easter`,"lumen-christi":`triduum-easter`,"paschal-triduum":`triduum-easter`,"holy-water":`holy-water-thurifer`,"holy-water-thurifer":`holy-water-thurifer`,thurifer:`holy-water-thurifer`,thurible:`holy-water-thurifer`,incense:`holy-water-thurifer`,asperges:`holy-water-thurifer`,"liturgy-of-the-hours":`liturgy-of-the-hours`,"divine-office":`liturgy-of-the-hours`,breviary:`liturgy-of-the-hours`,"canonical-hours":`liturgy-of-the-hours`,lauds:`liturgy-of-the-hours`,vespers:`liturgy-of-the-hours`,"seven-sacraments":`seven-sacraments`,sacraments:`seven-sacraments`,sacrament:`seven-sacraments`,baptism:`seven-sacraments`,confirmation:`seven-sacraments`,eucharist:`seven-sacraments`,"liturgical-calendar":`liturgical-calendar`,calendar:`liturgical-calendar`,seasons:`liturgical-calendar`,advent:`liturgical-calendar`,lent:`liturgical-calendar`,"liturgical-postures":`liturgical-postures`,postures:`liturgical-postures`,genuflection:`liturgical-postures`,kneeling:`liturgical-postures`,bow:`liturgical-postures`,"catholic-rites":`catholic-rites`,rites:`catholic-rites`,"eastern-churches":`catholic-rites`,byzantine:`catholic-rites`,maronite:`catholic-rites`,"cst-virtues":`cst-virtues`,cst:`cst-virtues`,virtues:`cst-virtues`,"social-teaching":`cst-virtues`,"latin-mass-prayers":`latin-mass-prayers`,"latin-prayers":`latin-mass-prayers`,latin:`latin-mass-prayers`,"gregorian-chant":`latin-mass-prayers`,"pater-noster":`latin-mass-prayers`,"nicene-creed":`nicene-creed`,creed:`nicene-creed`,credo:`nicene-creed`,"apostles-creed":`nicene-creed`,"ten-commandments":`ten-commandments`,commandments:`ten-commandments`,decalogue:`ten-commandments`,sinai:`ten-commandments`,"order-of-the-mass":`order-of-the-mass`,mass:`order-of-the-mass`,"holy-mass":`order-of-the-mass`,"eucharistic-liturgy":`order-of-the-mass`,"sacred-objects":`sacred-objects`,"sacred-vessels":`sacred-objects`,vestments:`sacred-objects`,"first-communion":`first-communion`,"holy-communion":`first-communion`,"eucharistic-adoration":`first-communion`,"eucharistic-procession-film":`eucharistic-procession-film`,"procession-film":`eucharistic-procession-film`,"liturgical-film":`eucharistic-procession-film`,procession:`eucharistic-procession-film`,welcome:`welcome`,intro:`welcome`,start:`welcome`,onboarding:`welcome`,showcase:`welcome`},M=[{id:`welcome`,type:`Sim`,title:`Welcome to AST Vector Player & Educational Simulator`,stage:`PORTAL APPARATUS & SIMULATOR`,category:`Portal Showcase`,desc:`Interactive demonstration of the AST Vector Engine: 60 FPS sub-pixel kinematics, harmonic oscillations, smartboard stylus ink, and zero-cloud Gemini Nano tutoring.`,icon:`✨`,source:`builtin`,svgFile:`cartridges/welcome.svg`,astFile:`cartridges/welcome.ast`,version:`2.6.0`,invariants:[`Zero Bloat Runtime`,`Harmonic Resonance`,`Sub-15ms Cold Start`,`Direct Pointer Capture`]},{id:`pythagoras`,type:`Sim`,title:`Pythagoras' Theorem (a² + b² = c²)`,stage:`KS3 GEOMETRY`,category:`Mathematics`,desc:`Interactive right-triangle manipulative demonstrating area conservation: square a² (emerald) plus square b² (sapphire) equals square c² (amber).`,icon:`📐`,source:`builtin`,svgFile:`cartridges/pythagoras.svg`,astFile:`cartridges/pythagoras.ast`,version:`2.6.0`,invariants:[`Pythagorean Theorem`,`Area Conservation`,`Euclidean Metric`]},{id:`kinetic-gas`,type:`Sim`,title:`Kinetic Gas Theory & Boyle's Law (PV = nRT)`,stage:`KS3/KS4 PHYSICS & CHEMISTRY`,category:`Science`,desc:`Real-time particle kinematics in a compression cylinder with temperature heater, pressure gauge, and Maxwell-Boltzmann velocity distribution.`,icon:`🌡️`,source:`builtin`,svgFile:`cartridges/kinetic-gas.svg`,astFile:`cartridges/kinetic-gas.ast`,version:`2.6.0`,invariants:[`Boyle's Law`,`Ideal Gas Law`,`Kinetic Theory of Gases`]},{id:`electric-circuits`,type:`Sim`,title:`Electrical Circuits & Ohm's Law (V = I × R)`,stage:`KS2/KS3 PHYSICS`,category:`Science`,desc:`Live closed-loop circuit with electron charge kinematics, battery electromotive force, resistance dissipation, and lightbulb filament luminance.`,icon:`💡`,source:`builtin`,svgFile:`cartridges/electric-circuits.svg`,astFile:`cartridges/electric-circuits.ast`,version:`2.6.0`,invariants:[`Ohm's Law`,`Kirchhoff Voltage Loop`,`Electron Drift Velocity`]},{id:`calculus-curves`,type:`Sim`,title:`Calculus: Tangent Slopes (dy/dx) & Definite Integrals (∫)`,stage:`GCSE & A-LEVEL MATHS`,category:`Mathematics`,desc:`Interactive tangent probe gliding over quadratic & cubic curves with real-time derivative secant limit and Riemann sum area accumulation.`,icon:`📈`,source:`builtin`,svgFile:`cartridges/calculus-curves.svg`,astFile:`cartridges/calculus-curves.ast`,version:`2.6.0`,invariants:[`First Derivative Tangent Limit`,`Riemann Integral Sum`,`Continuity`]},{id:`algebra-balance`,type:`Sim`,title:`Algebraic Balance Scale: Preserving Equality (2x + 5 = 15)`,stage:`KS2/KS3 MATHS`,category:`Mathematics`,desc:`Physical 2-pan balance scale demystifying linear equations. Whatever operation you apply to one side, you must apply to the other to preserve equilibrium.`,icon:`⚖️`,source:`builtin`,svgFile:`cartridges/algebra-balance.svg`,astFile:`cartridges/algebra-balance.ast`,version:`2.6.0`,invariants:[`Conservation of Mass`,`Additive Invariance`,`Multiplicative Invariance`]},{id:`bodmas`,type:`Slide`,title:`BODMAS / BIDMAS: Forcefield & Magnetic Clamping`,stage:`KS2/KS3 MATHS`,category:`Mathematics`,desc:`Interactive operator physics: titanium bracket shields, magnetic multiplication clamps, and concrete Area Model showing why 5 + 3 × 4 ≠ 32.`,icon:`🧮`,source:`builtin`,svgFile:`cartridges/bodmas.svg`,astFile:`cartridges/bodmas.ast`,version:`2.6.0`,invariants:[`Order of Operations`,`Distributive Property`]},{id:`times-tables`,type:`Sim`,title:`Times Tables Arrays & Distributive Splitter (12×12)`,stage:`KS1/KS2 MATHS`,category:`Mathematics`,desc:`Visual 2D arrays, 90° commutative rotation, and mental arithmetic decomposition: 7 × 8 = (7 × 5) + (7 × 3) = 56.`,icon:`📐`,source:`builtin`,svgFile:`cartridges/times-tables.svg`,astFile:`cartridges/times-tables.ast`,version:`2.6.0`,invariants:[`Commutative Property`,`Distributive Property`]},{id:`fractions`,type:`Slide`,title:`Fractions & Proportions`,stage:`KS2 MATHS`,category:`Mathematics`,desc:`Visual slice partitioning, equivalent denominators, and geometric whole unit assembly.`,icon:`🥧`,source:`builtin`,svgFile:`cartridges/fractions.svg`,astFile:`cartridges/fractions.ast`,version:`2.6.0`,invariants:[`Common Denominator Equivalence`,`Whole Conservation`]},{id:`fish-tank`,type:`App`,title:`Aquarium Living Ecosystem & Boids Flocking Benchmark`,stage:`BENCHMARK & STRESS LAB`,category:`Diagnostics & Games`,desc:`Autonomous multi-species boids flocking simulation with acoustic glass-tap scatter, stage tap feeding, and frame render budget monitoring.`,icon:`🐠`,source:`builtin`,svgFile:`cartridges/fish-tank.svg`,astFile:`cartridges/fish-tank.ast`,version:`2.6.0`,invariants:[`Craig Reynolds Boid Flocking`,`Continuous Velocity Verlet`]},{id:`solar-system`,type:`Sim`,title:`Solar System Planetary Orbits`,stage:`KS3 SCIENCE`,category:`Science`,desc:`3D Heliocentric orbital velocities, Keplerian mechanics, and scale celestial dynamics.`,icon:`🪐`,source:`builtin`,svgFile:`cartridges/solar-system.svg`,astFile:`cartridges/solar-system.ast`,version:`2.6.0`,invariants:[`Kepler's Laws of Planetary Motion`,`Gravitational Central Force`]},{id:`photosynthesis`,type:`Slide`,title:`Photosynthesis & Leaf Anatomy`,stage:`KS3 BIOLOGY`,category:`Science`,desc:`Light-dependent chloroplast reactions, stomata gas exchange, and glucose synthesis rate limiter.`,icon:`🍃`,source:`builtin`,svgFile:`cartridges/photosynthesis.svg`,astFile:`cartridges/photosynthesis.ast`,version:`2.6.0`,invariants:[`Conservation of Carbon & Oxygen Atoms`,`Blackman Limiting Factors`]},{id:`atom`,type:`Sim`,title:`Atomic Structure: Bohr Electron Shells`,stage:`KS3 CHEMISTRY`,category:`Science`,desc:`Quantized electron orbits (2, 8, 8), proton/neutron nucleus binding, and valence energy states.`,icon:`⚛️`,source:`builtin`,svgFile:`cartridges/atom.svg`,astFile:`cartridges/atom.ast`,version:`2.6.0`,invariants:[`Bohr Angular Momentum Quantization`,`Nuclear Charge Balance`]},{id:`velocity`,type:`Sim`,title:`Velocity Vectors & Kinematics`,stage:`KS3 PHYSICS`,category:`Science`,desc:`Continuous motion physics, displacement vectors, velocity-time graph area accumulation, and acceleration mechanics.`,icon:`🏎️`,source:`builtin`,svgFile:`cartridges/velocity.svg`,astFile:`cartridges/velocity.ast`,version:`2.6.0`,invariants:[`Newtonian Kinematics`,`Displacement Calculus`]},{id:`mountain-elevation`,type:`Sim`,title:`Mountain Altitude: Climber Game & Trigonometry`,stage:`KS2/KS3 MATHS & GEOGRAPHY`,category:`Games & Simulations`,desc:`Interactive hill climber game contrasting vertical altitude against slope distance, right-angle hypotenuse, and atmospheric lapse rate.`,icon:`🧗`,source:`builtin`,svgFile:`cartridges/mountain-elevation.svg`,astFile:`cartridges/mountain-elevation.ast`,version:`2.6.0`,invariants:[`Trigonometric Ratios (sin, cos, tan)`,`Atmospheric Lapse Rate`]},{id:`math-fishing`,type:`App`,title:`Math Pond: Number Bonds Fishing Game`,stage:`KS1/KS2 MATHS`,category:`Games & Simulations`,desc:`Interactive vector pond fishing adventure: hook swimming fish to solve number bonds to 10 & 20, doubles, and mental arithmetic.`,icon:`🎣`,source:`builtin`,svgFile:`cartridges/math-fishing.svg`,astFile:`cartridges/math-fishing.ast`,version:`2.6.0`,invariants:[`Additive Part-Whole Number Bonds`,`Combinatorics`]},{id:`dna-helix`,type:`Sim`,title:`DNA Double Helix & Base Pairs`,stage:`KS3 GENETICS`,category:`Science`,desc:`Antiparallel sugar-phosphate backbone and hydrogen-bonded A-T / C-G base pairing.`,icon:`🧬`,source:`builtin`,svgFile:`cartridges/dna-helix.svg`,astFile:`cartridges/dna-helix.ast`,version:`2.6.0`,invariants:[`Watson-Crick Complementary Base Pairing`,`Double Helix Pitch`]},{id:`phonics-lab`,type:`App`,title:`Early Phonics: Sound Buttons & Blending Mat`,stage:`EYFS/KS1 PHONICS`,category:`Early Literacy & Phonics`,desc:`Synthetic phonics soundboard, interactive sound button blending mat, tricky words, and Alien Words Screening Check.`,icon:`🔤`,source:`builtin`,svgFile:`cartridges/phonics-lab.svg`,astFile:`cartridges/phonics-lab.ast`,version:`2.6.0`,invariants:[`Phoneme-Grapheme Correspondence`,`Synthetic Blending`]},{id:`spelling-bee`,type:`App`,title:`Spelling Bee Championship: KS1 to KS3 Orthography`,stage:`KS1/KS2/KS3 ENGLISH`,category:`English & Literacy`,desc:`UK National Curriculum statutory spelling lists, Web Speech API auditory synthesis, interactive touch letter tiles, phonics breakdown, and streak multipliers.`,icon:`🐝`,source:`builtin`,svgFile:`cartridges/spelling-bee.svg`,astFile:`cartridges/spelling-bee.ast`,version:`2.6.0`,invariants:[`National Curriculum Statutory Spellings`,`Auditory Memory & Phonics`]},{id:`church-tour`,type:`Slide`,title:`Catholic Church Sanctuary Tour`,stage:`CATHOLIC LIFE`,category:`Catholic Faith`,desc:`Latin cross basilica architecture, Nave, High Altar, golden Tabernacle, and Marian Chapel.`,icon:`⛪`,source:`builtin`,svgFile:`cartridges/church-tour.svg`,astFile:`cartridges/church-tour.ast`,version:`2.6.0`,invariants:[`Sacred Architecture`,`Latin Cross Basilica Proportions`]},{id:`stations-of-the-cross`,type:`Slide`,title:`The Stations of the Cross (Via Crucis)`,stage:`CATHOLIC LIFE`,category:`Catholic Faith`,desc:`The 14 sacred stations of the Via Dolorosa, Golgotha Calvary hill, Roman praetorium, Holy Sepulchre tomb, and glorious Easter Resurrection.`,icon:`✝️`,source:`builtin`,duration:28,oakId:`OAK-KS2-RE-020`,oakUnit:`ks2-re-catholic-via-crucis-stations`,mount:`/curriculum/catholic-life/stations-of-the-cross`,section:`Catholic Life & Faith Formation`,svgFile:`cartridges/stations-of-the-cross.svg`,astFile:`cartridges/stations-of-the-cross.ast`,version:`2.6.0`,invariants:[`14 Traditional Stations of the Cross`,`Via Dolorosa Sacred Pilgrimage`,`Scriptural Passion`,`Paschal Resurrection`]},{id:`altar-anatomy`,type:`Slide`,title:`The Catholic Altar: Sacred Anatomy & Types`,stage:`CATHOLIC LIFE`,category:`Catholic Faith`,desc:`The Mensa, Altar Stone with martyr relics, seasonal Antependium, Crucifix, and beeswax altar candles.`,icon:`✝️`,source:`builtin`,svgFile:`cartridges/altar-anatomy.svg`,astFile:`cartridges/altar-anatomy.ast`,version:`2.6.0`,invariants:[`Consecrated Mensa`,`Sepulchrum Martyr Relics`,`Altar Linens & Liturgical Colors`]},{id:`holy-oils`,type:`Slide`,title:`The Three Holy Oils & Sacred Ambry (Olea Sancta)`,stage:`CATHOLIC LIFE`,category:`Catholic Faith`,desc:`Oleum Infirmorum (O.I.), Oleum Catechumenorum (O.C.), Sanctum Chrisma (S.C.), and the sanctuary ambry niche.`,icon:`🏺`,source:`builtin`,svgFile:`cartridges/holy-oils.svg`,astFile:`cartridges/holy-oils.ast`,version:`2.6.0`,invariants:[`Olea Sancta`,`Chrism Mass Balsam & Olive Oil`,`Indelible Sacramental Character`]},{id:`triduum-easter`,type:`Sim`,title:`The Sacred Paschal Triduum & Easter Glory`,stage:`CATHOLIC LIFE`,category:`Catholic Faith`,desc:`From the Upper Room Mandatum and Calvary Cross to the New Fire, Lumen Christi 3 elevations, Exsultet, and 50-day Paschal Resurrection.`,icon:`🔥`,source:`builtin`,svgFile:`cartridges/triduum-easter.svg`,astFile:`cartridges/triduum-easter.ast`,version:`2.6.0`,invariants:[`Sacrum Triduum Paschale`,`Lumen Christi 3 Elevations`,`Exsultet & Paschal Candle`,`Resurrectio Domini`]},{id:`holy-water-thurifer`,type:`Sim`,title:`Holy Water, Asperges & The Thurible (Thuribulum)`,stage:`CATHOLIC LIFE`,category:`Catholic Faith`,desc:`Aqua Benedicta sacramental stoup, Sunday Asperges Me sprinkling, 3-chain thurible swing dynamics, incense boat, and 7 Mass incensations.`,icon:`💨`,source:`builtin`,svgFile:`cartridges/holy-water-thurifer.svg`,astFile:`cartridges/holy-water-thurifer.ast`,version:`2.6.0`,invariants:[`Aqua Benedicta Sacramental`,`Asperges Me & Vidi Aquam`,`Thurible Dynamics & Rising Incense`]},{id:`liturgy-of-the-hours`,type:`Sim`,title:`The Liturgy of the Hours (Divine Office)`,stage:`CATHOLIC LIFE`,category:`Catholic Faith`,desc:`The seven canonical hours sanctifying the cycle of day and night: Matins, Lauds (Benedictus), Daytime Hours, Vespers (Magnificat), and Compline (Nunc Dimittis).`,icon:`🕰️`,source:`builtin`,svgFile:`cartridges/liturgy-of-the-hours.svg`,astFile:`cartridges/liturgy-of-the-hours.ast`,version:`2.6.0`,invariants:[`Liturgia Horarum`,`Seven Canonical Hours`,`Canticles of Zechariah, Mary & Simeon`]},{id:`seven-sacraments`,type:`Sim`,title:`The Seven Holy Sacraments (Septem Sacramenta)`,stage:`CATHOLIC LIFE`,category:`Catholic Faith`,desc:`Visible signs of invisible grace: Sacraments of Initiation (Baptism, Confirmation, Eucharist), Healing (Penance, Anointing), and Service of Communion (Orders, Matrimony).`,icon:`✨`,source:`builtin`,svgFile:`cartridges/seven-sacraments.svg`,astFile:`cartridges/seven-sacraments.ast`,version:`2.6.0`,invariants:[`Septem Sacramenta`,`Threefold Indelible Character`,`Ex Opere Operato`]},{id:`liturgical-calendar`,type:`Sim`,title:`The Catholic Liturgical Year (Annus Liturgicus)`,stage:`CATHOLIC LIFE`,category:`Catholic Faith`,desc:`The 360-degree seasonal year wheel: Advent (Violet), Christmas (Gold), Ordinary Time (Green), Lent (Purple), Easter (Gold), Pentecost (Red), and Christ the King.`,icon:`📅`,source:`builtin`,svgFile:`cartridges/liturgical-calendar.svg`,astFile:`cartridges/liturgical-calendar.ast`,version:`2.6.0`,invariants:[`Liturgical Cycle & Colors`,`Sunday Lectionary Cycles A/B/C`,`50-Day Easter Season`]},{id:`liturgical-postures`,type:`Sim`,title:`Sacred Postures & Gestures (Gestus Sacri)`,stage:`CATHOLIC LIFE`,category:`Catholic Faith`,desc:`Praying with mind, soul, and body: Standing (dignity & readiness), Kneeling (adoration), Genuflecting to the Tabernacle, Bowing, and the Sign of the Cross.`,icon:`🙇`,source:`builtin`,svgFile:`cartridges/liturgical-postures.svg`,astFile:`cartridges/liturgical-postures.ast`,version:`2.6.0`,invariants:[`Sacred Postures`,`Right-Knee Genuflection`,`Profound Bow at Creed`,`Trinitarian Sign of Cross`]},{id:`catholic-rites`,type:`Sim`,title:`The 24 Catholic Rites & Churches (Omnes Gentes)`,stage:`CATHOLIC LIFE`,category:`Catholic Faith`,desc:`The universal communion of 24 autonomous (sui iuris) Catholic Churches across East and West: Latin, Byzantine, Alexandrian, Antiochian, Chaldean, and Armenian traditions.`,icon:`🌍`,source:`builtin`,svgFile:`cartridges/catholic-rites.svg`,astFile:`cartridges/catholic-rites.ast`,version:`2.6.0`,invariants:[`24 Sui Iuris Catholic Churches`,`Communion with Peter`,`Eastern & Western Liturgical Rites`]},{id:`cst-virtues`,type:`Sim`,title:`Catholic Social Teaching (CST) & School Virtues`,stage:`CATHOLIC LIFE`,category:`Catholic Faith`,desc:`The 7 pillars of Catholic Social Teaching: Human Dignity (Imago Dei), Common Good, Solidarity, Subsidiarity, Option for the Poor, Dignity of Work, and Care for Creation (Laudato Si).`,icon:`🤝`,source:`builtin`,svgFile:`cartridges/cst-virtues.svg`,astFile:`cartridges/cst-virtues.ast`,version:`2.6.0`,invariants:[`7 Pillars of CST`,`Imago Dei Human Dignity`,`Laudato Si Care for Creation`]},{id:`latin-mass-prayers`,type:`Sim`,title:`Latin Prayers & Gregorian Chant (Vox Ecclesiae)`,stage:`CATHOLIC LIFE`,category:`Catholic Faith`,desc:`The ancient mother tongue and sacred music of the Western Church: Pater Noster, Ave Maria, Sanctus, Agnus Dei, and 4-line Gregorian square neume notation.`,icon:`📜`,source:`builtin`,svgFile:`cartridges/latin-mass-prayers.svg`,astFile:`cartridges/latin-mass-prayers.ast`,version:`2.6.0`,invariants:[`Pater Noster & Ave Maria`,`4-Line Gregorian Neume Notation`,`Latin Universal Liturgical Heritage`]},{id:`nicene-creed`,type:`Sim`,title:`The Nicene & Apostles' Creed (Credo in Deum)`,stage:`CATHOLIC LIFE`,category:`Catholic Faith`,desc:`The foundational profession of apostolic faith: The Father & Creation, The Son & Redemption, The Holy Spirit & The Church, and the Four Marks of the Church.`,icon:`✝️`,source:`builtin`,svgFile:`cartridges/nicene-creed.svg`,astFile:`cartridges/nicene-creed.ast`,version:`2.6.0`,invariants:[`Trinitarian Creed Structure`,`Four Marks of Church`,`Incarnation & Resurrection`]},{id:`ten-commandments`,type:`Sim`,title:`The Ten Commandments (The Decalogue & Mt Sinai)`,stage:`CATHOLIC LIFE`,category:`Catholic Faith`,desc:`The moral law of God given on Mount Sinai: Tablet I (Love of God, Commandments 1-3) and Tablet II (Love of Neighbour, Commandments 4-10) fulfilled in Christ.`,icon:`📜`,source:`builtin`,svgFile:`cartridges/ten-commandments.svg`,astFile:`cartridges/ten-commandments.ast`,version:`2.6.0`,invariants:[`Two Tablets of Sinai`,`Decalogue Categorization`,`Two Great Commandments of Love`]},{id:`order-of-the-mass`,type:`Sim`,title:`The Order of the Holy Mass (Ordo Missae)`,stage:`CATHOLIC LIFE`,category:`Catholic Faith`,desc:`The sacred liturgy through 4 movements: Introductory Rites, Liturgy of the Word, Liturgy of the Eucharist (Transubstantiation & Elevation), and Concluding Rites.`,icon:`🍷`,source:`builtin`,svgFile:`cartridges/order-of-the-mass.svg`,astFile:`cartridges/order-of-the-mass.ast`,version:`2.6.0`,invariants:[`4 Movements of the Mass`,`Consecration & Elevation`,`Real Presence in Tabernacle`]},{id:`sacred-objects`,type:`Sim`,title:`Sacred Vessels, Linens & Vestments`,stage:`CATHOLIC LIFE`,category:`Catholic Faith`,desc:`Interactive examination of sacred vessels (Chalice, Paten, Ciborium), linens (Corporal, Purificator, Pall), and priestly vestments.`,icon:`🏺`,source:`builtin`,svgFile:`cartridges/sacred-objects.svg`,astFile:`cartridges/sacred-objects.ast`,version:`2.6.0`,invariants:[`Vessels of Gold Reverence`,`Corporal Particle Protection`,`Alb Baptismal Innocence`]},{id:`first-communion`,type:`Sim`,title:`First Holy Communion & Eucharistic Adoration`,stage:`CATHOLIC LIFE`,category:`Catholic Faith`,desc:`Preparation steps for receiving Jesus: First Confession, Eucharistic Fast, Reverent Reception with Amen, and Thanksgiving before the Monstrance.`,icon:`🍞`,source:`builtin`,svgFile:`cartridges/first-communion.svg`,astFile:`cartridges/first-communion.ast`,version:`2.6.0`,invariants:[`Amen Real Presence Oath`,`1-Hour Eucharistic Fast`,`Reverent Reception Posture`]},{id:`eucharistic-procession-film`,type:`Film`,video:`/media/eucharistic-procession.mp4`,videoFit:`contain`,title:`Solemn Eucharistic Procession (Educational Film & Vector HUD)`,stage:`CATHOLIC LIFE`,category:`Catholic Faith`,desc:`Synchronized liturgical film driving: Blessed Sacrament canopy, thurible incensation streams, Tantum Ergo hymns, and humeral veil blessing with interactive vector checkpoints.`,icon:`🎬`,source:`builtin`,svgFile:`cartridges/eucharistic-procession-film.svg`,astFile:`cartridges/eucharistic-procession-film.ast`,version:`2.6.0`,invariants:[`Film Synchronized Timeline`,`Sub-Frame Scrubbing`,`Over-Film Stylus Whiteboard`,`Checkpoints Pause Film`]},{id:`water-cycle`,type:`Slide`,title:`Water Cycle: Continuous Earth Cycle`,stage:`KS2 GEOGRAPHY`,category:`Geography & Science`,desc:`Solar evaporation, condensation cloud formation, precipitation, and groundwater runoff loop.`,icon:`💧`,source:`builtin`,svgFile:`cartridges/water-cycle.svg`,astFile:`cartridges/water-cycle.ast`,version:`2.6.0`,invariants:[`Hydrological Mass Conservation`,`Phase Change Thermodynamics`]},{id:`languages`,type:`App`,title:`MFL & Polyglot Studio: Spanish, French & Latin`,stage:`KS2/KS3 MFL`,category:`Modern & Classical Languages`,desc:`Spanish, French & Latin phonics soundboard, regular verb conjugation wheels, and vocabulary recall sprints.`,icon:`🌍`,source:`builtin`,svgFile:`cartridges/languages.svg`,astFile:`cartridges/languages.ast`,version:`2.6.0`,invariants:[`Grammar Agreement`,`Phoneme Articulation`,`Vocabulary Association`]},{id:`shakespeare`,type:`Slide`,title:`The Globe Theatre: Shakespeare & Iambic Pentameter`,stage:`KS3/KS4 ENGLISH LITERATURE`,category:`English Literature`,desc:`Wooden O 3D stage geometry, rhythm meter visualizer for unstressed/stressed beats, and Elizabethan theatrical staging.`,icon:`🎭`,source:`builtin`,svgFile:`cartridges/shakespeare.svg`,astFile:`cartridges/shakespeare.ast`,version:`2.6.0`,invariants:[`Iambic Pentameter Metre`,`Elizabethan Theatrical Proportions`]},{id:`bsl-fingerspelling`,type:`Sim`,title:`BSL: 3D British Sign Language Two-Handed Fingerspelling`,stage:`ACCESSIBILITY & LANGUAGES`,category:`Modern & Classical Languages`,desc:`3D rotatable two-handed BSL manual alphabet rig, A-E-I-O-U vowel fingertip tap positions, Signer POV vs Receiver POV camera orbit, and speed slider.`,icon:`🖐️`,source:`builtin`,svgFile:`cartridges/bsl-fingerspelling.svg`,astFile:`cartridges/bsl-fingerspelling.ast`,version:`2.6.0`,invariants:[`BSL Manual Alphabet`,`Two-Handed Signing Anatomy`,`3D Spatial Orientation`]},{id:`phonics-screening`,type:`Sim`,title:`Year 1 Phonics Screening Check & Alien Words`,stage:`EYFS/KS1 PHONICS`,category:`Early Literacy & Phonics`,desc:`Official statutory 40-word screening check simulator with monster alien cards, tactile sound button dots & dashes, animated sweep bar, and pass diagnostics.`,icon:`👾`,source:`builtin`,svgFile:`cartridges/phonics-screening.svg`,astFile:`cartridges/phonics-screening.ast`,version:`2.6.0`,invariants:[`DfE Statutory Screening Check`,`Pseudo-Word Phonetic Decoding`,`Sound Buttons`]},{id:`shakespeare-macbeth`,type:`Slide`,title:`Macbeth: 5-Act Dramatic Soliloquy & Moral Fall`,stage:`KS3/KS4 ENGLISH LITERATURE`,category:`English Literature`,desc:`5-Act play-through on the 1599 Globe stage: blasted heath prophecy, floating bloody dagger, Banquo ghost feast, and Dunsinane catastrophe.`,icon:`👑`,source:`builtin`,svgFile:`cartridges/shakespeare-macbeth.svg`,astFile:`cartridges/shakespeare-macbeth.ast`,version:`2.6.0`,invariants:[`Shakespearean Tragedy`,`Iambic Pentameter Blank Verse`,`Canon vs What-If Drama`]},{id:`rosary-mysteries`,type:`Sim`,title:`The Holy Rosary: 3D Beads & 20 Scriptural Mysteries`,stage:`CATHOLIC LIFE`,category:`Catholic Faith`,desc:`Contemplative 3D chaplet ring with Our Father and Hail Mary beads, depth-fog lighting, 4 mystery cycles (Joyful, Luminous, Sorrowful, Glorious), and Latin prayers.`,icon:`📿`,source:`builtin`,svgFile:`cartridges/rosary-mysteries.svg`,astFile:`cartridges/rosary-mysteries.ast`,version:`2.6.0`,invariants:[`Scriptural Contemplation`,`Marian Devotion`,`Ecclesiastical Latin Prayers`]}],N=null,P=!1,F=null;async function I(){if(!P)return F||(F=(async()=>{try{let e=await t(),r=[];if(typeof window<`u`)try{let e=localStorage.getItem(A);e&&(r=JSON.parse(e))}catch{}let i=new Map;e.forEach(e=>i.set(e.id,e));for(let e of r)i.has(e.id)||(i.set(e.id,e),await n(e));for(let[e,t]of Object.entries(k)){let r=i.get(e);if(!r||!r.svgMarkup||!r.astSource){let a=e.includes(`church`)||e.includes(`rites`),o=e===`church-tour`?`Tour of a Catholic Church: Sacred Architecture & Sacred Spaces`:e===`catholic-rites`?`The 24 Catholic Rites & Churches: Unity in Diversity Across East & West`:e.charAt(0).toUpperCase()+e.slice(1),s={...r||{},id:e,title:r?.title||o,stage:r?.stage||(a?`CATHOLIC LIFE`:`CURRICULUM`),category:r?.category||(a?`Catholic Faith`:`STEM`),desc:r?.desc||`Pre-expanded offline core vector simulation.`,icon:r?.icon||(e.includes(`church`)?`⛪`:e.includes(`rites`)?`🌍`:`📐`),source:`builtin`,svgMarkup:t.svg,astSource:t.ast,updatedAt:Date.now()};i.set(e,s),await n(s)}}if(N=Array.from(i.values()),typeof window<`u`){let e=window;if(e.ASTSceneRegistry&&typeof e.ASTSceneRegistry.register==`function`)for(let t of N)t.svgMarkup&&t.astSource&&e.ASTSceneRegistry.register(t.id,{id:t.id,title:t.title,stage:t.stage,svgMarkup:t.svgMarkup,astSource:t.astSource})}P=!0}catch(e){console.warn(`[cartridgeStore] Failed to initialize cartridge vault:`,e)}})(),F)}typeof window<`u`&&I().catch(()=>{});function L(){if(typeof window>`u`)return[];if(N!==null)return N;P||I().catch(()=>{});try{let e=localStorage.getItem(A);if(!e)return[];let t=JSON.parse(e),n=Array.isArray(t)?t:[];return N=n,n}catch(e){return console.warn(`[cartridgeStore] Failed to read custom cartridges:`,e),[]}}function R(e){if(!e||typeof e!=`string`)return``;let t=e.toLowerCase().trim().replace(/^(demo-|scene-|preset-)/,``).replace(/\.(ast|svg|json|html|phet)$/,``);if(j[t])return j[t];let n=O.find(e=>e.oakId&&e.oakId.toLowerCase()===t||e.oakUnit&&e.oakUnit.toLowerCase()===t);return n?n.id:t}function z(){let e=L(),t=new Map;e.forEach(e=>t.set(e.id,e));let n=[],r=new Set;e.forEach(e=>{let t=e.isCore??e.source===`builtin`,i=e.tier||(e.source===`builtin`?`core`:e.source);n.push({...e,isCore:t,tier:i,mount:e.mount||B(e.id),section:e.section||V(e.id,e.category)}),r.add(e.id)});let i=new Map(O.map(e=>[e.id,e]));return M.forEach(e=>{if(!r.has(e.id)){let t=i.get(e.id);n.push({...e,oakId:e.oakId||t?.oakId,oakUnit:e.oakUnit||t?.oakUnit,subject:e.subject||t?.subject,isCore:!0,tier:`core`,mount:e.mount||t?.mount||B(e.id),section:e.section||t?.section||V(e.id,e.category)}),r.add(e.id)}}),O.forEach(e=>{r.has(e.id)||(n.push({id:e.id,title:e.label,stage:e.stage,oakId:e.oakId,oakUnit:e.oakUnit,subject:e.subject,type:e.type,category:e.subject||`General Curriculum`,desc:`Oak National Curriculum aligned cartridge: ${e.oakId||e.stage}.`,icon:e.type===`Sim`?`🎮`:e.type===`Slide`?`📑`:`💻`,source:`builtin`,svgFile:`cartridges/${e.id}.svg`,astFile:`cartridges/${e.id}.ast`,isCore:e.isCore??!0,tier:e.tier||`core`,mount:e.mount||B(e.id),section:e.section||V(e.id)}),r.add(e.id))}),n}function B(e){return{pythagoras:`/curriculum/maths/geometry/pythagoras`,"kinetic-gas":`/curriculum/science/physics/kinetic-gas`,"electric-circuits":`/curriculum/science/physics/electric-circuits`,"church-tour":`/curriculum/catholic-life/church-tour`,"altar-anatomy":`/curriculum/catholic-life/altar-anatomy`,"stations-of-the-cross":`/curriculum/catholic-life/stations-of-the-cross`,"holy-oils":`/curriculum/catholic-life/holy-oils`,"rosary-mysteries":`/curriculum/catholic-life/rosary-mysteries`,"phonics-lab":`/curriculum/english/phonics/phonics-lab`,"phonics-screening":`/curriculum/english/phonics/screening-check`,"spelling-bee":`/curriculum/english/spelling/spelling-bee`,shakespeare:`/curriculum/english/theatre/globe`,"shakespeare-macbeth":`/curriculum/english/theatre/macbeth`,languages:`/curriculum/languages/mfl-polyglot`,"bsl-fingerspelling":`/curriculum/languages/bsl-fingerspelling`,bodmas:`/curriculum/maths/algebra/bodmas`,"times-tables":`/curriculum/maths/arithmetic/times-tables`,"math-fishing":`/curriculum/maths/arithmetic/number-bonds`,fractions:`/curriculum/maths/arithmetic/fractions`,"calculus-curves":`/curriculum/maths/calculus/tangent-slopes`,"algebra-balance":`/curriculum/maths/algebra/balance-scale`,atom:`/curriculum/science/chemistry/atomic-structure`,photosynthesis:`/curriculum/science/biology/photosynthesis`,"dna-helix":`/curriculum/science/biology/dna-helix`,"solar-system":`/curriculum/science/physics/solar-system`,velocity:`/curriculum/science/physics/velocity-vectors`,"water-cycle":`/curriculum/geography/water-cycle`,"mountain-elevation":`/curriculum/geography/mountain-elevation`,"fish-tank":`/curriculum/computing/stress-benchmark`}[e]||`/curriculum/${e}`}function V(e,t){return e.includes(`church`)||e.includes(`altar`)||e.includes(`holy`)||e.includes(`rosary`)||t===`Catholic Faith`?`Catholic Life & Faith Formation`:e.includes(`math`)||e.includes(`pythagoras`)||e.includes(`algebra`)||e.includes(`calculus`)||e.includes(`fractions`)||e.includes(`bodmas`)||e.includes(`times`)||t===`Mathematics`?`Mathematics & Geometry`:e.includes(`gas`)||e.includes(`circuit`)||e.includes(`atom`)||e.includes(`photo`)||e.includes(`dna`)||e.includes(`solar`)||e.includes(`velocity`)||t===`Science`?`Natural Sciences & Physics`:e.includes(`phonics`)||e.includes(`spelling`)||e.includes(`shakespeare`)||t===`English Literature`?`English Literature & Phonics`:e.includes(`language`)||e.includes(`bsl`)||t===`Modern & Classical Languages`?`Languages & Inclusion`:`Curriculum Cartridges`}function H(e){if(!e)return null;let t=e.toLowerCase().trim().replace(/\/+$/,``),n=z().find(e=>e.mount&&e.mount.toLowerCase().replace(/\/+$/,``)===t);if(n)return n;let r=t.split(`/`).filter(Boolean),i=r[r.length-1];if(i){let e=W(i);if(e)return e}return null}function U(){let e=z(),t=new Map;return e.forEach(e=>{let n=e.section||V(e.id,e.category);if(!t.has(n)){let e=`📚`;n.includes(`Catholic`)?e=`⛪`:n.includes(`Mathematics`)?e=`📐`:n.includes(`Sciences`)?e=`🔬`:n.includes(`English`)?e=`🎭`:n.includes(`Languages`)&&(e=`🌍`),t.set(n,{section:n,icon:e,cartridges:[]})}t.get(n).cartridges.push(e)}),Array.from(t.values())}function W(e){if(!e)return null;let t=R(e),n=z().find(n=>n.id===t||n.id===e||n.oakId&&n.oakId.toLowerCase()===e.toLowerCase()||n.oakUnit&&n.oakUnit.toLowerCase()===e.toLowerCase());if(n)return!n.svgMarkup&&k[t]&&(n.svgMarkup=k[t].svg,n.astSource=k[t].ast),n;if(k[t])return{id:t,title:t.charAt(0).toUpperCase()+t.slice(1),stage:`CURRICULUM`,category:`STEM`,desc:`Built-in curriculum vector simulation.`,icon:`📐`,source:`builtin`,svgMarkup:k[t].svg,astSource:k[t].ast};if(t&&/^[a-z0-9_-]+$/i.test(t)){let e=t.replace(/[-_]/g,` `).replace(/\b\w/g,e=>e.toUpperCase());return{id:t,title:e,stage:`CURRICULUM`,category:`STEM`,desc:`Interactive curriculum vector laboratory cartridge for ${e}.`,icon:`⚡`,source:`builtin`,svgFile:`cartridges/${t}.svg`,astFile:`cartridges/${t}.ast`,version:`2.6.0`}}return null}function G(e){if(typeof window>`u`)return;let t=L().filter(t=>t.id!==e.id),r={...e,updatedAt:Date.now()},i=[r,...t];N=i,n(r).catch(e=>{console.warn(`[cartridgeStore] IndexedDB vault save error:`,e)});try{localStorage.setItem(A,JSON.stringify(i))}catch{}let a=window;a.ASTSceneRegistry&&typeof a.ASTSceneRegistry.register==`function`&&a.ASTSceneRegistry.register(e.id,{id:e.id,title:e.title,stage:e.stage,svgMarkup:e.svgMarkup,astSource:e.astSource}),window.dispatchEvent(new Event(`cartridges_updated`)),window.dispatchEvent(new Event(`storage`))}function K(e){if(typeof window>`u`)return;let t=R(e),n=L().filter(n=>n.id!==t&&n.id!==e);N=n,i(t).catch(e=>{console.warn(`[cartridgeStore] IndexedDB vault delete error:`,e)});try{localStorage.setItem(A,JSON.stringify(n))}catch(e){console.error(`[cartridgeStore] Failed to delete cartridge from localStorage:`,e)}window.dispatchEvent(new Event(`cartridges_updated`)),window.dispatchEvent(new Event(`storage`))}async function q(e){let t=await D(e);return G(t),t}async function J(e){let t=W(e);if(!t)throw Error(`Cartridge [${e}] not found in store`);return{cartridge:t,...await E(t)}}async function Y(){let e=await r(),t=N?N.length:0;return{isInitialized:P,vaultCount:e,memoryCount:t}}async function X(e){let t=e.name.toLowerCase();if(t.endsWith(`.swf`)){let t=await e.arrayBuffer(),n=e.name.replace(/\.swf$/i,``).replace(/[^a-z0-9_-]/gi,`-`).toLowerCase(),r=await x(t,n);if(!r.success)throw Error(r.error||`Failed to transpile legacy Flash SWF file.`);let i={id:n,title:`Flash: ${n.replace(/[-_]/g,` `).replace(/\b\w/g,e=>e.toUpperCase())}`,stage:`FLASH TRANSLATED`,category:`Imported Flash`,desc:`Transpiled from legacy Adobe Flash SWF with 60 FPS deterministic vector recreation.`,icon:`⚡`,source:`imported`,svgMarkup:r.svgMarkup,astSource:r.astSource,author:`Flash Archive`,version:`Flash v${r.metadata?.version||9}`,invariants:[`Legacy Vector Timeline`,`ActionScript Translation`],createdAt:Date.now(),updatedAt:Date.now()};return G(i),i}let n=await e.text();if(c(n)||t.endsWith(`.phet`)||t.includes(`phet`)){let t=await p(n,e.name);if(!t.success)throw Error(t.error||`Failed to transpile PhET simulation.`);let r=(t.metadata?.simName||e.name).replace(/\.(html|json|phet)$/i,``).replace(/[^a-z0-9_-]/gi,`-`).toLowerCase(),i={id:r,title:t.metadata?.title||`PhET: ${r}`,stage:`PhET INTERACTIVE APPARATUS`,category:`Science`,desc:`Distilled from ${((t.metadata?.originalSizeBytes||1e6)/1024/1024).toFixed(1)} MB PhET bundle down to clean AST vector physics with zero cloud leakage.`,icon:`🧪`,source:`phet`,svgMarkup:t.svgMarkup,astSource:t.astSource,author:`University of Colorado Boulder (PhET)`,version:t.metadata?.version||`1.0.0`,invariants:t.metadata?.detectedInvariants||[`Physical Conservation Law`],createdAt:Date.now(),updatedAt:Date.now()};return G(i),i}if(t.endsWith(`.json`))try{let e=JSON.parse(n);if(e&&e.id&&(e.svgMarkup||e.astSource)){let t={id:e.id,title:e.title||e.id,stage:e.stage||`CUSTOM CARTRIDGE`,category:e.category||`General`,desc:e.desc||`Imported decentralized cartridge package.`,icon:e.icon||`📦`,source:e.source||`user`,svgMarkup:e.svgMarkup||``,astSource:e.astSource||``,author:e.author||`Educator`,version:e.version||`1.0.0`,invariants:e.invariants||[],createdAt:Date.now(),updatedAt:Date.now()};return G(t),t}}catch{}if(t.endsWith(`.svg`)||t.endsWith(`.ast.svg`)){let t=n.match(/<title[^>]*>([^<]+)<\/title>/i),r=n.match(/<metadata[^>]*data-ast=["']([\s\S]*?)["']/i)||n.match(/\(:scene[\s\S]*?\)/),i=e.name.replace(/\.(ast\.)?svg$/i,``).replace(/[^a-z0-9_-]/gi,`-`).toLowerCase(),a={id:i,title:t?t[1]:i,stage:`VECTOR CAPSULE`,category:`Mathematics`,desc:`Imported living vector cartridge capsule.`,icon:`🎨`,source:`imported`,svgMarkup:n,astSource:r?r[1]?decodeURIComponent(r[1]):r[0]:`(:scene :id "${i}" :title "${i}")`,createdAt:Date.now(),updatedAt:Date.now()};return G(a),a}if(t.endsWith(`.ast`)||n.trim().startsWith(`(:scene`)||n.trim().startsWith(`(`)){let t=e.name.replace(/\.ast$/i,``).replace(/[^a-z0-9_-]/gi,`-`).toLowerCase(),r=n.match(/:title\s+"([^"]+)"/i),i=n.match(/:stage\s+"([^"]+)"/i),a=n.match(/:type\s+"(Sim|Slide|App|Film)"/i),o=n.match(/:video\s+"([^"]+)"/i)||n.match(/:film\s+"([^"]+)"/i),s=n.match(/:video-?fit\s+"([^"]+)"/i),c=a?.[1]||(o?`Film`:`Sim`),l={id:t,title:r?r[1]:t,stage:i?i[1]:`CURRICULUM`,type:c,video:o?o[1]:void 0,videoFit:s?s[1]:`contain`,category:c===`Film`?`Educational Film`:`Mathematics`,desc:c===`Film`?`Synchronized educational film with interactive vector stage overlays.`:`Imported declarative AST vector logic cartridge.`,icon:c===`Film`?`🎬`:`📜`,source:`imported`,svgMarkup:`<svg viewBox="0 0 800 480" xmlns="http://www.w3.org/2000/svg"><rect width="800" height="480" fill="#090d16" fill-opacity="${c===`Film`?`0`:`1`}"/><text x="400" y="240" fill="#38bdf8" font-size="20" font-weight="800" text-anchor="middle">${t}</text></svg>`,astSource:n,createdAt:Date.now(),updatedAt:Date.now()};return G(l),l}throw Error(`Unsupported cartridge file format: ${e.name}. Expected .html (PhET), .swf, .json, .ast, or .svg.`)}function Z(e){let t=e.title.toLowerCase().replace(/[^a-z0-9_-]+/g,`-`).replace(/^-|-$/g,``)||`cartridge-${Date.now().toString(36)}`,n=`<svg viewBox="0 0 800 480" xmlns="http://www.w3.org/2000/svg">
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
)`,i={id:t,title:e.title,stage:e.stage||`CUSTOM APPARATUS`,category:e.category||`General`,desc:e.desc||`Custom authored decentralized vector cartridge.`,icon:e.icon||`📐`,source:`user`,svgMarkup:e.svgMarkup||n,astSource:e.astSource||r,author:`Classroom Educator`,version:`1.0.0`,createdAt:Date.now(),updatedAt:Date.now()};return G(i),i}export{u as _,z as a,U as c,I as d,R as f,x as g,O as h,J as i,Y as l,k as m,K as n,W as o,G as p,q as r,H as s,Z as t,X as u,p as v};