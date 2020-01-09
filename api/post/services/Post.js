'use strict';

/**
 * Read the documentation () to implement custom service functions
 */

module.exports = {
  getNameFromTitle: (title) => {
    let result = '', subVal = '';
    for (let i = 0; i < title.length; i++) {
      if (title[i] === ' ') {
        result += (result !== '' && subVal ? '-' : '') + subVal;
        subVal = '';
      } else {
        subVal += title[i];
      }
    }
    result = result + (result && subVal !== '' ? '-' : '') + subVal;
    return result.toLowerCase();
  }
};
