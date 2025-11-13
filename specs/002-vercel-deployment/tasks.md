# Tasks: Vercel Deployment Support

**Input**: Design documents from `/specs/002-vercel-deployment/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: No automated test tasks - deployment verification is manual per research.md decision

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Repository root for configuration files
- Vercel dashboard for deployment configuration (not code-based)

---

## Phase 1: Setup (Prerequisites Verification)

**Purpose**: Verify existing application is ready for deployment

**⚠️ BLOCKED**: Application not yet implemented at repository root

- [ ] ~~T001 Verify local build succeeds with `npm run build` in repository root~~ **BLOCKED**: No package.json exists
- [ ] ~~T002 Verify `package.json` has build script defined in repository root~~ **BLOCKED**: No package.json exists
- [ ] ~~T003 Verify `dist/` directory is created after build with expected structure~~ **BLOCKED**: No build exists
- [ ] ~~T004 Verify assets exist in expected locations: `assets/logos/` and `data/brands/`~~ **BLOCKED**: No assets at root
- [X] T005 Verify Git repository is pushed to GitHub/GitLab/Bitbucket **COMPLETED**: Repository at https://github.com/castavridis/rc_brand_explorer.git
- [ ] T006 Create Vercel account at https://vercel.com/signup (if not already exists) **MANUAL**: User must complete

---

## Phase 2: Foundational (Deployment Configuration)

**Purpose**: Core deployment configuration that enables all user stories

**✅ COMPLETED**: All configuration files created and committed

- [X] T007 Create `vercel.json` in repository root with SPA rewrites configuration **COMPLETED**: /vercel.json created
- [X] T008 [P] Create `.vercelignore` in repository root to exclude unnecessary files (optional) **COMPLETED**: /.vercelignore created
- [X] T009 Commit deployment configuration files to Git with message "feat: Add Vercel deployment configuration" **COMPLETED**: Commit c0394eb
- [X] T010 Push configuration files to remote repository **COMPLETED**: Pushed to origin/002-vercel-deployment

**Additional**: Created `.gitignore` file (was missing from repository)

**Checkpoint**: ✅ Configuration files committed - Vercel project setup can now begin

---

## Phase 3: User Story 1 - Deploy Application to Vercel (Priority: P1) 🎯 MVP

**⚠️ BLOCKED**: Cannot deploy until application is implemented at repository root

**Goal**: Enable initial deployment to Vercel with public URL access

**Independent Test**: Connect repository to Vercel, trigger deployment, verify application loads at Vercel URL with all 8 logos displaying correctly and modal functionality working

**Blocker**: The Brand Logo Browser application (feature 001-logo-browser) must be implemented at the repository root before deployment can proceed. Current situation:
- Application files exist in `specs/001-logo-browser/checklists/` (wrong location)
- No `package.json`, `src/`, or build artifacts at repository root
- Cannot run `npm run build` or deploy to Vercel without the application

**To Unblock**: Implement feature 001-logo-browser at repository root, then return to this deployment feature.

### Implementation for User Story 1

- [ ] T011 [US1] Navigate to Vercel dashboard and click "Add New Project"
- [ ] T012 [US1] Import Git repository (select rc_brand_explorer repository)
- [ ] T013 [US1] Verify framework detection shows "Vite" in Vercel project settings
- [ ] T014 [US1] Verify build command is set to `npm run build` in Vercel project settings
- [ ] T015 [US1] Verify output directory is set to `dist` in Vercel project settings
- [ ] T016 [US1] Click "Deploy" to trigger first deployment
- [ ] T017 [US1] Monitor build logs in Vercel dashboard for successful completion
- [ ] T018 [US1] Verify deployment status shows "Ready" in Vercel deployments list
- [ ] T019 [US1] Visit production URL and verify application loads without errors
- [ ] T020 [US1] Verify all 8 brand logos display correctly on deployed application
- [ ] T021 [US1] Test logo modal functionality (click logo, verify modal opens and closes)
- [ ] T022 [US1] Verify HTTPS is enabled (check for padlock icon in browser)
- [ ] T023 [US1] Run Lighthouse audit and verify performance score is 90+ on deployed site
- [ ] T024 [US1] Verify deployment completed within 3 minutes from trigger to live site

**Checkpoint**: At this point, User Story 1 should be fully functional - application is publicly accessible via Vercel URL with HTTPS

---

## Phase 4: User Story 2 - Automatic Deployments on Push (Priority: P2)

**Goal**: Enable automatic production deployments on main branch pushes and preview deployments on feature branches

**Independent Test**: Push a commit to main branch, verify automatic deployment triggers and changes appear on production URL without manual intervention

### Implementation for User Story 2

- [ ] T025 [US2] Navigate to Vercel project settings > Git configuration
- [ ] T026 [US2] Verify production branch is set to `main` (or appropriate default branch)
- [ ] T027 [US2] Verify "Automatic Deployments" is enabled for production branch
- [ ] T028 [US2] Verify "Preview Deployments" is enabled for all branches
- [ ] T029 [US2] Make a test change to `index.html` (add comment) on local main branch
- [ ] T030 [US2] Commit and push test change to main branch
- [ ] T031 [US2] Verify deployment triggers automatically within 10 seconds in Vercel dashboard
- [ ] T032 [US2] Monitor deployment logs and verify successful completion
- [ ] T033 [US2] Visit production URL and verify test change is visible
- [ ] T034 [US2] Create feature branch `test/preview-deployment` locally
- [ ] T035 [US2] Make a test change on feature branch and push to remote
- [ ] T036 [US2] Verify preview deployment is created with unique URL in Vercel dashboard
- [ ] T037 [US2] Visit preview URL and verify feature branch changes are visible
- [ ] T038 [US2] Verify preview deployment does not affect production URL
- [ ] T039 [US2] Delete test feature branch: `git branch -D test/preview-deployment && git push origin --delete test/preview-deployment`
- [ ] T040 [US2] Revert test change on main branch and push (clean up)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - automatic deployments function for production and preview

---

## Phase 5: User Story 3 - Custom Domain Support (Priority: P3)

**Goal**: Enable custom domain configuration for branding purposes

**Independent Test**: Configure a custom domain in Vercel settings, verify DNS configuration, and access application via custom domain with valid HTTPS certificate

### Implementation for User Story 3

- [ ] T041 [US3] Navigate to Vercel project settings > Domains
- [ ] T042 [US3] Click "Add Domain" and enter custom domain name
- [ ] T043 [US3] Copy DNS records provided by Vercel (A record or CNAME)
- [ ] T044 [US3] Add DNS records to domain registrar's DNS settings
- [ ] T045 [US3] Wait for DNS propagation (5 minutes to 24 hours)
- [ ] T046 [US3] Verify domain shows as "Valid" in Vercel domains list
- [ ] T047 [US3] Visit application via custom domain and verify it loads correctly
- [ ] T048 [US3] Verify all 8 logos display correctly via custom domain
- [ ] T049 [US3] Verify HTTPS works automatically on custom domain (check SSL certificate)
- [ ] T050 [US3] Verify both custom domain and Vercel URL serve identical application

**Checkpoint**: All user stories should now be independently functional - application accessible via both Vercel URL and custom domain

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation and validation of deployment

- [ ] T051 [P] Document deployment URLs in project README.md
- [ ] T052 [P] Document deployment process in project documentation
- [ ] T053 Verify all success criteria from spec.md are met
- [ ] T054 Run through quickstart.md validation checklist
- [ ] T055 [P] Add deployment badge to README.md (optional)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - verifies prerequisites
- **User Story 1 (Phase 3)**: Depends on Foundational phase - requires vercel.json to exist
- **User Story 2 (Phase 4)**: Depends on User Story 1 - requires initial Vercel project setup
- **User Story 3 (Phase 5)**: Depends on User Story 1 - requires deployed application to exist
- **Polish (Phase 6)**: Depends on desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Depends on User Story 1 - Requires Vercel project to exist before configuring Git integration
- **User Story 3 (P3)**: Depends on User Story 1 - Requires deployed application before adding custom domain

**Note**: Unlike typical feature development, these user stories are sequential due to infrastructure dependencies. US2 and US3 both require US1's Vercel project to exist.

### Within Each User Story

**User Story 1**:
- Vercel project creation before configuration verification
- Build monitoring before deployment verification
- Deployment verification before functionality testing

**User Story 2**:
- Git integration configuration before test deployments
- Production deployment test before preview deployment test

**User Story 3**:
- Domain registration (external) before DNS configuration
- DNS configuration before domain verification

### Parallel Opportunities

**Phase 1 (Setup)**: No parallel opportunities - verification tasks are quick and sequential

**Phase 2 (Foundational)**:
- T008 (create .vercelignore) can run in parallel with T007 (create vercel.json) - marked [P]

**Phase 6 (Polish)**:
- T051 (README), T052 (documentation), T055 (badge) can all run in parallel - marked [P]

**Across User Stories**:
- User Stories 2 and 3 cannot run in parallel because both depend on User Story 1 completion
- User Story 3 could theoretically start in parallel with User Story 2 if only basic deployment is needed

---

## Parallel Example: Foundational Phase

```bash
# Launch configuration file creation together:
Task: "Create vercel.json in repository root with SPA rewrites configuration"
Task: "Create .vercelignore in repository root to exclude unnecessary files (optional)"
```

---

## Parallel Example: Polish Phase

```bash
# Launch all documentation tasks together:
Task: "Document deployment URLs in project README.md"
Task: "Document deployment process in project documentation"
Task: "Add deployment badge to README.md (optional)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (verify prerequisites - ~5 minutes)
2. Complete Phase 2: Foundational (create config files - ~5 minutes)
3. Complete Phase 3: User Story 1 (deploy to Vercel - ~15-20 minutes)
4. **STOP and VALIDATE**: Test deployment independently (all logos work, HTTPS enabled, performance 90+)
5. Deploy/demo - application is now publicly accessible!

**Total MVP Time**: ~30 minutes

### Incremental Delivery

1. Complete Setup + Foundational → Configuration ready (~10 minutes)
2. Add User Story 1 → Test independently → **MVP deployed!** (~20 minutes)
3. Add User Story 2 → Test independently → Automatic deployments working (~15 minutes)
4. Add User Story 3 → Test independently → Custom domain configured (~varies based on DNS)
5. Each story adds value without breaking previous stories

**Total Full Implementation**: ~45-60 minutes (excluding DNS propagation wait time)

### Parallel Team Strategy

**Not Applicable**: This feature requires sequential implementation due to infrastructure dependencies. User Stories 2 and 3 both require User Story 1's Vercel project to exist before they can be configured.

**Single Developer Workflow**:
1. Complete Setup + Foundational
2. Complete User Story 1 (creates Vercel project)
3. Complete User Story 2 (configures Git integration on existing project)
4. Complete User Story 3 (adds domain to existing project) - optional

---

## Notes

- **No Code Changes**: This feature adds only configuration files, no application code is modified
- **Manual Testing**: All verification tasks are manual (visiting URLs, checking dashboards) per research.md decision
- **Infrastructure Focus**: Tasks involve Vercel dashboard configuration, not code implementation
- **External Dependencies**: User Story 3 requires external domain registrar access (not controlled by this project)
- **Time Variability**: DNS propagation (US3) can take 5 minutes to 24 hours depending on registrar
- **[P] tasks**: Different files or independent operations, no dependencies
- **[Story] label**: Maps task to specific user story for traceability
- Commit after Phase 2 completion (configuration files)
- Stop at any checkpoint to validate story independently
- Verify all functionality works on deployed site before considering story complete
