# Git & GitHub Quick Guide

## Initial Setup

### Configure Git
```bash
git config --global user.name "Your Name"           // Set your name
git config --global user.email "your@email.com"     // Set your email
git config --global core.editor "code"              // Set default editor
git config --list                                    // View all configurations
```

### Login to GitHub/GitLab
```bash
gh auth login                                        // GitHub CLI login (interactive)
git config --global user.password "your_token"      // Store personal access token
```

---

## Creating & Initializing Repository

### Initialize Local Repository
```bash
git init                                             // Initialize empty git repo in current folder
git init [project-name]                              // Create new folder and initialize git
```

### Add Remote Repository

#### GitHub
```bash
git remote add origin https://github.com/username/repo.git  // Add GitHub repo
git remote add origin git@github.com:username/repo.git       // SSH method (faster)
```

#### GitLab
```bash
git remote add origin https://gitlab.com/username/repo.git   // Add GitLab repo
git remote add origin git@gitlab.com:username/repo.git       // SSH method
```

### View Remote
```bash
git remote -v                                        // Show all remotes with URLs
git remote show origin                               // Show details of origin remote
```

### Create Public Repository (CLI)

#### GitHub
```bash
gh repo create my-repo --public                      // Create public repo on GitHub
gh repo create my-repo --public --source=.           // Create and push current folder
```

#### GitLab
```bash
# GitLab requires API token or use web interface
# Alternative: Use web interface at gitlab.com/projects/new
```

---

## Daily Workflow: Status & Changes

### Check Status
```bash
git status                                           // Show modified files, staged changes, branch
git status -s                                        // Short status format
```

### View Changes
```bash
git diff                                             // Show unstaged changes
git diff --staged                                    // Show staged changes
git diff [file-name]                                 // Show changes in specific file
git diff main..feature                               // Compare two branches
```

### Stage Changes
```bash
git add [file-name]                                  // Stage specific file
git add .                                            // Stage all changes
git add *.js                                         // Stage all .js files
git add src/                                         // Stage entire folder
git reset [file-name]                                // Unstage specific file
git reset                                            // Unstage all files
```

---

## Branching Strategy

### Create & Switch Branches
```bash
git branch                                           // List local branches
git branch -a                                        // List all branches (local + remote)
git branch [branch-name]                             // Create new branch
git checkout [branch-name]                           // Switch to branch
git checkout -b [branch-name]                        // Create and switch to new branch
git switch [branch-name]                             // Modern way to switch
```

### Delete Branch
```bash
git branch -d [branch-name]                          // Delete local branch (safe)
git branch -D [branch-name]                          // Force delete local branch
git push origin --delete [branch-name]               // Delete remote branch
```

### Rename Branch
```bash
git branch -m [old-name] [new-name]                  // Rename current or specific branch
git push origin --delete [old-name]                  // Delete old branch on remote
git push origin [new-name]                           // Push renamed branch
```

---

## Committing Changes

### Commit with Message
```bash
git commit -m "feat: add login feature"              // Commit with message (conventional format)
git commit -am "fix: resolve bug"                    // Stage all tracked files + commit
git commit --amend                                   // Modify last commit message
git commit --amend --no-edit                         // Add changes to last commit (no message change)
```

### View Commit History
```bash
git log                                              // Show commit history
git log --oneline                                    // Show short commit history
git log --graph --oneline --all                      // Show branch graph
git log --author="name"                              // Show commits by author
git show [commit-hash]                               // Show details of specific commit
```

---

## Pushing & Pulling

### Push to Remote
```bash
git push origin [branch-name]                        // Push branch to remote
git push origin main                                 // Push to main/master
git push -u origin [branch-name]                     // Push and set upstream (first time)
git push --all                                       // Push all branches
```

### Pull from Remote
```bash
git pull                                             // Fetch and merge changes
git pull origin main                                 // Pull specific branch
git pull --rebase                                    // Pull with rebase instead of merge
git fetch                                            // Download changes without merging
```

### Force Push (USE WITH CAUTION)
```bash
git push --force                                     // Force push (overwrites remote history)
git push --force-with-lease                          // Safer force push (checks if updated)
```

---

## Undo & Revert Changes

### Undo Unstaged Changes
```bash
git restore [file-name]                              // Discard changes in file
git restore .                                        // Discard all changes
git checkout -- [file-name]                          // Old way to discard changes
```

### Undo Staged Changes
```bash
git restore --staged [file-name]                     // Unstage file
git reset [file-name]                                // Old way to unstage
```

### Go Back to Previous Version
```bash
git revert [commit-hash]                             // Create new commit undoing changes (safe)
git reset --soft HEAD~1                              // Undo last commit, keep changes staged
git reset --mixed HEAD~1                             // Undo last commit, keep changes unstaged
git reset --hard HEAD~1                              // Undo last commit, delete all changes
git reset --hard [commit-hash]                       // Go back to specific commit (DANGEROUS)
git checkout [commit-hash]                           // View specific commit (detached state)
git checkout [commit-hash] -- [file-name]            // Restore file from specific commit
```

---

## Merging & Rebasing

### Merge Branch
```bash
git checkout main                                    // Switch to main branch
git merge [feature-branch]                           // Merge feature branch into main
git merge --no-ff [feature-branch]                   // Merge with commit message (keeps history)
```

### Resolve Merge Conflicts
```bash
git status                                           // See conflicted files
# Edit files to resolve conflicts (remove <<<<<<, ======, >>>>>>)
git add [resolved-file]                              // Stage resolved files
git commit -m "Merge [feature-branch]"               // Complete merge
```

### Rebase (Cleaner History)
```bash
git rebase main                                      // Rebase current branch onto main
git rebase -i HEAD~3                                 // Interactive rebase last 3 commits
git rebase --abort                                   // Cancel rebase
git rebase --continue                                // Continue after resolving conflicts
```

---

## Pull Requests & Code Review

### Create Pull Request (GitHub)
```bash
git push origin [branch-name]                        // Push your branch
# Go to GitHub and click "Compare & pull request"
gh pr create --title "Add login" --body "Description"  // Create PR from CLI
gh pr create --base main --head feature              // Create PR specifying branches
```

### Create Merge Request (GitLab)
```bash
git push origin [branch-name]                        // Push your branch
# Go to GitLab and click "Create merge request"
```

### Request Code Review
```bash
# In PR description, mention: @copilot-assistant or @specific-reviewer
# Add reviewers through GitHub/GitLab interface
# Use code suggestions: Start comment with "```suggestion" for inline fixes
```

### Update PR with New Changes
```bash
git add [files]                                      // Stage new changes
git commit -m "Address review feedback"              // Commit changes
git push origin [branch-name]                        // Push updates (auto-updates PR)
```

### Merge PR
```bash
git checkout main                                    // Switch to main
git pull origin main                                 // Get latest
git merge [feature-branch]                           // Merge the branch
git push origin main                                 // Push merged changes
# Or use GitHub/GitLab interface: Click "Merge" button
```

---

## Best Practices: Daily Workflow

### ✅ Recommended Workflow:

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/login-form               // Create feature branch
   ```

2. **Make Changes & Commit Regularly**
   ```bash
   git add src/login.js                              // Stage related changes
   git commit -m "feat: add login form component"   // Commit with clear message
   ```

3. **Push to Remote**
   ```bash
   git push -u origin feature/login-form            // First push (set upstream)
   ```

4. **Create Pull Request**
   - Open PR for code review (don't commit directly to main)
   - Request reviewers (team members, Copilot, CodeRabbit)

5. **Address Feedback**
   ```bash
   git add [changed-files]                           // Stage feedback fixes
   git commit -m "refactor: improve login validation" // New commit
   git push origin feature/login-form               // Push updates
   ```

6. **Merge to Main**
   - Once approved, merge through GitHub/GitLab interface
   - Delete feature branch after merging

### 📋 Commit Frequency:
- **Commit every logical change** (when a feature/fix is complete, not necessarily every file)
- **One commit per feature/fix** for small changes, **multiple commits** if it's a large feature
- **Don't commit broken code** to shared branches

### 🔄 Branch Strategy:
- **main/master**: Production-ready code only
- **develop**: Integration branch (optional)
- **feature/\***: Individual features
- **fix/\***: Bug fixes
- **docs/\***: Documentation updates

---

## Quick Command Reference

| Command | Purpose |
|---------|---------|
| `git status` | Check current branch and changes |
| `git add .` | Stage all changes |
| `git commit -m "msg"` | Commit staged changes |
| `git push origin [branch]` | Push branch to remote |
| `git pull` | Get latest changes |
| `git checkout -b [branch]` | Create and switch branch |
| `git merge [branch]` | Merge branch into current |
| `git diff` | View unstaged changes |
| `git log --oneline` | See commit history |
| `git revert [commit]` | Undo commit safely |

---

## Troubleshooting

### Accidentally Committed to Wrong Branch
```bash
git reset --soft HEAD~1                              // Undo commit, keep changes
git checkout -b correct-branch                       // Create correct branch
git commit -m "message"                              // Commit to correct branch
git push origin correct-branch                       // Push
```

### Forgot to Push Changes
```bash
git log --oneline -3                                 // Check commits
git push origin [branch-name]                        // Push now
```

### Accidentally Deleted Local Branch
```bash
git reflog                                           // Find deleted branch
git checkout -b [branch-name] [reflog-hash]          // Restore branch
```

---

**Last Updated:** May 2026  
**Tip:** Use `git --help [command]` for detailed command documentation.
