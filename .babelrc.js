let requiredPolyfills = new Set();

let checkPolyfillsTimeout;

function checkRequiredPolyfills() {
  if (requiredPolyfills.size === 0) return;

  console.error(
    '\nThe following polyfills are required:\n\t' +
      Array.from(requiredPolyfills).sort().join('\n\t') +
      '\n',
  );

  process.exitCode = 1;
}

const plugins = [];

if (process.env.CHECK_POLYFILLS === 'true') {
  plugins.push([
    'polyfill-corejs3',
    {
      method: 'usage-pure',
      shouldInjectPolyfill(name, defaultShouldInject) {
        if (defaultShouldInject) {
          requiredPolyfills.add(name);
        }

        clearTimeout(checkPolyfillsTimeout);

        checkPolyfillsTimeout = setTimeout(() => {
          checkRequiredPolyfills();
          requiredPolyfills = new Set();
        }, 1000);

        return false;
      },
      proposals: true,
    },
  ]);
}

module.exports = {
  plugins,
};
