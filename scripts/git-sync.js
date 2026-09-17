import { execSync } from 'child_process';

function run(command) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch (err) {
    return null;
  }
}

console.log("=== Zelda: Rise of the Legends - GitHub Auto-Sync ===");

// 1. Check git status
const status = run('git status --porcelain');

if (!status) {
  console.log("✓ Repository is up to date. Nothing to commit.");
} else {
  console.log("Found modified / new files:");
  console.log(status);

  // 2. Stage all files
  console.log("\nStaging files (git add -A)...");
  run('git add -A');

  // 3. Commit with descriptive message
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const commitMsg = `feat: Rise of the Legends - Ganondorf Reawakened PC Game (${timestamp})`;
  console.log(`Committing changes: "${commitMsg}"...`);
  run(`git commit -m "${commitMsg}"`);
  console.log("✓ Changes committed successfully.");
}

// 4. Push to remote
console.log("\nPushing to remote origin main (https://github.com/Crazy-Link67/zelda-ganandorf-reawakened)...");
const pushResult = run('git push -u origin main');
if (pushResult !== null) {
  console.log("✓ Successfully pushed to GitHub!");
} else {
  console.log("⚠️ Remote push could not complete automatically. Ensure your GitHub credentials/SSH keys are configured.");
}

console.log("=====================================================");

