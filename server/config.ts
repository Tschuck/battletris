import server from './server';

const prefix = 'BATTLETRIS_';
const _ = (name: string, defaultValue: any) => {
  const paramName = `${prefix}${name.toUpperCase()}`;
  const value = process.env[paramName];
  if (value || defaultValue) {
    if (defaultValue) {
      server.log.warn(`[CONFIG] using default for: ${paramName}: ${defaultValue}`);
    }

    return value || defaultValue;
  }

  throw new Error(`config ${prefix}${name.toUpperCase()} is missing`);
};

export default {
  port: _('port', 3000),
};
