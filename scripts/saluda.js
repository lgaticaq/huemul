// Description:
//   Hubot saluda cuando hay gente nueva por DM
//
// Dependencies:
//   None
//
// Configuration:
//   None
//
// Commands:
//   None
//
// Author:
//   @jorgeepunan

module.exports = robot => {
  /**
   * @typedef {Object} Topic
   * @property {string} value -
   * @property {string} creator -
   * @property {number} last_set -
   */
  /**
   * @typedef {Object} Channel
   * @property {string} id -
   * @property {string} name -
   * @property {Topic} topic -
   * @property {number} num_members -
   */
  /**
   * @typedef {Object} ChannelResponse
   * @property {boolean} ok -
   * @property {Array<Channel>} channels -
   * @property {string} [error] -
   */
  /**
   * @typedef {Object} SimpleChannel
   * @property {string} id -
   * @property {string} name -
   * @property {string} topic -
   */
  /**
   * Lists all channels in a Slack team.
   *
   * @returns {Promise<Array<SimpleChannel>>} -
   * @example
   * const channels = await getAllChannels()
   */
  const getAllChannels = () => {
    return new Promise((resolve, reject) => {
      robot
        .http('https://slack.com/api/channels.list')
        .query({
          token: process.env.HUBOT_SLACK_TOKEN,
          exclude_archived: true,
          exclude_members: true
        })
        .get()((err, res, body) => {
          if (err) return reject(err)
          try {
          /** @type {ChannelResponse} */
            const response = JSON.parse(body)
            if (!response.ok) return reject(new Error(response.error))
            resolve(
              response.channels
                .sort((a, b) => a.num_members > b.num_members)
                .map(({ id, name, topic: { value: topic } }) => ({ id, name, topic }))
            )
          } catch (error) {
            reject(error)
          }
        })
    })
  }

  /**
   * Create list (text) of all channels.
   *
   * @param {Array<SimpleChannel>} channels -
   * @returns {string} -
   * @example
   * const text = await channelsToText(channels)
   */
  const channelsToText = channels => {
    return channels.reduce((text, { id, name, topic }) => {
      text += `- <https://devschile.slack.com/archives/${id}|#${name}>: ${topic}\n`
      return text
    }, '')
  }

  robot.enter(async msg => {
    const channel = robot.adapter.client.rtm.dataStore.getChannelByName('#comunidad')
    if (msg.message.room === channel.id) {
      try {
        const channels = await getAllChannels()
        const channelsText = channelsToText(channels)
        robot.send(
          { room: channel.members.pop() },
          `¡Hola! :wave: \n \
  Soy ${
    robot.name
  } el :robot_face: de este grupo y te doy la bienvenida a *devsChile*, la mejor y más activa comunidad chilena de desarrolladores y diseñadores web.\n\n \
  Entre los canales que te pueden interesar están:\n \
  ${channelsText}
  Te sugerimos presentarte en #comunidad y te daremos la bienvenida como corresponde. Para conocer mis comandos puedes enviarme un \`help\` por DM o escribir \`huemul help\` en algún canal y te mostraré lo que puedo hacer.\n\n \
  \
  Esta comunidad es libre y abierta y se aceptan donaciones voluntarias para mantener el servidor en el cual reside el sitio web y :huemul: ; se venden stickers en <http://www.devschile.cl/|devschile.cl> \
  \
  No dejes de leer nuestro <https://www.devschile.cl/coc/|Código de Conducta> y cualquier duda o consulta sobre el CdC o el grupo puedes hacerla en #comunidad o directo a los admins :gmq: :hector: o :jorge: \n\n \
  \
  ¡Esperamos tu participación!`
        )
      } catch (err) {
        robot.emit('error', err, msg, 'saluda')
      }
    }
  })
}
