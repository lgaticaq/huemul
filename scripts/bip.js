// Description:
//   Huemul muestra saldo tarjeta BIP! ázì nòmá
//
// Dependencies:
//   bip
//
// Configuration:
//   None
//
// Commands:
//   Huemul bip <numero>
//
// Author:
//   @jorgeepunan

const bip = require('bip')
const moment = require('moment')
const { numberToCLPFormater } = require('numbertoclpformater')

module.exports = robot => {
  robot.respond(/bip (\d{8})$/i, async res => {
    const options = {
      as_user: false,
      link_names: 1,
      icon_url: 'https://i.imgur.com/UfRWgNj.png',
      username: 'bip',
      unfurl_links: false,
      attachments: [{}]
    }

    try {
      const status = await bip(parseInt(res.match[1]), 10)
      if (!status.valid) {
        options.attachments[0].fallback = status.message
        options.attachments[0].text = status.message
        options.attachments[0].color = 'danger'
      } else {
        const balance = numberToCLPFormater(status.balance)
        const date = moment(status.date).format('DD/MM/YYYY')
        const text = `El saldo de la tarjeta ${status.number} es ${balance} al ${date}.`
        options.attachments[0].fallback = text
        options.attachments[0].color = 'good'
        options.attachments[0].fields = [
          {
            title: 'Número',
            value: status.number,
            short: true
          },
          {
            title: 'Saldo',
            value: balance,
            short: true
          },
          {
            title: 'Fecha',
            value: date,
            short: true
          },
          {
            title: 'Mensaje',
            value: status.message,
            short: true
          }
        ]
      }
      robot.emit('slack.attachment', (res, options))
    } catch (err) {
      options.attachments[0].fallback = err.message
      options.attachments[0].text = err.message
      options.attachments[0].color = 'danger'
      robot.emit('slack.attachment', (res, options))
    }
  })
}
