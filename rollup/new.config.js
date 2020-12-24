import resolve from 'rollup-plugin-node-resolve';
import {terser} from 'rollup-plugin-terser';
import includePaths from 'rollup-plugin-includepaths';

export default {
  input: './esm/index.js',
  plugins: [
    includePaths({
      include: {
        '@ungap/element-matches': 'node_modules/@ungap/degap/element-matches.js',
        '@ungap/node-contains': 'node_modules/@ungap/degap/node-contains.js',
        '@webreflection/lie': 'node_modules/uhooks/esm/promise.js'
      },
    }),
    resolve({module: true}),
    terser()
  ],
  
  output: {
    exports: 'named',
    file: './new.js',
    format: 'iife',
    name: 'hookedElements'
  }
};
