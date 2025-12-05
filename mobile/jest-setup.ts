// import '@testing-library/react-native/extend-expect'; // Uncomment if using custom matchers

// Mocking Expo Router or other native modules if necessary
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
}));
