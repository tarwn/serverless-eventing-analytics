const yaml = require('js-yaml');
const fs = require('fs');

module.exports.config = (path, property) => {
    try {
        const config = yaml.safeLoad(fs.readFileSync(path, 'utf8'));
        Object.keys(config[property]).forEach((key) => {
            process.env[key] = config[property][key];
        });
    } 
    catch (e) {
        console.log(e);
        throw e;
    }
};