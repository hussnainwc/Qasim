#!/usr/bin/env node

const HELPERS = require('../lib/helpers.js');
const program = require('../lib/commands.js');
const licenses = require('../lib/license.js');
const axios = require('../lib/requests.js');
const prompt = require('prompt');
const fs = require("fs");

program
  .version(HELPERS.VERSION,'-v, --version')
  .on('command:*',() => {
    console.error("ERROR:");
    console.log(HELPERS.ERROR(HELPERS.SPACE + program.args.join(' ')
                + HELPERS.SPACE + "is not a valid command"));
    process.exit(1);
  });

program
  .command('list [license-key]')
  .alias('ls')
  .option('-d, --description',false)
  .description('qasim will list all licenses')
  .action((key,options) => {
    if(key){

      let valid_key = false;

      licenses.forEach((license) => {
        if(license.key === key){
          axios.get(license.url)
            .then((response) => {
              let perms = response.data.permissions;
              let permLegnth = response.data.permissions.length;
              let conditions = response.data.conditions;
              let conditionsLength = response.data.conditions.length;
              let limitations = response.data.limitations;
              let limitationsLength = response.data.limitations.length;
              let description = response.data.description;
              let longest = Math.max(permLegnth,conditionsLength,limitationsLength);
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
                console.log(HELPERS.PREETY(" DESCRIPTION : " + description));
              }var fs = require("fs");

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
  .option('-f, --force',false)
  .description('let qasim know which license to add')
  .action((key,options) => {

    key = key.toLowerCase();
    var valid_key = false;
    var matches = [];

    if(!options.force){
      fs.access("./LICENSE", fs.F_OK , (error) => {
        if(!error){
          console.log(HELPERS.ERROR("A LICENSE already exists use -f or --force to update anyways"));
          process.exit(1);
        }
      });
      fs.access("./COPYING", fs.F_OK , (error) => {
        if(!error){
          console.log(HELPERS.ERROR("A LICENSE already exists use -f or --force to update anyways"));
          process.exit(1);
        }
      });
      fs.access("./COPYING.LESSER", fs.F_OK , (error) => {
        if(!error){
          console.log(HELPERS.ERROR("A LICENSE already exists use -f or --force to update anyways"));
          process.exit(1);
        }
      });
      fs.access("./UNLICENSE", fs.F_OK , (error) => {
        if(!error){
          console.log(HELPERS.ERROR("A LICENSE already exists use -f or --force to update anyways"));
          process.exit(1);
        }
      });
    }
    else{
      fs.access("./LICENSE", fs.F_OK , (error) => {
        if(!error){
          fs.unlinkSync("./LICENSE");
        }
      });
      fs.access("./COPYING", fs.F_OK , (error) => {
        if(!error){
          fs.unlinkSync("./COPYING");
        }
      });
      fs.access("./COPYING.LESSER", fs.F_OK , (error) => {
        if(!error){
          fs.unlinkSync("./COPYING.LESSER");
        }
      });
      fs.access("./UNLICENSE", fs.F_OK , (error) => {
        if(!error){
          fs.unlinkSync("./UNLICENSE");
        }
      });
    }

    licenses.forEach((license) => {

      const search = key.match(new RegExp(license.key))
      if(search != null){
        matches.push(license.key);
      }

      if(license.key === key){
        axios.get(license.url)
          .then((response) => {
            var string = response.data.body;
            if(key === "mit" || key === "apache" || key === "agpl"|| key === "gpl" || key === "lgpl"){
              prompt.start();
              prompt.get(['fullname'], ((err, result) => {
                if (err) {
                  console.log(HELPERS.ERROR(err));
                }
                else{
                  if(key === "mit"){
                    string = string.replace("[year]",new Date().getFullYear());
                    string = string.replace("[fullname]",result.fullname);

                    fs.writeFile("LICENSE", string, (error) => {
                      if (error) {
                        console.log(HELPERS.ERROR(error));
                      }
                        console.log(HELPERS.SUCCESS("commited!"));
                    });
                  }
                  else if(key === "apache"){
                    string = string.replace("[yyyy]",new Date().getFullYear());
                    string = string.replace("[name of copyright owner]",result.fullname);

                    fs.writeFile("LICENSE", string, (error) => {
                      if (error) {
                        console.log(HELPERS.ERROR(error));
                      }
                        console.log(HELPERS.SUCCESS("commited!"));
                    });
                  }
                  else if(key === "agpl"){
                    string = string.replace("<year>",new Date().getFullYear());
                    string = string.replace("<name of author>",result.fullname);

                    fs.writeFile("LICENSE", string, (error) => {
                      if (error) {
                        console.log(HELPERS.ERROR(error));
                      }
                        console.log(HELPERS.SUCCESS("commited!"));
                    });
                  }
                  else if(key === "gpl"){
                    string = string.replace("<year>",new Date().getFullYear());
                    string = string.replace("<name of author>",result.fullname);
                    string = string.replace("<year>",new Date().getFullYear());
                    string = string.replace("<name of author>",result.fullname);

                    fs.writeFile("COPYING", string, (error) => {
                      if (error) {
                        console.log(HELPERS.ERROR(error));
                      }
                      console.log(HELPERS.SUCCESS("commited!"));
                    });
                  }
                  else if(key === "lgpl"){

                    fs.writeFile("COPYING.LESSER", string, (error) => {
                      if (error) {
                        console.log(HELPERS.ERROR(error));
                      }
                    });

                    axios.get("https://api.github.com/licenses/gpl-3.0")
                    .then((response) => {
                      string = response.data.body;
                      string = string.replace("<year>",new Date().getFullYear());
                      string = string.replace("<name of author>",result.fullname);
                      string = string.replace("<year>",new Date().getFullYear());
                      string = string.replace("<name of author>",result.fullname);
                      fs.writeFile("COPYING", string, (error) => {
                        if (error) {
                          console.log(HELPERS.ERROR(error));
                        }
                        console.log(HELPERS.SUCCESS("commited!"));
                      });
                    })
                  }
                }
              }));
            }
            else{
              if(key === "unlicense"){
                fs.writeFile("UNLICENSE", string, (error) => {
                  if (error) {
                    console.log(HELPERS.ERROR(error));
                  }
                  console.log(HELPERS.SUCCESS("commited!"));
                });
              }
              else{
                fs.writeFile("LICENSE", string, (error) => {
                  if (error) {
                    console.log(HELPERS.ERROR(error));
                  }
                    console.log(HELPERS.SUCCESS("commited!"));
                });
              }
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
