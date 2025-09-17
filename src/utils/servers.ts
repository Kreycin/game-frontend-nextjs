// src/utils/servers.ts
export interface Server { id: string; name: string; }
export const servers: Server[] = [
  { id: 'china', name: 'China Servers' },
  { id: 's_servers', name: 'S-Servers' },
  { id: 'n_servers', name: 'N-Servers' },
  { id: 'na_servers', name: 'NA-Servers' },
  { id: 't_servers', name: 'T-Servers' },
];