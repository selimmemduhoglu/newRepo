import angular from 'angular';

const bulk = require('bulk-require');
const apisModule = angular.module('app.apis', []);
const apis = bulk(__dirname, ['./**/!(*index|*.spec).js']);

function declare(apiMap) {
  Object.keys(apiMap).forEach((key) => {
    let item = apiMap[key];

    if (!item) {
      return;
    }

    if (item.fn && typeof item.fn === 'function') {
      apisModule.api(item.name, item.fn);
    } else {
      declare(item);
    }
  });
}

declare(apis);

export default apisModule;