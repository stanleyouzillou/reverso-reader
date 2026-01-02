import { render, screen, fireEvent } from "@testing-library/react";
import { Sidebar } from "../components/Sidebar";
import { FloatingToolbar } from "../components/FloatingToolbar";
import { vi, describe, it, expect } from "vitest";
import { useStore } from "../store/useStore";

// Mock the store
vi.mock("../store/useStore", () => ({
  useStore: vi.fn(),
}));

describe("Sidebar Redesign", () => {
  const mockSetSidebarMode = vi.fn();
  const mockResetVocabNotification = vi.fn();
  const mockToggle = vi.fn();

  beforeEach(() => {
    (useStore as any).mockReturnValue({
      sidebarMode: "vocabulary",
      setSidebarMode: mockSetSidebarMode,
      history: [],
      saved: [],
      toLearn: [],
      vocabNotificationCount: 0,
      resetVocabNotification: mockResetVocabNotification,
    });
  });

  it("renders the collapse button at the top in expanded state", () => {
    render(<Sidebar collapsed={false} onToggle={mockToggle} />);
    const button = screen.getByLabelText("Collapse sidebar");
    expect(button).toBeDefined();
    // Check if it's in a container with padding-top: 16px (pt-4)
    expect(button.parentElement?.className).toContain("pt-4");
  });

  it("renders the expand button at the top in collapsed state", () => {
    render(<Sidebar collapsed={true} onToggle={mockToggle} />);
    const button = screen.getByLabelText("Expand sidebar");
    expect(button).toBeDefined();
    expect(button.parentElement?.className).toContain("pt-4");
  });

  it("calls onToggle when collapse button is clicked", () => {
    render(<Sidebar collapsed={false} onToggle={mockToggle} />);
    const button = screen.getByLabelText("Collapse sidebar");
    fireEvent.click(button);
    expect(mockToggle).toHaveBeenCalledTimes(1);
  });
});

describe("FloatingToolbar Redesign", () => {
  beforeEach(() => {
    (useStore as any).mockReturnValue({
      viewMode: "dual",
      setViewMode: vi.fn(),
      readingMode: "scrolling",
      setReadingMode: vi.fn(),
      showHintsEnabled: true,
      setShowHintsEnabled: vi.fn(),
      fontSize: 16,
      setFontSize: vi.fn(),
      theme: "light",
      sidebarCollapsed: false,
    });
  });

  it("swaps font control positions (Increase size should be first/above Decrease size)", () => {
    const { container } = render(<FloatingToolbar sidebarCollapsed={false} />);

    const buttons = container.querySelectorAll(
      'button[aria-label*="text size"]'
    );
    expect(buttons.length).toBe(2);

    // First button should be Increase
    expect(buttons[0].getAttribute("aria-label")).toBe("Increase text size");
    // Second button should be Decrease
    expect(buttons[1].getAttribute("aria-label")).toBe("Decrease text size");
  });

  it("maintains 8px padding from sidebar in collapsed state", () => {
    const { container } = render(<FloatingToolbar sidebarCollapsed={true} />);
    const controlContainer = container.querySelector(
      ".fixed.bottom-\\[6rem\\]"
    );
    // 3.5rem = 3rem (sidebar) + 0.5rem (8px padding)
    expect(controlContainer?.className).toContain("right-[3.5rem]");
  });

  it("maintains 8px padding from sidebar in expanded state", () => {
    const { container } = render(<FloatingToolbar sidebarCollapsed={false} />);
    const controlContainer = container.querySelector(
      ".fixed.bottom-\\[6rem\\]"
    );
    // calc(min(20rem, 80vw) + 0.5rem)
    expect(controlContainer?.className).toContain(
      "right-[calc(min(20rem,80vw)+0.5rem)]"
    );
  });
});
