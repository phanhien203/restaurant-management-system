// Conventional Commits. Scopes are a warning only: chore/fix commits may use other scopes, and the
// `Refs: US-xx` footer is a team convention that is not enforced here (US-01 plan, Q5).
const workspaces = ['web', 'realtime', 'db', 'shared', 'ui'];
const modules = [
  'access',
  'menu',
  'tables',
  'ordering',
  'waiter',
  'kds',
  'billing',
  'reports',
  'audit',
];
const other = ['deps', 'repo', 'plan', 'stories', 'adr', 'docs', 'ci'];

export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [1, 'always', [...workspaces, ...modules, ...other]],
  },
};
