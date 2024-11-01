import angular from 'angular';

const bulk = require('bulk-require');
const configsModule = angular.module('app.configs', []);
const configs = bulk(__dirname, ['./**/!(*index|*.spec).js']);

function declare(configsMap) {
  Object.keys(configsMap).forEach((key) => {
    let item = configsMap[key];

    if (!item) {
      return;
    }

    if (item.fn && typeof item.fn === 'function') {
      configsModule.configs(item.name, item.fn);
    } else {
      declare(item);
    }
  });
}

declare(configs);

export default configsModule;