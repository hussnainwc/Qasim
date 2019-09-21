#!/usr/bin/env node

const HELPERS = require('../lib/helpers.js');
const program = require('../lib/commands.js');
const licenses = require('../lib/license.js');
const axios = require('../lib/requests.js');
const prompt = require('prompt');

program
  .version(HELPERS.VERSION,'-v, --version')
  .on('command:*',() => {
    console.error("ERROR:");
    console.log(HELPERS.ERROR(HELPERS.SPACE + program.args.join(' ')
                + HELPERS.SPACE + "is not a valid command"))
    process.exit(1);
  })

program
  .command('list [license-key]')
  .alias('ls')
  .option('-d, --description',false)
  .description('qasim will list all licenses')
  .action((key,options) => {
    if(key){

      var valid_key = false;

      licenses.forEach((license) => {
        if(license.key === key){
          axios.get(license.url)
            .then((response) => {
              var perms = response.data.permissions;
              var permLegnth = response.data.permissions.length;
              var conditions = response.data.conditions;
              var conditionsLength = response.data.conditions.length;
              var limitations = response.data.limitations;
              var limitationsLength = response.data.limitations.length;
              var description = response.data.description;
              var longest = Math.max(permLegnth,conditionsLength,limitationsLength);
              console.log("");
              console.log('   %s               %s          %s',HELPERS.SUCCESS('permissions'),HELPERS.WARNING('conditions'),HELPERS.ERROR('limitations'));
              console.log("");
              for (var i = 0; i < longest; i++) {
                try {
                  console.log('  %s%s%s%s%s',perms[i] || "",HELPERS.SPACE.padStart(24 - perms[i].length," "),conditions[i] || "",HELPERS.SPACE.padStart(24 - conditions[i].length," "),limitations[i] || "");
                } catch (e) {
                  console.log('  %s%s%s%s%s',perms[i] || "",HELPERS.SPACE.padStart(24 - perms[i].length," "),conditions[i] || "",HELPERS.SPACE.padStart(24," "),limitations[i] || "");
                }
              }
              if(!options.description){
                console.log("");
                console.log(HELPERS.PREETY(" DESCRIPTION : " + description)); // fix how its printed
              }
              console.log("");
            })
            .catch((error) => {
              console.log(HELPERS.ERROR("SOMETHING WENT WRONG ! FAILED"));
            })
            valid_key = true;
        }
      })

      if(!valid_key){
        console.log(HELPERS.ERROR(HELPERS.SPACE + "INVALID KEY"));
      }
    }
    else{
      licenses.forEach((license) => {
        console.log(HELPERS.SPACE + '-' + HELPERS.SPACE + HELPERS.PREETY(license.key)
        + HELPERS.SPACE.padStart(10 - license.key.length," "),license.name);
      })
    }
  })

program
  .command('commit <license-key>')
  .alias('add')
  .description('let qasim know which license to add')
  .action((key) => {

    key = key.toLowerCase();
    var valid_key = false;
    var matches = [];

    licenses.forEach((license) => {

      const search = key.match(new RegExp(license.key)) // TODO: improve regex so similar words show up
      if(search != null){
        matches.push(license.key);
      }

      if(license.key === key){
        axios.get(license.url)
          .then((response) => {
            if(key === "mit"){
              prompt.start();
              prompt.get(['fullname'], function (err, result) {
                if (err) {
                  console.log(HELPERS.ERROR(err));
                }
                else{
                  var string = response.data.body;
                  string = string.replace("[year]",new Date().getFullYear());
                  string = string.replace("[fullname]",result.fullname);
                  console.log(HELPERS.PREETY(string));
                }
              });
            }
            else{
              console.log(HELPERS.PREETY(response.data.body));
            }
          })
          .catch((error) => {
            console.log(HELPERS.ERROR("SOMETHING WENT WRONG ! FAILED"));
          })
          valid_key = true;
      }
    })

    if(!valid_key){
      console.log(HELPERS.ERROR(HELPERS.SPACE + "INVALID KEY"))
      if(matches.length != 0){
        console.log(HELPERS.WARNING(HELPERS.SPACE + "DID YOU MEAN : "));
        matches.forEach((match) => {
          console.log(HELPERS.SPACE + '-' +
                      HELPERS.WARNING(HELPERS.SPACE + HELPERS.SPACE + match));
         })
       }
     }
   })

program.parse(process.argv);

var NO_COMMAND_SPECIFIED = program.args.length === 0;

if(NO_COMMAND_SPECIFIED){
  program.help();
}
