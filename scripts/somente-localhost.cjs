// Carregado antes do Expo (node -r). O Metro abre a porta sem informar o endereço,
// e aí o Node escuta em todas as interfaces de rede. Aqui todo servidor TCP que não
// disser o endereço (ou pedir 0.0.0.0 / ::) passa a escutar só em 127.0.0.1.
const net = require('net');

const LOCAL = '127.0.0.1';
const ANY = new Set(['0.0.0.0', '::', '']);
const listen = net.Server.prototype.listen;

net.Server.prototype.listen = function (...args) {
  const [first] = args;
  if (args.length === 0 || typeof first === 'function') {
    args.unshift(0, LOCAL);
  } else if (typeof first === 'number' || (typeof first === 'string' && /^\d+$/.test(first))) {
    if (typeof args[1] !== 'string') args.splice(1, 0, LOCAL);
    else if (ANY.has(args[1])) args[1] = LOCAL;
  } else if (first && typeof first === 'object' && first.path === undefined && !first._handle) {
    if (!first.host || ANY.has(first.host)) args[0] = { ...first, host: LOCAL };
  }
  return listen.apply(this, args);
};
