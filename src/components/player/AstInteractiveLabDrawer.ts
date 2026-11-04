// src/components/player/AstInteractiveLabDrawer.ts
/**
 * Reactive Invariant Parameter Manipulation Lab Drawer
 * Pure Vanilla TypeScript / DOM component.
 * 
 * Provides interactive parameter sliders and telemetry readouts for:
 * - Calculus (dy/dx derivatives, tangent slopes, Riemann definite integrals)
 * - Verlet Springs & Pendulums (Harmonic oscillators, Hooke's Law, gravity fields)
 * - Kinetic Gas & Thermodynamics (PV = nRT, Boyle's Law, phase transitions)
 * - Invariant Manipulatives (Pythagoras, BODMAS, Photosynthesis, Kinematics, Circuits, Algebra)
 */

import { CALCULUS_PRESETS, CalculusPlotter } from '../../utils/calculusPlotter';

export interface AstInteractiveLabDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  preset: string;
}

export function renderAstInteractiveLabDrawer(props: AstInteractiveLabDrawerProps): HTMLElement | null {
  if (!props.isOpen) return null;

  const { onClose, preset } = props;

  // Local state
  let pythA = 3;
  let pythB = 4;
  let bodmasA = 2;
  let bodmasB = 3;
  let bodmasC = 4;
  let sunlight = 75;
  let co2 = 420;
  let water = 80;
  let speed = 20;
  let angle = 45;
  let altitude = 2500;
  let rows = 6;
  let cols = 7;
  let balanceCoeff = 2;
  let balanceConst = 5;
  let balanceRight = 15;
  let balanceX = 5;
  let voltage = 12;
  let resistance = 4;
  let pendulumLength = 1.2;
  let gravityG = 9.81;
  let springK = 25;
  let massM = 0.5;
  let gasTempK = 300;
  let gasVolumeRatio = 1.0;
  let gasState: 'solid' | 'liquid' | 'gas' | 'brownian' = 'gas';
  let gasParticlesCount = 50;
  let calcPresetId = 'parabola';
  let calcX0 = 2.0;
  let calcA = 0.0;
  let calcB = 3.0;

  let activeTab: 'preset' | 'verlet' | 'kinetic-gas' | 'calculus' =
    preset === 'calculus-curves' ? 'calculus' : preset === 'kinetic-gas' ? 'kinetic-gas' : 'preset';

  const postVarToPlayer = (name: string, val: string | number | boolean) => {
    if (typeof window !== 'undefined') {
      const iframes = document.querySelectorAll('iframe');
      iframes.forEach((f) => {
        try {
          f.contentWindow?.postMessage({ type: 'SET_VAR', name, value: val }, '*');
        } catch {}
      });
    }
  };

  const container = document.createElement('div');
  container.className = 'ast-interactive-lab-drawer';
  container.style.cssText = `
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 360px;
    max-width: 90%;
    background: rgba(15, 23, 42, 0.96);
    backdrop-filter: blur(12px);
    border-left: 1px solid rgba(255, 255, 255, 0.15);
    z-index: 40;
    display: flex;
    flex-direction: column;
    box-shadow: -6px 0 25px rgba(0,0,0,0.5);
    color: #f8fafc;
    font-family: system-ui, sans-serif;
  `;

  function refresh() {
    container.innerHTML = '';

    // 1. Header
    const header = document.createElement('div');
    header.style.cssText = 'padding: 14px 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.12); display: flex; justify-content: space-between; align-items: center;';
    header.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 1.2rem;">🔬</span>
        <div>
          <h3 style="margin: 0; font-size: 0.95rem; font-weight: 800; color: #f8fafc;">
            Reactive Invariant Lab
          </h3>
          <span style="font-size: 0.7rem; color: #38bdf8; font-weight: 700;">
            Direct Variable Manipulation
          </span>
        </div>
      </div>
    `;

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.style.cssText = 'background: none; border: none; color: #94a3b8; font-size: 1.1rem; cursor: pointer; padding: 4px;';
    closeBtn.textContent = '✕';
    closeBtn.onclick = onClose;
    header.appendChild(closeBtn);
    container.appendChild(header);

    // 2. Tabs
    const tabsBar = document.createElement('div');
    tabsBar.style.cssText = 'display: flex; border-bottom: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.2);';

    const tabDefs: Array<{ id: 'preset' | 'verlet' | 'kinetic-gas' | 'calculus'; label: string; color: string }> = [
      { id: 'preset', label: '🔬 Scene Parameters', color: '#38bdf8' },
      { id: 'verlet', label: '🪢 Verlet Springs', color: '#c084fc' },
      { id: 'kinetic-gas', label: '🌡️ Gas Laws', color: '#f87171' },
      { id: 'calculus', label: '📐 Calculus (dy/dx)', color: '#38bdf8' },
    ];

    tabDefs.forEach((t) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      const isActive = activeTab === t.id;
      btn.style.cssText = `
        flex: 1;
        padding: 8px 6px;
        background: ${isActive ? 'rgba(56, 189, 248, 0.15)' : 'none'};
        border: none;
        border-bottom: ${isActive ? `2px solid ${t.color}` : '2px solid transparent'};
        color: ${isActive ? t.color : '#94a3b8'};
        font-size: 0.72rem;
        font-weight: 700;
        cursor: pointer;
      `;
      btn.textContent = t.label;
      btn.onclick = () => {
        activeTab = t.id;
        refresh();
      };
      tabsBar.appendChild(btn);
    });
    container.appendChild(tabsBar);

    // 3. Body Content
    const bodyContent = document.createElement('div');
    bodyContent.style.cssText = 'flex: 1; overflow-y: auto; padding: 16px;';

    if (activeTab === 'calculus') {
      const calcTab = document.createElement('div');

      // Header Badge
      const badge = document.createElement('div');
      badge.style.cssText = 'background: rgba(56, 189, 248, 0.15); padding: 10px; border-radius: 8px; margin-bottom: 14px; border: 1px solid rgba(56, 189, 248, 0.3);';
      badge.innerHTML = `
        <div style="font-size: 0.76rem; color: #7dd3fc; font-weight: 700; text-transform: uppercase;">
          Differentiation & Integration:
        </div>
        <div style="font-size: 1.05rem; font-weight: 900; color: #38bdf8; margin: 2px 0;">
          dy/dx = lim(&Delta;y/&Delta;x) &bull; &int; f(x) dx
        </div>
        <div style="font-size: 0.72rem; color: #cbd5e1;">
          Instantaneous tangent gradients, stationary turning points, and continuous Riemann area integration.
        </div>
      `;
      calcTab.appendChild(badge);

      // Curve Preset Selector
      const curveSelectBox = document.createElement('div');
      curveSelectBox.style.cssText = 'margin-bottom: 14px;';
      curveSelectBox.innerHTML = '<div style="font-size: 0.78rem; font-weight: 700; margin-bottom: 6px; color: #cbd5e1;">Function Curve Presets:</div>';

      const curveGrid = document.createElement('div');
      curveGrid.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 8px;';

      CALCULUS_PRESETS.forEach((p) => {
        const pBtn = document.createElement('button');
        pBtn.type = 'button';
        const isSelected = calcPresetId === p.id;
        pBtn.style.cssText = `
          padding: 8px;
          background: ${isSelected ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255,255,255,0.06)'};
          border: ${isSelected ? '1px solid #38bdf8' : '1px solid rgba(255,255,255,0.1)'};
          border-radius: 6px;
          color: ${isSelected ? '#f8fafc' : '#94a3b8'};
          text-align: left;
          cursor: pointer;
        `;
        pBtn.innerHTML = `
          <div style="font-size: 0.76rem; font-weight: 800;">${p.name}</div>
          <div style="font-size: 0.64rem; color: #38bdf8; font-family: monospace;">${p.latex}</div>
        `;
        pBtn.onclick = () => {
          calcPresetId = p.id;
          calcX0 = p.defaultX0;
          calcA = p.defaultA;
          calcB = p.defaultB;
          postVarToPlayer('calcPreset', p.id);
          refresh();
        };
        curveGrid.appendChild(pBtn);
      });
      curveSelectBox.appendChild(curveGrid);
      calcTab.appendChild(curveSelectBox);

      // Tangent Probe Slider x0
      const x0Box = document.createElement('div');
      x0Box.style.cssText = 'margin-bottom: 14px;';
      x0Box.innerHTML = `
        <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 700; margin-bottom: 4px;">
          <span>Tangent Probe (x₀):</span>
          <span style="color: #f43f5e;">x₀ = ${calcX0.toFixed(2)}</span>
        </div>
      `;
      const x0Input = document.createElement('input');
      x0Input.type = 'range';
      x0Input.min = '-4.0';
      x0Input.max = '4.0';
      x0Input.step = '0.1';
      x0Input.value = String(calcX0);
      x0Input.style.cssText = 'width: 100%; accent-color: #f43f5e;';
      x0Input.oninput = (e) => {
        calcX0 = Number((e.target as HTMLInputElement).value);
        postVarToPlayer('calcX0', calcX0);
        refresh();
      };
      x0Box.appendChild(x0Input);
      calcTab.appendChild(x0Box);

      // Definite Integral Bounds a and b
      const intBox = document.createElement('div');
      intBox.style.cssText = 'margin-bottom: 14px; background: rgba(0,0,0,0.2); padding: 10px; border-radius: 8px; border: 1px solid rgba(34, 197, 94, 0.2);';
      intBox.innerHTML = `
        <div style="font-size: 0.78rem; font-weight: 800; color: #86efac; margin-bottom: 6px;">
          Integral Boundaries [a, b]:
        </div>
        <div style="margin-bottom: 8px;">
          <div style="display: flex; justify-content: space-between; font-size: 0.74rem; color: #cbd5e1;">
            <span>Lower Limit (a):</span>
            <span style="color: #86efac; font-weight: 700;">a = ${calcA.toFixed(1)}</span>
          </div>
        </div>
      `;
      const aInput = document.createElement('input');
      aInput.type = 'range';
      aInput.min = '-4.0';
      aInput.max = String(calcB - 0.1);
      aInput.step = '0.1';
      aInput.value = String(calcA);
      aInput.style.cssText = 'width: 100%; accent-color: #22c55e; margin-bottom: 8px;';
      aInput.oninput = (e) => {
        calcA = Number((e.target as HTMLInputElement).value);
        postVarToPlayer('calcA', calcA);
        refresh();
      };
      intBox.appendChild(aInput);

      const bLabel = document.createElement('div');
      bLabel.innerHTML = `
        <div style="display: flex; justify-content: space-between; font-size: 0.74rem; color: #cbd5e1;">
          <span>Upper Limit (b):</span>
          <span style="color: #86efac; font-weight: 700;">b = ${calcB.toFixed(1)}</span>
        </div>
      `;
      intBox.appendChild(bLabel);

      const bInput = document.createElement('input');
      bInput.type = 'range';
      bInput.min = String(calcA + 0.1);
      bInput.max = '4.0';
      bInput.step = '0.1';
      bInput.value = String(calcB);
      bInput.style.cssText = 'width: 100%; accent-color: #22c55e;';
      bInput.oninput = (e) => {
        calcB = Number((e.target as HTMLInputElement).value);
        postVarToPlayer('calcB', calcB);
        refresh();
      };
      intBox.appendChild(bInput);
      calcTab.appendChild(intBox);

      // Calculus telemetry
      const activePreset = CALCULUS_PRESETS.find((p) => p.id === calcPresetId) || CALCULUS_PRESETS[0];
      const plotter = new CalculusPlotter();
      const tangent = plotter.calculateTangent(activePreset.fn, calcX0);
      const y0 = tangent.y0;
      const slope = tangent.slope;
      const integral = plotter.calculateDefiniteIntegral(activePreset.fn, calcA, calcB);
      const integralVal = integral.area;

      const telemDiv = document.createElement('div');
      telemDiv.style.cssText = 'background: #090d16; border: 1px solid #1e293b; border-radius: 10px; padding: 12px;';
      telemDiv.innerHTML = `
        <div style="font-size: 0.75rem; font-weight: 800; color: #94a3b8; margin-bottom: 8px;">
          CALCULUS TELEMETRY:
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px;">
          <div style="background: rgba(244, 63, 94, 0.1); padding: 8px; border-radius: 6px; text-align: center;">
            <div style="font-size: 0.65rem; color: #f43f5e;">Instant Slope dy/dx</div>
            <div style="font-size: 1.15rem; font-weight: 900; color: #f8fafc;">${slope.toFixed(2)}</div>
            <div style="font-size: 0.65rem; color: #94a3b8;">at x = ${calcX0.toFixed(2)}</div>
          </div>
          <div style="background: rgba(34, 197, 94, 0.1); padding: 8px; border-radius: 6px; text-align: center;">
            <div style="font-size: 0.65rem; color: #4ade80;">Area &int; f(x) dx</div>
            <div style="font-size: 1.15rem; font-weight: 900; color: #f8fafc;">${integralVal.toFixed(2)}</div>
            <div style="font-size: 0.65rem; color: #94a3b8;">[${calcA.toFixed(1)}, ${calcB.toFixed(1)}]</div>
          </div>
        </div>
        <div style="font-size: 0.74rem; color: #cbd5e1; line-height: 1.5;">
          <div>Function Height: <strong>f(${calcX0.toFixed(2)}) = ${y0.toFixed(2)}</strong></div>
          <div>Tangent Equation: <strong style="color: #f43f5e;">y = ${slope.toFixed(2)}x + ${(y0 - slope * calcX0).toFixed(2)}</strong></div>
        </div>
      `;
      calcTab.appendChild(telemDiv);

      bodyContent.appendChild(calcTab);
    } else if (activeTab === 'verlet') {
      const verletTab = document.createElement('div');
      verletTab.innerHTML = `
        <div style="background: rgba(168, 85, 247, 0.15); padding: 10px; border-radius: 8px; margin-bottom: 14px; border: 1px solid rgba(168, 85, 247, 0.3);">
          <div style="font-size: 0.76rem; color: #d8b4fe; font-weight: 700; text-transform: uppercase;">
            Verlet Integration & Hooke's Law:
          </div>
          <div style="font-size: 1.05rem; font-weight: 900; color: #c084fc; margin: 2px 0;">
            T = 2&pi;&radic;(L / g) &bull; F = -k&Delta;x
          </div>
          <div style="font-size: 0.72rem; color: #cbd5e1;">
            Pure mathematical numerical physics: spring-mass elasticity, pendulum period invariance, and gravity fields.
          </div>
        </div>
      `;

      // Gravity Field Selector
      const gravBox = document.createElement('div');
      gravBox.style.cssText = 'margin-bottom: 14px;';
      gravBox.innerHTML = '<div style="font-size: 0.78rem; font-weight: 700; margin-bottom: 6px; color: #cbd5e1;">Gravitational Acceleration (g):</div>';

      const gravGrid = document.createElement('div');
      gravGrid.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; margin-bottom: 8px;';

      const gravOptions = [
        { label: '🌕 Moon', g: 1.62 },
        { label: '🌍 Earth', g: 9.81 },
        { label: '🪐 Jupiter', g: 24.79 },
      ];

      gravOptions.forEach((item) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.style.cssText = `
          padding: 6px 4px;
          background: ${gravityG === item.g ? 'rgba(168, 85, 247, 0.3)' : 'rgba(255,255,255,0.06)'};
          border: ${gravityG === item.g ? '1px solid #a855f7' : '1px solid rgba(255,255,255,0.1)'};
          border-radius: 6px;
          color: ${gravityG === item.g ? '#f8fafc' : '#94a3b8'};
          font-size: 0.7rem;
          font-weight: 700;
          cursor: pointer;
        `;
        btn.textContent = item.label;
        btn.onclick = () => {
          gravityG = item.g;
          postVarToPlayer('gravity', gravityG);
          refresh();
        };
        gravGrid.appendChild(btn);
      });
      gravBox.appendChild(gravGrid);

      const gravSlider = document.createElement('input');
      gravSlider.type = 'range';
      gravSlider.min = '0.5';
      gravSlider.max = '30';
      gravSlider.step = '0.1';
      gravSlider.value = String(gravityG);
      gravSlider.style.cssText = 'width: 100%; accent-color: #a855f7;';
      gravSlider.oninput = (e) => {
        gravityG = Number((e.target as HTMLInputElement).value);
        postVarToPlayer('gravity', gravityG);
        refresh();
      };
      gravBox.appendChild(gravSlider);
      verletTab.appendChild(gravBox);

      // Pendulum Length Slider
      const pendBox = document.createElement('div');
      pendBox.style.cssText = 'margin-bottom: 14px;';
      pendBox.innerHTML = `
        <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 700; margin-bottom: 4px;">
          <span>Pendulum Length (L):</span>
          <span style="color: #38bdf8;">${pendulumLength.toFixed(2)} m</span>
        </div>
      `;
      const pendSlider = document.createElement('input');
      pendSlider.type = 'range';
      pendSlider.min = '0.2';
      pendSlider.max = '3.0';
      pendSlider.step = '0.05';
      pendSlider.value = String(pendulumLength);
      pendSlider.style.cssText = 'width: 100%; accent-color: #38bdf8;';
      pendSlider.oninput = (e) => {
        pendulumLength = Number((e.target as HTMLInputElement).value);
        postVarToPlayer('pendulumLength', pendulumLength);
        refresh();
      };
      pendBox.appendChild(pendSlider);
      verletTab.appendChild(pendBox);

      // Spring Stiffness k
      const springBox = document.createElement('div');
      springBox.style.cssText = 'margin-bottom: 14px;';
      springBox.innerHTML = `
        <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 700; margin-bottom: 4px;">
          <span>Spring Constant (k):</span>
          <span style="color: #facc15;">${springK} N/m</span>
        </div>
      `;
      const springSlider = document.createElement('input');
      springSlider.type = 'range';
      springSlider.min = '5';
      springSlider.max = '100';
      springSlider.step = '1';
      springSlider.value = String(springK);
      springSlider.style.cssText = 'width: 100%; accent-color: #facc15;';
      springSlider.oninput = (e) => {
        springK = Number((e.target as HTMLInputElement).value);
        postVarToPlayer('springK', springK);
        refresh();
      };
      springBox.appendChild(springSlider);
      verletTab.appendChild(springBox);

      // Oscillator Mass m
      const massBox = document.createElement('div');
      massBox.style.cssText = 'margin-bottom: 16px;';
      massBox.innerHTML = `
        <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 700; margin-bottom: 4px;">
          <span>Oscillator Mass (m):</span>
          <span style="color: #34d399;">${massM.toFixed(2)} kg</span>
        </div>
      `;
      const massSlider = document.createElement('input');
      massSlider.type = 'range';
      massSlider.min = '0.1';
      massSlider.max = '5.0';
      massSlider.step = '0.1';
      massSlider.value = String(massM);
      massSlider.style.cssText = 'width: 100%; accent-color: #34d399;';
      massSlider.oninput = (e) => {
        massM = Number((e.target as HTMLInputElement).value);
        postVarToPlayer('massM', massM);
        refresh();
      };
      massBox.appendChild(massSlider);
      verletTab.appendChild(massBox);

      // Verlet Telemetry
      const pendulumPeriod = 2 * Math.PI * Math.sqrt(pendulumLength / gravityG);
      const springPeriod = 2 * Math.PI * Math.sqrt(massM / springK);
      const springFreq = 1 / springPeriod;

      const verletTelem = document.createElement('div');
      verletTelem.style.cssText = 'background: #090d16; border: 1px solid #1e293b; border-radius: 10px; padding: 12px;';
      verletTelem.innerHTML = `
        <div style="font-size: 0.75rem; font-weight: 800; color: #94a3b8; margin-bottom: 8px;">
          VERLET HARMONIC TELEMETRY:
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px;">
          <div style="background: rgba(56, 189, 248, 0.1); padding: 6px; border-radius: 6px; text-align: center;">
            <div style="font-size: 0.65rem; color: #38bdf8;">Pendulum Period (T)</div>
            <div style="font-size: 1.05rem; font-weight: 900; color: #f8fafc;">${pendulumPeriod.toFixed(2)} s</div>
          </div>
          <div style="background: rgba(250, 204, 21, 0.1); padding: 6px; border-radius: 6px; text-align: center;">
            <div style="font-size: 0.65rem; color: #facc15;">Spring Frequency</div>
            <div style="font-size: 1.05rem; font-weight: 900; color: #f8fafc;">${springFreq.toFixed(2)} Hz</div>
          </div>
        </div>
        <div style="font-size: 0.74rem; color: #cbd5e1; line-height: 1.5; margin-bottom: 10px;">
          <div>Oscillator Restoring Force: <strong style="color: #facc15;">${(springK * 0.15).toFixed(1)} N</strong> (at 15cm displacement)</div>
          <div>Potential Energy: <strong style="color: #34d399;">${(0.5 * springK * 0.15 * 0.15).toFixed(2)} J</strong></div>
        </div>
      `;
      verletTab.appendChild(verletTelem);

      bodyContent.appendChild(verletTab);
    } else if (activeTab === 'kinetic-gas') {
      const gasTab = document.createElement('div');

      gasTab.innerHTML = `
        <div style="background: rgba(239, 68, 68, 0.15); padding: 10px; border-radius: 8px; margin-bottom: 14px; border: 1px solid rgba(239, 68, 68, 0.3);">
          <div style="font-size: 0.76rem; color: #fca5a5; font-weight: 700; text-transform: uppercase;">
            Ideal Gas Law & Phase Dynamics:
          </div>
          <div style="font-size: 1.1rem; font-weight: 900; color: #f87171; margin: 2px 0;">
            PV = nRT &bull; E_k = 3/2 k_B T
          </div>
          <div style="font-size: 0.72rem; color: #cbd5e1;">
            Direct kinetic molecular theory: particle collision frequency, chamber volume, temperature and phase change.
          </div>
        </div>
      `;

      // Phase State Selector
      const stateBox = document.createElement('div');
      stateBox.style.cssText = 'margin-bottom: 14px;';
      stateBox.innerHTML = '<div style="font-size: 0.78rem; font-weight: 700; margin-bottom: 6px; color: #cbd5e1;">Phase of Matter:</div>';

      const stateGrid = document.createElement('div');
      stateGrid.style.cssText = 'display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 8px;';

      const states = [
        { id: 'solid', label: '🧊 Solid Lattice', desc: 'Rigid bonds & vibration' },
        { id: 'liquid', label: '💧 Liquid Flow', desc: 'Loose glide & shear' },
        { id: 'gas', label: '💨 Kinetic Gas', desc: 'Elastic collisions' },
        { id: 'brownian', label: '🔬 Brownian Motion', desc: 'Heavy pollen impact' },
      ];

      states.forEach((s) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        const isSelected = gasState === s.id;
        btn.style.cssText = `
          padding: 8px;
          background: ${isSelected ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255,255,255,0.06)'};
          border: ${isSelected ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.1)'};
          border-radius: 6px;
          color: ${isSelected ? '#f8fafc' : '#94a3b8'};
          text-align: left;
          cursor: pointer;
        `;
        btn.innerHTML = `
          <div style="font-size: 0.76rem; font-weight: 800;">${s.label}</div>
          <div style="font-size: 0.64rem; color: #94a3b8;">${s.desc}</div>
        `;
        btn.onclick = () => {
          gasState = s.id as any;
          let targetTemp = 300;
          if (s.id === 'solid') targetTemp = 80;
          else if (s.id === 'liquid') targetTemp = 220;
          else if (s.id === 'gas') targetTemp = 300;
          gasTempK = targetTemp;
          postVarToPlayer('state', s.id);
          postVarToPlayer('temp', targetTemp);
          refresh();
        };
        stateGrid.appendChild(btn);
      });
      stateBox.appendChild(stateGrid);
      gasTab.appendChild(stateBox);

      // Volume slider
      const volBox = document.createElement('div');
      volBox.style.cssText = 'margin-bottom: 14px;';
      volBox.innerHTML = `
        <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 700; margin-bottom: 4px;">
          <span>Chamber Volume (V):</span>
          <span style="color: #38bdf8;">${Math.round(gasVolumeRatio * 100)}%</span>
        </div>
      `;
      const volSlider = document.createElement('input');
      volSlider.type = 'range';
      volSlider.min = '0.25';
      volSlider.max = '1.0';
      volSlider.step = '0.05';
      volSlider.value = String(gasVolumeRatio);
      volSlider.style.cssText = 'width: 100%; accent-color: #38bdf8;';
      volSlider.oninput = (e) => {
        gasVolumeRatio = Number((e.target as HTMLInputElement).value);
        postVarToPlayer('volume', gasVolumeRatio);
        refresh();
      };
      volBox.appendChild(volSlider);
      gasTab.appendChild(volBox);

      // Temperature slider
      const tempBox = document.createElement('div');
      tempBox.style.cssText = 'margin-bottom: 14px;';
      tempBox.innerHTML = `
        <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 700; margin-bottom: 4px;">
          <span>Temperature (T):</span>
          <span style="color: #f87171;">${gasTempK} K (${(gasTempK - 273.15).toFixed(0)}°C)</span>
        </div>
      `;
      const tempSlider = document.createElement('input');
      tempSlider.type = 'range';
      tempSlider.min = '50';
      tempSlider.max = '800';
      tempSlider.step = '10';
      tempSlider.value = String(gasTempK);
      tempSlider.style.cssText = 'width: 100%; accent-color: #ef4444;';
      tempSlider.oninput = (e) => {
        gasTempK = Number((e.target as HTMLInputElement).value);
        postVarToPlayer('temp', gasTempK);
        if (gasTempK <= 140) gasState = 'solid';
        else if (gasTempK <= 273) gasState = 'liquid';
        else gasState = 'gas';
        postVarToPlayer('state', gasState);
        refresh();
      };
      tempBox.appendChild(tempSlider);
      gasTab.appendChild(tempBox);

      // Gas telemetry
      const pressure = (101.3 * (gasTempK / 300)) / Math.max(0.25, gasVolumeRatio);
      const vrms = Math.round(Math.sqrt((3 * 8.314 * gasTempK) / 0.028));
      const wallCollisions = Math.round((gasParticlesCount * (vrms / 500) * (1 / gasVolumeRatio)) * 9.6);
      const pvConst = (pressure * gasVolumeRatio).toFixed(1);

      const gasTelem = document.createElement('div');
      gasTelem.style.cssText = 'background: rgba(0,0,0,0.3); padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);';
      gasTelem.innerHTML = `
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="font-size: 0.74rem; color: #94a3b8; font-weight: 800;">THERMAL TELEMETRY:</span>
          <span style="font-size: 0.74rem; color: #22c55e; font-weight: 900;">Boyle's P&times;V = ${pvConst}</span>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px;">
          <div style="background: rgba(56, 189, 248, 0.1); padding: 8px; border-radius: 6px; text-align: center;">
            <div style="font-size: 0.65rem; color: #38bdf8;">Measured Pressure</div>
            <div style="font-size: 1.15rem; font-weight: 900; color: #f8fafc;">${pressure.toFixed(1)} kPa</div>
          </div>
          <div style="background: rgba(234, 179, 8, 0.1); padding: 8px; border-radius: 6px; text-align: center;">
            <div style="font-size: 0.65rem; color: #facc15;">Thermal Speed (v_rms)</div>
            <div style="font-size: 1.15rem; font-weight: 900; color: #f8fafc;">${vrms} m/s</div>
          </div>
        </div>
        <div style="font-size: 0.74rem; color: #cbd5e1; line-height: 1.5;">
          <div>Wall Impulses: <strong style="color: #38bdf8;">${wallCollisions} collisions/sec</strong></div>
          <div>Molar Kinetic Energy: <strong style="color: #facc15;">${(1.5 * 8.314 * gasTempK).toFixed(0)} J/mol</strong></div>
        </div>
      `;
      gasTab.appendChild(gasTelem);

      bodyContent.appendChild(gasTab);
    } else {
      // PRESET-SPECIFIC PARAMETER LABS
      const presetTab = document.createElement('div');

      if (preset === 'pythagoras') {
        const a2 = pythA * pythA;
        const b2 = pythB * pythB;
        const c2 = a2 + b2;
        const c = Math.sqrt(c2);
        const isTriple = Number.isInteger(c);
        const angleDeg = (Math.atan(pythB / pythA) * (180 / Math.PI)).toFixed(1);

        presetTab.innerHTML = `
          <div style="background: rgba(59, 130, 246, 0.15); padding: 10px; border-radius: 8px; margin-bottom: 14px; border: 1px solid rgba(59, 130, 246, 0.3);">
            <div style="font-size: 0.76rem; color: #93c5fd; font-weight: 700; text-transform: uppercase;">
              Mathematical Invariant:
            </div>
            <div style="font-size: 1.1rem; font-weight: 900; color: #60a5fa; margin: 2px 0;">
              a² + b² = c²
            </div>
            <div style="font-size: 0.72rem; color: #cbd5e1;">
              The sum of the geometric square areas on the two legs always equals the square area on the hypotenuse.
            </div>
          </div>
        `;

        // Leg a slider
        const aBox = document.createElement('div');
        aBox.style.cssText = 'margin-bottom: 14px;';
        aBox.innerHTML = `
          <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 700; margin-bottom: 4px;">
            <span>Leg a (Base):</span>
            <span style="color: #38bdf8;">${pythA} units</span>
          </div>
        `;
        const aSlider = document.createElement('input');
        aSlider.type = 'range';
        aSlider.min = '1';
        aSlider.max = '10';
        aSlider.value = String(pythA);
        aSlider.style.cssText = 'width: 100%; accent-color: #38bdf8;';
        aSlider.oninput = (e) => {
          pythA = Number((e.target as HTMLInputElement).value);
          postVarToPlayer('sideA', pythA);
          refresh();
        };
        aBox.appendChild(aSlider);
        presetTab.appendChild(aBox);

        // Leg b slider
        const bBox = document.createElement('div');
        bBox.style.cssText = 'margin-bottom: 16px;';
        bBox.innerHTML = `
          <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 700; margin-bottom: 4px;">
            <span>Leg b (Height):</span>
            <span style="color: #f59e0b;">${pythB} units</span>
          </div>
        `;
        const bSlider = document.createElement('input');
        bSlider.type = 'range';
        bSlider.min = '1';
        bSlider.max = '10';
        bSlider.value = String(pythB);
        bSlider.style.cssText = 'width: 100%; accent-color: #f59e0b;';
        bSlider.oninput = (e) => {
          pythB = Number((e.target as HTMLInputElement).value);
          postVarToPlayer('sideB', pythB);
          refresh();
        };
        bBox.appendChild(bSlider);
        presetTab.appendChild(bBox);

        // Proof box
        const proofBox = document.createElement('div');
        proofBox.style.cssText = 'background: #090d16; border: 1px solid #1e293b; border-radius: 10px; padding: 12px;';
        proofBox.innerHTML = `
          <div style="font-size: 0.75rem; font-weight: 800; color: #94a3b8; margin-bottom: 8px;">
            LIVE GEOMETRIC PROOF:
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; text-align: center; margin-bottom: 10px;">
            <div style="background: rgba(56, 189, 248, 0.1); padding: 6px; border-radius: 6px;">
              <div style="font-size: 0.65rem; color: #38bdf8;">Area a²</div>
              <div style="font-size: 1rem; font-weight: 900; color: #f8fafc;">${a2}</div>
            </div>
            <div style="background: rgba(245, 158, 11, 0.1); padding: 6px; border-radius: 6px;">
              <div style="font-size: 0.65rem; color: #f59e0b;">Area b²</div>
              <div style="font-size: 1rem; font-weight: 900; color: #f8fafc;">${b2}</div>
            </div>
            <div style="background: rgba(74, 222, 128, 0.1); padding: 6px; border-radius: 6px;">
              <div style="font-size: 0.65rem; color: #4ade80;">Area c²</div>
              <div style="font-size: 1rem; font-weight: 900; color: #f8fafc;">${c2}</div>
            </div>
          </div>
          <div style="font-size: 0.84rem; font-weight: 700; color: #e2e8f0; margin-bottom: 6px;">
            Hypotenuse c = <strong style="color: #4ade80;">${c.toFixed(2)}</strong> units
          </div>
          <div style="font-size: 0.78rem; color: #94a3b8;">
            Angle &theta; = <strong>${angleDeg}&deg;</strong>
          </div>
          ${isTriple ? `
            <div style="margin-top: 8px; padding: 4px 8px; border-radius: 4px; background: rgba(34, 197, 94, 0.2); color: #4ade80; font-size: 0.72rem; font-weight: 800; text-align: center;">
              ⭐ Exact Pythagorean Integer Triple! (${pythA}, ${pythB}, ${c})
            </div>
          ` : ''}
        `;
        presetTab.appendChild(proofBox);
      } else if (preset === 'bodmas') {
        const product = bodmasB * bodmasC;
        const correct = bodmasA + product;
        const wrongMistake = (bodmasA + bodmasB) * bodmasC;

        presetTab.innerHTML = `
          <div style="background: rgba(168, 85, 247, 0.15); padding: 10px; border-radius: 8px; margin-bottom: 14px; border: 1px solid rgba(168, 85, 247, 0.3);">
            <div style="font-size: 0.76rem; color: #c084fc; font-weight: 700; text-transform: uppercase;">
              Order of Operations Invariant:
            </div>
            <div style="font-size: 1.1rem; font-weight: 900; color: #d8b4fe; margin: 2px 0;">
              A + (B &times; C)
            </div>
            <div style="font-size: 0.72rem; color: #cbd5e1;">
              Multiplication creates a locked 2D area before loose additive units can be combined.
            </div>
          </div>
        `;

        // Sliders for A, B, C
        [
          { label: 'A (Loose Units)', val: bodmasA, min: 1, max: 20, color: '#38bdf8', set: (v: number) => { bodmasA = v; } },
          { label: 'B (Row Factor)', val: bodmasB, min: 1, max: 12, color: '#f59e0b', set: (v: number) => { bodmasB = v; } },
          { label: 'C (Column Factor)', val: bodmasC, min: 1, max: 12, color: '#4ade80', set: (v: number) => { bodmasC = v; } },
        ].forEach((item) => {
          const row = document.createElement('div');
          row.style.cssText = 'margin-bottom: 12px;';
          row.innerHTML = `
            <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 700; margin-bottom: 4px;">
              <span>${item.label}:</span>
              <span style="color: ${item.color};">${item.val}</span>
            </div>
          `;
          const input = document.createElement('input');
          input.type = 'range';
          input.min = String(item.min);
          input.max = String(item.max);
          input.value = String(item.val);
          input.style.cssText = `width: 100%; accent-color: ${item.color};`;
          input.oninput = (e) => {
            item.set(Number((e.target as HTMLInputElement).value));
            refresh();
          };
          row.appendChild(input);
          presetTab.appendChild(row);
        });

        const proofDiv = document.createElement('div');
        proofDiv.style.cssText = 'background: #090d16; border: 1px solid #1e293b; border-radius: 10px; padding: 12px;';
        proofDiv.innerHTML = `
          <div style="font-size: 0.75rem; font-weight: 800; color: #94a3b8; margin-bottom: 8px;">
            EVALUATION TRACE:
          </div>
          <div style="font-size: 0.82rem; margin-bottom: 4px; color: #cbd5e1;">
            1. Evaluate Forcefield Clamp: <strong>${bodmasB} &times; ${bodmasC} = <span style="color: #facc15;">${product}</span></strong>
          </div>
          <div style="font-size: 0.82rem; margin-bottom: 8px; color: #cbd5e1;">
            2. Add Loose Units: <strong>${bodmasA} + ${product} = <span style="color: #4ade80; font-size: 0.95rem;">${correct}</span></strong>
          </div>
          <div style="padding: 8px; border-radius: 6px; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3);">
            <div style="font-size: 0.7rem; color: #f87171; font-weight: 800;">⚠️ VIOLATING BODMAS (LEFT-TO-RIGHT ERROR):</div>
            <div style="font-size: 0.78rem; color: #fca5a5;">
              (${bodmasA} + ${bodmasB}) &times; ${bodmasC} = <strong>${wrongMistake}</strong> (Error: difference of ${Math.abs(wrongMistake - correct)})
            </div>
          </div>
        `;
        presetTab.appendChild(proofDiv);
      } else if (preset === 'photosynthesis') {
        const co2Factor = Math.min(100, Math.round((co2 / 1000) * 100));
        const limitingFactorVal = Math.min(sunlight, co2Factor, water);
        let limitingName = 'Sunlight Photon Energy';
        if (limitingFactorVal === co2Factor) limitingName = 'Carbon Dioxide Supply';
        if (limitingFactorVal === water) limitingName = 'Water Transpiration';

        const glucoseRate = ((limitingFactorVal / 100) * 45).toFixed(1);
        const o2Rate = ((limitingFactorVal / 100) * 120).toFixed(0);

        presetTab.innerHTML = `
          <div style="background: rgba(34, 197, 94, 0.15); padding: 10px; border-radius: 8px; margin-bottom: 14px; border: 1px solid rgba(34, 197, 94, 0.3);">
            <div style="font-size: 0.76rem; color: #86efac; font-weight: 700; text-transform: uppercase;">
              Biochemical Rate Limiter:
            </div>
            <div style="font-size: 1.1rem; font-weight: 900; color: #4ade80; margin: 2px 0;">
              6 CO₂ + 6 H₂O &rarr; C₆H₁₂O₆ + 6 O₂
            </div>
            <div style="font-size: 0.72rem; color: #cbd5e1;">
              Liebig’s Law of the Minimum: The reaction rate is strictly governed by the scarcest reactant.
            </div>
          </div>
        `;

        // Sliders
        const photoSliders = [
          { label: '☀️ Sunlight Photon Flux', val: `${sunlight}%`, min: 0, max: 100, step: 1, cur: sunlight, color: '#facc15', set: (v: number) => { sunlight = v; } },
          { label: '💨 CO₂ Concentration', val: `${co2} ppm`, min: 200, max: 1200, step: 10, cur: co2, color: '#38bdf8', set: (v: number) => { co2 = v; } },
          { label: '💧 Soil H₂O Transpiration', val: `${water}%`, min: 0, max: 100, step: 1, cur: water, color: '#60a5fa', set: (v: number) => { water = v; } },
        ];

        photoSliders.forEach((item) => {
          const row = document.createElement('div');
          row.style.cssText = 'margin-bottom: 12px;';
          row.innerHTML = `
            <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 700; margin-bottom: 4px;">
              <span>${item.label}:</span>
              <span style="color: ${item.color};">${item.val}</span>
            </div>
          `;
          const input = document.createElement('input');
          input.type = 'range';
          input.min = String(item.min);
          input.max = String(item.max);
          input.step = String(item.step);
          input.value = String(item.cur);
          input.style.cssText = `width: 100%; accent-color: ${item.color};`;
          input.oninput = (e) => {
            item.set(Number((e.target as HTMLInputElement).value));
            refresh();
          };
          row.appendChild(input);
          presetTab.appendChild(row);
        });

        const photoTelem = document.createElement('div');
        photoTelem.style.cssText = 'background: #090d16; border: 1px solid #1e293b; border-radius: 10px; padding: 12px;';
        photoTelem.innerHTML = `
          <div style="font-size: 0.75rem; font-weight: 800; color: #94a3b8; margin-bottom: 8px;">
            CELLULAR SYNTHESIS OUTPUT:
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px;">
            <div style="background: rgba(34, 197, 94, 0.15); padding: 8px; border-radius: 6px; text-align: center;">
              <div style="font-size: 0.65rem; color: #86efac;">Glucose (C₆H₁₂O₆)</div>
              <div style="font-size: 1.1rem; font-weight: 900; color: #f8fafc;">${glucoseRate} g/hr</div>
            </div>
            <div style="background: rgba(56, 189, 248, 0.15); padding: 8px; border-radius: 6px; text-align: center;">
              <div style="font-size: 0.65rem; color: #7dd3fc;">Oxygen (O₂)</div>
              <div style="font-size: 1.1rem; font-weight: 900; color: #f8fafc;">${o2Rate} mL/min</div>
            </div>
          </div>
          <div style="font-size: 0.78rem; color: #f59e0b; font-weight: 700;">
            🛑 Current Limiting Reagent: <strong>${limitingName}</strong>
          </div>
        `;
        presetTab.appendChild(photoTelem);
      } else if (preset === 'electric-circuits') {
        const current = voltage / resistance;
        const power = voltage * current;
        const isOvercurrent = current > 6.0;

        presetTab.innerHTML = `
          <div style="background: rgba(234, 179, 8, 0.15); padding: 10px; border-radius: 8px; margin-bottom: 14px; border: 1px solid rgba(234, 179, 8, 0.3);">
            <div style="font-size: 0.76rem; color: #fde047; font-weight: 700; text-transform: uppercase;">
              Ohm's Law Invariant:
            </div>
            <div style="font-size: 1.1rem; font-weight: 900; color: #facc15; margin: 2px 0;">
              Current I = Voltage (V) &divide; Resistance (R)
            </div>
            <div style="font-size: 0.72rem; color: #cbd5e1;">
              Electrical pressure drives electron flow; circuit resistance dissipates energy into heat and light.
            </div>
          </div>
        `;

        // Voltage Slider
        const vBox = document.createElement('div');
        vBox.style.cssText = 'margin-bottom: 12px;';
        vBox.innerHTML = `
          <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 700; margin-bottom: 4px;">
            <span>Battery Voltage (V):</span>
            <span style="color: #38bdf8;">${voltage} Volts</span>
          </div>
        `;
        const vSlider = document.createElement('input');
        vSlider.type = 'range';
        vSlider.min = '1.5';
        vSlider.max = '24';
        vSlider.step = '0.5';
        vSlider.value = String(voltage);
        vSlider.style.cssText = 'width: 100%; accent-color: #38bdf8;';
        vSlider.oninput = (e) => {
          voltage = Number((e.target as HTMLInputElement).value);
          postVarToPlayer('voltage', voltage);
          refresh();
        };
        vBox.appendChild(vSlider);
        presetTab.appendChild(vBox);

        // Resistance Slider
        const rBox = document.createElement('div');
        rBox.style.cssText = 'margin-bottom: 14px;';
        rBox.innerHTML = `
          <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 700; margin-bottom: 4px;">
            <span>Resistor (R):</span>
            <span style="color: #f59e0b;">${resistance} &Omega;</span>
          </div>
        `;
        const rSlider = document.createElement('input');
        rSlider.type = 'range';
        rSlider.min = '1';
        rSlider.max = '20';
        rSlider.step = '0.5';
        rSlider.value = String(resistance);
        rSlider.style.cssText = 'width: 100%; accent-color: #f59e0b;';
        rSlider.oninput = (e) => {
          resistance = Number((e.target as HTMLInputElement).value);
          postVarToPlayer('resistance', resistance);
          refresh();
        };
        rBox.appendChild(rSlider);
        presetTab.appendChild(rBox);

        // Switch Buttons
        const swBox = document.createElement('div');
        swBox.style.cssText = 'margin-bottom: 14px; display: flex; gap: 8px;';

        const closeSwBtn = document.createElement('button');
        closeSwBtn.type = 'button';
        closeSwBtn.style.cssText = 'flex: 1; padding: 5px 8px; background: rgba(34, 197, 94, 0.2); border: 1px solid #22c55e; border-radius: 6px; color: #4ade80; font-size: 0.75rem; font-weight: 700; cursor: pointer;';
        closeSwBtn.textContent = '⚡ Close Switch';
        closeSwBtn.onclick = () => postVarToPlayer('switchClosed', true);

        const openSwBtn = document.createElement('button');
        openSwBtn.type = 'button';
        openSwBtn.style.cssText = 'flex: 1; padding: 5px 8px; background: rgba(239, 68, 68, 0.2); border: 1px solid #ef4444; border-radius: 6px; color: #f87171; font-size: 0.75rem; font-weight: 700; cursor: pointer;';
        openSwBtn.textContent = '⏹ Open Switch';
        openSwBtn.onclick = () => postVarToPlayer('switchClosed', false);

        swBox.appendChild(closeSwBtn);
        swBox.appendChild(openSwBtn);
        presetTab.appendChild(swBox);

        // Telemetry
        const circTelem = document.createElement('div');
        circTelem.style.cssText = 'background: #090d16; border: 1px solid #1e293b; border-radius: 10px; padding: 12px;';
        circTelem.innerHTML = `
          <div style="font-size: 0.75rem; font-weight: 800; color: #94a3b8; margin-bottom: 8px;">
            CIRCUIT TELEMETRY:
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px;">
            <div style="background: rgba(56, 189, 248, 0.1); padding: 6px; border-radius: 6px; text-align: center;">
              <div style="font-size: 0.65rem; color: #38bdf8;">Current (I)</div>
              <div style="font-size: 1.1rem; font-weight: 900; color: #f8fafc;">${current.toFixed(2)} A</div>
            </div>
            <div style="background: rgba(234, 179, 8, 0.1); padding: 6px; border-radius: 6px; text-align: center;">
              <div style="font-size: 0.65rem; color: #facc15;">Power (P)</div>
              <div style="font-size: 1.1rem; font-weight: 900; color: #f8fafc;">${power.toFixed(1)} W</div>
            </div>
          </div>
          <div style="font-size: 0.76rem; color: #cbd5e1; line-height: 1.5; margin-bottom: 8px;">
            <div>Electron Drift Velocity: <strong style="color: #38bdf8;">${(current * 0.4).toFixed(2)} mm/s</strong></div>
            <div>Filament Dissipation: <strong style="color: #facc15;">${power.toFixed(0)} Joules/sec</strong></div>
          </div>
          ${isOvercurrent ? `
            <div style="padding: 6px 8px; border-radius: 4px; background: rgba(239, 68, 68, 0.2); color: #fca5a5; font-size: 0.72rem; font-weight: 800; text-align: center;">
              ⚡ Warning: Current exceeds 6A safety threshold! Increase resistance.
            </div>
          ` : ''}
        `;
        presetTab.appendChild(circTelem);
      } else if (preset === 'times-tables') {
        const total = rows * cols;

        presetTab.innerHTML = `
          <div style="background: rgba(234, 179, 8, 0.15); padding: 10px; border-radius: 8px; margin-bottom: 14px; border: 1px solid rgba(234, 179, 8, 0.3);">
            <div style="font-size: 0.76rem; color: #fde047; font-weight: 700; text-transform: uppercase;">
              Standard School Times Table (1× to 12×):
            </div>
            <div style="font-size: 1.1rem; font-weight: 900; color: #facc15; margin: 2px 0;">
              ${rows} &times; ${cols} = ${total}
            </div>
            <div style="font-size: 0.72rem; color: #cbd5e1;">
              Standard UK curriculum 1 to 12 multiplication facts, commutative laws, and 12&times;12 grid.
            </div>
          </div>
        `;

        // Rows Box
        const rowBox = document.createElement('div');
        rowBox.style.cssText = 'margin-bottom: 14px;';
        rowBox.innerHTML = `
          <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 700; margin-bottom: 4px;">
            <span>Times Table:</span>
            <span style="color: #38bdf8;">${rows}&times;</span>
          </div>
        `;
        const rowSlider = document.createElement('input');
        rowSlider.type = 'range';
        rowSlider.min = '1';
        rowSlider.max = '12';
        rowSlider.value = String(rows);
        rowSlider.style.cssText = 'width: 100%; accent-color: #38bdf8;';
        rowSlider.oninput = (e) => {
          rows = Number((e.target as HTMLInputElement).value);
          postVarToPlayer('table', rows);
          refresh();
        };
        rowBox.appendChild(rowSlider);

        const rowChips = document.createElement('div');
        rowChips.style.cssText = 'display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px;';
        [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].forEach((num) => {
          const chip = document.createElement('button');
          chip.type = 'button';
          chip.style.cssText = `
            padding: 3px 7px;
            border-radius: 5px;
            font-size: 0.72rem;
            font-weight: 800;
            border: ${rows === num ? '1px solid #10b981' : '1px solid #334155'};
            background: ${rows === num ? '#059669' : '#1e293b'};
            color: ${rows === num ? '#ffffff' : '#cbd5e1'};
            cursor: pointer;
          `;
          chip.textContent = `${num}×`;
          chip.onclick = () => {
            rows = num;
            postVarToPlayer('table', num);
            refresh();
          };
          rowChips.appendChild(chip);
        });
        rowBox.appendChild(rowChips);
        presetTab.appendChild(rowBox);

        // Multiplier Box
        const multBox = document.createElement('div');
        multBox.style.cssText = 'margin-bottom: 16px;';
        multBox.innerHTML = `
          <div style="display: flex; justify-content: space-between; font-size: 0.8rem; font-weight: 700; margin-bottom: 4px;">
            <span>Multiplier (1 to 12):</span>
            <span style="color: #4ade80;">&times;${cols}</span>
          </div>
        `;
        const multSlider = document.createElement('input');
        multSlider.type = 'range';
        multSlider.min = '1';
        multSlider.max = '12';
        multSlider.value = String(cols);
        multSlider.style.cssText = 'width: 100%; accent-color: #4ade80;';
        multSlider.oninput = (e) => {
          cols = Number((e.target as HTMLInputElement).value);
          postVarToPlayer('multiplier', cols);
          refresh();
        };
        multBox.appendChild(multSlider);
        presetTab.appendChild(multBox);

        const timesTelem = document.createElement('div');
        timesTelem.style.cssText = 'background: #090d16; border: 1px solid #1e293b; border-radius: 10px; padding: 12px;';
        timesTelem.innerHTML = `
          <div style="font-size: 0.75rem; font-weight: 800; color: #94a3b8; margin-bottom: 6px;">
            MULTIPLICATION PROPERTIES:
          </div>
          <div style="font-size: 0.95rem; font-weight: 900; color: #f8fafc; margin-bottom: 6px;">
            ${rows} &times; ${cols} = <span style="color: #facc15;">${total}</span>
          </div>
          <div style="font-size: 0.76rem; color: #94a3b8; margin-bottom: 6px;">
            Commutative Law: ${rows} &times; ${cols} = ${cols} &times; ${rows} = ${total}
          </div>
          <div style="font-size: 0.76rem; color: #cbd5e1; background: rgba(255,255,255,0.06); padding: 6px 8px; border-radius: 6px;">
            Inverse Division: ${total} &divide; ${rows} = ${cols} &bull; ${total} &divide; ${cols} = ${rows}
          </div>
        `;
        presetTab.appendChild(timesTelem);
      } else {
        // Fallback
        presetTab.innerHTML = `
          <div style="text-align: center; padding: 2rem 1rem; color: #94a3b8;">
            <span style="font-size: 2rem; display: block; margin-bottom: 8px;">🔬</span>
            <h4 style="margin: 0 0 6px 0; color: #f8fafc; font-size: 0.95rem;">General AST Telemetry Active</h4>
            <p style="margin: 0; font-size: 0.78rem; line-height: 1.5;">
              This scene runs on declarative S-expression keyframes with real-time coordinate physics. Switch to Pythagoras, BODMAS, Photosynthesis, or Velocity to engage reactive mathematical parameter sliders!
            </p>
          </div>
        `;
      }

      bodyContent.appendChild(presetTab);
    }

    container.appendChild(bodyContent);

    // 4. Footer
    const footer = document.createElement('div');
    footer.style.cssText = 'padding: 12px 16px; border-top: 1px solid rgba(255,255,255,0.12); font-size: 0.72rem; color: #64748b; text-align: center;';
    footer.textContent = '⚡ 100% Client-Side Invariant Calculator • Zero Server Latency';
    container.appendChild(footer);
  }

  refresh();
  return container;
}

export const AstInteractiveLabDrawer = renderAstInteractiveLabDrawer;
export default renderAstInteractiveLabDrawer;
