import 'leaflet';

declare module 'leaflet' {
  namespace control {
    function fullscreen(options?: Control.FullscreenOptions): Control.Fullscreen;
  }

  namespace Control {
    interface FullscreenOptions extends ControlOptions {
      title?: string;
      titleCancel?: string;
      content?: string;
      forceSeparateButton?: boolean;
      forcePseudoFullscreen?: boolean;
      fullscreenElement?: HTMLElement | false;
    }

    class Fullscreen extends Control {
      options: FullscreenOptions;
    }
  }
}