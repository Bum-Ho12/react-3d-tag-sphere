import typescript from '@rollup/plugin-typescript';  // TypeScript plugin
import { nodeResolve } from '@rollup/plugin-node-resolve';  // Resolve node_modules
import commonjs from '@rollup/plugin-commonjs';  // Convert CommonJS to ES6
import peerDepsExternal from 'rollup-plugin-peer-deps-external';  // Externalize peer deps

export default {
    input: 'src/index.ts',  // Entry point for your module
    output: [
        {
        file: 'dist/index.js',  // Output file for ES module
        format: 'es',  // ES module format
        sourcemap: true,  // Enable source maps for debugging
        },
    ],
    plugins: [
        peerDepsExternal(),  // Externalize peer dependencies
        nodeResolve(),  // Resolve dependencies from node_modules
        commonjs(),  // Convert CommonJS to ES6 modules
        typescript({ tsconfig: './tsconfig.json' }),  // Use TypeScript plugin
    ],
    external: ['react'],  // Mark `react` as external so it's not bundled
};
