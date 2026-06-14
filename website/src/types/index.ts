export interface RegistryFile {
  src: string;
  dest: string;
}

export interface ComponentMeta {
  name: string;
  version: string;
  description: string;
  tier: "free" | "paid";
  files: RegistryFile[];
  manualSteps: string[];
}

export interface Registry {
  components: Record<string, ComponentMeta>;
}

export interface MockData {
  section: {
    settings: Record<string, unknown>;
    blocks: Array<{
      id: string;
      type: string;
      settings: Record<string, unknown>;
    }>;
  };
  shop: {
    name: string;
    currency: string;
  };
}
