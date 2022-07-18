/**
 * @type {import("merlyn").UserMerlynConfig}
 */
export default ({ dev }) => ({
  scenes: {
    boot: dev ? 'battle' : 'world',
    // preload: true,
  },
})
