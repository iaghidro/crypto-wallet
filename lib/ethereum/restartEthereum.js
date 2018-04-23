var exec = require('child-process-promise').exec;
var Logger = require('./../logger/Logger');

var restartEthereum = function (params) {
    var cmd = `npm run restartEthereum`;
    this.log = params.log ? params.log : Logger.create();
    this.log.info(`restartEthereum:: Start`);
    exec(cmd, {maxBuffer: 1024 * 500})
            .then(() => {
                this.log.info(`restartEthereum:: Successfully restarted ethereum`);
            })
            .catch((err) => {
                this.log.error(`restartEthereum:: Failed to restart ethereum`);
                this.log.error(err);
            });
};

module.exports = restartEthereum;
