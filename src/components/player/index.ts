// src/components/player/index.ts
export {
  default as PlayerSettingsModal,
  renderPlayerSettingsModal,
  type PlayerSettingsModalProps,
} from './PlayerSettingsModal';

export {
  default as PlayerEmbedModal,
  renderPlayerEmbedModal,
  type PlayerEmbedModalProps,
} from './PlayerEmbedModal';

export {
  default as SvgInspectorDrawer,
  renderSvgInspectorDrawer,
  type SvgInspectorDrawerProps,
  type InspectedElementData,
} from './SvgInspectorDrawer';

export {
  default as SwfTranspilerDrawer,
  renderSwfTranspilerDrawer,
  type SwfTranspilerDrawerProps,
} from './SwfTranspilerDrawer';

export {
  default as PhetTranspilerDrawer,
  renderPhetTranspilerDrawer,
  type PhetTranspilerDrawerProps,
} from './PhetTranspilerDrawer';

export {
  default as DevStudioDrawer,
  renderDevStudioDrawer,
  type DevStudioDrawerProps,
  type StudioTabType,
} from './DevStudioDrawer';

export {
  default as NanoAiTutorDrawer,
  renderNanoAiTutorDrawer,
  type NanoAiTutorDrawerProps,
  type ContextSnapshot,
  type ChatLogItem,
} from './NanoAiTutorDrawer';

export {
  default as AstInteractiveLabDrawer,
  renderAstInteractiveLabDrawer,
  type AstInteractiveLabDrawerProps,
} from './AstInteractiveLabDrawer';

export {
  default as AstChalkboardOverlay,
  mountChalkboard,
  type AstChalkboardOptions,
  type AstChalkboardInstance,
} from './AstChalkboardOverlay';
