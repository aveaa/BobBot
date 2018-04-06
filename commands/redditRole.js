class redditRole {
  constructor (thot) {
    this.thot = thot
    this.roles = this.thot.get('serverData', 'roles')

    this.thot.register({ command: 'v!setredditrole', usage: '<Role Name>', description: 'Set the role to be assigned when subbed to reddit.', callback: this.setrole.bind(this), admin: true })
  }

  setrole (message) {
    if (!message.guild) { return }
    if (!this.thot.checkPerms(message)) { return }

    let roleName = message.content.split(' ')
    roleName.shift()

    const role = message.guild.roles.find('name', roleName.join(' '))

    if (role) {
      this.roles[message.guild.id] = role.id
      this.thot.get('serverData', 'roles', this.roles)
      this.thot.emit('REDDIT_ROLE_UPDATE', this.roles)
      message.react('✅')
    } else {
      message.react('❌')
    }
  }
}

module.exports = redditRole
