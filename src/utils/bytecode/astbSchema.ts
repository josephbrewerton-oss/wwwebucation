// src/utils/bytecode/astbSchema.ts
/**
 * AST Vector Bytecode (.astb) Format Constants & TypeScript Interfaces.
 *
 * Header Layout (16 bytes):
 * [0..3]   Magic Bytes: 0x41, 0x53, 0x54, 0x42 ('ASTB')
 * [4]      Version: 0x01
 * [5]      Cartridge Archetype: 0x01 (Sim), 0x02 (Slide), 0x03 (App), 0x04 (Film)
 * [6..7]   Duration in deciseconds (UInt16, e.g. 100 = 10.0s, 260 = 26.0s)
 * [8..9]   String Table Count (UInt16)
 * [10..13] String Table Byte Length (UInt32)
 * [14..15] Flags (bit 0: has3D, bit 1: hasVideo, bit 2: hasCheckpoints, bit 3: hasSubtitles)
 */

export const ASTB_MAGIC = [0x41, 0x53, 0x54, 0x42]; // 'A', 'S', 'T', 'B'
export const ASTB_VERSION = 1;

// Archetypes
export const ARCHETYPE_SIM = 0x01;
export const ARCHETYPE_SLIDE = 0x02;
export const ARCHETYPE_APP = 0x03;
export const ARCHETYPE_FILM = 0x04;

// Flags
export const FLAG_HAS_3D = 0x0001;
export const FLAG_HAS_VIDEO = 0x0002;
export const FLAG_HAS_CHECKPOINTS = 0x0004;
export const FLAG_HAS_SUBTITLES = 0x0008;
export const FLAG_HAS_SVG = 0x0010;
export const FLAG_COMPLETE_BINARY = 0x0020;
export const FLAG_HAS_VECTOR_DICT = 0x0040;

// Opcodes
export const OP_SCENE_META = 0x01; // [id_str: u16] [title_str: u16] [stage_str: u16] [video_str: u16] [video_fit_u8]
export const OP_KEYFRAME   = 0x10; // [t_u16 (normalized 0..65535)] [title_str: u16] [rule_str: u16]
export const OP_SUBTITLE   = 0x20; // [start_u16] [end_u16] [lang_count: u8] { [lang_str: u16] [text_str: u16] }*
export const OP_BINDING    = 0x30; // [target_str: u16] [attr_str: u16] [expr_str: u16]
export const OP_BINDING_WHEN = 0x31; // [target_str: u16] [attr_str: u16] [expr_str: u16] [when_str: u16]
export const OP_BINDING_VAR  = 0x32; // [var_str: u16] [expr_str: u16] [when_str: u16]
export const OP_3D_LINE      = 0x33; // [target,x1,y1,z1,x2,y2,z2,cap1,cap2,splitExpr,splineA,splineB,sortAfter: 13*u16] [baseR: f32] [splineIndex: u16 (0xFFFF=none)] [flags: u8] [zLayer?: f32] [zBias?: f32]
export const OP_3D_NODE      = 0x34; // [target,x,y,z,label,sortAfter: 6*u16] [baseR: f32] [flags: u8] [zLayer?: f32] [zBias?: f32]
export const OP_3D_RING      = 0x35; // [target,r,cx,cy,cz,tiltX,tiltY,tiltZ,sortAfter: 9*u16] [segments: u16] [flags: u8] [zLayer?: f32] [zBias?: f32]
export const OP_CHECKPOINT      = 0x40; // [t_u16] [prompt_str: u16] [correct_idx: u8] [expl_str: u16] [opt_count: u8] { [opt_str: u16] }*
export const OP_CHECKPOINT_GOAL = 0x41; // [cp_idx: u16] [title_str: u16] [pass_expr_str: u16] [hold_dur: f32] [wrong_count: u8] { [opt_idx: u8] [hint_str: u16] }*
export const OP_GESTURE         = 0x50; // [target_str: u16] [axis_u8 (1:x, 2:y, 3:xy)] [min_f32] [max_f32]
export const OP_VAR             = 0x60; // [name_str: u16] [type_u8 (1:num, 2:str, 3:bool)] [num_val: f32 / str_val: u16] [min_f32] [max_f32] [step_f32] [label_str: u16]
export const OP_COMPUTED        = 0x61; // [name_str: u16] [expr_str: u16]
export const OP_INPUT           = 0x70; // [kind_u8 (1:slider, 2:switch, 3:btn)] [var_str: u16] [label_str: u16] [min_f32] [max_f32] [step_f32]
export const OP_CAMERA          = 0x80; // [yaw_str: u16] [pitch: f32] [distance: f32] [fov: f32]
export const OP_SVG_COMPANION   = 0x81; // [svg_str: u16] (optional embedded Duo SVG stage vector)
export const OP_STYLE_TABLE     = 0x82; // [payload_len: u32] [style_count: u16] { solid | linearGradient | focalRadialGradient }*
export const OP_SHAPE_DEF       = 0x83; // [payload_len: u32] [sym_id_str: u16] [layer_count: u8] { fillIdx, strokeIdx, strokeW, flags, delta M/L/Q/C/Z }*
export const OP_STAMP           = 0x84; // [depth: u16] [sym_id_str: u16] [inst_id_str: u16] [matrix: 6*f32] [opacity: u8] [flags: u8] (fixed 32 B)
export const OP_SCOPE           = 0x90; // [target_str: u16] [x_expr_str: u16] [y_expr_str: u16] [samples: u16] [x_min: f32] [x_max: f32] [y_min: f32] [y_max: f32] [plot_x: f32] [plot_y: f32] [plot_w: f32] [plot_h: f32]
export const OP_LEDGER          = 0x91; // [id_str: u16] [target_str: u16] [unit_str: u16] [max_expr_str: u16] [x: f32] [y: f32] [w: f32] [h: f32] [term_count: u8] { [label_str: u16] [expr_str: u16] [color_str: u16] }*
export const OP_SCENE_EXT       = 0xA0; // [section_key_str: u16] [json_payload_str: u16]
export const OP_EOF             = 0xFF;

export interface AstScopeConfig {
  target: string;
  xExpr: string;
  yExpr: string;
  samples: number;
  xRange: [number, number];
  yRange: [number, number];
  plot?: [number, number, number, number];
}

export interface AstLedgerTerm {
  label: string;
  expr: string;
  color: string;
}

export interface AstLedgerConfig {
  id: string;
  target?: string;
  unit?: string;
  maxExpr?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  terms: AstLedgerTerm[];
}

export interface AstCheckpointConfig {
  t: number;
  title?: string;
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
  passExpr?: string;
  holdDuration?: number;
  onWrong?: Record<number, string>;
}

export interface AstVectorRgba {
  r: number;
  g: number;
  b: number;
  a: number; // 0..255
}

export interface AstVectorGradientStop {
  offset: number; // 0..1
  color: AstVectorRgba;
}

export type AstVectorStyleEntry =
  | { kind: 'solid'; color: AstVectorRgba }
  | {
      kind: 'linear';
      id: string;
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      stops: AstVectorGradientStop[];
    }
  | {
      kind: 'radial';
      id: string;
      cx: number;
      cy: number;
      r: number;
      fx: number;
      fy: number;
      stops: AstVectorGradientStop[];
    };

export type AstVectorPathCmd =
  | { op: 'M'; x: number; y: number }
  | { op: 'L'; x: number; y: number }
  | { op: 'Q'; cx: number; cy: number; x: number; y: number }
  | { op: 'C'; x1: number; y1: number; x2: number; y2: number; x: number; y: number }
  | { op: 'Z' };

export interface AstVectorShapeLayer {
  fillStyle?: number; // index into styles[]
  strokeStyle?: number; // index into styles[]
  strokeWidth?: number;
  evenOdd?: boolean;
  roundCap?: boolean;
  roundJoin?: boolean;
  ariaHidden?: boolean;
  commands: AstVectorPathCmd[];
}

export interface AstVectorShapeDef {
  id: string;
  layers: AstVectorShapeLayer[];
}

export interface AstVectorStamp {
  depth: number;
  symbolId: string;
  instanceId?: string;
  matrix: [number, number, number, number, number, number];
  opacity?: number; // 0..1
  ariaHidden?: boolean;
}

export interface AstVectorDictionary {
  viewBox?: string;
  styles: AstVectorStyleEntry[];
  shapes: AstVectorShapeDef[];
  stamps: AstVectorStamp[];
}

export interface BytecodeCompiledScene {
  id: string;
  type: 'Sim' | 'Slide' | 'App' | 'Film';
  title: string;
  stage: string;
  duration: number;
  video?: string | null;
  videoFit?: 'contain' | 'cover' | 'fill';
  has3D?: boolean;
  hasVideo?: boolean;
  camera?: { distance: number; pitch: number | string; yaw: number | string; fov: number } | null;
  keyframes: Array<{ t: number; title: string; rule: string }>;
  subtitles: Array<{ start: number; end: number; en: string; es?: string; la?: string; [k: string]: any }>;
  bindings: Array<any>;
  checkpoints: AstCheckpointConfig[];
  scopes?: AstScopeConfig[];
  ledgers?: AstLedgerConfig[];
  gestures?: Array<any>;
  vars?: Record<string, any>;
  computed?: Array<{ name: string; expr: string }>;
  inputs?: Array<any>;
  uiControls?: Array<any>;
  bindInputs?: Array<any>;
  physics?: any;
  emitters?: Array<any>;
  stateMachines?: Array<any>;
  controls?: Record<string, any> | null;
  skills?: Array<any>;
  definedSkills?: string | Array<any>;
  cameraStops?: Array<any> | null;
  quests?: any;
  bootSound?: string | null;
  interactiveDisabled?: boolean;
  actors?: Array<any>;
  staticElements?: Array<any>;
  completeBinary?: boolean;
  svgMarkup?: string;
  vectorDict?: AstVectorDictionary;
}

export interface AstBytecodeCompileOptions {
  svgMarkup?: string;
  idOverride?: string;
  titleOverride?: string;
  stageOverride?: string;
}
