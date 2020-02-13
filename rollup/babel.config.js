import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';

export default {
  input: './esm/index.js',
  plugins: [
    
    resolve({module: true}),
    babel({presets: ['@babel/preset-env']})
  ],
  
  output: {
    exports: 'named',
    file: './index.js',
    format: 'iife',
    name: 'hookedElements'
  }
};
