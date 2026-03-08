import { nodeResolve } from '@rollup/plugin-node-resolve';
import versionInjector from 'rollup-plugin-version-injector';
import metablock from 'rollup-plugin-userscript-metablock';
import pkg from './package.json' assert {type: 'json'};
import terser from '@rollup/plugin-terser';
// import { obfuscator } from 'rollup-obfuscator';

export default {
    input: 'src/main.js',
    watch: true,
    output: [
        {
            file: 'dist/kekui.user.js',
            format: 'cjs',
            plugins: [
                metablock({
                    file: 'meta.json',
                    override: {
                        version: pkg.version,
                    }
                }),
            ]
        },
        {
            file: 'dist/kekui.min.user.js',
            format: 'cjs',
            plugins: [
                terser(),
                metablock({
                    file: 'meta.json',
                    override: {
                        version: pkg.version,
                    }
                }),
            ]
        }
    ],
    plugins: [
        nodeResolve(),
        versionInjector(),
    ]
};


