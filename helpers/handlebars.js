const moment = require('moment');

const { options } = require('../config/DBConfig');

const formatDate = function (date, targetFormat) {
    return moment(date).format(targetFormat);
};

const spaceCommas = function(value) {
    return value ? value.replace(/,/g, ', ') : 'None';
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

const dollaroff = function(a, b) {
    result=parseFloat(a)-parseFloat(b);
    return result.toFixed(2);  
}; 

const percentoff = function(a, b) {
    result=parseFloat(a)*((parseFloat(100)-parseFloat(b))/100);
    return result.toFixed(2);  
}; 

module.exports = { formatDate, replaceCommas,spaceCommas, checkboxCheck, radioCheck, comparison, if_equal, dollaroff,percentoff }

