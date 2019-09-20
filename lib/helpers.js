#!/usr/bin/env node

  const { name, version } = require('../package.json');
  const chalk = require('chalk');

  const HELPERS = {
    VERSION : `${name.toUpperCase()} ${version}`,
    PRINT : chalk.white,
    ERROR : chalk.bold.red,
    WARNING : chalk.yellow,
    SUCCESS : chalk.green,
    PREETY : chalk.cyan,
    SPACE : " "
  }

  module.exports = HELPERS;
