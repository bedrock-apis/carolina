import { defineConfig } from '../../rolldown.config';

export default defineConfig(
   {
      main: './api/interface.ts',
      raknet: './raknet/main.ts',
      //nethernet: './nethernet/main.ts',
   },
   {},
);
