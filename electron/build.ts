import { build } from 'electron-builder';
import * as path from 'path';

build({
  config: {
    appId: 'com.supabase.print.desktop',
    productName: 'Supabase Print Desktop',
    directories: {
      output: 'release',
      app: path.resolve(__dirname, '..')
    },
    files: [
      'dist/**/*',
      'electron/**/*'
    ],
    win: {
      target: [
        {
          target: 'nsis',
          arch: ['x64']
        }
      ]
    },
    nsis: {
      oneClick: false,
      allowToChangeInstallationDirectory: true,
      createDesktopShortcut: true,
      createStartMenuShortcut: true
    }
  }
}); 