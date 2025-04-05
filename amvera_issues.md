5/04/25 19:18:23

INFO[0002] Returning cached image manifest
05/04/25 19:18:23

INFO[0003] Built cross stage deps: map[0:[/app/collector-bp-app/dist]]
05/04/25 19:18:23

INFO[0003] Retrieving image manifest node:20-alpine
05/04/25 19:18:23

INFO[0003] Returning cached image manifest
05/04/25 19:18:23

INFO[0003] Retrieving image manifest node:20-alpine
05/04/25 19:18:23

INFO[0003] Returning cached image manifest
05/04/25 19:18:23

INFO[0003] Executing 0 build triggers
05/04/25 19:18:23

INFO[0003] Building stage 'node:20-alpine' [idx: '0', base-idx: '-1']
05/04/25 19:18:23

INFO[0003] Resolving srcs [collector-bp-app/package*.json]...
05/04/25 19:18:23

INFO[0003] Checking for cached layer cr.yandex/crp2gf3gm8rv83kfkvet/amvera-wochagonnadu-collector/cache:a6230f1a03208dcf7e05b2f240401a6d5ccc90e22ce1ef1a74f32ce879aad345...
05/04/25 19:18:23

INFO[0003] No cached layer found for cmd RUN npm install --frozen-lockfile
05/04/25 19:18:23

INFO[0003] Unpacking rootfs as cmd COPY collector-bp-app/package*.json ./ requires it.
05/04/25 19:18:26

INFO[0006] Initializing snapshotter ...
05/04/25 19:18:26

INFO[0006] Taking snapshot of full filesystem...
05/04/25 19:18:29

INFO[0008] WORKDIR /app/collector-bp-app
05/04/25 19:18:29

INFO[0008] Cmd: workdir
05/04/25 19:18:29

INFO[0008] Changed working directory to /app/collector-bp-app
05/04/25 19:18:29

INFO[0008] Creating directory /app/collector-bp-app with uid -1 and gid -1
05/04/25 19:18:29

INFO[0008] Resolving srcs [collector-bp-app/package*.json]...
05/04/25 19:18:29

INFO[0008] COPY collector-bp-app/package*.json ./
05/04/25 19:18:29

INFO[0008] Resolving srcs [collector-bp-app/package*.json]...
05/04/25 19:18:29

INFO[0008] RUN npm install --frozen-lockfile
05/04/25 19:18:29

INFO[0008] Cmd: /bin/sh
05/04/25 19:18:29

INFO[0008] Args: [-c npm install --frozen-lockfile]
05/04/25 19:18:29

INFO[0008] Running: [/bin/sh -c npm install --frozen-lockfile]
05/04/25 19:18:42

05/04/25 19:18:42

added 308 packages, and audited 309 packages in 13s
05/04/25 19:18:42

05/04/25 19:18:42

63 packages are looking for funding
05/04/25 19:18:42

run `npm fund` for details
05/04/25 19:18:42

05/04/25 19:18:42

found 0 vulnerabilities
05/04/25 19:18:42

npm notice
05/04/25 19:18:42

npm notice New major version of npm available! 10.8.2 -> 11.2.0
05/04/25 19:18:42

npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.2.0
05/04/25 19:18:42

npm notice To update run: npm install -g npm@11.2.0
05/04/25 19:18:42

npm notice
05/04/25 19:18:43

INFO[0023] COPY collector-bp-app/ .
05/04/25 19:18:43

INFO[0023] RUN npm run build
05/04/25 19:18:44

INFO[0024] Cmd: /bin/sh
05/04/25 19:18:44

INFO[0024] Args: [-c npm run build]
05/04/25 19:18:44

INFO[0024] Running: [/bin/sh -c npm run build]
05/04/25 19:18:45

05/04/25 19:18:45

> collector-bp-app@0.0.0 build
05/04/25 19:18:45

> tsc -b && vite build
05/04/25 19:18:45

05/04/25 19:18:53

src/utils/laborCostCalculations.ts(178,11): error TS6133: 'annualGrossSalaryPerType' is declared but its value is never read.
05/04/25 19:18:53

src/utils/monthlySimulation.ts(101,9): error TS6133: 'totalExpectedRecoveryValue' is declared but its value is never read.
05/04/25 19:18:53

error building image: error building stage: failed to execute command: waiting for process to exit: exit status 2
05/04/25 19:19:03

Контейнер перешел в статус FAILED