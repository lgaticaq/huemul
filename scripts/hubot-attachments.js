/**
 * @param {*} robot
 * @return {*}
 */
module.exports = robot => {
  /**
   * @typedef {Object} Attachments
   * @property {string} [pretext]
   * @property {string} [text]
   */
  /**
   * @typedef {Object} BlockText
   * @property {string} [type]
   * @property {string} [text]
   */
  /**
   * @typedef {Object} Blocks
   * @property {string} [type]
   * @property {BlockText} [text]
   */
  /**
   * @typedef {Object} PostMessageOptions
   * @property {boolean} [as_user=false] - Pass true to post the message as the authed user, instead of as a bot. Defaults to false.
   * @property {Array<Attachments>} [attachments] - A JSON-based array of structured attachments, presented as a URL-encoded string.
   * @property {Array<Blocks>} [blocks] - A JSON-based array of structured blocks, presented as a URL-encoded string.
   * @property {string} [icon_emoji] - Emoji to use as the icon for this message. Overrides icon_url. Must be used in conjunction with as_user set to false, otherwise ignored.
   * @property {string} [icon_url] - URL to an image to use as the icon for this message. Must be used in conjunction with as_user set to false, otherwise ignored.
   * @property {boolean} [link_names] - Find and link channel names and usernames.
   * @property {boolean} [mrkdwn=true] - Disable Slack markup parsing by setting to false. Enabled by default.
   * @property {string} [parse='none'] - Change how messages are treated. Defaults to none.
   * @property {boolean} [reply_broadcast=false] - Used in conjunction with thread_ts and indicates whether reply should be made visible to everyone in the channel or conversation. Defaults to false.
   * @property {number} [thread_ts] - Provide another message's ts value to make this message a reply. Avoid using a reply's ts value; use its parent instead.
   * @property {boolean} [unfurl_links] - Pass true to enable unfurling of primarily text-based content.
   * @property {boolean} [unfurl_media] - Pass false to disable unfurling of media content.
   * @property {string} [username] - Set your bot's user name. Must be used in conjunction with as_user set to false, otherwise ignored.
   */
  /**
   * @param {*} response
   * @param {PostMessageOptions} options
   * @return {*}
   */
  const onAttachments = (response, options) => {
    if (options.attachments.length === 0) {
      robot.logger.warning('Empty attachments')
      return
    }
    if (['SlackBot', 'Room'].includes(robot.adapter.constructor.name)) {
      response.send(options)
    } else if (options.attachments[0].fallback) {
      response.send(options.attachments[0].fallback)
    } else {
      robot.logger.warning('Fallback not provided')
    }
  }
  robot.on('slack.attachment', onAttachments)
}
