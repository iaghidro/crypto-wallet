var Slack = require('./../slack/Slack');
var util = require('./../util');

class Logger {

    constructor(id) {
        this.logs       = [];
        this.maxLogs    = 15;
        this.slack      = Slack.create();
        this.id         = Boolean(id) ? `${id} ` : ''; //TODO add wallet id here
//        this.id         = (params && params.generateId) ? `${util.generateId()} ` : '';
    }

    error(message) {
        var post = this._createErrorMessage(message);
        console.error(post);
        this._handlePost(post);
        this._logSlackErrors(post);
    }

    warn(message) {
        console.warn(message);
        var errorTrimPost = message.details ? message.details : message;
        var post = this._createMessage(Logger.level.WARN, errorTrimPost);
        var stringTrimPost = post.toString().substring(0, 150);
        this._handlePost(stringTrimPost);
    }

    info(message) {
        var post = this._createMessage(Logger.level.INFO, message);
        console.info(post);
        this._handlePost(post);
    }

    pretty(message) {
        var post = this._createMessage(Logger.level.INFO, message);
        console.info(post);
        this.slack.postMessage(Slack.CHANNELS.TRADE_PAIRS, post);
    }
    
    ///////// PRIVATE //////////

    _logSlackErrors(post) {
       this.slack.postMessage(Slack.CHANNELS.ERRORS, post);
    }

    _createErrorMessage(error) {
        var errorString = util.stringifyError(error);
        return this._createMessage(Logger.level.ERROR, errorString);
    }

    _createMessage(level, message) {
        var now = util.nowUTC().toISOString();
        var nowFormatted = (now.toString()).replace(/.[^.]*$/, '');
        var messageString;
        if (typeof message === 'string') {
            messageString = message;
        } else {
            messageString = JSON.stringify(message, null, 2);
        }
        return `${nowFormatted} ${level} ${this.id} ${messageString}`;
    }
    
    _clearAndLog() {
        var currentLogs = this.logs.join('\n');
        this.logs = [];
        this.slack.postMessage(Slack.CHANNELS.LOGS, currentLogs);
    }

    _handlePost(post) {
        this.logs.push(post);
        if (this._exceededLogLimit()) {
            console.log('---Exceeded limit, logging---');
            this._clearAndLog();
        }
    }
    
    _exceededLogLimit() {
        return this.logs.length >= this.maxLogs;
    }
    
}

Logger.create = function (id) {
    return new Logger(id);
};

Logger.level = {
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR'
};

module.exports = Logger;
