module.exports = {
  extends: [
    'react-app',
    'react-app/jest',
    '@twindigital',
  ],
  overrides: [
    {
      files: ['*.ts', '*.tsx', '*.js', '*.jsx'],
      rules: {
        // this rule has bugs that give nonsensical errors for our types:
        // 'Member constructor should be declared before all private instance method definitions', for
        // a class that has no private instance methods
        '@typescript-eslint/member-ordering': ['off'],
      },
    },
  ],
  rules: {
    'react/jsx-uses-react': 'off',
    'react/react-in-jsx-scope': 'off',
  },
}
