const reverseImageSearch =  require('./index');

const doSomething = (res) => {
  console.log(res)
}

reverseImageSearch('https://cdn.discordapp.com/attachments/494223131683061763/868615421362839583/91403647_p0_master1200.png', doSomething)