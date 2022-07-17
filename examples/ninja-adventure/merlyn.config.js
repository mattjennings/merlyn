/**
 * @type {import("merlyn").UserMerlynConfig}
 */
export default ({ dev }) => ({
  scenes: {
    // boot: dev ? 'battle' : 'world',
    boot: 'world',
    // preload: true,
  },
})
