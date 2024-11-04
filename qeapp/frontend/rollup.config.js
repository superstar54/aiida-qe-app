// rollup.config.js
import babel from '@rollup/plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import postcss from 'rollup-plugin-postcss';
import json from '@rollup/plugin-json'; // Make sure this is imported

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/qeapp.esm.js',
    format: 'esm',
    exports: 'named',
    inlineDynamicImports: true,
  },
  external: ['react', 'react-dom', 'weas'],
  plugins: [
    postcss({
      extensions: ['.css'],
      extract: true,
      plugins: [require('postcss-import')],
      include: ['**/*.css'],
      exclude: undefined,
    }),
    babel({
      babelHelpers: 'bundled',
      exclude: 'node_modules/**',
    }),
    resolve({
      preferBuiltins: false,
      mainFields: ['browser', 'module', 'main'],
    }),
    commonjs(),
    json(), // Add the plugin here
    // terser(), // Uncomment if you want to minify your bundle
  ],
};
