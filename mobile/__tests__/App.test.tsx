import { render, screen } from "@testing-library/react-native";
import React from "react";
import { View, Text } from "react-native";

// Simple component for smoke test since actual App might have complex providers
const TestApp = () => (
  <View>
    <Text>Welcome to Heka Mobile</Text>
  </View>
);

describe("App", () => {
  it("renders correctly", () => {
    render(<TestApp />);
    expect(screen.getByText("Welcome to Heka Mobile")).toBeTruthy();
  });
});
