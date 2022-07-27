const moment = require('moment');
const { options } = require('../config/DBConfig');

const formatDate = function (date, targetFormat) {
    return moment(date).format(targetFormat);
};

const replaceCommas = function(value) {
    return value ? value.replace(/,/g, ' | ') : 'None';
};

const checkboxCheck = function (value, checkboxValue) {
    return (value.search(checkboxValue) >= 0) ? 'checked' : '';
};

const radioCheck = function (value, radioValue) {
    return (value == radioValue) ? 'checked' : '';
};

const comparison = ('compareStrings', function(p, q, options) {
    return ( p == q ) ? options.fn(this) : options.inverse(this);
});

const equals = function (arg1, arg2, options) {
    return arg1 == arg2 ? options.fn(this) : options.inverse(this);  
}


module.exports = { formatDate, replaceCommas, checkboxCheck, radioCheck, comparison,equals};