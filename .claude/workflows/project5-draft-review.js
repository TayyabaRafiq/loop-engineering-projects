export const meta = {
  name: 'project5-draft-review',
  description: 'Project 5 draft-and-review body: read candidates.json, build worktrees pinned to a fixed base commit, fix each candidate, independently review, report PASS/FAIL',
  phases: [
    { title: 'Read candidates', detail: 'load candidates.json dynamically' },
    { title: 'Setup worktrees', detail: 'git worktree add pinned to 22dacf2, from repo root' },
    { title: 'Implement', detail: 'one implementer per candidate, in its pre-built worktree' },
    { title: 'Review', detail: 'independent reviewer per candidate' },
  ],
}

const BASE_COMMIT = '22dacf2'
const REPO_ROOT = '/mnt/d/loop-engineering-projects'

phase('Read candidates')

const CANDIDATES_SCHEMA = {
  type: 'object',
  required: ['candidates'],
  properties: {
    candidates: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'title', 'file', 'test'],
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          file: { type: 'string' },
          test: { type: 'string' },
        },
      },
    },
  },
}

const read = await agent(
  `Read the file project-5-codify-the-body/candidates.json in the repository at ${REPO_ROOT} (path relative to the repo root). Parse it as JSON and return its contents verbatim as a "candidates" array, each item with id, title, file, test fields exactly as found in the file. Do not invent, omit, or modify any entries.`,
  { schema: CANDIDATES_SCHEMA }
)
const candidates = read.candidates
log(`Loaded ${candidates.length} candidates from candidates.json`)

phase('Setup worktrees')

const SETUP_SCHEMA = {
  type: 'object',
  required: ['worktrees'],
  properties: {
    worktrees: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'worktreePath', 'branch', 'verified', 'note'],
        properties: {
          id: { type: 'string' },
          worktreePath: { type: 'string' },
          branch: { type: 'string' },
          verified: { type: 'boolean' },
          note: { type: 'string' },
        },
      },
    },
  },
}

const candidateListText = candidates.map((c) => `- id="${c.id}"`).join('\n')

const setup = await agent(
  `You are the worktree-setup agent for the Project 5 dynamic workflow. Operate directly in the repository's main checkout at ${REPO_ROOT} — do NOT request worktree isolation for yourself, and do NOT create, merge, rebase, or push any commits on the main checkout itself. ` +
  `For each of these candidates, create one isolated git worktree pinned to the exact commit ${BASE_COMMIT} (not "main", not "HEAD", not "origin/main" — the literal commit ${BASE_COMMIT}), by running from ${REPO_ROOT}:\n` +
  `  git worktree add -b p5-<id> ${REPO_ROOT}/.claude/worktrees/p5-<id> ${BASE_COMMIT}\n` +
  `substituting <id> with each candidate's id below, one at a time (do not run them concurrently — run each command, wait for it to finish, then the next):\n${candidateListText}\n\n` +
  `After creating each worktree, verify it independently: run \`git -C ${REPO_ROOT}/.claude/worktrees/p5-<id> log -1 --oneline\` and confirm the commit hash starts with ${BASE_COMMIT}, and confirm the file ${REPO_ROOT}/.claude/worktrees/p5-<id>/project-5-codify-the-body/candidates.json exists. ` +
  `If either check fails for a candidate, mark verified=false for it and explain why in note — do not attempt to fix it yourself (no checkout/cherry-pick/merge/rebase). ` +
  `Do not touch origin, do not push, do not touch the main checkout's own branch. ` +
  `Report back a "worktrees" array with one entry per candidate: id, worktreePath (absolute), branch (e.g. "p5-candidate-1"), verified (boolean), note (empty string if verified, explanation if not).`,
  { schema: SETUP_SCHEMA }
)

const worktreeById = Object.fromEntries(setup.worktrees.map((w) => [w.id, w]))
for (const w of setup.worktrees) {
  log(`${w.id}: worktree ${w.verified ? 'verified OK' : 'NOT verified'} at ${w.worktreePath} (${w.branch})`)
}

const IMPLEMENT_SCHEMA = {
  type: 'object',
  required: ['id', 'status', 'worktreePath', 'branch', 'testResult', 'diffSummary', 'note'],
  properties: {
    id: { type: 'string' },
    status: { type: 'string', enum: ['completed', 'blocked'] },
    worktreePath: { type: 'string' },
    branch: { type: 'string' },
    testResult: { type: 'string', enum: ['pass', 'fail', 'not_run'] },
    diffSummary: { type: 'string' },
    note: { type: 'string' },
  },
}

const REVIEW_SCHEMA = {
  type: 'object',
  required: ['id', 'decision', 'evidence'],
  properties: {
    id: { type: 'string' },
    decision: { type: 'string', enum: ['PASS', 'FAIL'] },
    evidence: { type: 'string' },
  },
}

const results = await pipeline(
  candidates,
  async (candidate) => {
    const w = worktreeById[candidate.id]
    if (!w || !w.verified) {
      return {
        id: candidate.id,
        status: 'blocked',
        worktreePath: w ? w.worktreePath : '',
        branch: w ? w.branch : '',
        testResult: 'not_run',
        diffSummary: '',
        note: `Worktree setup did not verify for ${candidate.id}: ${w ? w.note : 'no worktree info returned by setup'}`,
      }
    }
    return agent(
      'You are the implementer agent for one candidate bug fix in the Project 5 "dynamic fix loop" demo. ' +
      `A worktree has already been created for you at ${w.worktreePath}, pinned to commit ${BASE_COMMIT}, on branch ${w.branch}. Do NOT create a new worktree, do NOT run git worktree add. ` +
      `cd into ${w.worktreePath}/project-5-codify-the-body first. Before doing anything else, run \`git log -1 --oneline\` from the worktree root and confirm the commit starts with ${BASE_COMMIT}, and confirm candidates.json and skills/implementer.md exist. ` +
      'If either check fails, do NOT run git checkout/cherry-pick/merge/rebase to fix it — just report status "blocked", testResult "not_run", diffSummary "", and a note explaining what you found. Stop there. ' +
      `If both checks pass, proceed as the implementer for this candidate: id=${candidate.id}, title="${candidate.title}", file=project-5-codify-the-body/${candidate.file}, test=project-5-codify-the-body/${candidate.test}. ` +
      'Read project-5-codify-the-body/skills/implementer.md and follow it exactly. Steps: ' +
      '(1) from inside project-5-codify-the-body/, create a virtualenv and install pytest if .venv does not already exist (python3 -m venv .venv && .venv/bin/pip install -q pytest). ' +
      `(2) Run .venv/bin/python -m pytest ${candidate.test} -q to reproduce the bug. ` +
      '(3) Read the test to understand the expected behavior. ' +
      `(4) Fix ONLY ${candidate.file} with the smallest correct change — do not touch any other candidate's file, candidates.json, or skills/. ` +
      '(5) Re-run the test to confirm it passes. Do not weaken, delete, or bypass the test. ' +
      `(6) Commit your change on branch ${w.branch} with message "${candidate.id}: fix ${candidate.title}". ` +
      `(7) Report back with status "completed": worktreePath "${w.worktreePath}", branch "${w.branch}", testResult "pass" or "fail", a short diffSummary, and note "".`,
      { label: `implement:${candidate.id}`, phase: 'Implement', schema: IMPLEMENT_SCHEMA }
    )
  },
  async (implementResult, candidate) => {
    if (implementResult.status === 'blocked') {
      log(`${candidate.id} BLOCKED: ${implementResult.note}`)
      return { id: candidate.id, decision: 'BLOCKED', evidence: implementResult.note }
    }
    const verdict = await agent(
      'You are the independent reviewer agent for one candidate bug fix in the Project 5 "dynamic fix loop" demo. ' +
      "You did NOT write this fix — review it as if you have never seen the implementer's reasoning. " +
      'An implementer already made a change in an existing, isolated git worktree. Do NOT create a new worktree, do NOT run git worktree add. ' +
      `cd into this existing worktree path: ${implementResult.worktreePath}/project-5-codify-the-body. Expected branch: ${implementResult.branch}. ` +
      `Candidate: id=${candidate.id}, title="${candidate.title}", file=project-5-codify-the-body/${candidate.file}, test=project-5-codify-the-body/${candidate.test}. ` +
      'Read skills/reviewer.md in that directory and follow its rules. Steps: ' +
      '(1) confirm git branch --show-current matches the expected branch. ' +
      "(2) Inspect the actual code change: git log --oneline -5, find the commit for this candidate, git show it, confirm only the candidate's file was touched. " +
      "(3) Check the test file was not weakened, deleted, or bypassed (git log on the test file; read its current contents for real assertions). " +
      "(4) Independently run the test yourself (create/reuse a .venv, install pytest if needed) — do not trust the implementer's report. " +
      '(5) Do NOT modify any file, merge anything, or push anything. ' +
      'Return: id, decision ("PASS" or "FAIL" — never PASS just because code looks reasonable, only PASS on objective passing-test evidence), and a short evidence-based reason.',
      { label: `review:${candidate.id}`, phase: 'Review', schema: REVIEW_SCHEMA }
    )
    return verdict
  }
)

const verdicts = results.filter(Boolean)
log(`Completed ${verdicts.length}/${candidates.length} candidates`)
return { candidates, worktrees: setup.worktrees, verdicts }
