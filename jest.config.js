module.exports = {
  // Use ts-jest to transform .ts and .tsx files
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },

  // Jest file locations
  testMatch: [
    "**/utils/utils.test.ts"
  ],
};