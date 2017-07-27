var fs = require('fs');
var path = require('path');
var cp = require('child_process');
var os = require('os');
var pkg = require('../package.json');

require('colors');

module.exports = {

  description: pkg.description,

  options: [
    ['    --files <dir>', 'files or directory to be eslint, default to `src`', 'src'],
    ['    --fix', 'with this option will execute eslint --fix'],
  ],

  action(options) {
    var currentPath = process.cwd();
    var eslintrcPath = path.join(currentPath, '.eslintrc');
    var pluginPath = path.join(__dirname, '..');

    // handle files name or dirctory name
    var targetFilesAndDirectorys = ['src'];
    if (options.files) {
      targetFilesAndDirectorys = options.files.split(',').map(item => item.replace(/\\|\//g, path.sep));
    }

    // check if .eslintrc.* is exists
    var hasEslintrc = [
      `${eslintrcPath}.js`,
      `${eslintrcPath}.yaml`,
      `${eslintrcPath}.yml`,
      `${eslintrcPath}.json`,
      eslintrcPath]
        .some(item => fs.existsSync(item));

    if (!hasEslintrc) {
      console.warn(String('\r\nYour project has no config file for eslint\r\nnowa eslint will create an .eslintrc.js with default rules\r\n').yellow);
      var outputEslintStream = fs.readFileSync(path.join(pluginPath, '.eslintrc.js.src'));
      fs.writeFileSync(`${eslintrcPath}.js`, outputEslintStream);
    }

    // create command line string with options

    var eslintPath = path.join(pluginPath, 'node_modules', '.bin', 'eslint');
    if (!fs.existsSync(eslintPath)) {
      eslintPath = path.join(pluginPath, '..', '.bin', 'eslint');
    }
    var args = [];
    if (!options.files) {
      var defaultSource = 'src';
      var abcPath = path.resolve(currentPath, 'abc.json');
      if (fs.existsSync(abcPath)) {
        var abc = JSON.parse(fs.readFileSync(abcPath));
        if (abc && abc.options && abc.options.src) {
          defaultSource = abc.options.src;
        }
      }
      args.push(defaultSource);
    } else {
      args = args.concat(targetFilesAndDirectorys);
    }

    if (options.fix) {
      args.push('--fix');
    }

    var NODE_PATH = path.join(pluginPath, 'node_modules');
    var term = cp.spawn(eslintPath, args, {
      env: {
        NODE_PATH,
        PATH: process.env.PATH,
        FORCE_COLOR: 1,
      }
    });
    term.stdout.on('data', (data) => {
      console.log(`${data}`);
    });
    term.stderr.on('data', (data) => {
      console.log(`${data}`);
    });
  },
};
