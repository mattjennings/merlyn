/**
 * @type {import("merlyn").UserMerlynConfig}
 */
export default ({ dev }) => ({
  scenes: {
    boot: 'world',
    // boot: dev ? 'battle' : 'world',
    // preload: ['world'],
  },
})
