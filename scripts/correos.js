// Description:
//   Get the latest status of a shipment from Correos de Chile
//
// Dependencies:
//   correos-chile
//
// Commands:
//   hubot correos [envio]
//
// Author:
//   @hectorpalmatellez

const correos = require('correos-chile')

module.exports = robot => {
  robot.respond(/correos (.*)/i, async res => {
    const options = {
      as_user: false,
      link_names: 1,
      icon_url: 'https://i.imgur.com/2KiVYGp.png',
      username: 'Correos de Chile',
      unfurl_links: false,
      attachments: [{}]
    }

    try {
      let trackingCode = res.match[1]
      if (trackingCode.length === 26) {
        // This converts 26 char. tracking codes to the format Correos de Chile understands according to https://www.correos.cl/SitePages/direccion-aliexpress/tips/Default.aspx
        trackingCode = trackingCode.replace(/\w+(\d{12})\d{3}$/, '$1')
      }
      const results = await correos([trackingCode])
      if (results.length === 0) return sendError(options)
      if (typeof results[0] === 'string') return sendError(options, results[0])
      if (results[0].registros.length === 0) sendError(options)
      const { estado, fecha, lugar } = results[0].registros.sort((a, b) => {
        const dateA = new Date(a.fecha.replace(/(\d+)\/(\d+)\/(\d+) (\d+:\d+)/, '$3-$2-$1 $4'))
        const dateB = new Date(b.fecha.replace(/(\d+)\/(\d+)\/(\d+) (\d+:\d+)/, '$3-$2-$1 $4'))
        return dateA < dateB
      })[0]
      const text = [
        `- Envío: ${trackingCode} (${res.match[1]})`,
        `- Estado: ${estado}`,
        `- Fecha: ${fecha}`,
        `- Lugar: ${lugar}`
      ].join('\n')
      options.attachments[0].fallback = text
      options.attachments[0].color = 'good'
      options.attachments[0].fields = [
        {
          title: 'Envío',
          value: res.match[1],
          short: true
        },
        {
          title: 'Estado',
          value: estado,
          short: true
        },
        {
          title: 'Fecha',
          value: fecha,
          short: true
        },
        {
          title: 'Lugar',
          value: lugar,
          short: true
        }
      ]
      robot.emit('slack.attachment', (res, options))
    } catch (err) {
      robot.emit('error', err, res, 'correos')
      options.attachments[0].fallback = 'Búsqueda sin resultados'
      options.attachments[0].text = options.attachments[0].fallback
      options.attachments[0].color = 'danger'
      robot.emit('slack.attachment', (res, options))
    }
  })
}
