/**
 * @param {*} robot
 * @return {*}
 */
module.exports = robot => {
  /**
   * @param {*} response
   * @param {string} text
   * @return {*}
   */
  const onUnfurlLinks = (response, text) => {
    if (!text) {
      robot.logger.warning('Text not provided')
      return
    }
    if (robot.adapter.constructor.name === 'SlackBot') {
      const options = { unfurl_links: false, as_user: true }
      robot.adapter.client.web.chat.postMessage(response.message.room, text, options)
    } else {
      response.send(text)
    }
  }
  robot.on('slack.unfurl_links', onUnfurlLinks)
}
