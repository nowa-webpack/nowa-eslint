var fs = require('fs');
var path = require('path');
var pkg = require('../package.json');
var CLIEngine = require('eslint').CLIEngine;

require('colors');

require('console.table');

module.exports = {

  description: pkg.description,

  options: [
    ['    --files <dir>', 'files or directory to be eslint, default to `src`', 'src'],
    ['    --fix', 'with this option will execute eslint --fix'],
  ],

  action(options) {
    console.log('\r');
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
      console.warn(String('Your project has no config file for eslint\r\nnowa eslint will create an .eslintrc.js with default rules\r\n').yellow);
      var outputEslintStream = fs.readFileSync(`${path.resolve(__dirname, '..') + path.sep}.eslintrc.js.src`);
      fs.writeFileSync(`${eslintrcPath}.js`, outputEslintStream);
    }

    // init CLIEngin
    var cli = new CLIEngine({
      useEslintrc: true,
      fix: !!options.fix,
      plugins: [
        'eslint-config-airbnb',
        'eslint-plugin-import',
        'eslint-plugin-jsx-a11y',
        'eslint-plugin-react'
      ],
    });

    // output messages
    var report = cli.executeOnFiles(targetFilesAndDirectorys);
    if (report.errorCount || report.warningCount) {
      report.results.forEach((item) => {
        if (item.errorCount || item.warningCount) {
          console.log(item.filePath);
          var msgs = item.messages.map(innerItem => ({
            'line/column': `${innerItem.line}/${innerItem.column}`,
            severity: innerItem.severity === 1 ? 'warn' : 'error',
            message: innerItem.message,
            rule: innerItem.ruleId,
          }));
          console.table(msgs);
        }
      });
      console.log(String(`  ${report.errorCount + report.warningCount} problems (${report.errorCount} errors, ${report.warningCount} warnings)`).red);
      if (report.fixableErrorCount || report.fixableWarningCount) {
        console.log(String(`  ${report.fixableErrorCount} error, ${report.fixableWarningCount} warnings potentially fixable with the \`--fix\` option.`).red);
      }
    } else {
      console.log(String('Congratulations on your code with 0 problems').green);
    }

    // if --fix then eslint --fix
    if (options.fix) {
      CLIEngine.outputFixes(report);
    }
  },
};
