import type { ConfigurationScope, ConfigurationTarget, WorkspaceConfiguration } from "vscode";
import { beforeEach, expect, it, vi } from "vitest";
import { createConfig } from "../src/index";

vi.mock("vscode", () => {
  const mockGet = vi.fn();
  const mockUpdate = vi.fn();

  const mockConfiguration: Partial<WorkspaceConfiguration & {
    get: typeof mockGet;
    update: typeof mockUpdate;
  }> = {
    get: mockGet,
    update: mockUpdate,
  };

  return {
    workspace: {
      getConfiguration: vi.fn().mockReturnValue(mockConfiguration),
    },
    ConfigurationTarget: {
      Global: 1,
      Workspace: 2,
      WorkspaceFolder: 3,
    },
  };
});

const mockVscode = vi.mocked(await import("vscode"));
const mockConfiguration = mockVscode.workspace.getConfiguration() as unknown as WorkspaceConfiguration & {
  get: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
};

interface TestConfig extends Record<string, unknown> {
  foo: string;
  bar: {
    baz: number;
    qux: boolean;
  };
}

const testConfig: TestConfig = {
  foo: "test",
  bar: {
    baz: 42,
    qux: true,
  },
};

beforeEach(() => {
  vi.clearAllMocks();
});

it("should get entire config when no key is provided", () => {
  mockConfiguration.get.mockReturnValueOnce(testConfig);

  const config = createConfig<TestConfig>({ section: "testSection" });
  const result = config.get();

  expect(result).toEqual(testConfig);
  expect(mockVscode.workspace.getConfiguration).toHaveBeenCalledWith();
  expect(mockConfiguration.get).toHaveBeenCalledWith("testSection");
});

it("should get specific config value by key", () => {
  mockConfiguration.get.mockReturnValueOnce("test");

  const config = createConfig<TestConfig>({ section: "testSection" });
  const result = config.get("foo");

  expect(result).toBe("test");
  expect(mockVscode.workspace.getConfiguration).toHaveBeenCalledWith("testSection", undefined);
  expect(mockConfiguration.get).toHaveBeenCalledWith("foo");
});

it("should get nested config value", () => {
  mockConfiguration.get.mockReturnValueOnce(42);

  const config = createConfig<TestConfig>({ section: "testSection" });
  const result = config.get("bar.baz");

  expect(result).toBe(42);
  expect(mockVscode.workspace.getConfiguration).toHaveBeenCalledWith("testSection", undefined);
  expect(mockConfiguration.get).toHaveBeenCalledWith("bar.baz");
});

it("should get config value with scope", () => {
  mockConfiguration.get.mockReturnValueOnce(true);

  const config = createConfig<TestConfig>({ section: "testSection" });
  const mockScope = { uri: { path: "/test" } } as ConfigurationScope;
  const result = config.get("bar.qux", mockScope);

  expect(result).toBe(true);
  expect(mockVscode.workspace.getConfiguration).toHaveBeenCalledWith("testSection", mockScope);
  expect(mockConfiguration.get).toHaveBeenCalledWith("bar.qux");
});

it("should get config value with default value", () => {
  mockConfiguration.get.mockReturnValueOnce(false);

  const config = createConfig<TestConfig>({ section: "testSection" });
  const result = config.get("bar.qux", null, true);

  expect(result).toBe(false);
  expect(mockVscode.workspace.getConfiguration).toHaveBeenCalledWith("testSection", null);
  expect(mockConfiguration.get).toHaveBeenCalledWith("bar.qux", true);
});

it("should update config value", async () => {
  mockConfiguration.update.mockResolvedValueOnce(undefined);

  const config = createConfig<TestConfig>({ section: "testSection" });
  await config.set("foo", "newValue", 1 as ConfigurationTarget);

  expect(mockVscode.workspace.getConfiguration).toHaveBeenCalledWith("testSection");
  expect(mockConfiguration.update).toHaveBeenCalledWith("foo", "newValue", 1);
});

it("should update nested config value", async () => {
  mockConfiguration.update.mockResolvedValueOnce(undefined);

  const config = createConfig<TestConfig>({ section: "testSection" });
  await config.set("bar.baz", 100, 2 as ConfigurationTarget);

  expect(mockVscode.workspace.getConfiguration).toHaveBeenCalledWith("testSection");
  expect(mockConfiguration.update).toHaveBeenCalledWith("bar.baz", 100, 2);
});
