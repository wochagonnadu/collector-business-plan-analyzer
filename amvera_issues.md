5/04/25 14:20:39

INFO[0004] Returning cached image manifest
05/04/25 14:20:39

INFO[0004] Retrieving image manifest node:20-alpine
05/04/25 14:20:39

INFO[0004] Returning cached image manifest
05/04/25 14:20:39

INFO[0004] Executing 0 build triggers
05/04/25 14:20:39

INFO[0004] Building stage 'node:20-alpine' [idx: '0', base-idx: '-1']
05/04/25 14:20:39

INFO[0004] Resolving srcs [collector-bp-app/package*.json]...
05/04/25 14:20:39

INFO[0004] Checking for cached layer cr.yandex/crp2gf3gm8rv83kfkvet/amvera-wochagonnadu-collector/cache:6990be426cc1fd17eb5668607bc9f20f86314ab384fc0bd77f96ff07cfb3579d...
05/04/25 14:20:39

INFO[0004] No cached layer found for cmd RUN npm install --frozen-lockfile
05/04/25 14:20:39

INFO[0004] Unpacking rootfs as cmd COPY collector-bp-app/package*.json ./ requires it.
05/04/25 14:20:43

INFO[0008] Initializing snapshotter ...
05/04/25 14:20:43

INFO[0008] Taking snapshot of full filesystem...
05/04/25 14:20:45

INFO[0010] WORKDIR /app/collector-bp-app
05/04/25 14:20:45

INFO[0010] Cmd: workdir
05/04/25 14:20:45

INFO[0010] Changed working directory to /app/collector-bp-app
05/04/25 14:20:45

INFO[0010] Creating directory /app/collector-bp-app with uid -1 and gid -1
05/04/25 14:20:45

INFO[0010] Resolving srcs [collector-bp-app/package*.json]...
05/04/25 14:20:45

INFO[0010] COPY collector-bp-app/package*.json ./
05/04/25 14:20:45

INFO[0010] Resolving srcs [collector-bp-app/package*.json]...
05/04/25 14:20:45

INFO[0010] RUN npm install --frozen-lockfile
05/04/25 14:20:45

INFO[0010] Cmd: /bin/sh
05/04/25 14:20:45

INFO[0010] Args: [-c npm install --frozen-lockfile]
05/04/25 14:20:45

INFO[0010] Running: [/bin/sh -c npm install --frozen-lockfile]
05/04/25 14:20:58

05/04/25 14:20:58

added 306 packages, and audited 307 packages in 13s
05/04/25 14:20:58

05/04/25 14:20:58

63 packages are looking for funding
05/04/25 14:20:58

run `npm fund` for details
05/04/25 14:20:58

05/04/25 14:20:58

found 0 vulnerabilities
05/04/25 14:20:58

npm notice
05/04/25 14:20:58

npm notice New major version of npm available! 10.8.2 -> 11.2.0
05/04/25 14:20:58

npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.2.0
05/04/25 14:20:58

npm notice To update run: npm install -g npm@11.2.0
05/04/25 14:20:58

npm notice
05/04/25 14:21:00

INFO[0025] COPY collector-bp-app/ .
05/04/25 14:21:00

INFO[0025] RUN npm run build
05/04/25 14:21:01

INFO[0026] Cmd: /bin/sh
05/04/25 14:21:01

INFO[0026] Args: [-c npm run build]
05/04/25 14:21:01

INFO[0026] Running: [/bin/sh -c npm run build]
05/04/25 14:21:01

05/04/25 14:21:01

> collector-bp-app@0.0.0 build
05/04/25 14:21:01

> tsc -b && vite build
05/04/25 14:21:01

05/04/25 14:21:09

src/components/CollectionStages/WorkflowVisualizer.tsx(4,1): error TS6133: 'Stage' is declared but its value is never read.
05/04/25 14:21:09

src/components/FinancialModeling/HorizontalCashflowReport.tsx(4,1): error TS6192: All imports in import declaration are unused.
05/04/25 14:21:09

src/components/FinancialModeling/HorizontalCashflowReport.tsx(62,5): error TS6133: 'event' is declared but its value is never read.
05/04/25 14:21:09

src/store/slices/costsSlice.ts(2,20): error TS6133: 'CFCategory' is declared but its value is never read.
05/04/25 14:21:10

error building image: error building stage: failed to execute command: waiting for process to exit: exit status 2
05/04/25 14:21:21

Контейнер перешел в статус FAILED