import type { ElectrobunConfig } from "electrobun";

export default {
  app: {
    name: "Messages",
    identifier: "com.local.googlemessages.wrapper",
    version: "0.0.1",
  },
  build: {
    views: {
      mainview: {
        entrypoint: "src/mainview/index.ts",
      },
    },
    copy: {
      "src/mainview/index.html": "views/mainview/index.html",
      "src/mainview/index.css": "views/mainview/index.css",
    },
    mac: {
      bundleCEF: true,
      icons: "icon.iconset",
    },
    linux: {
      bundleCEF: true,
      icon: "icon.iconset/icon_256x256.png",
    },
    win: {
      bundleCEF: true,
      icon: "icon.iconset/icon_256x256.png",
    },
  },
} satisfies ElectrobunConfig;
