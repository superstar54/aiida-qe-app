import React from "react";
const baseURL = process.env.PUBLIC_URL || '';

/**
 * Given a plugin ID (e.g. "bands") and a component name
 * (e.g. "SettingTab"), returns a lazy React component that
 * renders pluginModule[`${id}Tab`], once `/plugins/${id}/static/${id}.esm.js` finishes loading.
 */
export function lazyPluginComponent(pluginId, exportName) {
  return React.lazy(() =>
    import(/* webpackIgnore: true */ `${baseURL}/plugins/${pluginId}/static/${pluginId}.esm.js`).then(
      (mod) => {
        if (!mod.default || !mod.default[exportName]) {
          throw new Error(`Plugin ${pluginId} did not export ${exportName}`);
        }
        const Component = mod.default[exportName];
        // Wrap it so we can pass pluginId or any other props if needed
        return {
          default: (props) => <Component {...props} />,
        };
      }
    )
  );
}
