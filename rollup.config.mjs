import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import json from '@rollup/plugin-json';
import typescript2 from "rollup-plugin-typescript2"; // For Typescript
import postcss from "rollup-plugin-postcss";
import dts from "rollup-plugin-dts";
import babel from 'rollup-plugin-babel';
import terser from '@rollup/plugin-terser';

export default [
    {
        input: "src/index.ts",
        output: [
            {
                file: 'dist/index.js',
                format: 'cjs',
            },
            {
                file: 'dist/index.es.js',
                format: 'es',
                exports: 'named',
            }
        ],
        plugins: [
            babel({
                exclude: 'node_modules/**',
                presets: ['@babel/preset-react']
            }),
            resolve({ browser: true }),
            commonjs(),
            postcss(),
            terser(),
            json({
                compact: true
            }),
            typescript(),
            typescript2({
                useTsconfigDeclarationDir: true, check: true
            }),
        ],
        external: ["react", "react-dom"],
    },
    {
        input: "src/index.ts",
        output: [{ file: "dist/index.d.ts", format: "esm" }],
        plugins: [dts()],
        external: [/\.(css|less|scss)$/],
    },
];