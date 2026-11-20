// scripts/generate-reader-books.ts
/**
 * Generates 5 illustrated, 100% decodable early-reader storybook cartridges
 * (.svg + .ast pairs) in static/cartridges/ for the AST Vector Player.
 *
 * Each book is a native :type "Slide" cartridge featuring:
 *  - 5 custom vector-illustrated storybook spreads (viewBox 800x500)
 *  - Clickable words with toggleable UK DfE sound buttons (• / ━━ / ⌒ / ♥)
 *  - Tap-any-word Sound-Out Helper bar with pure synthetic phoneme playback
 *  - Read Page Aloud, Prev/Next buttons, ArrowLeft/ArrowRight keys, & page dots
 *  - Built-in end-of-book :interactive comprehension checkpoints
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  DECODABLE_MINI_BOOKS,
  decodeWordForReader,
  type DecodableMiniBook,
} from '../src/data/earlyReaderLadderData';
import { getPhonemeSpokenText } from '../src/data/phonicsCurriculumData';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const outDir = path.join(rootDir, 'static', 'cartridges');

interface BookCartridgeMeta {
  bookId: string;
  cartridgeId: string;
  oakId: string;
  oakUnit: string;
  accent: string;
  accentLight: string;
  scenes: string[];
}

const BOOK_CARTRIDGE_SPECS: BookCartridgeMeta[] = [
  {
    bookId: 'book-1-satpin',
    cartridgeId: 'reader-pat-sat',
    oakId: 'OAK-KS1-ENG-R01',
    oakUnit: 'eyfs-english-decodable-book-1-pat-sat',
    accent: '#0284c7',
    accentLight: '#e0f2fe',
    scenes: [
      // Page 0: Pat sat on a mat.
      `
        <rect x="36" y="64" width="728" height="220" fill="url(#warmRoomGrad)"/>
        <rect x="36" y="216" width="728" height="68" fill="#fde68a"/>
        <line x1="36" y1="216" x2="764" y2="216" stroke="#f59e0b" stroke-width="2" opacity="0.5"/>
        <!-- Window -->
        <rect x="550" y="84" width="130" height="92" rx="8" fill="#bae6fd" stroke="#78350f" stroke-width="5"/>
        <line x1="615" y1="84" x2="615" y2="176" stroke="#78350f" stroke-width="4"/>
        <line x1="550" y1="130" x2="680" y2="130" stroke="#78350f" stroke-width="4"/>
        <circle cx="648" cy="108" r="14" fill="#fde047"/>
        <!-- Woven Mat -->
        <ellipse cx="370" cy="248" rx="165" ry="26" fill="#0284c7"/>
        <ellipse cx="370" cy="248" rx="140" ry="18" fill="#38bdf8" stroke="#e0f2fe" stroke-width="3" stroke-dasharray="10 6"/>
        <!-- Pat sitting happily -->
        <g id="anim-pat-0">
          <ellipse cx="370" cy="222" rx="34" ry="26" fill="#ef4444"/>
          <path d="M 338 238 Q 320 250 344 252 L 396 252 Q 420 250 402 238 Z" fill="#1e3a8a"/>
          <circle cx="370" cy="176" r="28" fill="#fed7aa" stroke="#9a3412" stroke-width="2"/>
          <path d="M 342 172 Q 345 142 370 144 Q 395 142 398 172 Q 384 158 370 160 Q 356 158 342 172 Z" fill="#78350f"/>
          <circle cx="360" cy="174" r="3" fill="#0f172a"/>
          <circle cx="380" cy="174" r="3" fill="#0f172a"/>
          <path d="M 360 186 Q 370 195 380 186" stroke="#9a3412" stroke-width="2.5" fill="none" stroke-linecap="round"/>
          <!-- Waving arm -->
          <path d="M 400 208 Q 426 190 434 176" stroke="#fed7aa" stroke-width="11" stroke-linecap="round" fill="none"/>
        </g>
      `,
      // Page 1: Pat sat at a tap.
      `
        <rect x="36" y="64" width="728" height="220" fill="#ecfeff"/>
        <rect x="36" y="218" width="728" height="66" fill="#cbd5e1"/>
        <!-- Sink & Chrome Tap -->
        <rect x="440" y="176" width="190" height="104" rx="10" fill="#f8fafc" stroke="#94a3b8" stroke-width="3"/>
        <ellipse cx="535" cy="184" rx="68" ry="14" fill="#bae6fd" stroke="#64748b" stroke-width="2"/>
        <path d="M 595 178 L 595 126 Q 595 104 565 104 L 540 104 Q 528 104 528 122" stroke="#64748b" stroke-width="14" stroke-linecap="round" fill="none"/>
        <path d="M 595 178 L 595 126 Q 595 104 565 104 L 540 104 Q 528 104 528 122" stroke="#cbd5e1" stroke-width="7" stroke-linecap="round" fill="none"/>
        <rect x="576" y="128" width="38" height="8" rx="4" fill="#0284c7"/>
        <!-- Animated water drop -->
        <g id="anim-drop-1">
          <path d="M 528 134 Q 535 148 528 156 Q 521 148 528 134 Z" fill="#0ea5e9"/>
        </g>
        <!-- Pat sitting near tap -->
        <ellipse cx="300" cy="236" rx="34" ry="26" fill="#ef4444"/>
        <circle cx="300" cy="190" r="27" fill="#fed7aa" stroke="#9a3412" stroke-width="2"/>
        <path d="M 273 186 Q 276 158 300 160 Q 324 158 327 186 Q 312 172 300 174 Q 288 172 273 186 Z" fill="#78350f"/>
        <circle cx="292" cy="188" r="3" fill="#0f172a"/>
        <circle cx="310" cy="188" r="3" fill="#0f172a"/>
        <path d="M 294 200 Q 302 207 312 200" stroke="#9a3412" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      `,
      // Page 2: A tin pan is at the tap.
      `
        <rect x="36" y="64" width="728" height="220" fill="#f0f9ff"/>
        <rect x="36" y="218" width="728" height="66" fill="#e2e8f0"/>
        <!-- Big Chrome Tap -->
        <path d="M 490 220 L 490 124 Q 490 96 452 96 L 410 96 Q 394 96 394 118" stroke="#475569" stroke-width="18" stroke-linecap="round" fill="none"/>
        <path d="M 490 220 L 490 124 Q 490 96 452 96 L 410 96 Q 394 96 394 118" stroke="#cbd5e1" stroke-width="9" stroke-linecap="round" fill="none"/>
        <!-- Shiny Tin Pan -->
        <g id="anim-pan-2">
          <rect x="240" y="206" width="90" height="12" rx="6" fill="#334155"/>
          <path d="M 326 196 L 462 196 L 448 248 L 340 248 Z" fill="#94a3b8" stroke="#475569" stroke-width="3"/>
          <ellipse cx="394" cy="196" rx="68" ry="12" fill="#e2e8f0" stroke="#475569" stroke-width="2.5"/>
          <ellipse cx="394" cy="198" rx="54" ry="7" fill="#38bdf8" opacity="0.65"/>
        </g>
        <path d="M 394 134 Q 402 152 394 162 Q 386 152 394 134 Z" fill="#0ea5e9"/>
      `,
      // Page 3: Tap, tap, tap! A tin pan did tip.
      `
        <rect x="36" y="64" width="728" height="220" fill="#eff6ff"/>
        <rect x="36" y="222" width="728" height="62" fill="#cbd5e1"/>
        <!-- Water puddle & splashes -->
        <ellipse cx="420" cy="256" rx="145" ry="16" fill="#38bdf8" opacity="0.75"/>
        <!-- Tipped Tin Pan -->
        <g transform="rotate(-24 390 205)">
          <rect x="255" y="198" width="84" height="11" rx="5" fill="#334155"/>
          <path d="M 335 186 L 455 186 L 442 234 L 348 234 Z" fill="#94a3b8" stroke="#475569" stroke-width="3"/>
          <ellipse cx="395" cy="186" rx="60" ry="11" fill="#e2e8f0" stroke="#475569" stroke-width="2.5"/>
        </g>
        <!-- Splash droplets -->
        <g id="anim-splash-3" fill="#0284c7">
          <circle cx="475" cy="180" r="7"/>
          <circle cx="505" cy="196" r="5"/>
          <circle cx="456" cy="158" r="5"/>
          <circle cx="520" cy="222" r="6"/>
          <text x="530" y="148" font-size="24" font-weight="800" fill="#0284c7">TAP! TAP!</text>
        </g>
      `,
      // Page 4: Pat is in a nap on a mat.
      `
        <rect x="36" y="64" width="728" height="220" fill="#fefce8"/>
        <rect x="36" y="216" width="728" height="68" fill="#fde68a"/>
        <!-- Cozy Mat -->
        <ellipse cx="400" cy="248" rx="185" ry="26" fill="#0284c7"/>
        <ellipse cx="400" cy="248" rx="158" ry="18" fill="#38bdf8" stroke="#e0f2fe" stroke-width="3" stroke-dasharray="10 6"/>
        <!-- Pillow & Pat napping -->
        <rect x="275" y="218" width="66" height="24" rx="12" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
        <circle cx="318" cy="216" r="24" fill="#fed7aa" stroke="#9a3412" stroke-width="2"/>
        <path d="M 308 214 Q 314 218 320 214" stroke="#0f172a" stroke-width="2.2" fill="none"/>
        <path d="M 326 214 Q 332 218 338 214" stroke="#0f172a" stroke-width="2.2" fill="none"/>
        <path d="M 342 214 L 468 214 Q 486 214 486 238 L 342 238 Z" fill="#ef4444"/>
        <!-- Floating Zzz -->
        <g id="anim-zzz-4" fill="#0284c7" font-weight="800">
          <text x="348" y="176" font-size="20">z</text>
          <text x="370" y="152" font-size="26">z</text>
          <text x="398" y="126" font-size="32">Z</text>
        </g>
      `,
    ],
  },
  {
    bookId: 'book-2-phase2',
    cartridgeId: 'reader-red-dog',
    oakId: 'OAK-KS1-ENG-R02',
    oakUnit: 'eyfs-english-decodable-book-2-red-dog',
    accent: '#dc2626',
    accentLight: '#fee2e2',
    scenes: [
      // Page 0: The big red dog ran in the sun.
      `
        <rect x="36" y="64" width="728" height="150" fill="url(#skyGrad)"/>
        <rect x="36" y="206" width="728" height="78" fill="#4ade80"/>
        <circle cx="660" cy="112" r="30" fill="#fde047" stroke="#facc15" stroke-width="4"/>
        <!-- Running Red Dog -->
        <g id="anim-dog-0">
          <ellipse cx="385" cy="202" rx="64" ry="30" fill="#dc2626"/>
          <circle cx="448" cy="176" r="24" fill="#dc2626"/>
          <ellipse cx="468" cy="182" rx="14" ry="9" fill="#ef4444"/>
          <circle cx="479" cy="179" r="4" fill="#0f172a"/>
          <ellipse cx="436" cy="178" rx="9" ry="18" fill="#991b1b"/>
          <circle cx="456" cy="170" r="3.2" fill="#0f172a"/>
          <path d="M 322 192 Q 294 170 306 154" stroke="#dc2626" stroke-width="10" stroke-linecap="round" fill="none"/>
          <line x1="348" y1="224" x2="328" y2="252" stroke="#991b1b" stroke-width="10" stroke-linecap="round"/>
          <line x1="376" y1="224" x2="366" y2="256" stroke="#b91c1c" stroke-width="10" stroke-linecap="round"/>
          <line x1="418" y1="224" x2="438" y2="252" stroke="#991b1b" stroke-width="10" stroke-linecap="round"/>
          <line x1="436" y1="222" x2="462" y2="246" stroke="#b91c1c" stroke-width="10" stroke-linecap="round"/>
        </g>
      `,
      // Page 1: The dog can hop on a big log.
      `
        <rect x="36" y="64" width="728" height="150" fill="url(#skyGrad)"/>
        <rect x="36" y="206" width="728" height="78" fill="#4ade80"/>
        <!-- Big Brown Log -->
        <rect x="270" y="218" width="260" height="44" rx="22" fill="#92400e" stroke="#78350f" stroke-width="3"/>
        <ellipse cx="520" cy="240" rx="14" ry="22" fill="#fde68a" stroke="#78350f" stroke-width="3"/>
        <!-- Dog perched on log -->
        <g id="anim-dog-1">
          <ellipse cx="390" cy="178" rx="52" ry="25" fill="#dc2626"/>
          <circle cx="442" cy="154" r="22" fill="#dc2626"/>
          <ellipse cx="430" cy="158" rx="8" ry="16" fill="#991b1b"/>
          <circle cx="450" cy="148" r="3" fill="#0f172a"/>
          <circle cx="466" cy="156" r="4" fill="#0f172a"/>
          <line x1="358" y1="196" x2="358" y2="220" stroke="#991b1b" stroke-width="9" stroke-linecap="round"/>
          <line x1="422" y1="196" x2="422" y2="220" stroke="#991b1b" stroke-width="9" stroke-linecap="round"/>
        </g>
      `,
      // Page 2: A duck is in the mud. No, dog, no!
      `
        <rect x="36" y="64" width="728" height="146" fill="#e0f2fe"/>
        <rect x="36" y="206" width="728" height="78" fill="#86efac"/>
        <!-- Mud puddle -->
        <ellipse cx="470" cy="248" rx="150" ry="24" fill="#78350f"/>
        <ellipse cx="470" cy="246" rx="115" ry="15" fill="#92400e"/>
        <!-- Yellow Duck in mud -->
        <ellipse cx="485" cy="222" rx="34" ry="22" fill="#facc15" stroke="#ca8a04" stroke-width="2"/>
        <circle cx="514" cy="196" r="18" fill="#facc15" stroke="#ca8a04" stroke-width="2"/>
        <polygon points="530,194 550,200 530,206" fill="#f97316"/>
        <circle cx="520" cy="192" r="2.8" fill="#0f172a"/>
        <!-- Muddy red dog peering -->
        <ellipse cx="280" cy="212" rx="48" ry="24" fill="#dc2626"/>
        <circle cx="328" cy="190" r="20" fill="#dc2626"/>
        <circle cx="335" cy="186" r="3" fill="#0f172a"/>
        <circle cx="348" cy="192" r="4" fill="#0f172a"/>
        <circle cx="290" cy="220" r="7" fill="#78350f"/>
        <circle cx="310" cy="212" r="5" fill="#78350f"/>
      `,
      // Page 3: Go into the tub, red dog!
      `
        <rect x="36" y="64" width="728" height="220" fill="#ecfeff"/>
        <rect x="36" y="226" width="728" height="58" fill="#cbd5e1"/>
        <!-- White Bath Tub -->
        <path d="M 270 184 L 530 184 L 508 254 Q 504 264 490 264 L 310 264 Q 296 264 292 254 Z" fill="#ffffff" stroke="#64748b" stroke-width="3.5"/>
        <rect x="260" y="174" width="280" height="14" rx="7" fill="#f8fafc" stroke="#64748b" stroke-width="3"/>
        <!-- Red dog head poking out of bubbles -->
        <circle cx="400" cy="148" r="26" fill="#dc2626"/>
        <ellipse cx="378" cy="154" rx="9" ry="18" fill="#991b1b"/>
        <ellipse cx="422" cy="154" rx="9" ry="18" fill="#991b1b"/>
        <circle cx="390" cy="144" r="3.2" fill="#0f172a"/>
        <circle cx="410" cy="144" r="3.2" fill="#0f172a"/>
        <circle cx="400" cy="156" r="5" fill="#0f172a"/>
        <!-- Bubbles -->
        <g id="anim-bubbles-3" fill="#e0f2fe" stroke="#38bdf8" stroke-width="2">
          <circle cx="315" cy="174" r="16"/>
          <circle cx="350" cy="170" r="20"/>
          <circle cx="445" cy="172" r="19"/>
          <circle cx="485" cy="176" r="15"/>
          <circle cx="340" cy="118" r="9"/>
          <circle cx="460" cy="108" r="12"/>
        </g>
      `,
      // Page 4: The dog sat on a bed in a red hat.
      `
        <rect x="36" y="64" width="728" height="220" fill="#fefce8"/>
        <rect x="36" y="224" width="728" height="60" fill="#fde68a"/>
        <!-- Cozy Dog Bed -->
        <ellipse cx="400" cy="242" rx="145" ry="28" fill="#1d4ed8"/>
        <ellipse cx="400" cy="236" rx="115" ry="18" fill="#93c5fd"/>
        <!-- Happy clean Red Dog wearing red hat -->
        <ellipse cx="400" cy="206" rx="52" ry="26" fill="#dc2626"/>
        <circle cx="400" cy="166" r="26" fill="#dc2626"/>
        <ellipse cx="376" cy="172" rx="9" ry="18" fill="#991b1b"/>
        <ellipse cx="424" cy="172" rx="9" ry="18" fill="#991b1b"/>
        <circle cx="390" cy="164" r="3.2" fill="#0f172a"/>
        <circle cx="410" cy="164" r="3.2" fill="#0f172a"/>
        <circle cx="400" cy="174" r="5" fill="#0f172a"/>
        <!-- Stylish Red Hat -->
        <rect x="366" y="138" width="68" height="8" rx="4" fill="#b91c1c"/>
        <path d="M 380 138 L 386 112 L 414 112 L 420 138 Z" fill="#ef4444" stroke="#991b1b" stroke-width="2"/>
        <rect x="382" y="130" width="36" height="6" fill="#fde047"/>
      `,
    ],
  },
  {
    bookId: 'book-3-phase3',
    cartridgeId: 'reader-ship-rain',
    oakId: 'OAK-KS1-ENG-R03',
    oakUnit: 'ks1-english-decodable-book-3-ship-rain',
    accent: '#0369a1',
    accentLight: '#e0f2fe',
    scenes: [
      // Page 0: We see a big ship in the rain.
      `
        <rect x="36" y="64" width="728" height="156" fill="#64748b"/>
        <rect x="36" y="212" width="728" height="72" fill="#0369a1"/>
        <!-- Rain Clouds -->
        <g fill="#475569">
          <circle cx="170" cy="100" r="28"/><circle cx="206" cy="96" r="34"/><circle cx="244" cy="102" r="26"/>
          <circle cx="560" cy="98" r="28"/><circle cx="598" cy="94" r="34"/><circle cx="634" cy="100" r="26"/>
        </g>
        <!-- Rain streaks -->
        <g id="anim-rain-0" stroke="#bae6fd" stroke-width="2.5" stroke-linecap="round">
          <line x1="160" y1="138" x2="152" y2="164"/><line x1="210" y1="144" x2="202" y2="170"/>
          <line x1="260" y1="136" x2="252" y2="162"/><line x1="560" y1="138" x2="552" y2="164"/>
          <line x1="610" y1="146" x2="602" y2="172"/><line x1="650" y1="134" x2="642" y2="160"/>
        </g>
        <!-- Big Ship -->
        <g id="anim-ship-0">
          <path d="M 290 198 L 510 198 L 484 240 L 316 240 Z" fill="#92400e" stroke="#451a03" stroke-width="3"/>
          <rect x="394" y="102" width="10" height="96" fill="#78350f"/>
          <polygon points="404,108 486,184 404,184" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
          <polygon points="392,118 328,184 392,184" fill="#e0f2fe" stroke="#94a3b8" stroke-width="2"/>
        </g>
        <path d="M 36 242 Q 110 228 184 242 T 332 242 T 480 242 T 628 242 T 764 242" stroke="#38bdf8" stroke-width="4" fill="none"/>
      `,
      // Page 1: A deep fish can zoom by the boat.
      `
        <rect x="36" y="64" width="728" height="100" fill="#7dd3fc"/>
        <rect x="36" y="158" width="728" height="126" fill="#0284c7"/>
        <!-- Boat hull at surface -->
        <path d="M 310 144 L 490 144 L 468 176 L 332 176 Z" fill="#b45309" stroke="#78350f" stroke-width="2.5"/>
        <polygon points="400,82 460,138 400,138" fill="#ffffff"/>
        <!-- Deep swimming orange fish -->
        <g id="anim-fish-1">
          <ellipse cx="420" cy="232" rx="44" ry="22" fill="#f97316" stroke="#c2410c" stroke-width="2.5"/>
          <polygon points="376,232 346,210 346,254" fill="#fb923c" stroke="#c2410c" stroke-width="2"/>
          <circle cx="446" cy="226" r="4.5" fill="#0f172a"/>
          <circle cx="447" cy="225" r="1.5" fill="#ffffff"/>
          <circle cx="476" cy="216" r="5" fill="#bae6fd" opacity="0.8"/>
          <circle cx="488" cy="200" r="7" fill="#bae6fd" opacity="0.7"/>
        </g>
      `,
      // Page 2: At night we see the moon and a bright star.
      `
        <rect x="36" y="64" width="728" height="156" fill="#0f172a"/>
        <rect x="36" y="216" width="728" height="68" fill="#1e3a8a"/>
        <!-- Glowing Crescent Moon -->
        <circle cx="240" cy="126" r="34" fill="#fef08a"/>
        <circle cx="256" cy="118" r="28" fill="#0f172a"/>
        <!-- Bright Star -->
        <polygon points="560,92 569,116 595,116 574,132 582,156 560,141 538,156 546,132 525,116 551,116" fill="#fde047"/>
        <circle cx="410" cy="100" r="3" fill="#ffffff"/><circle cx="470" cy="146" r="2.5" fill="#ffffff"/><circle cx="660" cy="122" r="3" fill="#ffffff"/>
        <!-- Calm boat silhouette -->
        <path d="M 330 206 L 470 206 L 452 234 L 348 234 Z" fill="#475569"/>
        <polygon points="400,142 446,200 400,200" fill="#cbd5e1"/>
      `,
      // Page 3: He can see a high light on the dark rock.
      `
        <rect x="36" y="64" width="728" height="156" fill="#1e293b"/>
        <rect x="36" y="216" width="728" height="68" fill="#0c4a6e"/>
        <!-- Dark Rock & Lighthouse -->
        <path d="M 520 260 L 560 198 L 690 198 L 730 260 Z" fill="#334155"/>
        <path d="M 604 198 L 614 106 L 642 106 L 652 198 Z" fill="#f8fafc" stroke="#94a3b8" stroke-width="2"/>
        <rect x="611" y="132" width="34" height="16" fill="#ef4444"/>
        <rect x="607" y="166" width="42" height="16" fill="#ef4444"/>
        <rect x="614" y="90" width="28" height="16" fill="#fde047"/>
        <!-- Bright Lighthouse Beam -->
        <polygon points="614,98 220,76 220,164" fill="#fef08a" opacity="0.28"/>
        <!-- Boat sailing safely -->
        <path d="M 190 210 L 310 210 L 294 236 L 206 236 Z" fill="#92400e"/>
        <polygon points="250,152 292,204 250,204" fill="#f8fafc"/>
      `,
      // Page 4: The rain is off! The ship is back at the dock.
      `
        <rect x="36" y="64" width="728" height="152" fill="url(#skyGrad)"/>
        <rect x="36" y="210" width="728" height="74" fill="#0ea5e9"/>
        <circle cx="655" cy="108" r="28" fill="#fde047"/>
        <!-- Wooden Dock -->
        <rect x="470" y="202" width="294" height="18" fill="#92400e"/>
        <rect x="500" y="220" width="16" height="64" fill="#78350f"/>
        <rect x="620" y="220" width="16" height="64" fill="#78350f"/>
        <!-- Ship moored safely -->
        <path d="M 220 198 L 440 198 L 414 240 L 246 240 Z" fill="#92400e" stroke="#451a03" stroke-width="3"/>
        <rect x="326" y="106" width="10" height="92" fill="#78350f"/>
        <polygon points="336,112 414,186 336,186" fill="#ffffff"/>
        <path d="M 436 206 Q 460 226 484 208" stroke="#fef08a" stroke-width="4" fill="none"/>
      `,
    ],
  },
  {
    bookId: 'book-4-phase4',
    cartridgeId: 'reader-frog-log',
    oakId: 'OAK-KS1-ENG-R04',
    oakUnit: 'ks1-english-decodable-book-4-frog-log',
    accent: '#15803d',
    accentLight: '#dcfce7',
    scenes: [
      // Page 0: A green frog sat on a damp log by the pond.
      `
        <rect x="36" y="64" width="728" height="146" fill="url(#skyGrad)"/>
        <rect x="36" y="204" width="728" height="80" fill="#4ade80"/>
        <ellipse cx="560" cy="248" rx="165" ry="26" fill="#0ea5e9"/>
        <!-- Damp Log -->
        <rect x="200" y="210" width="210" height="38" rx="19" fill="#78350f"/>
        <!-- Green Frog -->
        <ellipse cx="305" cy="192" rx="34" ry="22" fill="#16a34a" stroke="#14532d" stroke-width="2.5"/>
        <circle cx="290" cy="168" r="10" fill="#16a34a" stroke="#14532d" stroke-width="2"/>
        <circle cx="320" cy="168" r="10" fill="#16a34a" stroke="#14532d" stroke-width="2"/>
        <circle cx="290" cy="167" r="4" fill="#ffffff"/><circle cx="291" cy="167" r="2" fill="#0f172a"/>
        <circle cx="320" cy="167" r="4" fill="#ffffff"/><circle cx="321" cy="167" r="2" fill="#0f172a"/>
        <path d="M 290 194 Q 305 204 320 194" stroke="#14532d" stroke-width="2.5" fill="none"/>
      `,
      // Page 1: The frog did a big jump and went splash in the pond.
      `
        <rect x="36" y="64" width="728" height="146" fill="url(#skyGrad)"/>
        <rect x="36" y="204" width="728" height="80" fill="#4ade80"/>
        <ellipse cx="450" cy="244" rx="220" ry="30" fill="#0ea5e9"/>
        <ellipse cx="450" cy="244" rx="130" ry="16" fill="none" stroke="#e0f2fe" stroke-width="3"/>
        <!-- Jumping Frog in mid-air -->
        <g id="anim-frog-1">
          <ellipse cx="420" cy="146" rx="36" ry="20" fill="#16a34a" transform="rotate(-18 420 146)"/>
          <circle cx="448" cy="128" r="9" fill="#16a34a"/>
          <circle cx="449" cy="127" r="3" fill="#0f172a"/>
          <line x1="388" y1="160" x2="354" y2="184" stroke="#15803d" stroke-width="8" stroke-linecap="round"/>
          <text x="488" y="196" font-size="24" font-weight="800" fill="#0284c7">SPLASH!</text>
        </g>
      `,
      // Page 2: A red crab crept past a flat rock on the sand.
      `
        <rect x="36" y="64" width="728" height="140" fill="#bae6fd"/>
        <rect x="36" y="200" width="728" height="84" fill="#fde68a"/>
        <!-- Flat Rock -->
        <ellipse cx="520" cy="228" rx="92" ry="26" fill="#94a3b8" stroke="#64748b" stroke-width="3"/>
        <!-- Red Crab -->
        <ellipse cx="330" cy="236" rx="36" ry="22" fill="#ef4444" stroke="#991b1b" stroke-width="2.5"/>
        <line x1="316" y1="216" x2="312" y2="200" stroke="#991b1b" stroke-width="3"/>
        <line x1="344" y1="216" x2="348" y2="200" stroke="#991b1b" stroke-width="3"/>
        <circle cx="312" cy="198" r="5" fill="#ffffff"/><circle cx="312" cy="198" r="2.5" fill="#0f172a"/>
        <circle cx="348" cy="198" r="5" fill="#ffffff"/><circle cx="348" cy="198" r="2.5" fill="#0f172a"/>
        <path d="M 294 226 Q 272 204 286 192" stroke="#ef4444" stroke-width="7" fill="none" stroke-linecap="round"/>
        <path d="M 366 226 Q 388 204 374 192" stroke="#ef4444" stroke-width="7" fill="none" stroke-linecap="round"/>
      `,
      // Page 3: Stop and swim with me, said the frog.
      `
        <rect x="36" y="64" width="728" height="130" fill="#bae6fd"/>
        <rect x="36" y="190" width="728" height="94" fill="#0ea5e9"/>
        <!-- Lily pads -->
        <ellipse cx="260" cy="240" rx="58" ry="16" fill="#22c55e"/>
        <ellipse cx="540" cy="244" rx="58" ry="16" fill="#22c55e"/>
        <!-- Frog & Crab chatting -->
        <ellipse cx="260" cy="218" rx="30" ry="20" fill="#16a34a"/>
        <circle cx="250" cy="196" r="8" fill="#16a34a"/><circle cx="270" cy="196" r="8" fill="#16a34a"/>
        <circle cx="250" cy="196" r="3" fill="#0f172a"/><circle cx="270" cy="196" r="3" fill="#0f172a"/>
        <ellipse cx="540" cy="224" rx="30" ry="18" fill="#ef4444"/>
        <circle cx="530" cy="202" r="4" fill="#0f172a"/><circle cx="550" cy="202" r="4" fill="#0f172a"/>
        <!-- Speech bubble -->
        <rect x="312" y="106" width="184" height="52" rx="14" fill="#ffffff" stroke="#0284c7" stroke-width="2.5"/>
        <text x="404" y="138" text-anchor="middle" font-size="18" font-weight="800" fill="#0f172a">Swim with me!</text>
      `,
      // Page 4: They had the best swim and sat on the soft grass.
      `
        <rect x="36" y="64" width="728" height="140" fill="url(#skyGrad)"/>
        <rect x="36" y="198" width="728" height="86" fill="#4ade80"/>
        <circle cx="655" cy="108" r="28" fill="#fde047"/>
        <!-- Frog & Crab resting side by side on soft grass -->
        <ellipse cx="330" cy="222" rx="34" ry="22" fill="#16a34a"/>
        <circle cx="318" cy="198" r="9" fill="#16a34a"/><circle cx="342" cy="198" r="9" fill="#16a34a"/>
        <circle cx="318" cy="198" r="3" fill="#0f172a"/><circle cx="342" cy="198" r="3" fill="#0f172a"/>
        <path d="M 316 226 Q 330 236 344 226" stroke="#14532d" stroke-width="2.5" fill="none"/>
        <ellipse cx="470" cy="226" rx="34" ry="20" fill="#ef4444"/>
        <circle cx="458" cy="200" r="4" fill="#0f172a"/><circle cx="482" cy="200" r="4" fill="#0f172a"/>
        <path d="M 456 230 Q 470 238 484 230" stroke="#7f1d1d" stroke-width="2.5" fill="none"/>
      `,
    ],
  },
  {
    bookId: 'book-5-phase5',
    cartridgeId: 'reader-cake-lake',
    oakId: 'OAK-KS1-ENG-R05',
    oakUnit: 'ks1-english-decodable-book-5-cake-lake',
    accent: '#7c3aed',
    accentLight: '#ede9fe',
    scenes: [
      // Page 0: Jake rode his bike to the wide blue lake.
      `
        <rect x="36" y="64" width="728" height="136" fill="url(#skyGrad)"/>
        <rect x="36" y="196" width="728" height="88" fill="#4ade80"/>
        <!-- Wide Blue Lake -->
        <ellipse cx="600" cy="240" rx="185" ry="34" fill="#0284c7"/>
        <!-- Bike & Jake -->
        <circle cx="250" cy="238" r="24" fill="none" stroke="#1e293b" stroke-width="5"/>
        <circle cx="340" cy="238" r="24" fill="none" stroke="#1e293b" stroke-width="5"/>
        <path d="M 250 238 L 292 204 L 340 238 L 288 238 Z" stroke="#7c3aed" stroke-width="5" fill="none"/>
        <circle cx="294" cy="166" r="18" fill="#fed7aa" stroke="#9a3412" stroke-width="2"/>
        <rect x="280" y="184" width="28" height="28" rx="8" fill="#0284c7"/>
      `,
      // Page 1: He had a bright kite up by a white cloud.
      `
        <rect x="36" y="64" width="728" height="156" fill="url(#skyGrad)"/>
        <rect x="36" y="216" width="728" height="68" fill="#4ade80"/>
        <!-- White Cloud -->
        <g fill="#ffffff">
          <circle cx="520" cy="112" r="26"/><circle cx="554" cy="104" r="32"/><circle cx="590" cy="114" r="24"/>
        </g>
        <!-- Bright Diamond Kite -->
        <g id="anim-kite-1">
          <polygon points="430,86 466,126 430,170 394,126" fill="#f43f5e" stroke="#be123c" stroke-width="2.5"/>
          <line x1="430" y1="86" x2="430" y2="170" stroke="#fde047" stroke-width="3"/>
          <line x1="394" y1="126" x2="466" y2="126" stroke="#fde047" stroke-width="3"/>
          <path d="M 430 170 Q 380 212 310 232" stroke="#475569" stroke-width="2" fill="none"/>
        </g>
        <!-- Jake holding string -->
        <circle cx="300" cy="204" r="16" fill="#fed7aa"/>
        <rect x="288" y="220" width="24" height="32" rx="6" fill="#0284c7"/>
      `,
      // Page 2: Come and eat some sweet cake, said Kate.
      `
        <rect x="36" y="64" width="728" height="140" fill="url(#skyGrad)"/>
        <rect x="36" y="200" width="728" height="84" fill="#4ade80"/>
        <!-- Picnic Blanket -->
        <rect x="260" y="218" width="280" height="52" rx="8" fill="#f43f5e" stroke="#ffffff" stroke-width="4" stroke-dasharray="14 8"/>
        <!-- Sweet Cake on Plate -->
        <ellipse cx="400" cy="236" rx="56" ry="12" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
        <rect x="362" y="196" width="76" height="38" rx="8" fill="#fef08a" stroke="#ca8a04" stroke-width="2"/>
        <path d="M 362 204 Q 374 216 386 204 Q 400 216 414 204 Q 426 216 438 204 L 438 196 L 362 196 Z" fill="#f472b6"/>
        <rect x="397" y="176" width="6" height="20" fill="#38bdf8"/>
        <circle cx="400" cy="172" r="5" fill="#f97316"/>
      `,
      // Page 3: We like to play and eat cake by the lake.
      `
        <rect x="36" y="64" width="728" height="136" fill="url(#skyGrad)"/>
        <rect x="36" y="196" width="728" height="88" fill="#4ade80"/>
        <ellipse cx="590" cy="242" rx="170" ry="30" fill="#0284c7"/>
        <!-- Jake & Kate smiling by the lake -->
        <circle cx="290" cy="186" r="20" fill="#fed7aa" stroke="#9a3412" stroke-width="2"/>
        <rect x="274" y="206" width="32" height="36" rx="8" fill="#0284c7"/>
        <circle cx="380" cy="186" r="20" fill="#fed7aa" stroke="#9a3412" stroke-width="2"/>
        <rect x="364" y="206" width="32" height="36" rx="8" fill="#7c3aed"/>
        <rect x="318" y="218" width="34" height="22" rx="4" fill="#f472b6"/>
      `,
      // Page 4: It was time to ride home with a big smile.
      `
        <rect x="36" y="64" width="728" height="140" fill="url(#sunsetGrad)"/>
        <rect x="36" y="200" width="728" height="84" fill="#4ade80"/>
        <circle cx="170" cy="140" r="34" fill="#fde047"/>
        <!-- Cozy Home -->
        <rect x="520" y="156" width="136" height="96" fill="#fef3c7" stroke="#b45309" stroke-width="3"/>
        <polygon points="506,158 588,96 670,158" fill="#dc2626" stroke="#991b1b" stroke-width="3"/>
        <rect x="572" y="200" width="34" height="52" rx="4" fill="#78350f"/>
        <rect x="536" y="176" width="24" height="24" fill="#bae6fd" stroke="#78350f" stroke-width="2"/>
        <rect x="616" y="176" width="24" height="24" fill="#bae6fd" stroke="#78350f" stroke-width="2"/>
        <!-- Bike riding home -->
        <circle cx="300" cy="240" r="22" fill="none" stroke="#1e293b" stroke-width="4.5"/>
        <circle cx="382" cy="240" r="22" fill="none" stroke="#1e293b" stroke-width="4.5"/>
        <path d="M 300 240 L 340 208 L 382 240 Z" stroke="#7c3aed" stroke-width="4.5" fill="none"/>
      `,
    ],
  },
];

function xmlEsc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function lispEsc(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function estimateCharWidth(ch: string): number {
  if (ch === 'i' || ch === 'l' || ch === 'I' || ch === 'j') return 8.5;
  if (ch === 'f' || ch === 'r' || ch === 't') return 10.5;
  if (ch === 'm' || ch === 'w' || ch === 'M' || ch === 'W') return 21.5;
  if (ch === '.' || ch === ',' || ch === '!' || ch === ';' || ch === ':') return 7.5;
  if (ch === '?') return 13.0;
  if (ch >= 'A' && ch <= 'Z') return 17.5;
  return 14.8;
}

function measureTextSpan(text: string): number {
  let w = 0;
  for (let i = 0; i < text.length; i++) {
    w += estimateCharWidth(text[i]);
  }
  return w;
}

function renderBookPageWordsSvg(
  sentence: string,
  pageIdx: number,
  accent: string
): { wordsMarkup: string; soundButtonsMarkup: string } {
  const tokens = sentence.split(/\s+/).filter(Boolean);
  const padX = 16;
  const gap = 12;

  const tiles = tokens.map((raw) => {
    const decoded = decodeWordForReader(raw);
    const leadingPunct = raw.match(/^[^a-zA-Z]+/)?.[0] || '';
    const trailingPunct = raw.match(/[^a-zA-Z]+$/)?.[0] || '';
    const cleanWord = decoded.cleanWord || raw;
    const leadingW = measureTextSpan(leadingPunct);
    const cleanW = measureTextSpan(cleanWord);
    const trailingW = measureTextSpan(trailingPunct);
    const totalTextW = leadingW + cleanW + trailingW;
    const width = Math.max(46, Math.round(totalTextW + padX * 2));
    return {
      raw,
      decoded,
      cleanWord,
      leadingW,
      cleanW,
      totalTextW,
      width,
    };
  });

  // Split into 1 or 2 centered lines if total width > 700px
  const maxRowW = 700;
  const rows: Array<typeof tiles> = [];
  let currentRow: typeof tiles = [];
  let rowW = 0;

  for (const tile of tiles) {
    const added = currentRow.length === 0 ? tile.width : gap + tile.width;
    if (currentRow.length > 0 && rowW + added > maxRowW) {
      rows.push(currentRow);
      currentRow = [tile];
      rowW = tile.width;
    } else {
      currentRow.push(tile);
      rowW += added;
    }
  }
  if (currentRow.length > 0) rows.push(currentRow);

  const wordsParts: string[] = [];
  const sbParts: string[] = [];

  const startY = rows.length === 1 ? 334 : 316;
  const rowStep = 50;

  rows.forEach((row, rIdx) => {
    const totalW = row.reduce((s, t) => s + t.width, 0) + gap * (row.length - 1);
    let cursorX = Math.round((800 - totalW) / 2);
    const baseY = startY + rIdx * rowStep;

    for (const tile of row) {
      const cx = cursorX + tile.width / 2;
      const decoded = tile.decoded;
      let dataHint = '';
      let dataPhonemes = '';

      if (decoded.kind === 'tricky') {
        dataHint = `♥ ${decoded.cleanWord} — Tricky Word: ${decoded.tricky.trickyExplanation}`;
        dataPhonemes = `${decoded.cleanWord}. Tricky word. ${decoded.cleanWord}`;
      } else {
        const segJoin = decoded.segments.map((s) => s.letters).join(' · ');
        const soundJoin = decoded.segments
          .map((s) => getPhonemeSpokenText(s.letters, s.soundHint))
          .join(', ');
        dataHint = `${segJoin}  ➔  ${decoded.cleanWord}`;
        dataPhonemes = `${soundJoin} ... ${decoded.cleanWord}`;
      }

      const isTricky = decoded.kind === 'tricky';
      const tileFill = isTricky ? '#fff1f2' : '#f8fafc';
      const tileStroke = isTricky ? '#fda4af' : '#cbd5e1';
      const textFill = isTricky ? '#be123c' : '#0f172a';

      wordsParts.push(`
        <g class="book-word" data-word="${xmlEsc(decoded.cleanWord)}" data-hint="${xmlEsc(dataHint)}" data-phonemes="${xmlEsc(dataPhonemes)}" style="cursor:pointer;">
          <rect x="${cursorX}" y="${baseY - 26}" width="${tile.width}" height="42" rx="10" fill="${tileFill}" stroke="${tileStroke}" stroke-width="1.8"/>
          <text x="${cx}" y="${baseY + 2}" text-anchor="middle" font-size="25" font-weight="800" fill="${textFill}">${xmlEsc(tile.raw)}</text>
        </g>
      `);

      // Sound buttons positioned strictly beneath decoded.cleanWord (excluding leading/trailing punctuation)
      const sbY = baseY + 10;
      const wordLeft = cx - tile.totalTextW / 2 + tile.leadingW;
      const wordRight = wordLeft + tile.cleanW;
      const wordCenter = (wordLeft + wordRight) / 2;

      if (decoded.kind === 'tricky') {
        const lineX1 = Math.max(cursorX + 8, wordLeft - 2);
        const lineX2 = Math.min(cursorX + tile.width - 8, wordRight + 2);
        sbParts.push(`
          <line x1="${lineX1.toFixed(1)}" y1="${sbY}" x2="${lineX2.toFixed(1)}" y2="${sbY}" stroke="#e11d48" stroke-width="2.5" stroke-dasharray="4 3"/>
          <text x="${wordCenter.toFixed(1)}" y="${sbY + 1}" text-anchor="middle" font-size="9" font-weight="800" fill="#e11d48">♥</text>
        `);
      } else {
        // Precompute exact horizontal boundaries for each letter in cleanWord
        const cleanChars = tile.cleanWord;
        const charStarts: number[] = [];
        const charWidths: number[] = [];
        let xAcc = wordLeft;
        for (let ci = 0; ci < cleanChars.length; ci++) {
          const cw = estimateCharWidth(cleanChars[ci]);
          charStarts.push(xAcc);
          charWidths.push(cw);
          xAcc += cw;
        }

        const charCenterAt = (idx: number): number => {
          const clamped = Math.max(0, Math.min(cleanChars.length - 1, idx));
          return charStarts[clamped] + charWidths[clamped] / 2;
        };

        let charCursor = 0;
        const segs = decoded.segments;
        for (let sIdx = 0; sIdx < segs.length; sIdx++) {
          const seg = segs[sIdx];
          if (seg.type === 'split') {
            // Split digraph (e.g. a-e, i-e, o-e): vowel sits at charCursor,
            // intervening consonant (next segment) follows, and silent 'e' sits right after it.
            const nextSeg = segs[sIdx + 1];
            const consonantLen = nextSeg ? Math.max(1, nextSeg.letters.replace(/-/g, '').length) : 1;
            const vowelX = charCenterAt(charCursor);
            const silentEIdx = Math.min(cleanChars.length - 1, charCursor + 1 + consonantLen);
            const silentEX = charCenterAt(silentEIdx);
            const midX = (vowelX + silentEX) / 2;
            sbParts.push(`<path d="M ${vowelX.toFixed(1)} ${sbY - 1} Q ${midX.toFixed(1)} ${sbY + 8} ${silentEX.toFixed(1)} ${sbY - 1}" stroke="${accent}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`);
            charCursor += 1;
          } else {
            const len = Math.max(1, seg.letters.length);
            const startIdx = Math.max(0, Math.min(cleanChars.length - 1, charCursor));
            const endIdx = Math.max(startIdx, Math.min(cleanChars.length - 1, charCursor + len - 1));
            const spanLeft = charStarts[startIdx];
            const spanRight = charStarts[endIdx] + charWidths[endIdx];
            const spanW = Math.max(8, spanRight - spanLeft);
            const sx = (spanLeft + spanRight) / 2;

            if (seg.type === 'single') {
              sbParts.push(`<circle cx="${sx.toFixed(1)}" cy="${sbY}" r="3.4" fill="${accent}"/>`);
            } else {
              // Digraph / trigraph sound bar: unmistakably wider than a single dot, anchored under its exact letters
              const minBarW = seg.type === 'trigraph' ? 30 : 21;
              const barW = Math.min(Math.max(minBarW, spanW - 3.5), spanW + 3);
              sbParts.push(`<rect x="${(sx - barW / 2).toFixed(1)}" y="${sbY - 2.4}" width="${barW.toFixed(1)}" height="4.8" rx="2.4" fill="${accent}"/>`);
            }
            charCursor += len;
          }
        }
      }

      cursorX += tile.width + gap;
    }
  });

  return {
    wordsMarkup: wordsParts.join(''),
    soundButtonsMarkup: `<g id="sb-page-${pageIdx}" pointer-events="none">${sbParts.join('')}</g>`,
  };
}

function generateBookCartridge(book: DecodableMiniBook, spec: BookCartridgeMeta): void {
  const pageGroupsSvg: string[] = [];
  const pageCount = book.pages.length;
  const maxPageIdx = Math.max(1, pageCount - 1);

  book.pages.forEach((page, idx) => {
    const { wordsMarkup, soundButtonsMarkup } = renderBookPageWordsSvg(
      page.text,
      idx,
      spec.accent
    );
    const sceneArt = spec.scenes[idx] || spec.scenes[0];
    pageGroupsSvg.push(`
      <g id="book-page-${idx}" display="${idx === 0 ? 'inline' : 'none'}">
        <g clip-path="url(#art-clip)">
          ${sceneArt}
        </g>
        <rect x="36" y="64" width="728" height="220" rx="14" fill="none" stroke="#cbd5e1" stroke-width="2"/>
        ${wordsMarkup}
        ${soundButtonsMarkup}
      </g>
    `);
  });

  const dotsSvg = book.pages
    .map((_, idx) => {
      const dx = 626 + idx * 16;
      return `<circle id="page-dot-${idx}" class="page-dot" data-page="${idx}" cx="${dx}" cy="442" r="5.5" fill="${idx === 0 ? spec.accent : '#cbd5e1'}" style="cursor:pointer;"/>`;
    })
    .join('\n      ');

  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%" id="${spec.cartridgeId}-root" style="background:#0f172a; font-family:system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <defs>
    <clipPath id="art-clip">
      <rect x="36" y="64" width="728" height="220" rx="14"/>
    </clipPath>
    <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#bae6fd"/>
      <stop offset="100%" stop-color="#f0f9ff"/>
    </linearGradient>
    <linearGradient id="warmRoomGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fef9c3"/>
      <stop offset="100%" stop-color="#fef3c7"/>
    </linearGradient>
    <linearGradient id="sunsetGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fed7aa"/>
      <stop offset="100%" stop-color="#fef08a"/>
    </linearGradient>
  </defs>

  <!-- Picture Book Cream Spread -->
  <rect x="16" y="12" width="768" height="476" rx="18" fill="#fffdf7" stroke="#cbd5e1" stroke-width="2"/>

  <!-- Top Book Chrome -->
  <text x="36" y="34" font-size="11" font-weight="800" fill="${spec.accent}" letter-spacing="0.06em">${xmlEsc(book.levelLabel.toUpperCase())}</text>
  <text x="36" y="53" font-size="19" font-weight="800" fill="#0f172a">${xmlEsc(book.title)}</text>

  <!-- Toggle Sound Buttons Control -->
  <g id="btn-toggle-sb" style="cursor:pointer;">
    <rect id="btn-toggle-sb-rect" x="394" y="21" width="154" height="32" rx="10" fill="${spec.accentLight}" stroke="${spec.accent}" stroke-width="1.5"/>
    <text id="btn-toggle-sb-txt" x="471" y="42" text-anchor="middle" font-size="12" font-weight="800" fill="${spec.accent}">● Sound Buttons: ON</text>
  </g>

  <!-- Read Page Aloud Control -->
  <g id="btn-read-page" style="cursor:pointer;">
    <rect x="558" y="21" width="122" height="32" rx="10" fill="${spec.accent}"/>
    <text x="619" y="42" text-anchor="middle" font-size="12" font-weight="800" fill="#ffffff">🔊 Read Page</text>
  </g>

  <!-- Page Indicator -->
  <text id="book-page-num" x="764" y="42" text-anchor="end" font-size="13" font-weight="800" fill="#475569">Page 1 of ${pageCount}</text>

  <!-- ${pageCount} Illustrated Story Pages -->
  ${pageGroupsSvg.join('\n')}

  <!-- Bottom Interactive Word Decoder & Page Navigation Bar -->
  <line x1="36" y1="406" x2="764" y2="406" stroke="#e2e8f0" stroke-width="1.5"/>

  <!-- Word Decoder Helper Box -->
  <rect x="36" y="418" width="388" height="48" rx="12" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
  <text id="decoder-hint-txt" x="52" y="447" font-size="14" font-weight="700" fill="#334155">Tap any word above to see &amp; hear its sounds</text>

  <!-- Sound Out Pure Phonemes Button -->
  <g id="btn-sound-out" style="cursor:pointer;">
    <rect x="434" y="418" width="110" height="48" rx="12" fill="${spec.accent}"/>
    <text x="489" y="447" text-anchor="middle" font-size="13" font-weight="800" fill="#ffffff">🌊 Sound Out</text>
  </g>

  <!-- Page Navigation -->
  <g id="btn-prev-page" style="cursor:pointer;">
    <rect x="554" y="422" width="58" height="40" rx="10" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1.5"/>
    <text x="583" y="447" text-anchor="middle" font-size="13" font-weight="800" fill="#334155">◀ Prev</text>
  </g>

  ${dotsSvg}

  <g id="btn-next-page" style="cursor:pointer;">
    <rect x="706" y="422" width="58" height="40" rx="10" fill="#0f172a"/>
    <text x="735" y="447" text-anchor="middle" font-size="13" font-weight="800" fill="#ffffff">Next ▶</text>
  </g>
</svg>
`;

  const jsSingleQuoteEsc = (s: string): string =>
    s
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/\r/g, '\\r')
      .replace(/\n/g, '\\n');

  // Strict integer page index [0..maxPageIdx] driven directly by vars.page while the
  // storybook-reader skill keeps vars.page and timeline progress t synchronized both ways.
  const activePageExpr = `Math.max(0, Math.min(${maxPageIdx}, Math.round(vars.page || 0)))`;
  const pageTextExpr = `[${book.pages.map((p) => `'${jsSingleQuoteEsc(p.text)}'`).join(', ')}][${activePageExpr}] || ''`;

  const subtitlesBlock = book.pages
    .map((p, idx) => {
      const start = (idx / pageCount).toFixed(2);
      const end = ((idx + 1) / pageCount).toFixed(2);
      return `    (:start ${start} :end ${end} :en "${lispEsc(p.text)}")`;
    })
    .join('\n');

  const keyframesBlock = book.pages
    .map((p, idx) => {
      const tVal = (idx / maxPageIdx).toFixed(2);
      return `    (:t ${tVal} :title "Page ${idx + 1}: ${lispEsc(book.title)}" :rule "${lispEsc(p.text)}")`;
    })
    .join('\n');

  const checkpointsBlock = book.quiz
    .map((q, qIdx) => {
      const tVal = qIdx === 0 ? '0.50' : '1.00';
      const correctIdx = Math.max(0, q.options.findIndex((o) => o.isCorrect));
      const opts = q.options.map((o) => `"${lispEsc(`${o.icon} ${o.label}`)}"`).join(' ');
      const correctOpt = q.options[correctIdx];
      return `    (:checkpoint :t ${tVal}
      :prompt "${lispEsc(q.question)}"
      :options (${opts})
      :answer ${correctIdx}
      :explanation "Great reading! In '${lispEsc(book.title)}', the answer is ${lispEsc(correctOpt.label)}.")`;
    })
    .join('\n');

  const pageBindings = book.pages
    .map(
      (_, idx) => `    (:target "#book-page-${idx}" :attr "display" :expr "${activePageExpr} === ${idx} ? 'inline' : 'none'")
    (:target "#sb-page-${idx}" :attr "opacity" :expr "vars.showButtons ? '1' : '0'")
    (:target "#page-dot-${idx}" :attr "fill" :expr "${activePageExpr} === ${idx} ? '${spec.accent}' : '#cbd5e1'")`
    )
    .join('\n');

  const astContent = `(:scene :id "${spec.cartridgeId}" :type "Slide" :oak-id "${spec.oakId}" :oak-unit "${spec.oakUnit}" :title "Decodable Book ${book.level}: ${lispEsc(book.title)} (${lispEsc(book.levelLabel)})" :stage "EYFS/KS1 PHONICS" :duration 20.0
  (:use-skill "storybook-reader" :pages ${pageCount})
  (:vars (
    (:var :name "page" :val 0 :min 0 :max ${maxPageIdx} :step 1 :label "Story Page")
    (:var :name "showButtons" :val true :label "Show Sound Buttons")
    (:var :name "activeWord" :val "Tap any word above to see & hear its sounds" :label "Selected Word Helper")
    (:var :name "activePhonemes" :val "" :label "Selected Word Phonemes")
  ))
  (:inputs (
    (:switch :var "showButtons" :label "Show DfE Sound Buttons (• / ━━ / ♥)")
  ))
  (:computed (
    (:name "activePage" :expr "${activePageExpr}")
    (:name "pageText" :expr "${lispEsc(pageTextExpr)}")
  ))
  (:subtitles (
${subtitlesBlock}
  ))
  (:keyframes (
${keyframesBlock}
  ))
  (:interactive (
${checkpointsBlock}
  ))
  (:bindings (
${pageBindings}
    (:target "#book-page-num" :attr "textContent" :expr "'Page ' + (${activePageExpr} + 1) + ' of ${pageCount}'")
    (:target "#decoder-hint-txt" :attr "textContent" :expr "vars.activeWord || 'Tap any word above to see & hear its sounds'")
    (:target "#btn-toggle-sb-txt" :attr "textContent" :expr "vars.showButtons ? '● Sound Buttons: ON' : '○ Sound Buttons: OFF'")
    (:target "#btn-toggle-sb-rect" :attr "fill" :expr "vars.showButtons ? '${spec.accentLight}' : '#f1f5f9'")
  ))
)
`;

  fs.writeFileSync(path.join(outDir, `${spec.cartridgeId}.svg`), svgContent, 'utf8');
  fs.writeFileSync(path.join(outDir, `${spec.cartridgeId}.ast`), astContent, 'utf8');
  console.log(`[ReaderBooks] Generated ${spec.cartridgeId}.svg + .ast (${pageCount} spreads)`);
}

for (const spec of BOOK_CARTRIDGE_SPECS) {
  const book = DECODABLE_MINI_BOOKS.find((b) => b.id === spec.bookId);
  if (!book) {
    throw new Error(`Missing book data for ${spec.bookId}`);
  }
  generateBookCartridge(book, spec);
}
console.log('[ReaderBooks] Successfully generated all 5 decodable storybook cartridges.');
