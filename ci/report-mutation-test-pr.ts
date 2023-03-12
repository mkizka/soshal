import fs from "fs";

type Result = {
  files: {
    [key: string]: {
      mutants: {
        status: "NoCoverage";
      }[];
    };
  };
};

type Score = {
  [key: string]: number;
};

// https://stryker-mutator.io/docs/mutation-testing-elements/mutant-states-and-metrics/#metrics
const getScorePerFile = (resultPath: string) => {
  const result = JSON.parse(fs.readFileSync(resultPath, "utf-8")) as Result;
  const score: Score = {};
  for (const [filename, { mutants }] of Object.entries(result.files)) {
    const detected = mutants.filter((mutant) =>
      ["Killed", "Timeout"].includes(mutant.status)
    ).length;
    const undetected = mutants.filter((mutant) =>
      ["Survived", "NoCoverage"].includes(mutant.status)
    ).length;
    score[filename] =
      Math.round((detected / (detected + undetected)) * 10000) / 100;
  }
  return score;
};

const table = () => {
  const prScores = getScorePerFile("reports/mutation/mutation.json");
  const mainScores = getScorePerFile("reports-main/mutation/mutation.json");
  const filenames = [
    ...new Set([...Object.keys(prScores), ...Object.keys(mainScores)]),
  ].sort();
  const comment = [
    "| ファイル名 | PR | main | 変化 |",
    "| --- | --- | --- | --- |",
  ];
  for (const filename of filenames) {
    const prScore = prScores[filename] ?? 0;
    const mainScore = mainScores[filename] ?? 0;
    const prText = prScores[filename] ?? "なし";
    const mainText = mainScores[filename] ?? "なし";
    if (prText == mainText) {
      continue;
    }
    const diffText =
      prScore > mainScore
        ? ":green_circle:"
        : prScore < mainScore
        ? ":warning:"
        : ":white_circle:";
    comment.push(`| ${filename} | ${prText} | ${mainText} | ${diffText}`);
  }
  return comment.length > 2
    ? comment.join("\n")
    : "ミューテーションテスト結果に変化がありませんでした";
};

const baseUrl = process.env.MUTATION_TEST_S3_BASEURL ?? "";

const text = `${table()}

:gun: [mutation.html](${baseUrl}/mutation/mutation.html)
:page_facing_up: [stryker.log](${baseUrl}/stryker.log)`;

console.log(text.replace("\n"));
