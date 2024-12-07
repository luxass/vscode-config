import { type ConfigurationScope, type ConfigurationTarget, workspace } from "vscode";

export interface ConfigOptions {
  section: string;
}

export interface Config<TConfig extends Record<string, unknown>> {
  get: (() => TConfig) & (<TKey extends Path<TConfig>>(
    key: TKey,
    scope?: ConfigurationScope | null,
  ) => PathValue<TConfig, TKey>) & (<TKey extends Path<TConfig>>(
    key: TKey,
    scope: ConfigurationScope | null | undefined,
    defaultValue: NonNullable<PathValue<TConfig, TKey>>,
  ) => PathValue<TConfig, TKey>);

  set: <TKey extends Path<TConfig>>(
    key: TKey,
    value: PathValue<TConfig, TKey>,
    target: ConfigurationTarget
  ) => Thenable<void>;
}

export function createConfig<TConfig extends Record<string, unknown>>(
  options: ConfigOptions,
): Config<TConfig> {
  return new Configuration<TConfig>(options);
}

class Configuration<TConfig extends Record<string, unknown>> implements Config<TConfig> {
  constructor(private readonly options: ConfigOptions) { }

  get(): TConfig;
  get<TKey extends Path<TConfig>>(key: TKey, scope?: ConfigurationScope | null): PathValue<TConfig, TKey>;
  get<TKey extends Path<TConfig>>(key: TKey, scope: ConfigurationScope | null | undefined, defaultValue: NonNullable<PathValue<TConfig, TKey>>): NonNullable<PathValue<TConfig, TKey>>;
  get<TKey extends Path<TConfig>>(key?: TKey, scope?: ConfigurationScope | null, defaultValue?: NonNullable<PathValue<TConfig, TKey>>): TConfig | PathValue<TConfig, TKey> {
    if (!key) {
      return workspace.getConfiguration().get<TConfig>(this.options.section)!;
    }

    const value = !defaultValue
      ? workspace.getConfiguration(this.options.section, scope)
        .get<PathValue<TConfig, TKey>>(key as string)!
      : workspace.getConfiguration(this.options.section, scope)
        .get<PathValue<TConfig, TKey>>(key as string, defaultValue)!;

    return value;
  }

  set<TKey extends Path<TConfig>>(key: TKey, value: PathValue<TConfig, TKey>, target: ConfigurationTarget): Thenable<void> {
    return workspace.getConfiguration(this.options.section)
      .update(key as string, value, target);
  }
}

export type ChildPath<T, Key extends keyof T> = Key extends string
  ? T[Key] extends Record<string, any>
    ?
    | `${Key}.${ChildPath<T[Key], Exclude<keyof T[Key], keyof any[]>> &
    string}`
    | `${Key}.${Exclude<keyof T[Key], keyof any[]> & string}`
    : never
  : never;

export type Path<T> = ChildPath<T, keyof T> | keyof T;

export type PathValue<T, P extends Path<T>> = P extends `${infer Key}.${infer Rest}`
  ? Key extends keyof T
    ? Rest extends Path<T[Key]>
      ? PathValue<T[Key], Rest>
      : never
    : never
  : P extends keyof T
    ? T[P]
    : never;
