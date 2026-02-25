type FeatureKey = "edit_code_inline";

export const requirePro = async (
  auth: () => {
    has: (p: { feature: FeatureKey }) => boolean;
    status: (code: number, body: unknown) => unknown;
  },
  feature: FeatureKey
) => {
  const { has, status } = auth();
  if (!has({ feature })) {
    return status(403, { error: "Pro feature required" });
  }
};
