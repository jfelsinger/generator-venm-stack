'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');


var VenmStackGenerator = module.exports = function VenmStackGenerator(args, options, config) {
    yeoman.generators.Base.apply(this, arguments);

    this.on('end', function () {
        this.installDependencies({ skipInstall: options['skip-install'] });
    });

    this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
};

util.inherits(VenmStackGenerator, yeoman.generators.Base);

VenmStackGenerator.prototype.askFor = function askFor() {
    var cb = this.async();

    // have Yeoman greet the user.
    console.log(this.yeoman);

    var prompts = [
        {
            name: 'appName',
            message: 'What is your application\'s name?'
        },
        {
            type: 'list',
            name: 'taskRunner',
            message: 'Which task runner do you want to use?',
            default: 'Gulp',
            choices: [
                {
                    name: 'Gulp',
                    value: 'gulp',
                },
                {
                    name: 'Grunt',
                    value: 'grunt',
                },
            ],
        },
        {
            type: 'list',
            name: 'moduleFramework',
            message: 'How would you like to manage front-end modules?',
            default: 'browserify',
            choices: [
                {
                    name: 'Browserify',
                    value: 'browserify',
                },
                {
                    name: 'RequireJS',
                    value: 'requirejs',
                },
                {
                    name: 'None',
                    value: 'none'
                }
            ],
        }
    ];

    this.prompt(prompts, function (props) {
        this.appName = props.appName;
        this.taskRunner = props.taskRunner;
        this.moduleFramework = props.moduleFramework;

        cb();
    }.bind(this));
};

VenmStackGenerator.prototype.app = function app() {
    this.mkdir('app');
    this.mkdir('app/controllers');
    this.mkdir('app/models');

    this.copy('app/controllers/index.js');

    /* #client */
    this.mkdir('client');
    this.mkdir('client/styles');
    this.mkdir('client/dist');
    this.mkdir('client/scripts');
    this.mkdir('client/scripts/vendor');

    this.template('client/index.html');
    this.copy('client/styles/main.scss');

    if (this.moduleFramework != 'none')
        this.directory('client/scripts/' + this.moduleFramework, 'client/scripts');
    else
        this.copy('client/main.js', 'client/scripts/main.js');

    /* #config */
    this.mkdir('config');
    this.mkdir('config/env');
    this.mkdir('config/middlewares');

    this.copy('config/config.js');
    this.copy('config/express.js');
    this.copy('config/routes.js');

    /* #config.environments */
    this.copy('config/env/all.js');
    this.copy('config/env/production.json');
    this.copy('config/env/dev.json');
    this.copy('config/env/test.json');
    this.copy('config/env/travis.json');

};

VenmStackGenerator.prototype.taskrunner = function taskrunner() {
    switch (this.taskRunner) {

        /* #grunt */
        case 'grunt':
            this.template('_Gruntfile.js', 'Gruntfile.js');
            this.directory('grunt-configuration');
            break;

        /* #gulp */
        case 'gulp':
            this.template('_gulpfile.js', 'gulpfile.js');
            // this.directory('gulp-configuration');
            break;

    }
}

VenmStackGenerator.prototype.configfiles = function configfiles() {
    this.template('_package.json', 'package.json');

    /* #bower */
    this.template('_bower.json', 'bower.json');
    this.copy('bowerrc', '.bowerrc');

    /* #travis */
    this.copy('travis.yml', '.travis.yml');

    /* #jshint */
    this.copy('jshintrc', '.jshintrc');

    /* #git */
    this.copy('gitignore', '.gitignore');

    /* #editor */
    this.copy('editorconfig', '.editorconfig');
};

VenmStackGenerator.prototype.humans = function humans() {
    this.copy('client/humans.txt');
};

VenmStackGenerator.prototype.robots = function robots() {
    this.copy('client/robots.txt');
};

VenmStackGenerator.prototype.server = function server() {
    this.copy('server.js');
};
