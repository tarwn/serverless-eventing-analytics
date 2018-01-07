module.exports = () => {
    return {
        files: [
            'functions/**/*.js',
            'tests/**/defaults.js'
        ],
        tests: [
            'tests/**/*.spec.js'
        ],
        //debug: true,
        env: {
            type: 'node'
        }
    };
};