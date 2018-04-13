class give {
  constructor (thot) {
    this.thot = thot

    this.thot.register({ command: 'v!transfer', usage: '<Mention> <Amount>', description: 'Give poems to someone.', callback: this.handle.bind(this), admin: false })
  }

  async handle (message) {
    let toGive = parseInt(message.content.split(' ')[2])
    if (isNaN(toGive) || toGive < 1) { toGive = 1 }

    let mention = message.mentions.users.array()[0]
    if (!mention) { return }

    let mypoems = this.thot.get('poems', message.author.id)
    let theirpoems = this.thot.get('poems', mention.id)
    if (isNaN(mypoems)) { mypoems = 0 }
    if (isNaN(theirpoems)) { theirpoems = 0 }

    if (mypoems < toGive) { message.channel.send(`**${message.author.username}**, you don't have that many poems.`); message.delete() }

    let verifyMsg = this.thot.send(message.channel, {
      title: 'Transfer Poems',
      description: `**${message.author.username}**, are you sure you want to transfer **${toGive} ${toGive === 1 ? 'poem' : 'poems'}** to **${mention.username}**`,
      color: 431075,
      footer: {
        text: `Executed by ${message.author.username}`
      }
    })

    verifyMsg.react('✅')
    verifyMsg.react('❌')

    const onReact = (reaction, user) => {
      if (user.id !== message.author.id) { return }

      if (reaction.emoji.toString() === '❌') { message.delete(); this.thot.client.removeEventListener('messageReactionAdd', onReact); return }
      if (reaction.emoji.toString() === '✅') {
        mypoems -= toGive
        theirpoems += toGive

        this.thot.set('poems', message.author.id, mypoems)
        this.thot.set('poems', mention.id, theirpoems)

        this.thot.emit('TRANSACTION', -toGive, message.author.tag, message.guild.id, 'v!transfer')
        this.thot.emit('TRANSACTION', toGive, mention.tag, message.guild.id, 'v!transfer')

        this.thot.send(message.channel, {
          title: 'Transfer Poems',
          description: `**${message.author.username}** has successfully transfered **${toGive} ${toGive === 1 ? 'poem' : 'poems'}** to <@${mention.id}>`,
          color: 53380
        })
        message.delete()
        this.thot.client.removeEventListener('messageReactionAdd', onReact)
      }
    }

    this.thot.client.on('messageReactionAdd', onReact)
  }
}

module.exports = give
