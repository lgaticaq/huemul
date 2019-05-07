// Description:
//   Busca pegas recientes en GetOnBrd
//
//  Dependencies:
//    cheerio
//
// Commands:
//   huemul pega|pegas|trabajo|trabajos <oficio>
//
// Author:
//   @jorgeepunan

const querystring = require('querystring')
const cheerio = require('cheerio')

module.exports = function(robot) {
  robot.respond(/(pega|pegas|trabajo|trabajos) (.*)/i, function(msg) {
    msg.send('Buscando en GetOnBrd... :dev:')

    const domain = 'https://www.getonbrd.cl/empleos-'
    let busqueda = msg.match[2]
    let url = domain + querystring.escape(busqueda)

    robot.http(url).get()(function(err, res, body) {
      if (err || res.statusCode !== 200) {
        robot.emit('error', err || new Error(`Status code is ${res.statusCode}`), msg, 'pegas')
        msg.reply(':gob: tiene problemas en el servidor')
        return
      }
      const $ = cheerio.load(body)
      let resultados = []

      $('.job-list .job').each(function() {
        let title = $(this)
          .find('.job-list__title')
          .first()
          .contents()
          .filter(function() {
            return this.type === 'text'
          })
          .text()
        let type = $(this)
          .find('.job-list__title .modality')
          .text()
        let path = $(this)
          .find('a')
          .attr('href')

        resultados.push(`<${path}|${title} - ${type}>`)
      })

      if (resultados.length > 0) {
        let limiteResultados = resultados.length > 6 ? 5 : resultados.length
        let plural = resultados.length > 1 ? ['n', 's'] : ['', '']
        let text = `Se ha${plural[0]} encontrado ${resultados.length} resultado${plural[1]} para *${busqueda}*:\n`
        for (let i = 0; i < limiteResultados; i++) {
          let conteo = i + 1
          text += conteo + ': ' + resultados[i] + '\n'
        }
        if (resultados.length > limiteResultados) {
          text += `Más resultados en: <${url}|getonbrd>\n`
        }
        robot.emit('slack.unfurl_links', (msg, text))
      } else {
        msg.send(`No se han encontrado resultados para *${busqueda}*`)
      }
    })
  })
}
