module.exports = {
  env: {
    browser: true,
    es2021: true,
    serviceworker: true
  },
  extends: [
    'react-app',
    'react-app/jest'
  ],
  rules: {
    'no-restricted-globals': ['error', {
      name: 'self',
      message: 'Use window instead.'
    }]
  },
  overrides: [
    {
      files: ['**/service-worker.js'],
      rules: {
        'no-restricted-globals': 'off'
      }
    }
  ]
}; 