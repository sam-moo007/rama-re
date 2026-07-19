declare module 'pannellum-react' {
  import * as React from 'react';

  export interface PannellumProps {
    width?: string;
    height?: string;
    image?: string;
    pitch?: number;
    yaw?: number;
    hfov?: number;
    autoLoad?: boolean;
    onLoad?: () => void;
    children?: React.ReactNode;
    [key: string]: any;
  }

  export class Pannellum extends React.Component<PannellumProps, any> {}

  export namespace Pannellum {
    export interface HotspotProps {
      type?: 'info' | 'custom';
      pitch?: number;
      yaw?: number;
      text?: string;
      URL?: string;
      handleClick?: (evt: any, args: any) => void;
      handleClickArg?: any;
      cssClass?: string;
    }
    export class Hotspot extends React.Component<HotspotProps, any> {}
  }
}
