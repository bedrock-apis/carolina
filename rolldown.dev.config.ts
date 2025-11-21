import type { OutputOptions, RolldownOptions } from 'rolldown';
import all from './rolldown.config';

export default all.map(e => (((e!.output as OutputOptions)!.sourcemap = 'inline'), e));
