import { rmSync } from 'node:fs'

// Remove declarations for deleted modules before rebuilding the tarball.
rmSync(new URL('../dist', import.meta.url), { recursive: true, force: true })
