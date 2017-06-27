var fs = require('fs');
var path = require('path');
var pkg = require('../package.json');
var cp = require('child_process');
var os = require('os');

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
      var outputEslintStream = fs.readFileSync(`${path.join(pluginPath, '.eslintrc.js.src')}`);
      fs.writeFileSync(`${eslintrcPath}.js`, outputEslintStream);
    }

    // create command line string with options
    var eslintPath = path.join(pluginPath, 'node_modules', '.bin', 'eslint');
    var commandStr = `${eslintPath} `;
    if (!options.files) {
      var defaultSource = 'src';
      var abcPath = path.resolve(currentPath, 'abc.json');
      if (fs.existsSync(abcPath)) {
        var abc = JSON.parse(fs.readFileSync(abcPath));
        if (abc && abc.options && abc.options.src) {
          defaultSource = abc.options.src;
        }
      }
      commandStr = `${commandStr + defaultSource} `;
    } else {
      commandStr = `${commandStr + targetFilesAndDirectorys.join(' ')} `;
    }
    if (options.fix) {
      commandStr = `${commandStr}` + '--fix' + ' ';
    }

    var NODE_PATH = path.join(pluginPath, 'node_modules');
    var command = commandStr;

    var nowaPath = path.resolve(os.homedir(), '.nowa', 'install');
    if (process.platform !== 'win32') {
      command = `NODE_PATH=${NODE_PATH} ${commandStr}`;
      cp.exec(command, function(err, stdout, stderr) {
         console.log(`${stdout}`);
         console.log(`${stderr}`);
      });
    } else {
       cp.exec(command, {
         env: {
           NODE_PATH: NODE_PATH
         }
       }, function(err, stdout, stderr) {
         console.log(`${stdout}`);
         console.log(`${stderr}`);
      });
    }
    
  },
};
