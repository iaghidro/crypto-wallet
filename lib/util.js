var Big             = require('big.js');
var Joi             = require('joi');

var util = {

    isSimulation() {
        const isSimulation = process.env.SIMULATION;
        console.log(`util::isSimulation:: ${isSimulation}`);
        return Boolean(isSimulation) && isSimulation !== 'false';
    },
    
    delay(interval) {
        return new Promise((resolve) => {
            setTimeout(resolve, interval);
        });
    },

    validate(object, schema) {
        return new Promise((resolve, reject) => {
            Joi.validate(object, schema, {allowUnknown: true}, (err, value) => {
                if (err === null) {
                    resolve(value);
                } else {
                    reject(err);
                }
            });
        });
    },

    clone(object) {
        return Object.assign({}, object);
    },

    dateUTC(dateValue) {
        var date = new Date(dateValue);
        var utc = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
        return utc;
    },

    nowUTC() {
        var now = new Date();
        return this.dateUTC(now);
    },
    /**
     *  Returns a random integer between min (included) and max (excluded)
     *  Using Math.round() will give you a non-uniform distribution!
     * @param {Integer} min
     * @param {Integer} max
     * @returns {Integer}
     */
    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    },

    stringifyError(error) {
        var errorString;
        if (error instanceof Error) {
            errorString = `${error.message} \n ${error.stack}`;
        } else {
            errorString = JSON.stringify(error);
        }
        return errorString;
    },
    
    generateId() {
        return s4();
    },

};

function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }

module.exports = util;