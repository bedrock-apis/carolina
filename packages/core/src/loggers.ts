import { Logger, rgb } from '@carolina/common';

const COMMON_DRIVERS = new Logger(rgb(98, 18, 151)('DRIVERS'));
export const NETWORK_DRIVER_LOGGER = new Logger(rgb(143, 196, 218)('NETWORK'), COMMON_DRIVERS);
