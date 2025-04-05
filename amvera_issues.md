05/04/25 14:34:23

INFO[0003] Retrieving image manifest node:20-alpine
05/04/25 14:34:23

INFO[0003] Returning cached image manifest
05/04/25 14:34:23

INFO[0003] Retrieving image manifest node:20-alpine
05/04/25 14:34:23

INFO[0003] Returning cached image manifest
05/04/25 14:34:23

INFO[0003] Executing 0 build triggers
05/04/25 14:34:23

INFO[0003] Building stage 'node:20-alpine' [idx: '0', base-idx: '-1']
05/04/25 14:34:23

INFO[0003] Resolving srcs [collector-bp-app/package*.json]...
05/04/25 14:34:23

INFO[0003] Checking for cached layer cr.yandex/crp2gf3gm8rv83kfkvet/amvera-wochagonnadu-collector/cache:6990be426cc1fd17eb5668607bc9f20f86314ab384fc0bd77f96ff07cfb3579d...
05/04/25 14:34:23

INFO[0004] No cached layer found for cmd RUN npm install --frozen-lockfile
05/04/25 14:34:23

INFO[0004] Unpacking rootfs as cmd COPY collector-bp-app/package*.json ./ requires it.
05/04/25 14:34:27

INFO[0008] Initializing snapshotter ...
05/04/25 14:34:27

INFO[0008] Taking snapshot of full filesystem...
05/04/25 14:34:28

INFO[0009] WORKDIR /app/collector-bp-app
05/04/25 14:34:28

INFO[0009] Cmd: workdir
05/04/25 14:34:28

INFO[0009] Changed working directory to /app/collector-bp-app
05/04/25 14:34:28

INFO[0009] Creating directory /app/collector-bp-app with uid -1 and gid -1
05/04/25 14:34:28

INFO[0009] Resolving srcs [collector-bp-app/package*.json]...
05/04/25 14:34:28

INFO[0009] COPY collector-bp-app/package*.json ./
05/04/25 14:34:28

INFO[0009] Resolving srcs [collector-bp-app/package*.json]...
05/04/25 14:34:28

INFO[0009] RUN npm install --frozen-lockfile
05/04/25 14:34:28

INFO[0009] Cmd: /bin/sh
05/04/25 14:34:28

INFO[0009] Args: [-c npm install --frozen-lockfile]
05/04/25 14:34:28

INFO[0009] Running: [/bin/sh -c npm install --frozen-lockfile]
05/04/25 14:34:46

05/04/25 14:34:46

added 306 packages, and audited 307 packages in 17s
05/04/25 14:34:46

05/04/25 14:34:46

63 packages are looking for funding
05/04/25 14:34:46

05/04/25 14:34:46

found 0 vulnerabilities
05/04/25 14:34:46

npm notice
05/04/25 14:34:46

npm notice New major version of npm available! 10.8.2 -> 11.2.0
05/04/25 14:34:46

npm notice Changelog: https://github.com/npm/cli/releases/tag/v11.2.0
05/04/25 14:34:46

npm notice To update run: npm install -g npm@11.2.0
05/04/25 14:34:46

npm notice
05/04/25 14:34:46

2025-04-05T11:34:46.07594Z stdout F run `npm fund` for details
05/04/25 14:34:47

INFO[0028] COPY collector-bp-app/ .
05/04/25 14:34:47

INFO[0028] RUN npm run build
05/04/25 14:34:49

INFO[0030] Cmd: /bin/sh
05/04/25 14:34:49

INFO[0030] Args: [-c npm run build]
05/04/25 14:34:49

INFO[0030] Running: [/bin/sh -c npm run build]
05/04/25 14:34:49

05/04/25 14:34:49

> collector-bp-app@0.0.0 build
05/04/25 14:34:49

> tsc -b && vite build
05/04/25 14:34:49

05/04/25 14:34:59

src/components/FinancialModeling/HorizontalCashflowReport.tsx(8,1): error TS6133: 'Stage' is declared but its value is never read.
05/04/25 14:34:59

src/components/FinancialModeling/HorizontalCashflowReport.tsx(9,1): error TS6192: All imports in import declaration are unused.
05/04/25 14:34:59

src/components/FinancialModeling/HorizontalCashflowReport.tsx(10,1): error TS6133: 'StaffType' is declared but its value is never read.
05/04/25 14:35:00

error building image: error building stage: failed to execute command: waiting for process to exit: exit status 2
05/04/25 14:35:07

Контейнер перешел в статус FAILED
05/04/25 14:35:08

Контейнер перешел в статус DELETE