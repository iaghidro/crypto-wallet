var SlackApi = require('slack-node');

class Slack {

    constructor() {
        this.maxRetries = 3;
        this.slackInstance = new SlackApi(Slack.apiToken);
    }

    postMessage(channel, message) {
        this._handleRetry(channel, message);
    }

    _handleRetry(channel, message) {

        var retryPost = 0;

        this._post(channel, message);

    }

    _post(channel, message) {
        var stringMessage = this.stringifyMessage(message);

        console.log('POSTING SLACK MESSAGE')
        this.slackInstance.api('chat.postMessage', {
            text: stringMessage,
            channel: channel
        }, function (err, response) {
            if (err) {
                console.error('POSTED SLACK MESSAGE, has error!');
                console.error(err);
                console.error(response);
            }

        });

    }

    stringifyMessage(message) {
        var messageString;
        if (typeof message === 'string') {
            messageString = message;
        } else {
            try {
                messageString = JSON.stringify(message, null, 2);
            } catch (err) {
                console.error(err);
                messageString = message.toString();
            }
        }
        return messageString;
    }
}

Slack.create = function () {
    return new Slack();
};

Slack.CHANNELS = {
};

module.exports = Slack;