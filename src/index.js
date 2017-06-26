var fs = require('fs');
var path = require('path');
var pkg = require('../package.json');
var cp = require('child_process');

require('colors');

module.exports = {

  description: pkg.description,

  options: [
    ['    --files <dir>', 'files or directory to be eslint, default to `src`', 'src'],
    ['    --fix', 'with this option will execute eslint --fix'],
  ],

  action(options) {
    var currentPath = process.cwd();
    var eslintrcPath = `${currentPath + path.sep}.eslintrc`;

    // handle files name or dirctory name
    var targetFilesAndDirectorys = ['src'];
    if (options.files) {
      targetFilesAndDirectorys = options.files.split(',').map(item => item.replace(/\\|\//g, path.sep));
    }

    // check if .eslintrc.* is exists
    var hasEslintrc = [`${eslintrcPath}.js`, `${eslintrcPath}.yaml`, `${eslintrcPath}.yml`, `${eslintrcPath}.json`, eslintrcPath].some(item => fs.existsSync(item));
    if (!hasEslintrc) {
      console.warn(String('\r\nYour project has no config file for eslint\r\nnowa eslint will create an .eslintrc.js with default rules\r\n').yellow);
      var outputEslintStream = fs.readFileSync(`${path.resolve(__dirname, '..', '.eslintrc.js.src')}`);
      fs.writeFileSync(`${eslintrcPath}.js`, outputEslintStream);
    }

    // create command line string with options
    var eslintPath = path.resolve(__dirname, '..', 'node_modules', '.bin', 'eslint');
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

    // eslint command running
    var term = cp.exec(commandStr);
    term.stdout.on('data', (data) => {
      console.log(data.toString());
    });
    term.stderr.on('data', (data) => {
      console.log(data.toString().red);
    });
    term.on('exit', (code) => {
      // nothing
    });
  },
};
