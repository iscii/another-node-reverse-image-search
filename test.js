const reverseImageSearch =  require('./index');

const doSomething = (res, url) => {
  console.log(url);
  console.log(res);
  console.log("-----------------------------------------------------------------------------------");
}

reverseImageSearch('https://media.discordapp.net/attachments/825057174178627614/876616859267530803/SPOILER_91929995_p0_master1200.png', doSomething);
reverseImageSearch('https://media.discordapp.net/attachments/825057174178627614/876616913432756224/91752673_p0_master1200.png', doSomething);