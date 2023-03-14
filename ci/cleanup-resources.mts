#!/usr/bin/env -S npx tsx
import os from "os";
import path from "path";
import fs from "fs/promises";
import { $ } from "zx";

const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "zx-"));
const tmpFile = path.join(tmpDir, "result.json");

const { stdout: prNumbers } =
  await $`gh pr list --json number | jq '.[].number'`;

const deleteUnuseApps = async () => {
  await $`npx caprover api -m GET -d "" -t /user/apps/appDefinitions -u ${process.env.CAPROVER_URL} -p ${process.env.CAPROVER_PASSWORD} -o ${tmpFile}`;
  const { stdout: appNames } =
    await $`jq -r '.appDefinitions | map(.appName) | .[]' < ${tmpFile}`;

  const appNamesToUse = prNumbers.split("\n").map((n) => `pr${n}-soshal`);
  return appNames
    .split("\n")
    .filter((app) => /pr\d+-soshal/.test(app) && !appNamesToUse.includes(app));
};

const deleteUnuseDirs = async () => {
  const { stdout: s3dirs } =
    await $`aws --endpoint-url https://minio-s3.paas.mkizka.dev s3 ls s3://soshal-mutation-test | awk '{print $2}'`;

  const dirNameToUse = prNumbers.split("\n").map((n) => `pr${n}/`);
  return s3dirs
    .split("\n")
    .filter((dir) => /pr\d+\//.test(dir) && !dirNameToUse.includes(dir));
};

for (const appName of await deleteUnuseApps()) {
  const data = JSON.stringify({ appName, volumes: [] });
  await $`npx caprover api -m POST -d ${data} -t /user/apps/appDefinitions/delete -u ${process.env.CAPROVER_URL} -p ${process.env.CAPROVER_PASSWORD}`;
}

for (const dir of await deleteUnuseDirs()) {
  await $`aws --endpoint-url https://minio-s3.paas.mkizka.dev s3 rm --recursive s3://soshal-mutation-test/${dir}`;
}
