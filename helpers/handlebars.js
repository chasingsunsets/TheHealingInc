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

const if_equal = function(a, b, opts) {
    if (a == b) {
        return opts.fn(this)
    } else {
        return opts.inverse(this)
    }
};

module.exports = { formatDate, replaceCommas, checkboxCheck, radioCheck, comparison, if_equal }