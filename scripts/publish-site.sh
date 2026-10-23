#!/usr/bin/env bash
# Usage: bash scripts/publish-site.sh "Commit message" file [file ...]
set -euo pipefail

if (( $# < 2 )); then
  echo 'Usage: bash scripts/publish-site.sh "Commit message" file [file ...]' >&2
  exit 2
fi
publish_message=$1
shift
cd "$(git -C "$(dirname "$0")" rev-parse --show-toplevel)"

[[ $(git branch --show-current) == main ]] || { echo 'Publish from main.' >&2; exit 1; }
git diff --cached --quiet || { echo 'Review or commit the already staged changes before publishing.' >&2; exit 1; }
for publish_file in "$@"; do
  [[ -f "$publish_file" && "$publish_file" != /* && "$publish_file" != *..* ]] || {
    echo "Expected a repository-relative file: $publish_file" >&2
    exit 1
  }
done

echo 'Checking copy, syntax, and whitespace.'
node scripts/check-content.mjs
git diff --check

publish_repo=$(gh repo view --json nameWithOwner --jq .nameWithOwner)
publish_branch=$(gh api "repos/$publish_repo/pages" --jq .source.branch)
publish_path=$(gh api "repos/$publish_repo/pages" --jq .source.path)
publish_url=$(gh api "repos/$publish_repo/pages" --jq .html_url)
[[ "$publish_branch" == main && "$publish_path" == / ]] || {
  echo 'This script expects GitHub Pages to publish the root of main.' >&2
  exit 1
}

git fetch origin main
[[ $(git rev-parse HEAD) == "$(git rev-parse origin/main)" ]] || {
  echo 'Local main and origin/main differ. Reconcile them before publishing.' >&2
  exit 1
}

echo 'Committing the selected files and pushing to GitHub Pages.'
git add -- "$@"
git diff --cached --quiet && { echo 'No selected changes to publish.' >&2; exit 1; }
git commit -m "$publish_message"
publish_sha=$(git rev-parse HEAD)
git push origin HEAD:main

echo "Waiting for the GitHub Pages build for ${publish_sha:0:7}."
publish_built=false
for (( publish_attempt = 1; publish_attempt <= 30; publish_attempt++ )); do
  publish_state=$(gh api "repos/$publish_repo/pages/builds/latest" --jq '[.commit, .status] | @tsv')
  IFS=$'\t' read -r publish_build_sha publish_build_status <<< "$publish_state"
  if [[ "$publish_build_sha" == "$publish_sha" ]]; then
    [[ "$publish_build_status" != errored ]] || { echo 'GitHub Pages build failed.' >&2; exit 1; }
    if [[ "$publish_build_status" == built ]]; then
      publish_built=true
      break
    fi
  fi
  sleep 10
done
[[ "$publish_built" == true ]] || { echo 'Pushed successfully, but the build is still pending. Check GitHub Pages before retrying.' >&2; exit 1; }

echo 'Checking that the live page and scripts match the local files.'
node --input-type=module - "$publish_url" "$publish_sha" <<'NODE'
import { readFileSync } from 'node:fs';
const [base, sha] = process.argv.slice(2);
const files = ['index.html', 'content.js', 'app.js'];
let pending = files;
for (let attempt = 0; attempt < 18 && pending.length; attempt++) {
  const remaining = [];
  for (const file of pending) {
    const url = new URL(file === 'index.html' ? './' : file, base);
    url.searchParams.set('deployment', sha);
    try {
      const response = await fetch(url, { headers: { 'Cache-Control': 'no-cache' }, signal: AbortSignal.timeout(15000) });
      if (!response.ok || await response.text() !== readFileSync(file, 'utf8')) remaining.push(file);
    } catch {
      remaining.push(file);
    }
  }
  pending = remaining;
  if (pending.length && attempt < 17) await new Promise(resolve => setTimeout(resolve, 10000));
}
if (pending.length) throw new Error(`Build completed, but these live files do not match yet: ${pending.join(', ')}`);
console.log(`Published and verified ${base} (${sha.slice(0, 7)}).`);
NODE
