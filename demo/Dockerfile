FROM node:22-slim

WORKDIR /work/gibbing-headless-ui

COPY --from=frontail package.json plugin.js /work/frontail/
COPY --from=frontail base /work/frontail/base
COPY --from=frontail components /work/frontail/components
COPY --from=frontail theme /work/frontail/theme
COPY --from=frontail utilities /work/frontail/utilities
COPY --from=frontail types /work/frontail/types

COPY package.json package-lock.json ./
COPY packages/react/package.json packages/react/
COPY packages/svelte/package.json packages/svelte/
COPY demo/react/package.json demo/react/
COPY demo/svelte/package.json demo/svelte/
RUN npm install --legacy-peer-deps --no-audit --no-fund

COPY . .
